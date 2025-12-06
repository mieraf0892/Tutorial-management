// components/Admin-Dashboard/CommunicationTab.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Send, Users, UserCheck, Globe, Bell, MessageSquare, Zap } from "lucide-react";
import { useState } from "react";

interface CommunicationTabProps {
  onSendNotification: (data: {
    target: 'all' | 'students' | 'tutors';
    title: string;
    message: string;
  }) => void;
}

export default function CommunicationTab({ onSendNotification }: CommunicationTabProps) {
  const [target, setTarget] = useState<'all' | 'students' | 'tutors'>('all');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    setIsSending(true);
    try {
      await onSendNotification({
        target,
        title: title.trim(),
        message: message.trim()
      });
      
      // Reset form
      setTitle('');
      setMessage('');
      setTarget('all');
    } finally {
      setIsSending(false);
    }
  };

  const getTargetCount = (targetType: string) => {
    const counts = {
      all: 'All Users (1,234)',
      students: 'Students (890)',
      tutors: 'Tutors (344)'
    };
    return counts[targetType as keyof typeof counts] || targetType;
  };

  const getTargetIcon = (targetType: string) => {
    const icons = {
      all: <Globe className="w-4 h-4" />,
      students: <Users className="w-4 h-4" />,
      tutors: <UserCheck className="w-4 h-4" />
    };
    return icons[targetType as keyof typeof icons] || <Bell className="w-4 h-4" />;
  };

  const quickTemplates = [
    {
      title: "System Maintenance",
      message: "We'll be performing scheduled maintenance on [Date] from [Time] to [Time]. The platform may be temporarily unavailable during this period. Please save your work in advance.",
      badge: "System",
      badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800"
    },
    {
      title: "New Course Available",
      message: "We're excited to announce our new course: [Course Name]! This comprehensive tutorial covers [Topics]. Enroll now to enhance your skills and advance your learning journey.",
      badge: "Courses",
      badgeColor: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800"
    },
    {
      title: "Holiday Schedule",
      message: "Please note our upcoming holiday schedule. The platform will operate with limited support on [Dates]. Regular tutoring sessions will resume on [Date]. Plan your studies accordingly.",
      badge: "Schedule",
      badgeColor: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-800"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Communication Center</h2>
        <p className="text-muted-foreground">Send notifications to students and tutors</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Notification Form */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <MessageSquare className="w-5 h-5" />
              Compose Notification
            </CardTitle>
            <CardDescription>
              Create and send important announcements to platform users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="target" className="text-foreground">Send To</Label>
                <RadioGroup value={target} onValueChange={(value: 'all' | 'students' | 'tutors') => setTarget(value)}>
                  <div className="flex gap-4">
                    {(['all', 'students', 'tutors'] as const).map((targetType) => (
                      <Label
                        key={targetType}
                        htmlFor={targetType}
                        className={`flex flex-col items-center justify-between rounded-md border-2 p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer flex-1 transition-colors ${
                          target === targetType 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border bg-card'
                        }`}
                      >
                        <RadioGroupItem value={targetType} id={targetType} className="sr-only" />
                        <div className="flex items-center gap-2 mb-2 text-foreground">
                          {getTargetIcon(targetType)}
                          <span className="font-medium capitalize">{targetType}</span>
                        </div>
                        <div className="text-sm text-muted-foreground text-center">
                          {getTargetCount(targetType)}
                        </div>
                      </Label>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title" className="text-foreground">Notification Title</Label>
                <Input
                  id="title"
                  placeholder="Enter notification title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-foreground">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Type your notification message here..."
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground resize-vertical"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={isSending || !title.trim() || !message.trim()}
              >
                <Send className="w-4 h-4 mr-2" />
                {isSending ? 'Sending...' : 'Send Notification'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Notification Templates & Stats */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg text-foreground">Notification Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">1,234</div>
                  <div className="text-sm text-muted-foreground">Total Users</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">890</div>
                  <div className="text-sm text-muted-foreground">Active Students</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">344</div>
                  <div className="text-sm text-muted-foreground">Verified Tutors</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">24</div>
                  <div className="text-sm text-muted-foreground">Sent Today</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Templates */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg text-foreground">Quick Templates</CardTitle>
              <CardDescription>
                Pre-written templates for common notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {quickTemplates.map((template, index) => (
                <div
                  key={index}
                  className="p-3 border border-border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors group"
                  onClick={() => {
                    setTitle(template.title);
                    setMessage(template.message);
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="font-medium text-sm text-foreground group-hover:underline">
                      {template.title}
                    </div>
                    <Badge variant="outline" className={`text-xs ${template.badgeColor}`}>
                      {template.badge}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground line-clamp-2">
                    {template.message}
                  </div>
                </div>
              ))}
              <div className="pt-2 border-t border-border">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full bg-card hover:bg-accent border-border"
                  onClick={() => {
                    setTitle('');
                    setMessage('');
                  }}
                >
                  Clear Form
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Best Practices */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg text-foreground flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                Best Practices
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {[
                "Keep titles clear and concise (under 60 characters)",
                "Include important details and action items in the message",
                "Use appropriate target groups to avoid notification fatigue",
                "Send during active hours (9 AM - 6 PM) for better engagement",
                "Keep messages focused on one primary topic",
                "Use templates for recurring announcements to maintain consistency"
              ].map((practice, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 shrink-0" />
                  <div className="text-muted-foreground flex-1">{practice}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Character Count & Preview */}
      {(title || message) && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">Preview & Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="text-sm font-medium text-foreground">Message Preview</div>
                <div className="p-3 border border-border rounded-lg bg-muted/30">
                  <div className="font-semibold text-foreground mb-2">{title || '(No title)'}</div>
                  <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {message || '(No message)'}
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="text-sm font-medium text-foreground">Statistics</div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Title Length:</span>
                    <span className="font-medium text-foreground">{title.length}/60</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Message Length:</span>
                    <span className="font-medium text-foreground">{message.length}/500</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Target Audience:</span>
                    <span className="font-medium text-foreground capitalize">{target}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estimated Reach:</span>
                    <span className="font-medium text-foreground">
                      {target === 'all' ? '1,234' : target === 'students' ? '890' : '344'} users
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}