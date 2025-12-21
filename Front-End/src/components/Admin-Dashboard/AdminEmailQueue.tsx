// AdminEmailQueue.jsx
import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const AdminEmailQueue = () => {
  const [emails, setEmails] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchEmailQueue();
  }, []);

  const fetchEmailQueue = async () => {
    try {
      const response = await apiClient.get('/admin/email-queue');
      setEmails(response.data.emails);
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching email queue:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEmail = async (id) => {
    try {
      const response = await apiClient.get(`/admin/email-queue/${id}`);
      setSelectedEmail(response.data.email);
    } catch (error) {
      console.error('Error fetching email details:', error);
    }
  };

  const handleClearOldEmails = async () => {
    if (!window.confirm('Clear emails older than 7 days?')) return;
    
    try {
      await apiClient.delete('/admin/email-queue/clear');
      alert('Old emails cleared!');
      fetchEmailQueue();
    } catch (error) {
      console.error('Error clearing emails:', error);
    }
  };

  if (loading) return <div>Loading email queue...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Email Queue (Development)</h1>
        <Button onClick={fetchEmailQueue} variant="outline">
          Refresh
        </Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-sm text-gray-500">Total Emails</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.verifications}</div>
              <p className="text-sm text-gray-500">Verification Emails</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.unviewed}</div>
              <p className="text-sm text-gray-500">Unviewed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.today}</div>
              <p className="text-sm text-gray-500">Today</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex gap-4">
        <Button onClick={handleClearOldEmails} variant="destructive">
          Clear Old Emails
        </Button>
        <Input
          placeholder="Search emails..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Email List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Email List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {emails.map(email => (
                <div
                  key={email.id}
                  className={`p-3 border rounded cursor-pointer hover:bg-gray-50 ${
                    selectedEmail?.id === email.id ? 'bg-blue-50 border-blue-300' : ''
                  }`}
                  onClick={() => handleSelectEmail(email.id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="font-medium truncate">{email.subject}</div>
                    <Badge variant={email.is_verification ? "default" : "secondary"}>
                      {email.type}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 truncate">To: {email.to}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(email.created_at).toLocaleString()}
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
          </CardHeader>
          <CardContent>
            {selectedEmail ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">{selectedEmail.subject}</h3>
                  <div className="text-sm text-gray-600">To: {selectedEmail.to}</div>
                  <div className="flex gap-2 mt-2">
                    <Badge>{selectedEmail.type}</Badge>
                    {selectedEmail.is_verification && (
                      <Badge variant="outline">Verification</Badge>
                    )}
                  </div>
                </div>

                {selectedEmail.user && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-2">User Details:</h4>
                    <div className="text-sm">
                      <div><strong>Name:</strong> {selectedEmail.user.name}</div>
                      <div><strong>Email:</strong> {selectedEmail.user.email}</div>
                      <div><strong>Role:</strong> {selectedEmail.user.role}</div>
                      <div><strong>Status:</strong> {selectedEmail.user.status}</div>
                    </div>
                  </div>
                )}

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Content:</h4>
                  <pre className="bg-gray-50 p-4 rounded whitespace-pre-wrap text-sm">
                    {selectedEmail.content}
                  </pre>
                </div>

                {selectedEmail.verification_url && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-2">Verification Link:</h4>
                    <div className="text-sm mb-2 break-all text-blue-600">
                      <a 
                        href={selectedEmail.verification_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {selectedEmail.verification_url}
                      </a>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => navigator.clipboard.writeText(selectedEmail.verification_url)}
                    >
                      Copy Link
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-12">
                Select an email to view details
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminEmailQueue;