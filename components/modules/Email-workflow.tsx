'use client'

import { getEmail } from "@/Actions/server"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Send, Settings } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"



export function EmailWorkflow() {

  interface Email {
    id: string | number
    recipient: string
    subject: string
    created_at: string
    status: string
    mail_status: string,
    sla: string
  }

  const [emailTracking, setEmailTracking] = useState<Email[]>([])
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchEmails = async () => {
      const data = await getEmail()
      setEmailTracking(data || [])
    }
    fetchEmails()
  }, [])

  // Filter emails by mail_status - handle different possible status values
  const sentEmails = emailTracking.filter(email =>
    email.mail_status === "SENT" ||
    email.mail_status === "SEND" ||
    email.mail_status === "sent" ||
    email.mail_status === "send"
  )
  const receivedEmails = emailTracking.filter(email =>
    email.mail_status === "RECIEVED" ||
    email.mail_status === "RECEIVED" ||
    email.mail_status === "recieved" ||
    email.mail_status === "received"
  )

  // Debug logging
  console.log('All emails:', emailTracking)
  console.log('Sent emails:', sentEmails)
  console.log('Received emails:', receivedEmails)
  console.log('Unique mail_status values:', [...new Set(emailTracking.map(email => email.mail_status))])

  const stats = {
    emailsSent: sentEmails.length,
    responses: receivedEmails.length,
    pending: emailTracking.filter(email => email?.status === "pending").length,
  }

  const renderEmailTable = (emails: Email[], title: string, type: 'sent' | 'received') => (
    <Card className={type === 'received' ? 'border-green-200 bg-green-50/30' : 'border-blue-200 bg-blue-50/30'}>
      <CardHeader>
        <CardTitle className={`flex items-center gap-2 ${type === 'received' ? 'text-green-700' : 'text-blue-700'}`}>
          {type === 'received' ? '📥' : '📤'} {title} ({emails.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {emails.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No {type === 'received' ? 'received' : 'sent'} emails found.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Recipient</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>{type === 'received' ? 'Received Date' : 'Sent Date'}</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>SLA</TableHead>
                <TableHead>Mail Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {emails.map((email) => (
                <TableRow key={email.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{email.recipient}</TableCell>
                  <TableCell className="max-w-xs truncate">{email.subject}</TableCell>
                  <TableCell>{
                    (() => {
                      // Parse the date and convert to IST
                      const date = new Date(email.created_at);
                      // IST is UTC+5:30
                      const istOffset = 5.5 * 60; // in minutes
                      const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
                      const istDate = new Date(utc + (istOffset * 60000));
                      // Format as DD-MM-YYYY (date only)
                      return istDate.toLocaleDateString('en-IN', {
                        day: '2-digit', month: '2-digit', year: 'numeric'
                      });
                    })()
                  }</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        email.status === "delivered" ? "default" : email.status === "pending" ? "secondary" : "outline"
                      }
                    >
                      {email.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{email.sla}</TableCell>
                  <TableCell>
                    <Badge
                      variant={email.mail_status === "SENT" ? "default" : "outline"}
                      className={email.mail_status === "RECIEVED" ? "bg-green-100 text-green-800" : ""}
                    >
                      {email.mail_status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => { setSelectedEmail(email); setOpenDialog(true); }}>
                        View
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => router.push("/form-generator")}>
                        {type === 'received' ? 'Reply' : 'Follow Up'}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Email Workflow Management</h2>
        <div className="flex gap-2">
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Configure SMTP
          </Button>
          <Button>
            <Send className="w-4 h-4 mr-2" />
            Send Bulk
          </Button>
        </div>
      </div>

      {/* Email Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-primary mb-2">{stats.emailsSent}</div>
            <div className="text-sm font-medium">Emails Sent</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-primary mb-2">{stats.responses}</div>
            <div className="text-sm font-medium">Responses</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-primary mb-2">{stats.pending}</div>
            <div className="text-sm font-medium">Pending</div>
          </CardContent>
        </Card>
      </div>

      {/* Sent Emails Table */}
      {renderEmailTable(sentEmails, "Sent Emails", 'sent')}

      {/* Received Emails Table */}
      {renderEmailTable(receivedEmails, "Received Emails", 'received')}

      {/* All Emails Table - for debugging */}
      {/* {emailTracking.length > 0 && (
        <Card className="border-gray-200 bg-gray-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-700">
              📋 All Emails ({emailTracking.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>SLA</TableHead>
                  <TableHead>Mail Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {emailTracking.map((email) => (
                  <TableRow key={email.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{email.recipient}</TableCell>
                    <TableCell className="max-w-xs truncate">{email.subject}</TableCell>
                    <TableCell>{
                      (() => {
                        const date = new Date(email.created_at);
                        const istOffset = 5.5 * 60;
                        const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
                        const istDate = new Date(utc + (istOffset * 60000));
                        return istDate.toLocaleDateString('en-IN', {
                          day: '2-digit', month: '2-digit', year: 'numeric'
                        });
                      })()
                    }</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          email.status === "delivered" ? "default" : email.status === "pending" ? "secondary" : "outline"
                        }
                      >
                        {email.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{email.sla}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={email.mail_status === "SENT" || email.mail_status === "SEND" ? "default" : "secondary"}
                        className={email.mail_status === "RECIEVED" || email.mail_status === "RECEIVED" ? "bg-green-100 text-green-800" : ""}
                      >
                        {email.mail_status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => { setSelectedEmail(email); setOpenDialog(true); }}>
                          View
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => router.push("/form-generator") }>
                          Follow Up
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )} */}

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-lg w-full sm:w-[90vw] overflow-y-auto max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Email Details</DialogTitle>
            <DialogDescription>
              {selectedEmail && "Below are the details for the selected email."}
            </DialogDescription>
          </DialogHeader>
          {selectedEmail && (
            <div className="space-y-2 mt-2 max-h-[55vh] overflow-y-auto pr-2">
              {Object.entries(selectedEmail).map(([key, value]) => (
                <div key={key} className="flex gap-2 items-start flex-wrap break-all">
                  <span className="font-semibold min-w-[90px] capitalize">{key}:</span>
                  <span className="break-words max-w-[300px]">{String(value)}</span>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
