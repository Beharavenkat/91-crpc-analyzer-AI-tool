"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Plus } from "lucide-react"

export function MasterData() {
  const cdrTemplates = [
    {
      id: 1,
      name: "Standard CDR Format",
      description: "Caller, Called, Date, Time, Duration, Type, Location, Tower ID",
    },
    {
      id: 2,
      name: "Extended CDR Format",
      description: "Includes IMEI, Cell ID, LAC, and additional metadata",
    },
  ]

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Master Data Management</h2>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Import Template
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Template
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Tabs defaultValue="cdr" className="w-full">
            <div className="border-b">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="cdr">CDR Templates</TabsTrigger>
                <TabsTrigger value="bank">Bank Templates</TabsTrigger>
                <TabsTrigger value="payment">Payment Templates</TabsTrigger>
                <TabsTrigger value="social">Social Media</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="cdr" className="p-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">CDR Format Templates</h3>
                <div className="space-y-4">
                  {cdrTemplates.map((template) => (
                    <div key={template.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{template.name}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm">Use Template</Button>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="bank" className="p-6">
              <div className="text-center text-muted-foreground py-12">Bank templates will be configured here</div>
            </TabsContent>

            <TabsContent value="payment" className="p-6">
              <div className="text-center text-muted-foreground py-12">
                Payment gateway templates will be configured here
              </div>
            </TabsContent>

            <TabsContent value="social" className="p-6">
              <div className="text-center text-muted-foreground py-12">
                Social media templates will be configured here
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
