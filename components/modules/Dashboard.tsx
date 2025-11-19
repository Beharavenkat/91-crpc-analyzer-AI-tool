"use client"

import { useState, useEffect, } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

import { getAllChats, getAllClases, getAllPersona, getSuspects } from "@/Actions/server"

// Color mapping for alerts



export function Dashboard() {

    const [cases, setCases] = useState<any[]>([])
    const [suspects, setSuspects] = useState<any[]>([])
    const [persona, setPersona] = useState<any[]>([])
    const [chats, setChats] = useState<any[]>([])

    useEffect(() => {
        const totalCases = async () => {
            const Cases = await getAllClases()
            console.log("Total cases fetched:", Cases.length)
            setCases(Cases)
            return Cases
        }

        const totalSuspects = async () => {
            // Assuming you have a function to fetch suspects
            const Suspects = await getSuspects() // Replace with actual function to fetch suspects
            console.log("Total suspects fetched:", Suspects.length)
            setSuspects(Suspects)
            return Suspects
        }

        const totalPersona = async () => {
            // Assuming you have a function to fetch persona
            const Persona = await getAllPersona() // Replace with actual function to fetch persona
            console.log("Total persona fetched:", Persona.length)
            setPersona(Persona)
            return Persona
        }

        const totalChats = async () => {
            // Assuming you have a function to fetch chats
            const Chats = await getAllChats() // Replace with actual function to fetch chats
            console.log("Total chats fetched:", Chats.length)
            setChats(Chats)
            return Chats
        }

        // Fetch all data concurrently
        Promise.all([
            totalCases(),
            totalSuspects(),
            totalPersona(),
            totalChats(),
        ])
    }, [])


    const realTimeData = ({
        totalCases: cases.length,
        totalSuspects: suspects.length,
        totalPersona: persona.length,
        totalChats: chats.length
    })

    const Steps = [
        {
            id: 1,
            title: "Message classification",
            content: "Categorizing messages for further processing.",
        },
        {
            id: 2,
            title: "Cases updated",
            content: "Recent changes made to cases.",
        },
        {
            id: 3,
            title: "Decoy chat started",
            content: "Initiated fake conversation for investigation.",
        },
        {
            id: 4,
            title: "91 CrPC form generated",
            content: "Legal document automatically created now.",
        },
        {
            id: 5,
            title: "Email workflow executed",
            content: "Automated email process completed successfully.",
        },
        {
            id: 6,
            title: "Sla monitoring alert",
            content: "Service alert triggered for monitoring.",
        },
        {
            id: 7,
            title: "Case management updated",
            content: "Case tracking system information refreshed.",
        },
    ]


    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold">Investigation Dashboard</h2>
                    <div className="flex items-center gap-2 mt-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-sm text-muted-foreground">Real-time Updates</span>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardContent className="p-6 text-center">
                        <div className="text-3xl font-bold text-stats mb-2">{realTimeData.totalCases}</div>
                        <div className="text-sm font-medium mb-1">Total Cases</div>
                        <div className="text-xs text-green-600">+50% this week</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 text-center">
                        <div className="text-3xl font-bold text-stats mb-2">{realTimeData.totalSuspects}</div>
                        <div className="text-sm font-medium mb-1">Total Suspects</div>
                        <div className="text-xs text-muted-foreground">2+ Found Criminals</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 text-center">
                        <div className="text-3xl font-bold text-stats mb-2">{realTimeData.totalPersona}</div>
                        <div className="text-sm font-medium mb-1">Total Persona</div>
                        <div className="text-xs text-green-600">+12% from last month</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 text-center">
                        <div className="text-3xl font-bold text-stats mb-2">{realTimeData.totalChats}</div>
                        <div className="text-sm font-medium mb-1">Total Chats</div>
                        <div className="text-xs text-green-600">Trending up AI</div>
                    </CardContent>
                </Card>
            </div>

            {/* Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="grid grid-row-1 md:grid-row-2 gap-6">

                <Card>
                    <CardHeader>
                        <CardTitle>SLA Compliance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Telecom Requests</span>
                                    {/* <span>85%</span> */}
                                </div>
                                <Progress value={85} className="h-2" />
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Bank Requests</span>
                                    {/* <span>92%</span> */}
                                </div>
                                <Progress value={92} className="h-2" />
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Social Media</span>
                                    {/* <span>78%</span> */}
                                </div>
                                <Progress value={78} className="h-2" />
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Payment Gateway</span>
                                    {/* <span>90%</span> */}
                                </div>
                                <Progress value={78} className="h-2" />
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Google</span>
                                    {/* <span>70%</span> */}
                                </div>
                                <Progress value={78} className="h-2" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <Button className="w-full justify-start">Classify Message</Button>
                            <Button className="w-full justify-start">Start Decoy Chat</Button>
                            <Button className="w-full justify-start">Generate Form</Button>
                            <Button className="w-full justify-start">
                                View Reports
                            </Button>
                        </div>
                    </CardContent>
                </Card>
                </div>

                                <Card>
                    <CardHeader>
                        <CardTitle>Recent Steps</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {Steps.map((alert) => {
                                return (
                                    <div
                                        key={alert.id}
                                        className={`flex items-center gap-3 p-3 border-l-4 rounded bg-emerald-300`}
                                    >
                                        <div className="flex-1">
                                            <div className="font-medium text-sm">{alert.id}-{alert.title}</div>
                                            <div className="text-xs text-muted-foreground">{alert.content}</div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
