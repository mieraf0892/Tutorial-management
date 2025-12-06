import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Send, 
  X, 
  Users, 
  MessageCircle, 
  Search,
  ArrowLeft
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";

interface TutorCommunicationPanelProps {
  onClose: () => void;
  tutorId?: number | string;
  onUnreadCountChange?: (count: number) => void;
}

interface Conversation {
  user_id: number;
  name: string;
  role: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

interface Message {
  id: number;
  message: string;
  sender_id: number;
  sender_name: string;
  receiver_id: number;
  receiver_name: string;
  is_own_message: boolean;
  timestamp: string;
  is_read: boolean;
}

interface OtherUser {
  id: number;
  name: string;
  role: string;
}

export default function TutorCommunicationPanel({ onClose, tutorId, onUnreadCountChange }: TutorCommunicationPanelProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeChat, setActiveChat] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const [conversationsLoading, setConversationsLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [otherUser, setOtherUser] = useState<OtherUser | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Filter conversations based on search
  const filteredConversations = conversations.filter(conversation =>
    conversation.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conversation.last_message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Fetch conversations and calculate unread count
  const fetchConversations = async () => {
    try {
      setConversationsLoading(true);
      const response = await apiClient.get('/messages/conversations');
      
      if (response.data.success) {
        setConversations(response.data.conversations);
        
        // Calculate total unread and notify parent
        const totalUnread = response.data.conversations.reduce(
          (sum: number, conv: any) => sum + (conv.unread_count || 0), 
          0
        );
        
        // Notify parent about new unread count
        if (onUnreadCountChange) {
          onUnreadCountChange(totalUnread);
        }
      } else {
        throw new Error('Failed to fetch conversations');
      }
    } catch (error: any) {
      console.error('Error fetching conversations:', error);
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive"
      });
    } finally {
      setConversationsLoading(false);
    }
  };

