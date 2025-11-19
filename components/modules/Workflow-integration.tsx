"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Play } from "lucide-react"

interface Workflow {
  id: string
  name: string
  status: "active" | "inactive"
  lastRun: string
  successRate: string
  totalExecutions: number
}

export function WorkflowIntegration() {
  const [workflows] = useState<Workflow[]>([
    {
      id: "WF001",
      name: "Message Classification",
      status: "active",
      lastRun: "2024-12-20 12:00:00",
      successRate: "94%",
      totalExecutions: 150,
    },
    {
      id: "WF002",
      name: "Decoy Chat Response",
      status: "active",
      lastRun: "2024-12-20 11:45:00",
      successRate: "87%",
      totalExecutions: 89,
    },
    {
      id: "WF003",
      name: "Email Automation",
      status: "active",
      lastRun: "2024-12-20 10:30:00",
      successRate: "96%",
      totalExecutions: 245,
    },
  ])

  const executeWorkflow = (workflowId: string) => {
    const workflow = workflows.find((w) => w.id === workflowId)
    if (workflow) {
      alert(`Workflow "${workflow.name}" executed successfully. Execution ID: EXE-${Date.now()}`)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">n8n Workflow Integration</h2>
        <div className="flex gap-2">
          <Button variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Create Workflow
          </Button>
          <Button>
            <Play className="w-4 h-4 mr-2" />
            Execute
          </Button>
        </div>
      </div>

      {/* Workflow Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-primary mb-2">4</div>
            <div className="text-sm font-medium">Active Workflows</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-primary mb-2">484</div>
            <div className="text-sm font-medium">Total Executions</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-primary mb-2">92%</div>
            <div className="text-sm font-medium">Success Rate</div>
          </CardContent>
        </Card>
      </div>

      {/* Workflow Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Workflow Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workflows.map((workflow) => (
              <div key={workflow.id} className="border rounded-lg p-4">
                <div className="space-y-3">
                  <div className="font-medium">{workflow.name}</div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Success Rate: {workflow.successRate}</span>
                    <span>Executions: {workflow.totalExecutions}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <Badge variant={workflow.status === "active" ? "default" : "secondary"}>{workflow.status}</Badge>
                    <div className="text-xs text-muted-foreground">
                      Last run: {new Date(workflow.lastRun).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => executeWorkflow(workflow.id)}>
                      Execute
                    </Button>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
