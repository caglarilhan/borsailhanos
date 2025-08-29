"use client";

import * as React from "react";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Bot, 
  Send, 
  Sparkles, 
  Brain, 
  MessageSquare, 
  Lightbulb,
  TrendingUp,
  Clock,
  User,
  Zap
} from "lucide-react";

interface AIMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  type: 'text' | 'insight' | 'suggestion' | 'analysis';
}

interface AIInsight {
  id: string;
  type: 'trend' | 'pattern' | 'recommendation' | 'warning';
  title: string;
  description: string;
  confidence: number;
  action?: string;
}

export function AIAssistant() {
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: '1',
      content: 'Merhaba! Ben MindTrack AI Assistant. Size nasıl yardımcı olabilirim?',
      role: 'assistant',
      timestamp: new Date(),
      type: 'text'
    }
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [insights, setInsights] = useState<AIInsight[]>([
    {
      id: '1',
      type: 'trend',
      title: 'Client Engagement Artışı',
      description: 'Son 30 günde client engagement %15 arttı',
      confidence: 0.87,
      action: 'Bu trendi sürdürmek için marketing stratejisini gözden geçirin'
    },
    {
      id: '2',
      type: 'pattern',
      title: 'Randevu İptal Oranı',
      description: 'Salı günleri iptal oranı %25 daha yüksek',
      confidence: 0.92,
      action: 'Salı günleri için reminder sistemini güçlendirin'
    },
    {
      id: '3',
      type: 'recommendation',
      title: 'Revenue Optimization',
      description: 'Premium hizmetler için %20 fiyat artışı önerilir',
      confidence: 0.78,
      action: 'Fiyat stratejisini gözden geçirin'
    }
  ]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      content: inputValue,
      role: 'user',
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: AIMessage = {
        id: (Date.now() + 1).toString(),
        content: generateAIResponse(inputValue),
        role: 'assistant',
        timestamp: new Date(),
        type: 'text'
      };

      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const generateAIResponse = (userInput: string): string => {
    const responses = [
      "Bu konuda size yardımcı olabilirim. Daha detaylı bilgi verebilir misiniz?",
      "İlginç bir soru! Bu durumu analiz etmek için verilerinizi incelemem gerekiyor.",
      "Bu konuda size özel öneriler sunabilirim. Hangi açıdan yardıma ihtiyacınız var?",
      "Mükemmel bir gözlem! Bu pattern'i daha detaylı analiz edelim.",
      "Bu konuda size rehberlik edebilirim. Hangi adımları atmak istiyorsunuz?"
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'trend': return <TrendingUp className="h-4 w-4" />;
      case 'pattern': return <Brain className="h-4 w-4" />;
      case 'recommendation': return <Lightbulb className="h-4 w-4" />;
      case 'warning': return <Zap className="h-4 w-4" />;
      default: return <Sparkles className="h-4 w-4" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'trend': return 'bg-blue-100 text-blue-800';
      case 'pattern': return 'bg-purple-100 text-purple-800';
      case 'recommendation': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* AI Chat Section */}
      <div className="lg:col-span-2">
        <Card className="h-full">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <div className="flex items-center gap-3">
              <Bot className="h-6 w-6" />
              <div>
                <CardTitle>AI Assistant</CardTitle>
                <CardDescription className="text-blue-100">
                  Akıllı öneriler ve analizler için AI ile konuşun
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 h-[600px] flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs opacity-70">
                      <Clock className="h-3 w-3" />
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span className="text-sm text-gray-600">AI düşünüyor...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t p-4">
              <div className="flex gap-2">
                <Textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="AI'ya bir soru sorun veya yardım isteyin..."
                  className="min-h-[60px] resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputValue.trim()}
                  className="px-4"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights Section */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI Insights
            </CardTitle>
            <CardDescription>
              Verilerinizden çıkarılan akıllı öneriler
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {insights.map((insight) => (
              <div key={insight.id} className="border rounded-lg p-3">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${getInsightColor(insight.type)}`}>
                    {getInsightIcon(insight.type)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm mb-1">{insight.title}</h4>
                    <p className="text-xs text-gray-600 mb-2">{insight.description}</p>
                    {insight.action && (
                      <p className="text-xs text-blue-600 font-medium">{insight.action}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <Progress value={insight.confidence * 100} className="h-2 flex-1" />
                      <span className="text-xs text-gray-500">
                        {Math.round(insight.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <TrendingUp className="h-4 w-4 mr-2" />
              Revenue Analizi
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <User className="h-4 w-4 mr-2" />
              Client Insights
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Clock className="h-4 w-4 mr-2" />
              Schedule Optimization
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <MessageSquare className="h-4 w-4 mr-2" />
              Communication Tips
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
