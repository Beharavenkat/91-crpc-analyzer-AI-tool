"use client"

import {
  insertClassificationWithCaseId,
  insertSuspectPhoneNumber,
} from "@/Actions/server"
import FileUploadBox from "@/components/FileUploadBox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
// import { Download, Upload } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import AllMessageData from "../AllMessageData"
import { PhoneInput } from "../phone-input"
import WhatsAppGroupUI from "../whatsapp-group-ui"



interface ClassificationResult {
  prediction: "SPAM" | "HAM"
  confidence: number
}



export function MessageClassification() {
  const [message, setMessage] = useState("")
  const [location, setLocation] = useState("")
  const [platform, setPlatform] = useState("whatsapp")
  const [result, setResult] = useState<ClassificationResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState("")
  const [tabValue, setTabValue] = useState("all")

  const router = useRouter()

  const ClassificationApi = async (text: string) => {
    try {
      const response = await fetch("http://localhost:8000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      })

      const responseBody = await response.text()
      let data
      try {
        data = JSON.parse(responseBody)
      } catch {
        console.error("Failed to parse JSON:", responseBody)
        throw new Error("Invalid JSON response from server")
      }

      if (!response.ok) {
        console.error("API error response:", data)
        throw new Error(
          data?.error || `HTTP error! status: ${response.status}`
        )
      }

      return data as ClassificationResult
    } catch (error) {
      console.error("API error:", error)
      throw error
    }
  }

  const classifyMessage = async () => {
    if (!message.trim()) {
      alert("Please enter a message to classify.")
      return
    }
    setLoading(true)
    try {
      const classification = await ClassificationApi(message)
      if (classification) {
        const data = await insertClassificationWithCaseId({
          content: message,
          classification: classification?.prediction === "SPAM" ? "suspicious" : "benign",
          confidence_score: classification?.confidence || 0,
          sender_location: location,
          source_platform: platform,
          media_type: "text",
        })
        if (phoneNumber && data?.case_id) {
          try {
            await insertSuspectPhoneNumber(phoneNumber, data?.case_id)
          } catch (err) {
            console.error('Error inserting phone number into suspect table:', err)
          }
        }
      }
      setResult(classification)

      router.refresh()
    } catch {
      alert("Failed to classify message. See console for details.")
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">
          {tabValue === "classification" ? "Message Classification" : "WhatsApp Groups"}
        </h2>
        {/* <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button>
            <Upload className="w-4 h-4 mr-2" />
            Batch Upload
          </Button>
        </div> */}
      </div>

      <Tabs defaultValue="classification" value={tabValue} onValueChange={setTabValue} className="w-full">
        <TabsList className="w-full p-4 h-10">
          <TabsTrigger value="all" className="h-8">All</TabsTrigger>
          <TabsTrigger value="file-upload" className="h-8">Batch Upload</TabsTrigger>
          <TabsTrigger value="classification" className="h-8">Message Classification</TabsTrigger>
          <TabsTrigger value="whatsapp-group" className="h-8">WhatsApp Group</TabsTrigger>
        </TabsList>

        <TabsContent value="file-upload">
          <FileUploadBox />
        </TabsContent>

        <TabsContent value="classification">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <Card>
              <CardHeader>
                <CardTitle>Message Input</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="content">Message Content</Label>
                  <Textarea
                    id="content"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Paste the message content here for classification..."
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Sender Phone</Label>
                  <PhoneInput defaultCountry="IN" value={phoneNumber} onChange={setPhoneNumber} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger id="location" className="w-full" aria-label="Location">
                      <span>{location ? location : "Select location"}</span>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="guntur">Guntur</SelectItem>
                      <SelectItem value="vijayawada">Vijayawada</SelectItem>
                      <SelectItem value="vizag">Vizag</SelectItem>
                      <SelectItem value="tirupati">Tirupati</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="platform">Platform</Label>
                  <Select value={platform} onValueChange={setPlatform}>
                    <SelectTrigger id="platform" className="w-full" aria-label="platform">
                      <span>{platform ? platform : "Select platform"}</span>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="SMS">SMS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={classifyMessage}
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? "Classifying..." : "Classify Message"}
                </Button>
              </CardContent>
            </Card>

            {/* Results Section */}
            {result && result.prediction && (
              <Card>
                <CardHeader>
                  <CardTitle>Classification Results</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Badge variant={result.prediction === "SPAM" ? "destructive" : "default"}>
                      {typeof result.prediction === "string"
                        ? result.prediction.charAt(0).toUpperCase() + result.prediction.slice(1)
                        : "Unknown"}
                    </Badge>
                    <span className="font-bold text-primary">{Math.round(result.confidence * 100)}%</span>
                  </div>

                  <div className="bg-muted p-3 rounded-lg">
                    <h4 className="font-medium mb-2">Stored Data Summary</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><strong>Message:</strong> {message?.substring(0, 50)}...</div>
                      <div><strong>Classification:</strong> {result.prediction}</div>
                      <div><strong>Confidence:</strong> {Math.round(result.confidence * 100)}%</div>
                      <div><strong>Location:</strong> {location || "Not specified"}</div>
                      <div><strong>Platform:</strong> {platform || "Not specified"}</div>
                      <div><strong>Timestamp:</strong> {new Date().toLocaleString()}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

        </TabsContent>

        <TabsContent value="whatsapp-group">
          <WhatsAppGroupUI />
        </TabsContent>

        <TabsContent value="all" className="space-y-2">
          <AllMessageData/>
        </TabsContent>
      </Tabs>
    </div>
  )
}
