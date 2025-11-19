"use client"

import { getCasesS1, getChatMessages, getClassifications, getSessionsBySuspectId, getSuspects } from "@/Actions/server"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronDown, ChevronRight, Download, FileText, Filter, Plus, Search, Users } from "lucide-react"
import { useEffect, useState } from "react"
import { PreviewReport } from "./PreviewReport"

// Updated interfaces based on actual database schema
interface Suspect {
  id: string
  name: string | null
  phone: string | null
  urls: string | null
  case_id: string | null
  source_platform: string | null
  scam_patterns: string | null
  upi_ids: string | null
  bank_accounts: string | null
  addresses: string | null
  other_info: string | null
  keywords: string | null
  risk_indicators: string | null
  amounts: string | null
  victim_numbers: string | null
  created_at: string
  updated_at: string
}

interface Case {
  id: string
  case_id: string
  status: string | null
  subject: string | null
  init_id: string | null
  created_at: string
  updated_at: string
}

interface Classification {
  id: string
  content: string | null
  source_platform: string | null
  classification: string | null
  confidence_score: string | null
  sender_location: string | null
  fraud_type: string | null
  case_id: string | null
  created_at: string
  updated_at: string
}

interface NetworkNodeProps {
  item: Case | Suspect
  type: "case" | "suspect"
  isSelected: boolean
  isConnected: boolean
  onClick: () => void
  position: { x: number; y: number }
}

// Helper function to safely parse JSON strings or return empty array
function parseJsonField(field: string | null): string[] {
  if (!field) return []
  try {
    const parsed = JSON.parse(field)
    return Array.isArray(parsed) ? parsed : [field]
  } catch {
    // If it's not JSON, treat as comma-separated string
    return field.split(',').map(item => item.trim()).filter(Boolean)
  }
}

// Helper function to get fraud type from case_id using classifications
function getFraudTypeForCase(caseId: string, classifications: Classification[]): string {
  const relatedClassification = classifications.find(c => c.case_id === caseId)
  return relatedClassification?.fraud_type || relatedClassification?.classification || "unknown"
}

// Helper function to get confidence score for case
function getConfidenceScoreForCase(caseId: string, classifications: Classification[]): number {
  const relatedClassification = classifications.find(c => c.case_id === caseId)
  const score = relatedClassification?.confidence_score
  return score ? parseInt(score) : Math.floor(Math.random() * 30) + 70 // fallback random score
}

// Helper function to get AI report for case
function getAIReportForCase(caseId: string, classifications: Classification[]): string {
  const relatedClassification = classifications.find(c => c.case_id === caseId)
  if (relatedClassification?.content) {
    return relatedClassification.content.length > 100
      ? relatedClassification.content.substring(0, 100) + "..."
      : relatedClassification.content
  }
  return "No AI analysis available"
}

