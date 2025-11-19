"use client"

import { getEmailById, getSlaData } from "@/Actions/server"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Bell, Settings } from "lucide-react"
import { useEffect, useState } from "react"

interface Email {
  id: string;
  type?: string;
  created_at?: string;
  sla?: number;
  // Add other fields as needed
}

interface SlaRecord {
  id: string;
  email_id?: string;
  status?: string;
  [key: string]: unknown; // Add other fields as needed
  emailId?: Email;
  email: string;
  case_id: string;
  subject: string;

}

export default function SlaMonitoring() {
  const [slaData, setSlaData] = useState<SlaRecord[]>([]);
  const [emailData, setEmailData] = useState<Email[]>([]);
  const [openDialog, setOpenDialog] = useState<{ open: boolean; data?: SlaRecord; item?: Email }>({ open: false });

  // Fetch SLA data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all SLA records
        const slaRecords = await getSlaData();
        if (slaRecords && Array.isArray(slaRecords)) {
          // For each SLA record, fetch the email by email_id
          const allData = await Promise.all(
            slaRecords
              .filter((sla) => sla.email_id) // Only process if email_id exists
              .map(async (sla) => {
                try {
                  const emailId = await getEmailById(sla.email_id);
                  return {
                    ...sla,
                    emailId,
                  };
                }
                catch (err) {
                  console.error(`Error fetching email for SLA record with email_id ${sla.email_id}:`, err);
                  return sla;
                }
              })
          );
          console.log("SLA Data:", allData);
          setSlaData(allData);
          const emaildata = allData.map(item => item.emailId).filter(Boolean);
          // Extract and set all email data in a separate state
          setEmailData(emaildata);
          console.log("Email Data:", emaildata);
        }
      } catch (err) {
        console.error("Error fetching SLA data:", err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">SLA Monitoring & Alerts</h2>
        <div className="flex gap-2">
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Configure SLA
          </Button>
          <Button>
            <Bell className="w-4 h-4 mr-2" />
            Send Reminder
          </Button>
        </div>
      </div>

      {/* SLA Overview */}
      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-red-500 mb-2">{criticalCount}</div>
              <div className="font-medium mb-1">Critical</div>
              <div className="text-sm text-muted-foreground">Overdue requests</div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-yellow-500">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-yellow-500 mb-2">{warningCount}</div>
              <div className="font-medium mb-1">Warning</div>
              <div className="text-sm text-muted-foreground">Due in 24 hours</div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-500 mb-2">{normalCount}</div>
              <div className="font-medium mb-1">Normal</div>
              <div className="text-sm text-muted-foreground">Within SLA</div>
            </CardContent>
          </Card>
        </div> */}

      {/* SLA Tracking Table */}
      <Card>
        <CardHeader>
          <CardTitle>SLA Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request ID</TableHead>
                <TableHead>Agency</TableHead>
                <TableHead>Sent Date</TableHead>
                {/* <TableHead>Due Date</TableHead> */}
                <TableHead>Status</TableHead>
                {/* <TableHead>Days Remaining</TableHead> */}
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {emailData.map((item, idx) => {
                return (
                  <TableRow
                    key={item.id}
                  // className={item.status === "critical" ? "bg-red-50 dark:bg-red-950/20" : ""}
                  >
                    <TableCell>{`REQ00${idx + 1}`}</TableCell>
                    <TableCell>{item.type?.toUpperCase()}</TableCell>
                    <TableCell>{item.created_at ? new Date(item.created_at).toLocaleDateString() : "-"}</TableCell>
                    {/* <TableCell>{item.created_at && item.sla ? new Date(new Date(item.created_at).getTime() + item.sla * 24 * 60 * 60 * 1000).toLocaleDateString() : "-"}</TableCell> */}
                    {slaData.map((data) => (
                      <TableCell key={data.id}>
                        <Badge variant={data.status === "SENT" ? "default" : "secondary"}>{data.status}</Badge>
                      </TableCell>
                    ))}
                    {/* <TableCell>{(() => {
                      if (item.created_at && item.sla) {
                        const dueDate = new Date(new Date(item.created_at).getTime() + item.sla * 24 * 60 * 60 * 1000);
                        const now = new Date();
                        const diffTime = dueDate.getTime() - now.getTime();
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        return diffDays >= 0 ? `${diffDays} days` : `Overdue by ${Math.abs(diffDays)} days`;
                      }
                      return "-";
                    })()}</TableCell> */}
                    <TableCell>
                      <div >
                        <Button variant="outline" size="sm" onClick={() => setOpenDialog({ open: true, data: slaData[idx], item })}>
                          preview
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog for preview */}
      <Dialog open={openDialog.open} onOpenChange={open => setOpenDialog({ open, data: open ? openDialog.data : undefined, item: open ? openDialog.item : undefined })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>SLA Preview</DialogTitle>
          </DialogHeader>
          {openDialog.data ? (
            <div className="space-y-4">
              <div className="font-bold flex justify-center text-xl underline"> {openDialog.data.case_id}</div>
              <div className="space-y-2">
                <div><strong>|---- CRCP Email sent On:</strong> {openDialog.item?.created_at ? new Date(openDialog.item.created_at).toLocaleDateString() : "-"}</div>
                <div><strong>|---- Follow Up Email sent On:</strong> {typeof openDialog.data?.created_at === "string" || typeof openDialog.data?.created_at === "number"
                  ? new Date(openDialog.data.created_at).toLocaleDateString()
                  : "-"}
                </div>
              </div>
              <div className="space-y-2">
                <div className="font-semibold flex justify-center">
                  {openDialog.data.subject}
                </div>
                <div
                  dangerouslySetInnerHTML={{ __html: openDialog.data.email }} className="p-2 bg-green-300 rounded-lg"
                />
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}

