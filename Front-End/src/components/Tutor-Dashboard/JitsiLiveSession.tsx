"use client";

import { useState, useEffect, useRef } from "react";
import { JitsiMeeting } from "@jitsi/react-sdk";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Video, Clock, Users, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface JitsiLiveSessionProps {
  tutorialId: number;
  lessonId?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isStarting?: boolean;
  sessionData?: Partial<LiveSession>;
  onSessionCreated?: (session: LiveSession) => void;
}

export default function JitsiLiveSession({
  tutorialId,
  lessonId,
  open,
  onOpenChange,
  isStarting = false,
  sessionData,
  onSessionCreated,
}: JitsiLiveSessionProps) {
  const { toast } = useToast();
  const [sessionForm, setSessionForm] = useState({
    title: "",
    description: "",
    scheduled_for: new Date(),
    duration_minutes: 60,
    max_participants: 50,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [roomId, setRoomId] = useState<string>("");
  const [isLive, setIsLive] = useState(false);
  const [copied, setCopied] = useState(false);
  const apiRef = useRef<any>(null);

  useEffect(() => {
    if (isStarting && !sessionData) {
      // Generate a random room ID
      const randomId = `tutorial-${tutorialId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      setRoomId(randomId);
      setSessionForm({
        title: `Live Session - ${format(new Date(), "PPP p")}`,
        description: "",
        scheduled_for: new Date(),
        duration_minutes: 60,
        max_participants: 50,
      });
    } else if (sessionData) {
      setRoomId(sessionData.jitsi_room_id || "");
      if (sessionData.scheduled_for) {
        setSessionForm({
          title: sessionData.title || "",
          description: sessionData.description || "",
          scheduled_for: new Date(sessionData.scheduled_for),
          duration_minutes: sessionData.duration_minutes || 60,
          max_participants: sessionData.max_participants || 50,
        });
      }
    }
  }, [isStarting, sessionData, tutorialId]);

  const handleStartSession = async () => {
    setIsLoading(true);
    try {
      // Here you would make an API call to save the session to your backend
      // const response = await apiClient.post(`/tutor/tutorials/${tutorialId}/live-sessions`, {
      //   ...sessionForm,
      //   jitsi_room_id: roomId,
      //   lesson_id: lessonId,
      //   status: 'scheduled'
      // });
      
      // For now, simulate API call
      setTimeout(() => {
        const newSession: LiveSession = {
          id: Date.now(),
          ...sessionForm,
          scheduled_for: sessionForm.scheduled_for.toISOString(),
          jitsi_room_id: roomId,
          status: 'scheduled',
          lesson_id: lessonId,
        };
        
        if (onSessionCreated) {
          onSessionCreated(newSession);
        }
        
        toast({
          title: "Session Scheduled",
          description: "Live session has been scheduled successfully.",
        });
        
        setIsLive(true);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to schedule session",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleCopyLink = () => {
    const inviteLink = `${window.location.origin}/live/${roomId}`;
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    
    toast({
      title: "Copied!",
      description: "Invite link copied to clipboard",
    });
  };

  const handleJitsiAPI = (api: any) => {
    apiRef.current = api;
    api.addEventListeners({
      readyToClose: () => {
        onOpenChange(false);
        setIsLive(false);
      },
      participantJoined: (participant: any) => {
        console.log("Participant joined:", participant);
      },
      participantLeft: (participant: any) => {
        console.log("Participant left:", participant);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] p-0 overflow-hidden">
        {!isLive ? (
          <>
            <DialogHeader className="px-6 pt-6">
              <DialogTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                {isStarting ? "Start Live Session" : "Schedule Live Session"}
              </DialogTitle>
              <DialogDescription>
                {isStarting 
                  ? "Configure and start an instant live session"
                  : "Schedule a live session for future date"}
              </DialogDescription>
            </DialogHeader>

            <div className="px-6 pb-6 space-y-6 overflow-y-auto max-h-[60vh]">
              {/* Session Title */}
              <div className="space-y-2">
                <Label htmlFor="session-title">Session Title *</Label>
                <Input
                  id="session-title"
                  value={sessionForm.title}
                  onChange={(e) =>
                    setSessionForm({ ...sessionForm, title: e.target.value })
                  }
                  placeholder="e.g. Live Q&A Session"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="session-description">Description</Label>
                <Textarea
                  id="session-description"
                  value={sessionForm.description}
                  onChange={(e) =>
                    setSessionForm({ ...sessionForm, description: e.target.value })
                  }
                  placeholder="Describe what you'll cover in this session..."
                  rows={3}
                />
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date & Time *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !sessionForm.scheduled_for && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {sessionForm.scheduled_for ? (
                          format(sessionForm.scheduled_for, "PPP p")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={sessionForm.scheduled_for}
                        onSelect={(date) =>
                          date && setSessionForm({ ...sessionForm, scheduled_for: date })
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min={15}
                    max={240}
                    value={sessionForm.duration_minutes}
                    onChange={(e) =>
                      setSessionForm({
                        ...sessionForm,
                        duration_minutes: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              {/* Max Participants */}
              <div className="space-y-2">
                <Label htmlFor="max-participants">Maximum Participants</Label>
                <Input
                  id="max-participants"
                  type="number"
                  min={1}
                  max={100}
                  value={sessionForm.max_participants}
                  onChange={(e) =>
                    setSessionForm({
                      ...sessionForm,
                      max_participants: parseInt(e.target.value),
                    })
                  }
                />
              </div>

              {/* Room ID Preview */}
              <div className="space-y-2">
                <Label>Session Room ID</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={roomId}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={handleCopyLink}
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Share this room ID with students to join the session
                </p>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleStartSession}
                  disabled={!sessionForm.title || isLoading}
                  className="gap-2"
                >
                  <Video className="h-4 w-4" />
                  {isLoading ? "Creating..." : isStarting ? "Start Session" : "Schedule Session"}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="h-full">
            <JitsiMeeting
              domain="meet.jit.si" // You can use your own Jitsi domain
              roomName={roomId}
              configOverwrite={{
                startWithAudioMuted: true,
                startWithVideoMuted: false,
                enableWelcomePage: false,
                disableModeratorIndicator: true,
                enableClosePage: false,
                prejoinPageEnabled: false,
              }}
              interfaceConfigOverwrite={{
                DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
                SHOW_CHROME_EXTENSION_BANNER: false,
                TOOLBAR_BUTTONS: [
                  'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
                  'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
                  'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
                  'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
                  'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone',
                  'security'
                ],
              }}
              getIFrameRef={(iframeRef) => {
                iframeRef.style.height = "100%";
                iframeRef.style.width = "100%";
                iframeRef.style.border = "none";
              }}
              onApiReady={handleJitsiAPI}
              userInfo={{
                displayName: "Tutor",
                email: "",
              }}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}