function NetworkNode({ item, type, isSelected, isConnected, onClick, position }: NetworkNodeProps) {
  const getRiskColor = (item: Case | Suspect) => {
    if (type === "case") {
      return "bg-blue-500"
    } else {
      const suspectItem = item as Suspect
      const riskIndicators = parseJsonField(suspectItem.risk_indicators)
      const amounts = parseJsonField(suspectItem.amounts)
      const riskScore = riskIndicators.length * 20 + amounts.length * 10
      if (riskScore >= 80) return "bg-red-500"
      if (riskScore >= 60) return "bg-orange-500"
      return "bg-yellow-500"
    }
  }

  const getSize = () => {
    if (type === "case") {
      return "w-12 h-12"
    } else {
      const suspectItem = item as Suspect
      const victimNumbers = parseJsonField(suspectItem.victim_numbers)
      return victimNumbers.length > 2 ? "w-16 h-16" : "w-12 h-12"
    }
  }

  return (
    <div
      className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 ${isSelected ? "scale-125 z-20" : isConnected ? "scale-110 z-10" : "z-0"
        }`}
      style={{ left: position.x, top: position.y }}
      onClick={onClick}
    >
      <div
        className={`${getSize()} rounded-full ${getRiskColor(item)} border-4 ${isSelected ? "border-blue-500 shadow-lg" : isConnected ? "border-blue-300" : "border-white"
          } flex items-center justify-center text-white font-bold text-xs shadow-md hover:shadow-lg transition-all`}
      >
        {type === "case" ? <FileText className="w-4 h-4" /> : <Users className="w-4 h-4" />}
      </div>
      {(item as Case).case_id && <div className={`mt-2 text-xs text-center font-medium ${isSelected ? "text-blue-600" : "text-gray-600"} line-clamp-1`}>
        {type === "case" ? (item as Case).case_id : (item as Suspect).name || "Unknown"}
      </div>}
    </div>
  )
}

interface ConnectionLineProps {
  from: { x: number; y: number }
  to: { x: number; y: number }
  isActive: boolean
}

function ConnectionLine({ from, to, isActive }: ConnectionLineProps) {
  return (
    <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: -1 }}>
      <line
        x1={from.x}
        y1={from.y}
        x2={to.x}
        y2={to.y}
        stroke={isActive ? "#3b82f6" : "#e5e7eb"}
        strokeWidth={isActive ? "3" : "2"}
        strokeDasharray={isActive ? "0" : "5,5"}
        className="transition-all duration-300"
      />
    </svg>
  )
}

export function CaseManagement() {
  const [selectedItem, setSelectedItem] = useState<{ item: Case | Suspect; type: "case" | "suspect" } | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [platformFilter, setPlatformFilter] = useState<string>("all")
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())
  const [cases, setCases] = useState<Case[]>([])
  const [suspects, setSuspects] = useState<Suspect[]>([])
  const [classifications, setClassifications] = useState<Classification[]>([])
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false)
  const [selectedSuspectProfile, setSelectedSuspectProfile] = useState<Suspect | null>(null)

  const [suspectMessages, setSuspectMessages] = useState<{session_id: string; messages: unknown[]}[]>([])
  const [combinedExtractedInfo, setCombinedExtractedInfo] = useState<Record<string, unknown>[]>([])


  useEffect(() => {
    const fetchSuspectSessions = async () => {
      const data = await getSessionsBySuspectId(selectedItem?.item.id || "")
      if (data) {
        const messages = []
        for (const session of data) {
          const chatMessages = await getChatMessages(session.id)
          messages.push({
            "session_id":session?.id,
            "messages": chatMessages
          })
        }
        console.log(messages)
        setSuspectMessages(messages)
      }
    }
    fetchSuspectSessions()
  }, [selectedItem])



  useEffect(() => {
    if (suspectMessages.length > 0) {
      const fc = suspectMessages.map((sm)=>{
        const combined = processCombinedExtractedInfo(sm.messages)
        return combined
      })
      console.log(fc)
      setCombinedExtractedInfo(fc)
    }
  }, [suspectMessages])


  const processCombinedExtractedInfo = (messages: unknown[]): Record<string, unknown> => {
    const combined: Record<string, unknown> = {}
    
    messages.forEach((message: any) => {
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
    
    return combined
  }



  // Fetch data from server
  useEffect(() => {
    async function fetchData() {
      try {
        const [casesData, suspectsData, classificationsData] = await Promise.all([
          getCasesS1(),
          getSuspects(),
          getClassifications()
        ])
        setCases(casesData)
        setSuspects(suspectsData)
        setClassifications(classificationsData)
      } catch (error) {
        console.error("Failed to fetch data:", error)
      }
    }
    fetchData()
  }, [])

  const toggleCardExpansion = (id: string) => {
    const newExpanded = new Set(expandedCards)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedCards(newExpanded)
  }

  const getStatusColor = (status: string | null) => {
    switch (status?.toUpperCase()) {
      case "OPEN":
        return "outline"; // Treat OPEN as ACTIVE
      case "ACTIVE":
        return "outline"
      case "INVESTIGATING":
        return "secondary"
      case "PENDING":
        return "destructive"
      case "CLOSED":
        return "default"
      default:
        return "outline"
    }
  }

  const getUniquePlatforms = () => {
    const platforms = suspects
      .map((s) => s.source_platform)
      .filter(Boolean)
      .filter((value, index, self) => self.indexOf(value) === index)
    return platforms as string[]
  }

  const filteredCases = cases.filter((caseItem) => {
    const fraudType = getFraudTypeForCase(caseItem.case_id, classifications)
    const matchesSearch =
      caseItem.case_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caseItem.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fraudType.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const filteredSuspects = suspects.filter((suspect) => {
    const phoneNumbers = parseJsonField(suspect.phone)
    const matchesSearch =
      (suspect.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      phoneNumbers.some((p) => p.includes(searchTerm))
    const matchesPlatform = platformFilter === "all" || suspect.source_platform === platformFilter
    return matchesSearch && matchesPlatform
  })

  // Generate positions for network view
  const generateNetworkPositions = (items: (Case | Suspect)[], containerWidth: number, containerHeight: number) => {
    const positions: { [key: string]: { x: number; y: number } } = {}
    const centerX = containerWidth / 2
    const centerY = containerHeight / 2
    const radius = Math.min(containerWidth, containerHeight) * 0.3

    items.forEach((item, index) => {
      const angle = (index / items.length) * 2 * Math.PI
      positions[item.id] = {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      }
    })

    return positions
  }

  const suspectFieldLabels: { [key: string]: string } = {
    name: "Name",
    phone: "Phone Numbers",
    emails: "Email Addresses",
    social_media_ids: "Social Media IDs",
    urls: "URLs",
    case_id: "Associated Case ID",
    source_platform: "Source Platform",
    scam_patterns: "Scam Patterns",
    upi_ids: "UPI IDs",
    bank_accounts: "Bank Accounts",
    addresses: "Addresses",
    other_info: "Other Information",
    keywords: "Keywords",
    risk_indicators: "Risk Indicators",
    amounts: "Amounts Involved",
    victim_numbers: "Victim Numbers",
    type: "Suspect Type",
    other_numbers: "Other Numbers",
    created_at: "Created At",
    updated_at: "Last Updated",
  }

  function getSuspectProfileData(suspect: Suspect) {
    const entries: { label: string; value: string }[] = []
    Object.entries(suspect).forEach(([key, value]) => {
      if (
        key !== "id" &&
        value !== null &&
        value !== undefined &&
        String(value).trim() !== ""
      ) {
        let displayValue = value
        // Try to parse JSON arrays or comma-separated
        if (typeof value === "string") {
          try {
            const parsed = JSON.parse(value)
            if (Array.isArray(parsed)) displayValue = parsed.join(", ")
          } catch {
            if (value.includes(",")) displayValue = value.split(",").map(v => v.trim()).join(", ")
          }
        }
        // Format timestamps
        if (key === "created_at" || key === "updated_at") {
          displayValue = new Date(value).toLocaleString()
        }
        entries.push({
          label: suspectFieldLabels[key] || key,
          value: displayValue as string,
        })
      }
    })
    return entries
  }

  return (
    <div className="space-y-8 p-4 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl sm:text-3xl font-bold">Case Management & Investigation Dashboard</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New Investigation
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search cases, suspects, or fraud types..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Select value={platformFilter} onValueChange={setPlatformFilter}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Platforms</SelectItem>
                  {getUniquePlatforms().map((platform) => (
                    <SelectItem key={platform} value={platform}>
                      {platform}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="cases" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="cases" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Cases View
          </TabsTrigger>
          <TabsTrigger value="suspects" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Suspects View
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cases" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cases Network View */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Case Network Visualization
                    <Badge variant="outline">{filteredCases.length} cases</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative h-96 bg-gray-50 rounded-lg overflow-hidden">
                    {(() => {
                      const positions = generateNetworkPositions(filteredCases, 600, 384)
                      return (
                        <>
                          {/* Connection lines */}
                          {filteredCases && filteredCases.map((caseItem) => {
                            const connectedSuspects = suspects.filter(s => s.case_id === caseItem.case_id)
                            return connectedSuspects.map((suspect) => {
                              const suspectPos = {
                                x: 300 + Math.random() * 100 - 50,
                                y: 192 + Math.random() * 100 - 50,
                              }
                              return (
                                <ConnectionLine
                                  key={`${caseItem.id}-${suspect.id}`}
                                  from={positions[caseItem.id]}
                                  to={suspectPos}
                                  isActive={selectedItem?.item.id === caseItem.id}
                                />
                              )
                            })
                          })}

                          {/* Case nodes */}
                          {filteredCases && filteredCases.map((caseItem) => (
                            <NetworkNode
                              key={caseItem.id}
                              item={caseItem}
                              type="case"
                              isSelected={selectedItem?.item.id === caseItem.id}
                              isConnected={false}
                              onClick={() => setSelectedItem({ item: caseItem, type: "case" })}
                              position={positions[caseItem.id]}
                            />
                          ))}
                        </>
                      )
                    })()}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Case Details Panel */}
            <div>
              <Card className="h-fit">
                <CardHeader>
                  <CardTitle>Case Details</CardTitle>
                </CardHeader>
                <CardContent className="max-h-96 overflow-y-auto">
                  {selectedItem && selectedItem.type === "case" ? (
                    <div className="space-y-4">
                      {(() => {
                        const caseItem = selectedItem.item as Case
                        const connectedSuspects = suspects.filter(s => s.case_id === caseItem.case_id)
                        const fraudType = getFraudTypeForCase(caseItem.case_id, classifications)
                        const confidenceScore = getConfidenceScoreForCase(caseItem.case_id, classifications)
                        const aiReport = getAIReportForCase(caseItem.case_id, classifications)
                        const victimCount = new Set(connectedSuspects.flatMap(s => parseJsonField(s.victim_numbers))).size

                        return (
                          <>
                            <div className="">
                              <h3 className="font-semibold text-lg line-clamp-1">{caseItem.case_id}</h3>
                              <Badge variant={getStatusColor(caseItem.status)} className="mt-1">
                                {caseItem.status?.toUpperCase() === "OPEN"
                                  ? "ACTIVE"
                                  : caseItem.status?.toUpperCase() || "INVESTIGATING"}
                              </Badge>
                            </div>

                            {confidenceScore !== undefined && confidenceScore !== null &&
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-sm font-medium">Confidence:</span>
                                  <Badge variant="secondary">{confidenceScore * 100}%</Badge>
                                </div>
                                <Progress value={confidenceScore * 100} className="h-2" />
                              </div>}

                            {fraudType ? (<div>
                              <span className="text-sm font-medium">Fraud Type:</span>
                              <Badge variant="outline" className="ml-2">
                                {fraudType}
                              </Badge>
                            </div>) : (null)}

                            {victimCount > 0 && <div>
                              <span className="text-sm font-medium">Victims:</span>
                              <span className="ml-2">{victimCount}</span>
                            </div>}

                            {connectedSuspects && <div>
                              <span className="text-sm font-medium">Connected Suspects:</span>
                              <div className="mt-1 space-y-1 max-h-20 overflow-y-auto">
                                {connectedSuspects.map((suspect) => (
                                  <Badge key={suspect.id} variant="destructive" className="mr-1 text-xs">
                                    {suspect.name || "Unknown"}
                                  </Badge>
                                ))}
                              </div>
                            </div>}

                            {aiReport && <div>
                              <span className="text-sm font-medium">AI Analysis:</span>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-3">{aiReport}</p>
                            </div>}

                          </>
                        )
                      })()}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Click on a case node to view details</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Cases List */}
          <Card>
            <CardHeader>
              <CardTitle>All Cases</CardTitle>
            </CardHeader>
            <CardContent className="max-h-96 overflow-y-auto">
              <div className="space-y-3">
                {filteredCases.map((caseItem) => {
                  const fraudType = getFraudTypeForCase(caseItem.case_id, classifications)
                  const confidenceScore = getConfidenceScoreForCase(caseItem.case_id, classifications)
                  const connectedSuspects = suspects.filter(s => s.case_id === caseItem.case_id)
                  const victimCount = new Set(connectedSuspects.flatMap(s => parseJsonField(s.victim_numbers))).size
                  const aiReport = getAIReportForCase(caseItem.case_id, classifications)

                  return (
                    <div
                      key={caseItem.id}
                      className="border rounded-lg p-4 hover:bg-accent cursor-pointer transition-colors"
                      onClick={() => toggleCardExpansion(caseItem.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {expandedCards.has(caseItem.id) ? (
                            <ChevronDown className="w-4 h-4 flex-shrink-0" />
                          ) : (
                            <ChevronRight className="w-4 h-4 flex-shrink-0" />
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="font-medium line-clamp-1">{caseItem.case_id}</div>
                            <div className="text-sm text-muted-foreground line-clamp-1">{fraudType}</div>
                          </div>
                        </div>
                        {caseItem.status && <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge variant={getStatusColor(caseItem.status)}>
                            {caseItem.status?.toUpperCase() === "OPEN"
                              ? "ACTIVE"
                              : caseItem.status?.toUpperCase() || "INVESTIGATING"}
                          </Badge>
                          <Badge variant="secondary">{confidenceScore * 100}%</Badge>
                          <PreviewReport caseItem={caseItem} />
                        </div>}
                      </div>

                      {expandedCards.has(caseItem.id) && (
                        <div className="mt-4 pt-4 border-t space-y-3">
                          {victimCount && <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Victims:</span>
                              <div>{victimCount}</div>
                            </div>
                          </div>}

                          {connectedSuspects && <div>
                            <span className="font-medium text-sm">Connected Suspects:</span>
                            <div className="flex flex-wrap gap-1 mt-1 max-h-16 overflow-y-auto">
                              {connectedSuspects.map((suspect) => (
                                <Badge key={suspect.id} variant="destructive" className="text-xs">
                                  {suspect.name || "Unknown"}
                                </Badge>
                              ))}
                            </div>
                          </div>}

                          {aiReport &&
                            <div>
                              <span className="font-medium text-sm">AI Analysis:</span>
                              <p className="text-xs text-muted-foreground mt-1 ">{aiReport}</p>
                            </div>
                          }
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suspects" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Suspects Network View */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  {filteredSuspects.length >= 0 && <CardTitle className="flex items-center justify-between">
                    Suspect Network Visualization
                    <Badge variant="outline">{filteredSuspects.length} suspects</Badge>
                  </CardTitle>
                  }
                </CardHeader>
                <CardContent>
                  <div className="relative h-96 bg-gray-50 rounded-lg overflow-hidden">
                    {(() => {
                      const positions = generateNetworkPositions(filteredSuspects, 600, 384)
                      return (
                        <>
                          {/* Connection lines between suspects and cases */}
                          {filteredSuspects && filteredSuspects.map((suspect) => {
                            const connectedCases = cases.filter(c => c.case_id === suspect.case_id)
                            return connectedCases.map((caseItem) => {
                              const casePos = { x: 300 + Math.random() * 100 - 50, y: 192 + Math.random() * 100 - 50 }
                              return (
                                <ConnectionLine
                                  key={`${suspect.id}-${caseItem.id}`}
                                  from={positions[suspect.id]}
                                  to={casePos}
                                  isActive={selectedItem?.item.id === suspect.id}
                                />
                              )
                            })
                          })}

                          {/* Suspect nodes */}
                          {filteredSuspects && filteredSuspects.map((suspect) => (
                            <NetworkNode
                              key={suspect.id}
                              item={suspect}
                              type="suspect"
                              isSelected={selectedItem?.item.id === suspect.id}
                              isConnected={false}
                              onClick={() => setSelectedItem({ item: suspect, type: "suspect" })}
                              position={positions[suspect.id]}
                            />
                          ))}
                        </>
                      )
                    })()}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Suspect Details Panel */}
            <div>
              <Card className="h-fit">
                <CardHeader>
                  <CardTitle>Suspect Details</CardTitle>
                </CardHeader>
                <CardContent className="max-h-96 overflow-y-auto">
                  {selectedItem && selectedItem.type === "suspect" ? (
                    <div className="space-y-4">
                      {(() => {
                        const suspect = selectedItem.item as Suspect
                        // const riskIndicators = parseJsonField(suspect.risk_indicators)
                        const amounts = parseJsonField(suspect.amounts)
                        const phoneNumbers = parseJsonField(suspect.phone)
                        const upiIds = parseJsonField(suspect.upi_ids)
                        // const riskScore = Math.min(riskIndicators.length * 20 + amounts.length * 10, 100)

                        return (
                          <>
                            {suspect.name && <div>
                              <h3 className="font-semibold text-lg line-clamp-1">{suspect.name || "Unknown Suspect"}</h3>
                              <Badge variant="outline" className="mt-1">
                                {suspect.source_platform || null}
                              </Badge>
                            </div>}

                            {/* {riskScore && <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm font-medium">Risk Score:</span>
                                <Badge
                                  variant={riskScore >= 80 ? "destructive" : riskScore >= 60 ? "secondary" : "default"}
                                >
                                  {riskScore}%
                                </Badge>
                              </div>
                              <Progress value={riskScore} className="h-2" />
                            </div>} */}

                            {phoneNumbers.length > 0 &&

                            <div>
                              <span className="text-sm font-medium">UPI IDs:</span>
                              <div className="mt-1  overflow-y-auto">
                                {upiIds.length > 0 ? upiIds.map((upi, index) => (
                                  <Badge key={index} variant="outline" className=" text-xs space-x-2">
                                    {upi}
                                  </Badge>
                                )) : <span className="text-xs text-muted-foreground">No UPI IDs</span>}
                              </div>
                            </div>
                      }

                            {amounts.length > 0 && <div>
                              <span className="text-sm font-medium">Amounts Involved:</span>
                              <div className="mt-1 max-h-16 overflow-y-auto space-x-2">
                                {amounts.length > 0 ? amounts.map((amount, index) => (
                                  <Badge key={index} variant="secondary" className="gap-2">
                                    {amount}
                                  </Badge>
                                )) : <span className="text-xs text-muted-foreground">No amounts recorded</span>}
                              </div>
                            </div>}

                            {cases.length > 0 && <div>
                              <span className="text-sm font-medium">Connected Cases:</span>
                              <div className="mt-1 max-h-16 overflow-y-auto">
                                {cases
                                  .filter((c) => c.case_id === suspect.case_id)
                                  .map((caseItem) => (
                                    <Badge key={caseItem.id} variant="destructive" className="mr-1 mb-1 text-xs">
                                      {caseItem.case_id}
                                    </Badge>
                                  ))}
                              </div>
                            </div>}

                            <Button
                              className="w-full"
                              size="sm"
                              onClick={() => {
                                setSelectedSuspectProfile(suspect)
                                setIsProfileDialogOpen(true)
                              }}
                            >
                              View Full Profile
                            </Button>
                          </>
                        )
                      })()}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Click on a suspect node to view details</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Suspects List */}
          <Card>
            <CardHeader>
              <CardTitle>All Suspects</CardTitle>
            </CardHeader>
            <CardContent className="max-h-96 overflow-y-auto">
              <div className="space-y-3">
                {filteredSuspects.map((suspect) => {
                  const riskIndicators = parseJsonField(suspect.risk_indicators)
                  const amounts = parseJsonField(suspect.amounts)
                  const phoneNumbers = parseJsonField(suspect.phone)
                  const victimNumbers = parseJsonField(suspect.victim_numbers)
                  const riskScore = Math.min(riskIndicators.length * 20 + amounts.length * 10, 100)

                  return (
                    <div
                      key={suspect.id}
                      className="border rounded-lg p-4 hover:bg-accent cursor-pointer transition-colors"
                      onClick={() => toggleCardExpansion(suspect.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {expandedCards.has(suspect.id) ? (
                            <ChevronDown className="w-4 h-4 flex-shrink-0" />
                          ) : (
                            <ChevronRight className="w-4 h-4 flex-shrink-0" />
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="font-medium line-clamp-1">{suspect.name || null}</div>
                            <div className="text-sm text-muted-foreground line-clamp-1">{suspect.scam_patterns || null}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge variant={suspect.source_platform ? "outline" : "secondary"}>
                            {suspect.source_platform || null}
                          </Badge>
                          <Badge variant={riskScore >= 80 ? "destructive" : riskScore >= 60 ? "secondary" : "default"}>
                            {riskScore}%
                          </Badge>
                        </div>
                      </div>

                      {expandedCards.has(suspect.id) && (
                        <div className="mt-4 pt-4 border-t space-y-3">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            {phoneNumbers.length >0 && <div>
                              <span className="font-medium">Phone Numbers:</span>
                              <div className="text-xs">{phoneNumbers.length} numbers</div>
                            </div>}
                            {victimNumbers.length && 
                            <div>
                              <span className="font-medium">Victims:</span>
                              <div className="text-xs">{victimNumbers.length} victims</div>
                            </div>
                          }
                          </div>

                          <div>
                            <span className="font-medium text-sm">Risk Indicators:</span>
                            <div className="max-h-20 overflow-y-auto">
                              {riskIndicators.length > 0 ? (
                                <ul className="text-xs text-muted-foreground mt-1 space-y-1">
                                  {riskIndicators.slice(0, 3).map((indicator, idx) => (
                                    <li key={idx} className="flex items-start gap-1">
                                      <div className="w-1 h-1 bg-red-500 rounded-full mt-1.5 flex-shrink-0" />
                                      <span className="line-clamp-1">{indicator}</span>
                                    </li>
                                  ))}
                                  {riskIndicators.length > 3 && (
                                    <li className="text-blue-600">+{riskIndicators.length - 3} more indicators</li>
                                  )}
                                </ul>
                              ) : (
                                <span className="text-xs text-muted-foreground">No risk indicators</span>
                              )}
                            </div>
                          </div>

                          <div>
                            <span className="font-medium text-sm">Connected Cases:</span>
                            <div className="flex flex-wrap gap-1 mt-1 max-h-16 overflow-y-auto">
                              {cases
                                .filter((c) => c.case_id === suspect.case_id)
                                .map((caseItem) => (
                                  <Badge key={caseItem.id} variant="outline" className="text-xs">
                                    {caseItem.case_id}
                                  </Badge>
                                ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedSuspectProfile?.name ? `Suspect Profile: ${selectedSuspectProfile?.name}` : null}
            </DialogTitle>
          </DialogHeader>
          {selectedSuspectProfile && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {getSuspectProfileData(selectedSuspectProfile).map(({ label, value }) => (
                <div key={label} className="flex flex-col">
                  <span className="font-semibold text-gray-700 text-sm">{label}</span>
                  <span className="text-gray-900 text-sm break-words">{value}</span>
                </div>
              ))}
            </div>
          )}
          {combinedExtractedInfo && (
            <div className="mt-4">
              <h3 className="font-semibold text-lg mb-2">Extracted Information</h3>
              <pre className="text-xs bg-gray-50 p-4 rounded-lg overflow-x-auto max-h-64">
                {JSON.stringify(combinedExtractedInfo, null, 2)}
              </pre>
            </div>
          )}
          <div className="flex justify-end mt-6">
            <Button variant="outline" onClick={() => setIsProfileDialogOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
