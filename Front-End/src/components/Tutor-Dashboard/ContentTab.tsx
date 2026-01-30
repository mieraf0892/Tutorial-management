// src/components/Tutor-Dashboard/ContentTab.tsx
"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import DocumentViewer from "@/components/common/DocumentViewer";
import JitsiLiveSession from "./JitsiLiveSession"; // Add this
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, FileText, Video, Lock, Eye, Pencil, Trash2, Upload, X, Calendar, Users, Clock, Radio  } from "lucide-react";

// Types (same as before)
interface Tutorial {
  id: number;
  title: string;
  status: string;
}

// Add to your existing interfaces in ContentTab.tsx
interface LiveSession {
  id: number;
  title: string;
  description?: string;
  scheduled_for: string;
  duration_minutes: number;
  jitsi_room_id: string;
  status: 'scheduled' | 'live' | 'ended' | 'cancelled';
  max_participants?: number;
  recording_url?: string;
  lesson_id?: number;
}

interface Lesson {
  id: number;
  title: string;
  description?: string;
  duration: string;
  order: number;
  video_url?: string;
  content?: string;
  is_preview: boolean;
  is_locked: boolean;
  materials?: Array<{
    id: number;
    original_name: string;
    url: string;
  }>;
  live_sessions?: LiveSession[]; // Add this line
}
interface ContentTabProps {
  tutorials: Tutorial[];
  onRefresh?: () => void;
}

