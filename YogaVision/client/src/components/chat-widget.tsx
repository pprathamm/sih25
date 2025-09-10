import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { MessageCircle, Send, X, Sparkles, Bot, User, Minimize2, Maximize2 } from "lucide-react";

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  message: string;
  timestamp: Date;
  confidence?: number;
  sources?: string[];
}

interface AIResponse {
  answer: string;
  confidence: number;
  sources: string[];
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      message: "Hello! I'm your AYUSH terminology assistant. Ask me about NAMASTE codes, ICD-11 mapping, or coding best practices.",
      timestamp: new Date(),
      confidence: 100,
      sources: []
    }
  ]);
  const [sessionId] = useState(`chat-${Date.now()}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const chatMutation = useMutation({
    mutationFn: async (data: { message: string; sessionId: string }) => {
      const response = await apiRequest("POST", "/api/chat", data);
      return response.json();
    },
    onSuccess: (response: AIResponse, variables) => {
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        type: 'assistant',
        message: response.answer,
        timestamp: new Date(),
        confidence: response.confidence,
        sources: response.sources
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    },
    onError: (error) => {
      toast({
        title: "Chat Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!message.trim() || chatMutation.isPending) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      message: message.trim(),
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Send to AI
    chatMutation.mutate({
      message: message.trim(),
      sessionId
    });
    
    setMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setIsMinimized(false);
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && (
        <Button
          onClick={toggleChat}
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow"
          data-testid="chat-button"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {isOpen && (
        <Card 
          className={`w-96 shadow-2xl transition-all duration-200 ${
            isMinimized ? 'h-16' : 'h-96'
          }`}
          data-testid="chat-panel"
        >
          <CardHeader className="pb-2 cursor-pointer" onClick={toggleMinimize}>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-chart-2 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">AI Assistant</span>
                <Badge variant="secondary" className="text-xs">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Gemini AI
                </Badge>
              </div>
              <div className="flex space-x-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMinimize();
                  }}
                  data-testid="button-minimize"
                >
                  {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(false);
                  }}
                  data-testid="button-close-chat"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>

          {!isMinimized && (
            <>
              <CardContent className="p-0 flex-1">
                <ScrollArea className="h-64 px-4" data-testid="chat-messages">
                  <div className="space-y-3 py-2">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex items-start space-x-2 ${
                          msg.type === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                        data-testid={`message-${msg.type}-${msg.id}`}
                      >
                        {msg.type === 'assistant' && (
                          <div className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mt-1">
                            <Bot className="w-3 h-3 text-primary" />
                          </div>
                        )}
                        
                        <div
                          className={`max-w-xs rounded-lg p-3 ${
                            msg.type === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                          
                          {msg.type === 'assistant' && msg.confidence !== undefined && (
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {msg.confidence}% confidence
                              </Badge>
                              {msg.sources && msg.sources.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {msg.sources.slice(0, 2).map((source, idx) => (
                                    <Badge key={idx} variant="secondary" className="text-xs">
                                      {source}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                          
                          <p className="text-xs opacity-70 mt-1">
                            {formatTimestamp(msg.timestamp)}
                          </p>
                        </div>

                        {msg.type === 'user' && (
                          <div className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mt-1">
                            <User className="w-3 h-3 text-primary" />
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {chatMutation.isPending && (
                      <div className="flex items-start space-x-2 justify-start">
                        <div className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mt-1">
                          <Bot className="w-3 h-3 text-primary" />
                        </div>
                        <div className="bg-muted rounded-lg p-3">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
              </CardContent>

              <div className="border-t p-4">
                <div className="flex space-x-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about AYUSH terminologies..."
                    className="text-sm"
                    disabled={chatMutation.isPending}
                    data-testid="input-chat-message"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!message.trim() || chatMutation.isPending}
                    size="icon"
                    data-testid="button-send-message"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                  <span>Powered by Gemini AI</span>
                  <span>{messages.length - 1} messages</span>
                </div>
              </div>
            </>
          )}
        </Card>
      )}
    </div>
  );
}
