"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Users, MessageCircle, Play, User, Bot, RefreshCw, Clock } from "lucide-react"
import { 
  getCasesS1, 
  getSuspects, 
  fetchPersonasFromSupabase,
  insertSessionId,
  getChatMessages,
  getSessionsByCaseId,
} from "@/Actions/server"
import { ChatPreview } from "./ChatPreview"
import { supabase } from "@/utils/supabase";


interface Case {
  case_id: string
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

interface Session {
  id: string
  case_id: string
  persona_id: string
  suspect_id: string
  created_at: string
  status?: string
}

export function DecoyChat() {
  const [cases, setCases] = useState<Case[]>([])
  const [suspects, setSuspects] = useState<Suspect[]>([])
  const [personas, setPersonas] = useState<Persona[]>([])
  const [activeSessions, setActiveSessions] = useState<Session[]>([])
  
  const [selectedCaseId, setSelectedCaseId] = useState<string>("")
  const [selectedSuspectId, setSelectedSuspectId] = useState<string>("")
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>("")
  const [selectedSessionId, setSelectedSessionId] = useState<string>("")
  
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingSessions, setLoadingSessions] = useState(false)

  // Load initial data
  useEffect(() => {
    loadInitialData()
  }, [])

  // Load suspects and sessions when case is selected
  useEffect(() => {
    if (selectedCaseId) {
      loadSuspectsForCase(selectedCaseId)
      loadActiveSessionsForCase(selectedCaseId)
      resetSelections()
    }
  }, [selectedCaseId])

  // Set session when session ID is selected
  useEffect(() => {
    if (selectedSessionId) {
      const foundSession = activeSessions.find(s => s.id === selectedSessionId)
      if (foundSession) {
        setSession(foundSession)
        setSelectedSuspectId(foundSession.suspect_id)
        setSelectedPersonaId(foundSession.persona_id)
      }
    }
  }, [selectedSessionId, activeSessions])