export default function ContentTab({ tutorials, onRefresh }: ContentTabProps) {
  const { toast } = useToast();

  const [selectedTutorialId, setSelectedTutorialId] = useState<number | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(false);

  // Create/Edit dialog
  const [showLessonDialog, setShowLessonDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingLessonId, setEditingLessonId] = useState<number | null>(null);
  const [viewerFile, setViewerFile] = useState<{ url: string; name: string; mime: string } | null>(null);
  const [lessonForm, setLessonForm] = useState<Partial<Lesson>>({
    title: "",
    description: "",
    duration: "45 min",
    order: 1,
    video_url: "",
    content: "",
    is_preview: false,
    is_locked: true,
  });
  const [files, setFiles] = useState<File[]>([]);

  // View dialog
  const [viewLesson, setViewLesson] = useState<Lesson | null>(null);

  // Delete confirmation
  const [lessonToDelete, setLessonToDelete] = useState<number | null>(null);
  // Add to existing state variables
const [showLiveSessionDialog, setShowLiveSessionDialog] = useState(false);
const [isStartingLiveSession, setIsStartingLiveSession] = useState(false);
const [selectedLessonForLiveSession, setSelectedLessonForLiveSession] = useState<number | null>(null);
const [liveSessions, setLiveSessions] = useState<LiveSession[]>([]);
const [editingLiveSession, setEditingLiveSession] = useState<LiveSession | null>(null);

const fetchLiveSessions = async () => {
  if (!selectedTutorialId) return;
  
  try {
    const res = await apiClient.get(`/tutor/tutorials/${selectedTutorialId}/live-sessions`);
    if (res.data.success) {
      setLiveSessions(res.data.sessions || []);
    }
  } catch (err: any) {
    console.error("Failed to fetch live sessions:", err);
  }
};

// Call this in your useEffect when selectedTutorialId changes
useEffect(() => {
  if (selectedTutorialId) {
    loadLessons();
    fetchLiveSessions(); // Add this line
  }
}, [selectedTutorialId]);

  // Fetch lessons when tutorial changes
  useEffect(() => {
    if (!selectedTutorialId) {
      setLessons([]);
      return;
    }
    loadLessons();
  }, [selectedTutorialId]);

  const loadLessons = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/tutor/tutorials/${selectedTutorialId}/lessons`);
      if (res.data.success) {
        setLessons(res.data.lessons || []);
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to load lessons",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Open create dialog
  const openCreateDialog = () => {
    setIsEditing(false);
    setEditingLessonId(null);
    setLessonForm({
      title: "",
      description: "",
      duration: "45 min",
      order: lessons.length + 1,
      video_url: "",
      content: "",
      is_preview: false,
      is_locked: true,
    });
    setFiles([]);
    setShowLessonDialog(true);
  };

  // Open edit dialog
  const openEditDialog = (lesson: Lesson) => {
    setIsEditing(true);
    setEditingLessonId(lesson.id);
    setLessonForm({
      title: lesson.title,
      description: lesson.description || "",
      duration: lesson.duration,
      order: lesson.order,
      video_url: lesson.video_url || "",
      content: lesson.content || "",
      is_preview: lesson.is_preview,
      is_locked: lesson.is_locked,
    });
    setFiles([]); // new files only — existing ones stay on server
    setShowLessonDialog(true);
  };

  const handleSaveLesson = async () => {
  if (!selectedTutorialId || !lessonForm.title) return;

  setLoading(true);

  try {
    if (isEditing && editingLessonId) {
      // For editing, send as JSON (without files for now)
      const jsonData = {
        title: lessonForm.title,
        description: lessonForm.description || "",
        duration: lessonForm.duration || "45 min",
        order: lessonForm.order || lessons.length + 1,
        video_url: lessonForm.video_url || "",
        content: lessonForm.content || "",
        is_preview: lessonForm.is_preview,
        is_locked: lessonForm.is_locked,
      };
      
      console.log("Sending JSON PUT:", jsonData);
      
      const res = await apiClient.put(
        `/tutor/tutorials/${selectedTutorialId}/lessons/${editingLessonId}`,
        jsonData
      );
      
      // Handle files separately if needed
      if (files.length > 0) {
        const fileFormData = new FormData();
        files.forEach((file) => fileFormData.append("materials[]", file));
        
        await apiClient.post(
          `/tutor/tutorials/${selectedTutorialId}/lessons/${editingLessonId}/materials`,
          fileFormData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
      }
      
      if (res.data.success) {
        toast({
          title: "Success",
          description: "Lesson updated successfully",
        });
        await loadLessons();
        setShowLessonDialog(false);
        setFiles([]);
        setIsEditing(false);
        setEditingLessonId(null);
      }
    } else {
      // For creating new lesson, use FormData
      const formData = new FormData();
      formData.append("title", lessonForm.title);
      formData.append("description", lessonForm.description || "");
      formData.append("duration", lessonForm.duration || "45 min");
      formData.append("order", String(lessonForm.order || lessons.length + 1));
      formData.append("video_url", lessonForm.video_url || "");
      formData.append("content", lessonForm.content || "");
      formData.append("is_preview", lessonForm.is_preview ? "1" : "0");
      formData.append("is_locked", lessonForm.is_locked ? "1" : "0");
      
      files.forEach((file) => formData.append("materials[]", file));
      
      const res = await apiClient.post(
        `/tutor/tutorials/${selectedTutorialId}/lessons`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      
      if (res.data.success) {
        toast({
          title: "Success",
          description: "Lesson created successfully",
        });
        await loadLessons();
        setShowLessonDialog(false);
        setFiles([]);
      }
    }
  } catch (err: any) {
    console.error("Save lesson error:", err);
    toast({
      title: "Error",
      description: err.response?.data?.message || "Failed to save lesson",
      variant: "destructive",
    });
  } finally {
    setLoading(false);
  }
};

  // Delete lesson
  const handleDeleteLesson = async () => {
    if (!selectedTutorialId || !lessonToDelete) return;

    try {
      const res = await apiClient.delete(
        `/tutor/tutorials/${selectedTutorialId}/lessons/${lessonToDelete}`
      );
      if (res.data.success) {
        toast({ title: "Success", description: "Lesson deleted" });
        setLessons(lessons.filter((l) => l.id !== lessonToDelete));
        setLessonToDelete(null);
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to delete lesson",
        variant: "destructive",
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files || [])]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const selectedTutorial = tutorials.find((t) => t.id === selectedTutorialId);

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Content Management</h2>
          <p className="text-muted-foreground">
            Create, edit and organize lessons, videos, PDFs and materials
          </p>
        </div>
        <Button onClick={loadLessons} disabled={loading || !selectedTutorialId}>
          Refresh
        </Button>
      </div>

      {/* Tutorial Selector */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Select Tutorial</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={selectedTutorialId?.toString() ?? ""}
            onValueChange={(v) => setSelectedTutorialId(v ? Number(v) : null)}
          >
            <SelectTrigger className="w-full md:w-[400px]">
              <SelectValue placeholder="Choose a tutorial..." />
            </SelectTrigger>
            <SelectContent>
              {tutorials.map((t) => (
                <SelectItem key={t.id} value={t.id.toString()}>
                  {t.title} ({t.status})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedTutorial && (
            <p className="mt-3 text-sm">
              Current status:{" "}
              <span className="font-medium">{selectedTutorial.status}</span>
            </p>
          )}
        </CardContent>
      </Card>

      {/* Main Content Area */}
      {selectedTutorialId ? (
        <>
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">
              Lessons • {selectedTutorial?.title}
            </h3>

            <Button onClick={openCreateDialog} disabled={loading}>
              <Plus className="mr-2 h-4 w-4" />
              New Lesson
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-12">Loading lessons...</div>
          ) : lessons.length === 0 ? (
            <Card className="text-center py-16">
              <CardContent className="pt-8">
                <FileText className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">No lessons yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start building your content by adding your first lesson.
                </p>
                <Button onClick={openCreateDialog}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Lesson
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {lessons.map((lesson) => (
                <Card key={lesson.id} className="overflow-hidden">
                  <CardHeader className="pb-3 bg-muted/40">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-lg">
                          {lesson.order}. {lesson.title}
                        </CardTitle>
                        <CardDescription className="mt-1 flex items-center gap-4 text-sm">
                          <span>{lesson.duration}</span>
                          {lesson.is_preview && (
                            <span className="flex items-center gap-1 text-green-600">
                              <Eye className="h-3.5 w-3.5" /> Preview
                            </span>
                          )}
                          {lesson.is_locked && (
                            <span className="flex items-center gap-1 text-amber-600">
                              <Lock className="h-3.5 w-3.5" /> Locked
                            </span>
                          )}
                        </CardDescription>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setViewLesson(lesson)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(lesson)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive/90"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Lesson</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "
                                <strong>{lesson.title}</strong>
                                "? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => {
                                  setLessonToDelete(lesson.id);
                                  handleDeleteLesson();
                                }}
                                className="bg-destructive hover:bg-destructive/90"
                              >
                                Delete Lesson
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-4">
                    {lesson.description && (
                      <p className="text-sm mb-4">{lesson.description}</p>
                    )}

                    {lesson.video_url && (
                      <div className="mb-4">
                        <a
                          href={lesson.video_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-primary hover:underline"
                        >
                          <Video className="h-4 w-4" />
                          Watch video lesson
                        </a>
                      </div>
                    )}

                    {lesson.materials && lesson.materials.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-medium text-muted-foreground mb-2">
                          Attached Materials:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {lesson.materials.map((m) => (
                            <a
                              key={m.id}
                              href={m.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs bg-muted px-3 py-1 rounded-full hover:bg-muted/80 flex items-center gap-1"
                            >
                              <FileText className="h-3 w-3" />
                              {m.original_name}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20 border rounded-lg bg-muted/30">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No tutorial selected</h3>
          <p className="text-sm text-muted-foreground">
            Choose a tutorial above to view or add lessons and content.
          </p>
        </div>
      )}

      {/* Add this after the Lessons section */}
{selectedTutorialId && (
  <>
    {/* Live Sessions Header */}
    <div className="flex justify-between items-center mt-10">
      <div>
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Radio className="h-5 w-5" />
          Live Sessions
        </h3>
        <p className="text-sm text-muted-foreground">
          Schedule and conduct live interactive sessions
        </p>
      </div>
      
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => {
            setIsStartingLiveSession(false);
            setSelectedLessonForLiveSession(null);
            setEditingLiveSession(null);
            setShowLiveSessionDialog(true);
          }}
        >
          <Calendar className="mr-2 h-4 w-4" />
          Schedule Session
        </Button>
        <Button
          onClick={() => {
            setIsStartingLiveSession(true);
            setSelectedLessonForLiveSession(null);
            setEditingLiveSession(null);
            setShowLiveSessionDialog(true);
          }}
        >
          <Radio className="mr-2 h-4 w-4" />
          Start Now
        </Button>
      </div>
    </div>

    {/* Live Sessions List */}
    {loading ? (
      <div className="text-center py-6">Loading live sessions...</div>
    ) : liveSessions.length === 0 ? (
      <Card className="text-center py-8">
        <CardContent>
          <Radio className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h4 className="text-lg font-medium mb-2">No Live Sessions Scheduled</h4>
          <p className="text-muted-foreground mb-4">
            Start by scheduling a live session for your students
          </p>
          <Button onClick={() => setShowLiveSessionDialog(true)}>
            <Calendar className="mr-2 h-4 w-4" />
            Schedule Your First Session
          </Button>
        </CardContent>
      </Card>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {liveSessions.map((session) => (
          <Card key={session.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-base">{session.title}</CardTitle>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  session.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                  session.status === 'live' ? 'bg-green-100 text-green-800' :
                  session.status === 'ended' ? 'bg-gray-100 text-gray-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                </span>
              </div>
              <CardDescription className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(session.scheduled_for).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {session.duration_minutes} min
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-3">
              {session.description && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {session.description}
                </p>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-sm">
                  <Users className="h-4 w-4" />
                  Max: {session.max_participants}
                </div>
                <div className="flex gap-2">
                  {session.status === 'scheduled' && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingLiveSession(session);
                          setShowLiveSessionDialog(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          // Start the session
                          setEditingLiveSession(session);
                          setIsStartingLiveSession(true);
                          setShowLiveSessionDialog(true);
                        }}
                      >
                        Start
                      </Button>
                    </>
                  )}
                  {session.status === 'live' && (
                    <Button
                      size="sm"
                      onClick={() => {
                        setEditingLiveSession(session);
                        setIsStartingLiveSession(true);
                        setShowLiveSessionDialog(true);
                      }}
                    >
                      Join
                    </Button>
                  )}
                  {session.status === 'ended' && session.recording_url && (
                    <Button
                      size="sm"
                      variant="outline"
                      asChild
                    >
                      <a href={session.recording_url} target="_blank" rel="noopener">
                        Recording
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )}
  </>
)}

      {/* Create / Edit Dialog */}
      <Dialog open={showLessonDialog} onOpenChange={setShowLessonDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Lesson" : "Create New Lesson"}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update the lesson details below"
                : "Fill in the details for your new lesson"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Title */}
            <div className="grid gap-2">
              <Label htmlFor="title">Lesson Title *</Label>
              <Input
                id="title"
                value={lessonForm.title}
                onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                placeholder="e.g. Variables & Data Types"
              />
            </div>

            {/* Duration & Order */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="duration">Duration *</Label>
                <Input
                  id="duration"
                  value={lessonForm.duration}
                  onChange={(e) => setLessonForm({ ...lessonForm, duration: e.target.value })}
                  placeholder="e.g. 45 min"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="order">Display Order</Label>
                <Input
                  id="order"
                  type="number"
                  min={1}
                  value={lessonForm.order}
                  onChange={(e) =>
                    setLessonForm({ ...lessonForm, order: Number(e.target.value) })
                  }
                />
              </div>
            </div>

            {/* Video URL */}
            <div className="grid gap-2">
              <Label htmlFor="video_url">Video URL (optional)</Label>
              <Input
                id="video_url"
                type="url"
                value={lessonForm.video_url || ""}
                onChange={(e) => setLessonForm({ ...lessonForm, video_url: e.target.value })}
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>

            {/* Content */}
            <div className="grid gap-2">
              <Label htmlFor="content">Lesson Content (Markdown supported)</Label>
              <Textarea
                id="content"
                rows={8}
                value={lessonForm.content || ""}
                onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })}
                placeholder="Write explanations, examples, code snippets..."
              />
            </div>

            {/* Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex items-center space-x-3">
                <Switch
                  id="preview"
                  checked={lessonForm.is_preview}
                  onCheckedChange={(checked) =>
                    setLessonForm({ ...lessonForm, is_preview: checked })
                  }
                />
                <div>
                  <Label htmlFor="preview" className="cursor-pointer">
                    Available as Preview
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Students can see this without enrolling
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Switch
                  id="locked"
                  checked={lessonForm.is_locked}
                  onCheckedChange={(checked) =>
                    setLessonForm({ ...lessonForm, is_locked: checked })
                  }
                />
                <div>
                  <Label htmlFor="locked" className="cursor-pointer">
                    Locked for Non-Enrolled
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Only enrolled students can access
                  </p>
                </div>
              </div>
            </div>

            {/* File Upload */}
            <div className="grid gap-3">
              <Label>Upload Materials (PDF, DOCX, ZIP...)</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted/50 transition">
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.txt,.zip"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="mx-auto h-10 w-10 text-muted-foreground" />
                  <p className="mt-2 text-sm font-medium">Click or drag files here</p>
                  <p className="text-xs text-muted-foreground mt-1">Max 15MB per file</p>
                </label>
              </div>

              {files.length > 0 && (
                <div className="space-y-2 mt-2">
                  {files.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-muted/60 p-2 px-3 rounded"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-primary" />
                        <span className="text-sm truncate max-w-[280px]">{file.name}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => removeFile(idx)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLessonDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveLesson}
              disabled={!lessonForm.title || loading}
            >
              {loading ? "Saving..." : isEditing ? "Update Lesson" : "Create Lesson"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Lesson Dialog */}
      <Dialog open={!!viewLesson} onOpenChange={() => setViewLesson(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewLesson?.title}</DialogTitle>
            <DialogDescription>
              {viewLesson?.duration} • Order: {viewLesson?.order}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {viewLesson?.description && (
              <div>
                <h4 className="text-sm font-medium mb-2">Description</h4>
                <p className="text-sm">{viewLesson.description}</p>
              </div>
            )}

            {viewLesson?.video_url && (
              <div>
                <h4 className="text-sm font-medium mb-2">Video</h4>
                <a
                  href={viewLesson.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:underline"
                >
                  <Video className="h-4 w-4" />
                  Open video in new tab
                </a>
              </div>
            )}

            {viewLesson?.content && (
              <div>
                <h4 className="text-sm font-medium mb-2">Content</h4>
                <div className="prose prose-sm max-w-none border rounded-lg p-4 bg-muted/30">
                  {/* Simple markdown preview - you can use react-markdown later */}
                  <pre className="whitespace-pre-wrap text-sm">{viewLesson.content}</pre>
                </div>
              </div>
            )}

            {viewLesson?.materials && viewLesson.materials.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Materials</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {viewLesson.materials?.map((m) => (
  <button
    key={m.id}
    onClick={() => setViewerFile({
      url: m.url,
      name: m.original_name,
      mime: "application/pdf" // adjust based on your mime_type if you store it
    })}
    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition text-sm w-full text-left"
  >
    <FileText className="h-5 w-5 text-primary" />
    <span className="font-medium truncate">{m.original_name}</span>
  </button>
))}
                </div>
              </div>
            )}

            <div className="flex gap-6 text-sm">
              <div>
                <strong>Preview:</strong>{" "}
                {viewLesson?.is_preview ? "Yes" : "No"}
              </div>
              <div>
                <strong>Locked:</strong>{" "}
                {viewLesson?.is_locked ? "Yes" : "No"}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewLesson(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {viewerFile && (
        <DocumentViewer
          open={!!viewerFile}
          onOpenChange={() => setViewerFile(null)}
          fileUrl={viewerFile.url}
          fileName={viewerFile.name}
          mimeType={viewerFile.mime}
        />
      )}
      {/* Add this after the DocumentViewer */}
<JitsiLiveSession
  tutorialId={selectedTutorialId || 0}
  lessonId={selectedLessonForLiveSession || undefined}
  open={showLiveSessionDialog}
  onOpenChange={setShowLiveSessionDialog}
  isStarting={isStartingLiveSession}
  sessionData={editingLiveSession || undefined}
  onSessionCreated={(session) => {
    setLiveSessions([...liveSessions, session]);
    setShowLiveSessionDialog(false);
    setEditingLiveSession(null);
  }}
/>
    </div>
  );
}