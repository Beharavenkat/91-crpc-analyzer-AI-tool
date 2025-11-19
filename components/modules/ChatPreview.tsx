"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { User, Bot, Download, MoreVertical, Eye, RefreshCw, Database, Copy, MessageCircle, Merge } from "lucide-react"
import { getChatMessages, getSuspectInfo } from "@/Actions/server"
import { supabase } from "@/utils/supabase"

interface Session {
  id: string
  case_id: string
  persona_id: string
  suspect_id: string
  created_at: string
}

interface Suspect {
  id: string
  name?: string
  phone?: string
  case_id: string
  type: string
  source_platform?: string
}

interface Persona {
  id: string
  name: string
  age: string
  description: string
  context: string
}

interface ChatMessage {
  id: string
  message: string
  sender: string
  recipient: string
  session_id: string
  created_at: string
  additional_info?: string
}

interface SuspectInfo {
  id: string
  name?: string
  phone?: string
  case_id: string
  source_platform?: string
  extracted_info?: any
  chat_count?: number
  last_activity?: string
  [key: string]: any
}

interface ChatPreviewProps {
  session: Session
  suspect?: Suspect
  persona?: Persona
}

export function ChatPreview({ session, suspect, persona }: ChatPreviewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [suspectInfo, setSuspectInfo] = useState<SuspectInfo | null>(null)
  const [combinedExtractedInfo, setCombinedExtractedInfo] = useState<any>({})
  const [loading, setLoading] = useState(false)
  const [reloading, setReloading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadChatMessages()
    loadSuspectInfo()
    setupRealtimeSubscription()
    
    return () => {
      supabase.removeAllChannels()
    }
  }, [session.id])

  useEffect(() => {
    scrollToBottom()
    processCombinedExtractedInfo(messages)
  }, [messages])

  const processCombinedExtractedInfo = (messages: any[]) => {
    const combined: Record<string, any> = {}
    
    messages.forEach(message => {
      if (message.additional_info) {
        try {
          const additionalData = JSON.parse(message.additional_info)
          const extractedInfo = additionalData.extracted_info || {}
          
          Object.keys(extractedInfo).forEach(key => {
            if (extractedInfo[key]) {
              if (combined[key]) {
                if (Array.isArray(combined[key])) {
                  if (!combined[key].includes(extractedInfo[key])) {
                    combined[key].push(extractedInfo[key])
                  }
                } else {
                  if (combined[key] !== extractedInfo[key]) {
                    combined[key] = [combined[key], extractedInfo[key]]
                  }
                }
              } else {
                combined[key] = extractedInfo[key]
              }
            }
          })
        } catch (error) {
          console.error("Error parsing additional_info:", error)
        }
      }
    })
    
    setCombinedExtractedInfo(combined)
  }

  const setupRealtimeSubscription = () => {
    const chatChannel = supabase
      .channel(`chat-${session.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chats_s2',
          filter: `session_id=eq.${session.id}`
        },
        (payload) => {
          console.log('Chat change received!', payload)
          if (payload.eventType === 'INSERT') {
            const newMessage = payload.new as ChatMessage
            setMessages(prev => {
              if (prev.find(msg => msg.id === newMessage.id)) {
                return prev
              }
              return [...prev, newMessage]
            })
          } else if (payload.eventType === 'UPDATE') {
            setMessages(prev => 
              prev.map(msg => 
                msg.id === payload.new.id ? payload.new as ChatMessage : msg
              )
            )
          } else if (payload.eventType === 'DELETE') {
            setMessages(prev => 
              prev.filter(msg => msg.id !== payload.old.id)
            )
          }
        }
      )
      .subscribe()
  }

  const loadChatMessages = async () => {
    try {
      setLoading(true)
      const chatMessages = await getChatMessages(session.id)
      setMessages(chatMessages)
    } catch (error) {
      console.error("Error loading chat messages:", error)
      setMessages([])
    } finally {
      setLoading(false)
    }
  }

  const loadSuspectInfo = async () => {
    try {
      const info = await getSuspectInfo(session.suspect_id)
      setSuspectInfo(info)
    } catch (error) {
      console.error("Error loading suspect info:", error)
    }
  }

  const reloadChatMessages = async () => {
    try {
      setReloading(true)
      const chatMessages = await getChatMessages(session.id)
      setMessages(chatMessages)
      await loadSuspectInfo()
    } catch (error) {
      console.error("Error reloading chat messages:", error)
    } finally {
      setReloading(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: "2-digit", 
      minute: "2-digit" 
    })
  }

  const isOutgoing = (message: ChatMessage) => {
    return message.sender === persona?.name || message.sender === "persona"
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const extractedData = {
    suspect_id: session.suspect_id,
    case_id: session.case_id,
    session_info: {
      id: session.id,
      created_at: session.created_at,
      message_count: messages.length,
      last_message_time: messages.length > 0 ? messages[messages.length - 1].created_at : null
    },
    suspect_details: suspectInfo,
    chat_analysis: {
      total_messages: messages.length,
      incoming_messages: messages.filter(m => !isOutgoing(m)).length,
      outgoing_messages: messages.filter(m => isOutgoing(m)).length,
      conversation_duration: messages.length > 0 ? 
        Math.round((new Date(messages[messages.length - 1].created_at).getTime() - 
                   new Date(messages[0].created_at).getTime()) / (1000 * 60)) : 0
    },
    extracted_info: {
      phone_numbers: messages.flatMap(m => m.message.match(/\b\d{10}\b|\b\d{3}-\d{3}-\d{4}\b/g) || []),
      email_addresses: messages.flatMap(m => m.message.match(/\b[\w.-]+@[\w.-]+\.\w+\b/g) || []),
      amounts: messages.flatMap(m => m.message.match(/₹?\s*\d+(?:,\d+)*(?:\.\d+)?/g) || []),
      urls: messages.flatMap(m => m.message.match(/https?:\/\/[^\s]+/g) || [])
    },
    last_updated: new Date().toISOString()
  }

  return (
    <div className="h-full flex-col gap-4">
      {/* Left Column - Chat */}
      <div className="flex-1 flex flex-col">
        <Card className="h-full flex flex-col">
          {/* Chat Header */}
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">{suspect?.name || "Unknown Suspect"}</CardTitle>
                  <p className="text-sm text-gray-500">{suspect?.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  Preview
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Live
                </Badge>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {/* Persona Info */}
            {persona && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Bot className="w-4 h-4 text-amber-600" />
                  <span className="font-medium text-sm text-amber-800">
                    Active Persona: {persona.name} (Age: {persona.age})
                  </span>
                </div>
                <p className="text-xs text-amber-700">{persona.description}</p>
              </div>
            )}
          </CardHeader>

          <Separator />

          {/* Messages Area */}
          <CardContent className="flex-1 flex flex-col min-h-0 p-0">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="text-gray-500">Loading messages...</div>
                </div>
              ) : messages.length > 0 ? (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${isOutgoing(message) ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] p-3 rounded-lg ${
                        isOutgoing(message)
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <div className="text-sm" style={{whiteSpace: 'pre-line'}}>{message.message}</div>
                      <div className={`text-xs mt-1 ${
                        isOutgoing(message) ? "text-blue-100" : "text-gray-500"
                      }`}>
                        {formatTime(message.created_at)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                  <MessageCircle className="w-12 h-12 mb-2 opacity-50" />
                  <p>No messages yet</p>
                  <p className="text-sm">Chat messages will appear here in real-time</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Read-only Footer */}
            <div className="p-4 border-t bg-gray-50">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <Eye className="w-4 h-4" />
                <span>Preview Mode - Read Only</span>
                <span className="mx-2">•</span>
                {/* <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Real-time Updates Active</span> */}
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={reloadChatMessages}
                  disabled={reloading}
                >
                  <RefreshCw className={`w-4 h-4 ${reloading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column - Data */}
      <div className="">
        {/* Suspect Data Card */}
        <Card className="">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Database className="w-5 h-5" />
                Suspect Data
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => copyToClipboard(JSON.stringify(suspectInfo, null, 2))}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-64 p-4">
              <pre className="text-xs bg-gray-50 p-3 rounded-lg overflow-x-auto">
                <code>{JSON.stringify(suspectInfo, null, 2)}</code>
              </pre>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Combined Extracted Info Card */}
        <Card className="">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Merge className="w-5 h-5" />
                Combined Extracted Info
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {Object.keys(combinedExtractedInfo).length} fields
                </Badge>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => copyToClipboard(JSON.stringify(combinedExtractedInfo, null, 2))}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-64 p-4">
              {Object.keys(combinedExtractedInfo).length > 0 ? (
                <pre className="text-xs bg-gray-50 p-3 rounded-lg overflow-x-auto">
                  <code>{JSON.stringify(combinedExtractedInfo, null, 2)}</code>
                </pre>
              ) : (
                <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                  <Merge className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-sm">No extracted info yet</p>
                  <p className="text-xs">Data will appear as messages are processed</p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Analysis Card */}
        <Card className="">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageCircle className="w-5 h-5" />
                Chat Analysis
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => copyToClipboard(JSON.stringify(extractedData, null, 2))}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-64 p-4">
              <pre className="text-xs bg-gray-50 p-3 rounded-lg overflow-x-auto">
                <code>{JSON.stringify(extractedData, null, 2)}</code>
              </pre>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
