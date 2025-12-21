import React, { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Mail, 
  MailCheck, 
  RefreshCw, 
  Search, 
  Trash2, 
  Copy, 
  ExternalLink,
  Calendar,
  Eye,
  User,
  Clock
} from "lucide-react";

interface Email {
  id: number;
  user_id: number;
  user_name: string;
  type: string;
  to: string;
  subject: string;
  content: string;
  token: string | null;
  verification_url: string | null;
  sent_at: string;
  viewed_at: string | null;
  created_at: string;
  is_verification: boolean;
}

interface EmailStats {
  total: number;
  verifications: number;
  unviewed: number;
  today: number;
}

export default function EmailQueueTab() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [stats, setStats] = useState<EmailStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const { toast } = useToast();

  // Line where you fetch the email queue
const fetchEmailQueue = async () => {
  try {
    setLoading(true);
    // Change from: const response = await apiClient.get("/admin/email-queue");
    const response = await apiClient.get("/email-queue"); // Fixed
    if (response.data.success) {
      setEmails(response.data.emails);
      setStats(response.data.stats);
    }
  } catch (error: any) {
    console.error("Error fetching email queue:", error);
    toast({
      title: "Error",
      description: "Failed to load email queue",
      variant: "destructive",
    });
  } finally {
    setLoading(false);
  }
};

const fetchEmailDetails = async (id: number) => {
  try {
    // Change from: const response = await apiClient.get(`/admin/email-queue/${id}`);
    const response = await apiClient.get(`/email-queue/${id}`); // Fixed
    if (response.data.success) {
      setSelectedEmail(response.data.email);
    }
  } catch (error) {
    console.error("Error fetching email details:", error);
  }
};

const clearOldEmails = async () => {
  if (!window.confirm("Clear emails older than 7 days?")) return;
  
  try {
    // Change from: await apiClient.delete("/admin/email-queue/clear");
    await apiClient.delete("/email-queue/clear"); // Fixed
    toast({
      title: "Success",
      description: "Old emails cleared successfully",
    });
    fetchEmailQueue();
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to clear old emails",
      variant: "destructive",
    });
  }
};

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Link copied to clipboard",
    });
  };

  useEffect(() => {
    fetchEmailQueue();
  }, []);

  // Filter emails based on search
  const filteredEmails = emails.filter(email => 
    email.to.toLowerCase().includes(searchQuery.toLowerCase()) ||
    email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    email.user_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-lg">Loading email queue...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Email Queue (Development)</h2>
          <p className="text-muted-foreground">
            View simulated emails sent during development. Only visible in development mode.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchEmailQueue}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="destructive" onClick={clearOldEmails}>
            <Trash2 className="w-4 h-4 mr-2" />
            Clear Old
          </Button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Mail className="w-5 h-5 text-blue-500" />
                <div className="text-2xl font-bold">{stats.total}</div>
              </div>
              <p className="text-sm text-muted-foreground">Total Emails</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <MailCheck className="w-5 h-5 text-green-500" />
                <div className="text-2xl font-bold">{stats.verifications}</div>
              </div>
              <p className="text-sm text-muted-foreground">Verification Emails</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-5 h-5 text-amber-500" />
                <div className="text-2xl font-bold">{stats.unviewed}</div>
              </div>
              <p className="text-sm text-muted-foreground">Unviewed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-purple-500" />
                <div className="text-2xl font-bold">{stats.today}</div>
              </div>
              <p className="text-sm text-muted-foreground">Today</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search emails by recipient, subject, or user..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Email List and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Email List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Recent Emails</CardTitle>
            <CardDescription>{filteredEmails.length} emails found</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredEmails.map(email => (
                <div
                  key={email.id}
                  className={`p-3 border rounded cursor-pointer hover:bg-accent transition-colors ${
                    selectedEmail?.id === email.id 
                      ? 'bg-accent border-primary' 
                      : 'border-border'
                  }`}
                  onClick={() => fetchEmailDetails(email.id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="font-medium truncate">{email.subject}</div>
                    <Badge 
                      variant={email.is_verification ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {email.type}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground truncate mt-1">
                    To: {email.to}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <User className="w-3 h-3" />
                      <span>{email.user_name}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(email.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Email Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Email Details</CardTitle>
            <CardDescription>
              {selectedEmail ? selectedEmail.subject : "Select an email to view details"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedEmail ? (
              <div className="space-y-6">
                {/* Header Info */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{selectedEmail.subject}</h3>
                    <div className="flex gap-2">
                      <Badge variant="outline">{selectedEmail.type}</Badge>
                      {selectedEmail.is_verification && (
                        <Badge variant="secondary">Verification</Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">To:</span>
                      <span>{selectedEmail.to}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">User:</span>
                      <span>{selectedEmail.user_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Sent:</span>
                      <span>{new Date(selectedEmail.sent_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Verification Link Section */}
                {selectedEmail.verification_url && (
                  <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-900/20">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <MailCheck className="w-4 h-4" />
                      Verification Link
                    </h4>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="flex-1">
                        <div className="text-sm break-all bg-white dark:bg-gray-800 p-2 rounded border">
                          {selectedEmail.verification_url}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => copyToClipboard(selectedEmail.verification_url!)}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          asChild
                        >
                          <a 
                            href={selectedEmail.verification_url!}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Open
                          </a>
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Use this link to verify the user's email address during testing
                    </p>
                  </div>
                )}

                {/* Email Content */}
                <div>
                  <h4 className="font-semibold mb-2">Content</h4>
                  <div className="bg-muted p-4 rounded-lg whitespace-pre-wrap font-mono text-sm">
                    {selectedEmail.content}
                  </div>
                </div>

                {/* Email Metadata */}
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Metadata</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Email ID:</span> {selectedEmail.id}
                    </div>
                    <div>
                      <span className="font-medium">User ID:</span> {selectedEmail.user_id}
                    </div>
                    <div>
                      <span className="font-medium">Created:</span> {new Date(selectedEmail.created_at).toLocaleString()}
                    </div>
                    <div>
                      <span className="font-medium">Viewed:</span> {selectedEmail.viewed_at ? new Date(selectedEmail.viewed_at).toLocaleString() : 'Not viewed'}
                    </div>
                    {selectedEmail.token && (
                      <div className="col-span-2">
                        <span className="font-medium">Token:</span> 
                        <div className="break-all text-xs bg-muted p-2 rounded mt-1">
                          {selectedEmail.token}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Select an email from the list to view details</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Instructions for Testing */}
      <Card>
        <CardHeader>
          <CardTitle>Testing Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>To test email verification:</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Register a new user (student or tutor)</li>
              <li>Email will be stored here instead of being sent</li>
              <li>Find the verification email in the list above</li>
              <li>Click on the email to view details</li>
              <li>Use the verification link to verify the user's email</li>
              <li>Check that the user's status changes from "pending" to "active"</li>
            </ol>
            <p className="text-muted-foreground mt-2">
              Note: This feature is only available in development mode. In production, real emails will be sent.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}