  // Setup real-time subscription for sessions
  useEffect(() => {
    if (selectedCaseId) {
      const sessionChannel = supabase
        .channel(`sessions-${selectedCaseId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'sessions_s2',
            filter: `case_id=eq.${selectedCaseId}`
          },
          (payload:any) => {
            console.log('Session change received!', payload)
            if (payload.eventType === 'INSERT') {
              setActiveSessions(prev => [...prev, payload.new as Session])
            } else if (payload.eventType === 'UPDATE') {
              setActiveSessions(prev => 
                prev.map(session => 
                  session.id === payload.new.id ? payload.new as Session : session
                )
              )
            } else if (payload.eventType === 'DELETE') {
              setActiveSessions(prev => 
                prev.filter(session => session.id !== payload.old.id)
              )
            }
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(sessionChannel)
      }
    }
  }, [selectedCaseId])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      const [casesData, personasData] = await Promise.all([
        getCasesS1(),
        fetchPersonasFromSupabase()
      ])
      setCases(casesData)
      setPersonas(personasData)
    } catch (error) {
      console.error("Error loading initial data:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadSuspectsForCase = async (caseId: string) => {
    try {
      const allSuspects = await getSuspects()
      const filteredSuspects = allSuspects.filter(suspect => suspect.case_id === caseId)
      setSuspects(filteredSuspects)
    } catch (error) {
      console.error("Error loading suspects:", error)
    }
  }

  const loadActiveSessionsForCase = async (caseId: string) => {
    try {
      setLoadingSessions(true)
      const sessions = await getSessionsByCaseId(caseId)
      setActiveSessions(sessions)
    } catch (error) {
      console.error("Error loading sessions:", error)
      setActiveSessions([])
    } finally {
      setLoadingSessions(false)
    }
  }

  const resetSelections = () => {
    setSelectedSuspectId("")
    setSelectedPersonaId("")
    setSelectedSessionId("")
    setSession(null)
  }

  const startChatSession = async () => {
    if (!selectedCaseId || !selectedSuspectId || !selectedPersonaId) {
      alert("Please select case, suspect, and persona")
      return
    }

    try {
      setLoading(true)
      const phone = suspects.find((item)=>item.id==selectedSuspectId)
      console.log(phone)
      const newSession = await insertSessionId(selectedCaseId, selectedPersonaId, selectedSuspectId, phone?.phone || "")
      const createdSession = newSession[0]
      
      try{
        let bodyContent = JSON.stringify({
          "session_id": createdSession.id,
          "suspect_id": selectedSuspectId,
          "case_id": selectedCaseId,
          "persona_id": selectedPersonaId,
          "phone": phone?.phone || ""
        });
        let response = await fetch("https://n8n.bestplanettechnology.com/webhook/start-ai-chat", { 
          method: "POST",
          body: bodyContent,
          headers: {
            "Content-Type": "application/json"
          }
        });
        
        if(response.ok){
          console.log("successfully initiated chat")
          setSession(createdSession)
        }
      }
      catch(e){
        console.log("error in initiating chat")
      }
      
      // Session will be added to activeSessions via real-time subscription
    } catch (error) {
      console.error("Error creating session:", error)
    } finally {
      setLoading(false)
    }
  }

  const canStartSession = selectedCaseId && selectedSuspectId && selectedPersonaId && !selectedSessionId
  const selectedSuspect = suspects.find(s => s.id === selectedSuspectId)
  const selectedPersona = personas.find(p => p.id === selectedPersonaId)

  const getPersonaName = (personaId: string) => {
    const persona = personas.find(p => p.id === personaId)
    return persona?.name || "Unknown Persona"
  }

  const getSuspectName = (suspectId: string) => {
    const suspect = suspects.find(s => s.id === suspectId)
    return suspect?.name || "Unknown Suspect"
  }

  return (
    <div className="h-screen flex flex-col p-6 bg-gray-50">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Chat Session Setup</h1>
        <p className="text-gray-600 mt-2">Select case → suspect → persona → start chatting</p>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        {/* Left Panel - Selection Process */}
        <div className="col-span-4 space-y-4 overflow-y-auto">
          
          {/* Step 1: Case Selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600">1</div>
                Select Case
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedCaseId} onValueChange={setSelectedCaseId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a case" />
                </SelectTrigger>
                <SelectContent>
                  {cases.map((case_item) => (
                    <SelectItem key={case_item.case_id} value={case_item.case_id}>
                      {case_item.case_id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Active Sessions for Selected Case */}
          {selectedCaseId && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    Active Sessions
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{activeSessions.length}</Badge>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => loadActiveSessionsForCase(selectedCaseId)}
                      disabled={loadingSessions}
                    >
                      <RefreshCw className={`w-4 h-4 ${loadingSessions ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activeSessions.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {activeSessions.map((activeSession) => (
                      <div
                        key={activeSession.id}
                        onClick={() => setSelectedSessionId(activeSession.id)}
                        className={`p-3 border rounded-lg cursor-pointer transition-all ${
                          selectedSessionId === activeSession.id
                            ? "bg-blue-50 border-blue-200"
                            : "bg-white hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {getSuspectName(activeSession.suspect_id)}
                            </p>
                            <p className="text-xs text-gray-500">
                              Persona: {getPersonaName(activeSession.persona_id)}
                            </p>
                            <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                              <Clock className="w-3 h-3" />
                              {new Date(activeSession.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {activeSession.status || "Active"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    {loadingSessions ? "Loading sessions..." : "No active sessions found"}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 2: Suspect Selection */}
          {selectedCaseId && !selectedSessionId && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-sm font-bold text-green-600">2</div>
                  Select Suspect
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedSuspectId} onValueChange={setSelectedSuspectId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a suspect" />
                  </SelectTrigger>
                  <SelectContent>
                    {suspects.map((suspect) => (
                      <SelectItem key={suspect.id} value={suspect.id}>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <div>
                            <div className="font-medium">{suspect.name || "Unknown"}</div>
                            <div className="text-xs text-gray-500">{suspect.phone}</div>
                            <Badge>{suspect.type}</Badge>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Persona Selection */}
          {selectedSuspectId && !selectedSessionId && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-sm font-bold text-purple-600">3</div>
                  Select Persona
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedPersonaId} onValueChange={setSelectedPersonaId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a persona" />
                  </SelectTrigger>
                  <SelectContent>
                    {personas.map((persona) => (
                      <SelectItem key={persona.id} value={persona.id}>
                        <div className="flex items-center gap-2">
                          <Bot className="w-4 h-4" />
                          <div>
                            <div className="font-medium">{persona.name}</div>
                            <div className="text-xs text-gray-500">Age: {persona.age}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          )}

          {/* Selection Summary & Start Button */}
          {canStartSession && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Ready to Start
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Case:</span>
                    <Badge variant="outline">{selectedCaseId}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Suspect:</span>
                    <span className="font-medium">{selectedSuspect?.name || "Unknown"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Persona:</span>
                    <span className="font-medium">{selectedPersona?.name}</span>
                  </div>
                </div>
                
                <Button 
                  onClick={startChatSession} 
                  disabled={loading}
                  className="w-full"
                  size="lg"
                >
                  <Play className="w-5 h-5 mr-2" />
                  {loading ? "Starting..." : "Start Chat Session"}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Panel - Chat Preview */}
        <div className="col-span-8 h-full">
          {session ? (
            <ChatPreview 
              session={session}
              suspect={selectedSuspect}
              persona={selectedPersona}
            />
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center">
                <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Session</h3>
                <p className="text-gray-500">
                  {selectedCaseId 
                    ? "Select an existing session or create a new one" 
                    : "Select a case to view available sessions"
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