  // Fetch messages for a specific user
  const fetchMessages = async (userId: number) => {
    try {
      setMessagesLoading(true);
      const response = await apiClient.get(`/messages/${userId}`);
      
      if (response.data.success) {
        setMessages(response.data.messages);
        setOtherUser(response.data.other_user);
      } else {
        throw new Error('Failed to fetch messages');
      }
    } catch (error: any) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive"
      });
    } finally {
      setMessagesLoading(false);
    }
  };

  // Send typing indicator
  const sendTypingIndicator = async () => {
    if (!activeChat || isTyping) return;
    
    try {
      setIsTyping(true);
      await apiClient.post('/messages/typing', {
        receiver_id: activeChat,
        is_typing: true
      });
      
      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Stop typing indicator after 3 seconds of no typing
      typingTimeoutRef.current = setTimeout(async () => {
        setIsTyping(false);
        try {
          await apiClient.post('/messages/typing', {
            receiver_id: activeChat,
            is_typing: false
          });
        } catch (error) {
          console.error('Error stopping typing indicator:', error);
        }
      }, 3000);
    } catch (error) {
      console.error('Error sending typing indicator:', error);
    }
  };

  // Mark messages as read
  const markAsRead = async (userId: number) => {
    try {
      await apiClient.post(`/messages/${userId}/read`);
      await fetchConversations(); // This will recalculate and notify parent
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  // Send a message
  const sendMessage = async () => {
    if (!message.trim() || !activeChat) return;

    try {
      // Stop typing indicator
      setIsTyping(false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      const response = await apiClient.post('/messages/send', {
        receiver_id: activeChat,
        message: message.trim()
      });

      if (response.data.success) {
        setMessage('');
        await fetchMessages(activeChat);
        await fetchConversations();
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    }
  };

  // Handle enter key to send message
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Load conversations when component mounts
  useEffect(() => {
    fetchConversations();
  }, []);

  // Load messages when active chat changes
  useEffect(() => {
    if (activeChat) {
      fetchMessages(activeChat);
      markAsRead(activeChat);
      
      // Poll for typing status every 2 seconds
      const typingInterval = setInterval(async () => {
        try {
          const response = await apiClient.get(`/messages/${activeChat}/typing`);
          if (response.data.success) {
            setOtherUserTyping(response.data.is_typing);
          }
        } catch (error) {
          console.error('Error checking typing status:', error);
        }
      }, 2000);
      
      return () => {
        clearInterval(typingInterval);
        setOtherUserTyping(false);
      };
    } else {
      setMessages([]);
      setOtherUser(null);
      setOtherUserTyping(false);
    }
  }, [activeChat]);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="fixed inset-0 sm:inset-auto sm:right-4 sm:top-4 sm:bottom-4 sm:w-96 bg-black/20 sm:bg-transparent z-50 flex items-center justify-center sm:items-stretch sm:justify-end p-4 sm:p-0">
      <Card className="w-full max-w-md sm:max-w-none sm:w-96 h-full flex flex-col shadow-2xl bg-card border-border">
        <CardHeader className="p-4 border-b border-border flex flex-row items-center justify-between space-y-0 shrink-0">
          <div className="flex items-center gap-2">
            {activeChat && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setActiveChat(null)}
                className="sm:hidden h-8 w-8"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <h3 className="text-lg font-semibold text-foreground">Messages</h3>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="p-0 flex-1 flex overflow-hidden">
          <div className="flex-1 flex overflow-hidden w-full">
            {/* Conversations List */}
            <div className={`${activeChat ? 'hidden sm:flex' : 'flex'} w-full sm:w-2/5 border-r border-border flex-col overflow-hidden`}>
              {/* Search Bar */}
              <div className="p-3 border-b border-border shrink-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search conversations..."
                    className="pl-10 bg-background"
                  />
                </div>
              </div>
              
              {/* Conversations */}
              <ScrollArea className="flex-1 overflow-auto">
                <div className="flex flex-col">
                  {conversationsLoading ? (
                    <div className="p-4 text-center text-muted-foreground">Loading conversations...</div>
                  ) : filteredConversations.length > 0 ? (
                    filteredConversations.map((conversation) => (
                      <div
                        key={conversation.user_id}
                        className={`p-3 border-b border-border cursor-pointer hover:bg-muted transition-colors ${
                          activeChat === conversation.user_id ? 'bg-accent' : ''
                        }`}
                        onClick={() => setActiveChat(conversation.user_id)}
                      >
                        <div className="flex items-start gap-2">
                          <Avatar className="h-10 w-10 shrink-0">
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {conversation.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0 overflow-hidden">
                            <div className="flex items-baseline justify-between gap-2 mb-1">
                              <h5 className="font-medium text-sm truncate flex-1 text-foreground">
                                {conversation.name}
                              </h5>
                              <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0 ml-2">
                                {formatTime(conversation.last_message_time)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="secondary" className="text-xs capitalize shrink-0 bg-muted text-muted-foreground">
                                {conversation.role}
                              </Badge>
                              {conversation.unread_count > 0 && (
                                <Badge variant="destructive" className="h-5 min-w-5 px-1.5 flex items-center justify-center text-xs shrink-0">
                                  {conversation.unread_count}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                              {conversation.last_message}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground py-8 px-4">
                      <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
                      <p className="text-sm">No conversations yet</p>
                      <p className="text-xs mt-1">Start a chat with your students</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Chat Area */}
            {activeChat ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Chat Header */}
                <div className="p-4 border-b border-border flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {otherUser?.name?.charAt(0).toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <h4 className="font-semibold truncate text-foreground">{otherUser?.name}</h4>
                      <p className="text-xs text-muted-foreground capitalize">{otherUser?.role}</p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-auto p-4" ref={messagesContainerRef}>
                  <div className="space-y-4">
                    {messagesLoading ? (
                      <div className="text-center text-muted-foreground">Loading messages...</div>
                    ) : messages.length > 0 ? (
                      messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${msg.is_own_message ? 'items-end' : 'items-start'}`}
                        >
                          <div
                            className={`max-w-[75%] px-4 py-2 rounded-lg wrap-break-words ${
                              msg.is_own_message
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-foreground'
                            }`}
                          >
                            <p className="text-sm wrap-break-words">{msg.message}</p>
                            <div className={`text-xs mt-1 flex items-center gap-1 ${
                              msg.is_own_message ? 'text-primary-foreground/70' : 'text-muted-foreground'
                            }`}>
                              <div className="w-3 h-3" />
                              {formatTime(msg.timestamp)}
                            </div>
                          </div>
                          {msg.is_own_message && msg.is_read && (
                            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                              <span className="text-blue-500">✓✓</span> Seen
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-muted-foreground py-8">
                        <MessageCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
                        <p className="text-sm">No messages yet</p>
                        <p className="text-xs mt-1">Start the conversation</p>
                      </div>
                    )}
                    
                    {/* Typing Indicator */}
                    {otherUserTyping && (
                      <div className="flex items-start">
                        <div className="bg-muted px-4 py-2 rounded-lg">
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-border shrink-0">
                  <div className="flex gap-2">
                    <Input
                      value={message}
                      onChange={(e) => {
                        setMessage(e.target.value);
                        sendTypingIndicator();
                      }}
                      onKeyPress={handleKeyPress}
                      placeholder="Type a message..."
                      className="flex-1 bg-background"
                    />
                    <Button 
                      onClick={sendMessage} 
                      disabled={!message.trim()}
                      size="icon"
                      className="shrink-0"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="hidden sm:flex flex-1 items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                  <p className="text-sm">Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}