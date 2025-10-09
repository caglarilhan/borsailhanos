"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageSquare, 
  Send, 
  Clock, 
  Check, 
  CheckCheck, 
  Paperclip, 
  Calendar,
  User,
  AlertCircle,
  Shield,
  Download,
  Eye,
  EyeOff,
  Trash2,
  Edit,
  Plus,
  Filter,
  Search
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  attachments: Attachment[];
  scheduledFor?: string;
  sentAt: string;
  readAt?: string;
  deliveredAt?: string;
  status: 'draft' | 'scheduled' | 'sent' | 'delivered' | 'read' | 'failed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  confidentiality: 'standard' | 'confidential' | 'restricted';
  retentionPeriod: number;
  autoDeleteAt?: string;
}

interface Attachment {
  id: string;
  filename: string;
  size: number;
  type: string;
  url: string;
  scanned: boolean;
  scanResult?: 'clean' | 'infected' | 'suspicious';
  uploadedAt: string;
}

interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: Message;
  unreadCount: number;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ScheduledMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  scheduledFor: string;
  status: 'pending' | 'sent' | 'cancelled';
  createdAt: string;
}

export default function MessagingV2() {
  const { toast } = useToast();
  const supabase = React.useMemo(() => createSupabaseBrowserClient(), []);
  
  const [conversations, setConversations] = React.useState<Conversation[]>([]);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [scheduledMessages, setScheduledMessages] = React.useState<ScheduledMessage[]>([]);
  const [selectedConversation, setSelectedConversation] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [newMessage, setNewMessage] = React.useState('');
  const [attachments, setAttachments] = React.useState<File[]>([]);
  const [scheduledFor, setScheduledFor] = React.useState('');
  const [priority, setPriority] = React.useState<'low' | 'normal' | 'high' | 'urgent'>('normal');
  const [confidentiality, setConfidentiality] = React.useState<'standard' | 'confidential' | 'restricted'>('standard');
  const [retentionPeriod, setRetentionPeriod] = React.useState(30);

  const fetchConversations = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/messaging/conversations');
      if (!res.ok) throw new Error('Failed to fetch conversations');
      const data = await res.json();
      setConversations(data.conversations || []);
    } catch (e: any) {
      toast({
        title: "Error",
        description: `Failed to load conversations: ${e.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchMessages = React.useCallback(async (conversationId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/messaging/messages?conversation_id=${conversationId}`);
      if (!res.ok) throw new Error('Failed to fetch messages');
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (e: any) {
      toast({
        title: "Error",
        description: `Failed to load messages: ${e.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchScheduledMessages = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/messaging/scheduled');
      if (!res.ok) throw new Error('Failed to fetch scheduled messages');
      const data = await res.json();
      setScheduledMessages(data.scheduledMessages || []);
    } catch (e: any) {
      toast({
        title: "Error",
        description: `Failed to load scheduled messages: ${e.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    fetchConversations();
    fetchScheduledMessages();
  }, [fetchConversations, fetchScheduledMessages]);

  React.useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
    }
  }, [selectedConversation, fetchMessages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() && attachments.length === 0) {
      toast({
        title: "Error",
        description: "Please enter a message or attach a file",
        variant: "destructive",
      });
      return;
    }

    if (!selectedConversation) {
      toast({
        title: "Error",
        description: "Please select a conversation",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('conversationId', selectedConversation);
      formData.append('content', newMessage);
      formData.append('priority', priority);
      formData.append('confidentiality', confidentiality);
      formData.append('retentionPeriod', retentionPeriod.toString());
      
      if (scheduledFor) {
        formData.append('scheduledFor', scheduledFor);
      }

      attachments.forEach((file, index) => {
        formData.append(`attachment_${index}`, file);
      });

      const res = await fetch('/api/messaging/send', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) throw new Error('Failed to send message');

      toast({
        title: "Success",
        description: scheduledFor ? "Message scheduled successfully!" : "Message sent successfully!",
      });

      setNewMessage('');
      setAttachments([]);
      setScheduledFor('');
      
      if (selectedConversation) {
        fetchMessages(selectedConversation);
      }
      fetchScheduledMessages();
    } catch (e: any) {
      toast({
        title: "Error",
        description: `Failed to send message: ${e.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const markAsRead = async (messageId: string) => {
    try {
      const res = await fetch('/api/messaging/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId })
      });
      
      if (!res.ok) throw new Error('Failed to mark as read');
      
      // Update local state
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, status: 'read', readAt: new Date().toISOString() }
          : msg
      ));
    } catch (e: any) {
      console.error('Failed to mark as read:', e);
    }
  };

  const cancelScheduledMessage = async (scheduledId: string) => {
    try {
      const res = await fetch('/api/messaging/scheduled/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduledId })
      });
      
      if (!res.ok) throw new Error('Failed to cancel scheduled message');
      
      toast({
        title: "Success",
        description: "Scheduled message cancelled",
      });
      
      fetchScheduledMessages();
    } catch (e: any) {
      toast({
        title: "Error",
        description: `Failed to cancel: ${e.message}`,
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: Message['status']) => {
    switch (status) {
      case 'sent': return <Check className="h-4 w-4 text-gray-400" />;
      case 'delivered': return <CheckCheck className="h-4 w-4 text-blue-500" />;
      case 'read': return <CheckCheck className="h-4 w-4 text-green-500" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return null;
    }
  };

  const getPriorityColor = (priority: Message['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConfidentialityIcon = (confidentiality: Message['confidentiality']) => {
    switch (confidentiality) {
      case 'restricted': return <Shield className="h-4 w-4 text-red-500" />;
      case 'confidential': return <EyeOff className="h-4 w-4 text-orange-500" />;
      case 'standard': return <Eye className="h-4 w-4 text-green-500" />;
      default: return <Eye className="h-4 w-4 text-green-500" />;
    }
  };

  return (
    <div className="h-screen flex">
      {/* Conversations Sidebar */}
      <div className="w-80 border-r bg-gray-50 flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Conversations</h2>
          <div className="mt-2 flex space-x-2">
            <Input placeholder="Search conversations..." className="flex-1" />
            <Button variant="outline" size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`p-4 border-b cursor-pointer hover:bg-gray-100 ${
                selectedConversation === conversation.id ? 'bg-blue-50 border-blue-200' : ''
              }`}
              onClick={() => setSelectedConversation(conversation.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium">
                    {conversation.participants.join(', ')}
                  </div>
                  {conversation.lastMessage && (
                    <div className="text-sm text-gray-600 truncate">
                      {conversation.lastMessage.content}
                    </div>
                  )}
                </div>
                {conversation.unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {conversation.unreadCount}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.senderId === 'current_user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.senderId === 'current_user' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-900'
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{message.senderName}</span>
                      <div className="flex items-center space-x-1">
                        {getConfidentialityIcon(message.confidentiality)}
                        <Badge className={getPriorityColor(message.priority)}>
                          {message.priority}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="text-sm">{message.content}</div>
                    
                    {message.attachments.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {message.attachments.map((attachment) => (
                          <div key={attachment.id} className="flex items-center space-x-2">
                            <Paperclip className="h-3 w-3" />
                            <span className="text-xs">{attachment.filename}</span>
                            {attachment.scanned && (
                              <Badge variant={attachment.scanResult === 'clean' ? 'default' : 'destructive'}>
                                {attachment.scanResult}
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between mt-2 text-xs opacity-75">
                      <span>{new Date(message.sentAt).toLocaleTimeString()}</span>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(message.status)}
                        {message.status === 'read' && message.readAt && (
                          <span>Read {new Date(message.readAt).toLocaleTimeString()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="border-t p-4">
              <Tabs defaultValue="compose" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="compose">Compose</TabsTrigger>
                  <TabsTrigger value="schedule">Schedule</TabsTrigger>
                  <TabsTrigger value="scheduled">Scheduled ({scheduledMessages.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="compose" className="space-y-4">
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      rows={3}
                    />
                    
                    {attachments.length > 0 && (
                      <div className="space-y-2">
                        {attachments.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-100 rounded">
                            <span className="text-sm">{file.name}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeAttachment(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Label htmlFor="file-upload">Attach</Label>
                        <Input
                          id="file-upload"
                          type="file"
                          multiple
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById('file-upload')?.click()}
                        >
                          <Paperclip className="h-4 w-4 mr-2" />
                          Files
                        </Button>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Label htmlFor="priority">Priority</Label>
                        <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Label htmlFor="confidentiality">Confidentiality</Label>
                        <Select value={confidentiality} onValueChange={(value: any) => setConfidentiality(value)}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="standard">Standard</SelectItem>
                            <SelectItem value="confidential">Confidential</SelectItem>
                            <SelectItem value="restricted">Restricted</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Button onClick={handleSendMessage} disabled={loading}>
                      <Send className="h-4 w-4 mr-2" />
                      Send
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="schedule" className="space-y-4">
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      rows={3}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="scheduled-for">Schedule For</Label>
                        <Input
                          id="scheduled-for"
                          type="datetime-local"
                          value={scheduledFor}
                          onChange={(e) => setScheduledFor(e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="retention-period">Retention (days)</Label>
                        <Input
                          id="retention-period"
                          type="number"
                          value={retentionPeriod}
                          onChange={(e) => setRetentionPeriod(parseInt(e.target.value) || 30)}
                          min="1"
                          max="365"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Label htmlFor="file-upload-schedule">Attach</Label>
                          <Input
                            id="file-upload-schedule"
                            type="file"
                            multiple
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => document.getElementById('file-upload-schedule')?.click()}
                          >
                            <Paperclip className="h-4 w-4 mr-2" />
                            Files
                          </Button>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Label htmlFor="priority-schedule">Priority</Label>
                          <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="normal">Normal</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="urgent">Urgent</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <Button onClick={handleSendMessage} disabled={loading || !scheduledFor}>
                        <Clock className="h-4 w-4 mr-2" />
                        Schedule
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="scheduled" className="space-y-4">
                  <div className="space-y-2">
                    {scheduledMessages.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">No scheduled messages</p>
                    ) : (
                      scheduledMessages.map((scheduled) => (
                        <div key={scheduled.id} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="text-sm font-medium">
                                Scheduled for {new Date(scheduled.scheduledFor).toLocaleString()}
                              </div>
                              <div className="text-sm text-gray-600 mt-1">
                                {scheduled.content}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant={scheduled.status === 'pending' ? 'default' : 'secondary'}>
                                {scheduled.status}
                              </Badge>
                              {scheduled.status === 'pending' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => cancelScheduledMessage(scheduled.id)}
                                >
                                  Cancel
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
