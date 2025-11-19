'use client'

import { getClassifications } from '@/Actions/server'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar, Hash, Settings, Users } from "lucide-react"
import React, { useEffect, useState } from 'react'
import ShowParsedData from './ShowParsedData'


interface Classification {
    id: string
    content: string
    classification: "suspicious" | "benign"
    confidence_score: number
    created_at: string
    media_type?: string
    case_id?: string
    group_link?: string // Optional field for group links
    source_platform?: string // Optional field for group links
    group_chat_result?: string // Optional field for group chat result JSON
}

interface Participant {
    id?: string;
    pn?: string;
    lid?: string;
    admin?: string;
}

const AllMessageData = () => {
    const [loading, setLoading] = React.useState(true)
    const [classifications, setClassifications] = React.useState<Classification[]>([])
    const [popoverOpen, setPopoverOpen] = React.useState(false)
    const [result, setResult] = useState({})
    const [chatResult, setChatInput] = useState<string>("")

    useEffect(() => {
        const fetchClassifications = async () => {
            setLoading(true)
            try {
                const data = await getClassifications()
                if (data) {
                    setClassifications(
                        (data as Classification[]).map((item) => ({
                            id: item.id,
                            content: item.content,
                            classification: item.classification,
                            confidence_score: typeof item.confidence_score === "number"
                                ? item.confidence_score
                                : parseFloat(item.confidence_score),
                            created_at: item.created_at,
                            case_id: item.case_id,
                            media_type: item.media_type || "text",
                            group_link: item.group_link || "",
                            source_platform: item.source_platform || "",
                        }))
                    )
                }
            } catch (error) {
                console.error("Error fetching classifications:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchClassifications()
    }, [])

    const handleViewData = async () => {
        setPopoverOpen(true)
        const data = await getClassifications()
        // If group_details is a JSON string, parse it
        if (data && Array.isArray(data)) {
            const result = data.map(item => {
                if (item.group_details) {
                    try {
                        const groupDetails = JSON.parse(item.group_details)
                        return groupDetails
                        // console.log("Parsed group_details:", groupDetails)
                        // You can now use groupDetails as a JS object
                    } catch (e) {
                        console.error("Failed to parse group_details:", e)
                    }
                }
            });
            setResult(result)
        }
    }

    const handleViewDataFile = async () => {
        setPopoverOpen(true)
        const ParseData = await getClassifications()
        // If group_details is a JSON string, parse it
        // console.log("Group chat result:", typeof(ParseData))
        const data = ParseData[0]
        if (data && data.group_chat_result) {
            setChatInput(data.group_chat_result)
        }
    }

    // Helper functions (add these above the component or import if already present)
    const getAdminIcon = (admin?: string) => {
        if (admin === "superadmin") return "SA"
        if (admin === "admin") return "A"
        return "U"
    }
    const getAdminBadge = (admin?: string) => {
        if (admin === "superadmin") return <Badge variant="destructive">Super Admin</Badge>
        if (admin === "admin") return <Badge variant="default">Admin</Badge>
        return null
    }
    const formatDate = (timestamp: number | string) => {
        if (!timestamp) return "Unknown"
        const date = new Date(Number(timestamp))
        return date.toLocaleString()
    }
    const formatPhoneNumber = (pn: string) => {
        // Simple phone number formatting
        return pn.replace(/(\d{2})(\d{5})(\d{5})/, "+$1 $2-$3")
    }


    return (
        <div className='space-y-3'>

            <Card>
                <CardHeader>
                    <CardTitle>File Classifications</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className={classifications.length > 7 ? "max-h-[420px] overflow-y-auto" : ""}>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Case Id</TableHead>
                                    <TableHead>Timestamp</TableHead>
                                    <TableHead>Message Preview</TableHead>
                                    <TableHead>Link</TableHead>
                                    <TableHead>Classification</TableHead>
                                    <TableHead>Confidence</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                                            Loading...
                                        </TableCell>
                                    </TableRow>
                                ) : classifications.filter(item => item.media_type === "file").length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                                            No classification history found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    classifications.filter(item => item.media_type === "file").map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                {item.case_id ? item.case_id : "-"}
                                            </TableCell>
                                            <TableCell>
                                                {item.created_at
                                                    ? new Date(item.created_at).toLocaleString()
                                                    : "-"}
                                            </TableCell>
                                            <TableCell className="max-w-xs truncate">
                                                {item.content ? item.content?.substring(0, 20) : "-"}
                                                {item.content?.length > 20 ? "..." : ""}
                                            </TableCell>
                                            <TableCell>
                                                {item.group_link ? item.group_link : "-"}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={item.classification === "suspicious" ? "destructive" : "default"}>
                                                    {item.classification}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{(item.confidence_score * 100).toFixed(0)}%</TableCell>
                                            <TableCell >
                                                <Dialog open={popoverOpen} onOpenChange={setPopoverOpen} >
                                                    <DialogTrigger asChild>
                                                        <Button variant="outline" size="sm" onClick={handleViewDataFile}>
                                                            View
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="w-full max-w-2xl bg-white/90 rounded-xl shadow-lg border border-blue-100 p-6">
                                                        <DialogTitle className="mb-4 text-lg font-bold text-blue-800">File JSON Data</DialogTitle>
                                                        <div className="w-full max-h-96 overflow-auto bg-gray-50 rounded-lg p-4 border border-gray-200">
                                                            <pre className="whitespace-pre-wrap break-all text-xs md:text-sm font-mono text-gray-800">
                                                                {chatResult ? (typeof chatResult === 'string') ? <ShowParsedData parsedData={{"output":JSON.parse(chatResult)}} />: <ShowParsedData parsedData={{"output":chatResult}} /> : 'No data'}
                                                            </pre>
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                                {/* <Button variant="outline" size="sm" >
                                                        Chat
                                                </Button> */}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>


            <Card>
                <CardHeader>
                    <CardTitle>message Classifications</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className={classifications.length > 7 ? "max-h-[420px] overflow-y-auto" : ""}>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Timestamp</TableHead>
                                    <TableHead>Message Preview</TableHead>
                                    <TableHead>Link</TableHead>
                                    <TableHead>Classification</TableHead>
                                    <TableHead>Confidence</TableHead>
                                    {/* <TableHead>Actions</TableHead> */}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                                            Loading...
                                        </TableCell>
                                    </TableRow>
                                ) : classifications.filter(item => item.media_type === "text").length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                                            No classification history found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    classifications.filter(item => item.media_type === "text").map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                {item.created_at
                                                    ? new Date(item.created_at).toLocaleString()
                                                    : "-"}
                                            </TableCell>
                                            <TableCell className="max-w-xs truncate">
                                                {item.content ? item.content?.substring(0, 50) : "-"}
                                                {item.content?.length > 50 ? "..." : ""}
                                            </TableCell>
                                            <TableCell>
                                                {item.group_link ? item.group_link : "-"}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={item.classification === "suspicious" ? "destructive" : "default"}>
                                                    {item.classification}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{(item.confidence_score * 100).toFixed(0)}%</TableCell>
                                            {/* <TableCell>
                                                <div className="flex gap-2">
                                                    <Button variant="outline" size="sm" >
                                                        View
                                                    </Button>
                                                    <Button variant="outline" size="sm">
                                                        Export
                                                    </Button>
                                                </div>
                                            </TableCell> */}
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>link Classifications</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className={classifications.length > 7 ? "max-h-[420px] overflow-y-auto" : ""}>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Timestamp</TableHead>
                                    <TableHead>Message Preview</TableHead>
                                    <TableHead>Link</TableHead>
                                    <TableHead>Classification</TableHead>
                                    <TableHead>Confidence</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                                            Loading...
                                        </TableCell>
                                    </TableRow>
                                ) : classifications.filter(item => item.media_type === "group_link").length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                                            No classification history found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    classifications.filter(item => item.media_type === "group_link").map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                {item.created_at
                                                    ? new Date(item.created_at).toLocaleString()
                                                    : "-"}
                                            </TableCell>
                                            <TableCell className="max-w-xs truncate">
                                                {item.content ? item.content?.substring(0, 50) : "-"}
                                                {item.content?.length > 50 ? "..." : ""}
                                            </TableCell>
                                            <TableCell>
                                                {item.group_link ? item.group_link : "-"}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={item.classification === "suspicious" ? "destructive" : "default"}>
                                                    {item.classification}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{(item.confidence_score * 100).toFixed(0)}%</TableCell>
                                            <TableCell>
                                                <div className="flex gap-2 w-full overflow-y-auto">
                                                    <Dialog open={popoverOpen} onOpenChange={setPopoverOpen}>
                                                        <DialogTrigger asChild>
                                                            <Button variant="outline" size="sm" onClick={handleViewData}>
                                                                View
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent className="w-full max-w-2xl bg-white/90 rounded-xl shadow-lg border border-blue-100 p-6">
                                                            <DialogTitle className="mb-4 text-lg font-bold text-blue-800">Group Details</DialogTitle>
                                                            <div className="w-full max-h-96 overflow-auto bg-gray-50 rounded-lg p-4 border border-gray-200">
                                                                {Array.isArray(result) && result.length > 0 && result.some(g => g) ? (
                                                                    result.filter(Boolean).map((groupData, idx) => (
                                                                        <div key={idx} className="space-y-6">
                                                                            {/* Group Header */}
                                                                            <Card>
                                                                                <CardHeader className="pb-4">
                                                                                    <div className="flex items-center space-x-4">
                                                                                        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                                                                                            <Users className="h-8 w-8 text-white" />
                                                                                        </div>
                                                                                        <div className="flex-1">
                                                                                            <CardTitle className="text-2xl font-bold text-green-700">
                                                                                                {groupData.subject || "Unknown Group"}
                                                                                            </CardTitle>
                                                                                            <p className="text-sm text-muted-foreground mt-1">
                                                                                                WhatsApp Group • {groupData.size || (groupData.participants?.length ?? 0)} members
                                                                                            </p>
                                                                                        </div>
                                                                                    </div>
                                                                                </CardHeader>
                                                                                <CardContent className="space-y-4">
                                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                                        <div className="flex items-center space-x-2">
                                                                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                                                                            <span className="text-sm">Created: {formatDate(groupData.creation)}</span>
                                                                                        </div>
                                                                                        <div className="flex items-center space-x-2">
                                                                                            <Hash className="h-4 w-4 text-muted-foreground" />
                                                                                            <span className="text-xs font-mono">{groupData.id || "Unknown ID"}</span>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div>{groupData.desc}</div>
                                                                                    <Separator />
                                                                                    {/* Group Settings */}
                                                                                    <div className="space-y-2">
                                                                                        <div className="flex items-center space-x-2 mb-3">
                                                                                            <Settings className="h-4 w-4 text-muted-foreground" />
                                                                                            <span className="text-sm font-medium">Group Settings</span>
                                                                                        </div>
                                                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                                                                            <Badge variant={groupData.joinApprovalMode ? "default" : "secondary"}>
                                                                                                {groupData.joinApprovalMode ? "Join Approval: On" : "Join Approval: Off"}
                                                                                            </Badge>
                                                                                            <Badge variant={groupData.memberAddMode ? "default" : "secondary"}>
                                                                                                {groupData.memberAddMode ? "Member Add: On" : "Member Add: Off"}
                                                                                            </Badge>
                                                                                            <Badge variant={groupData.announce ? "default" : "secondary"}>
                                                                                                {groupData.announce ? "Announce Only" : "All Can Send"}
                                                                                            </Badge>
                                                                                            <Badge variant={groupData.restrict ? "destructive" : "secondary"}>
                                                                                                {groupData.restrict ? "Restricted" : "Open"}
                                                                                            </Badge>
                                                                                        </div>
                                                                                    </div>
                                                                                </CardContent>
                                                                            </Card>
                                                                            {/* Participants */}
                                                                            <Card>
                                                                                <CardHeader>
                                                                                    <CardTitle className="flex items-center space-x-2">
                                                                                        <Users className="h-5 w-5" />
                                                                                        <span>Participants ({groupData.participants?.length ?? 0})</span>
                                                                                    </CardTitle>
                                                                                </CardHeader>
                                                                                <CardContent>
                                                                                    {(!groupData.participants || groupData.participants.length === 0) ? (
                                                                                        <div className="text-center py-8">
                                                                                            <p className="text-muted-foreground">No participants data available</p>
                                                                                        </div>
                                                                                    ) : (
                                                                                        <div className="space-y-4">
                                                                                            {groupData.participants.map((participant: Participant, index: number) => (
                                                                                                <div
                                                                                                    key={participant.id || index}
                                                                                                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                                                                                                >
                                                                                                    <div className="flex items-center space-x-3">
                                                                                                        <Avatar className="h-10 w-10">
                                                                                                            <AvatarImage src={`/placeholder.svg?height=40&width=40`} />
                                                                                                            <AvatarFallback className="bg-green-100 text-green-700">
                                                                                                                {getAdminIcon(participant.admin)}
                                                                                                            </AvatarFallback>
                                                                                                        </Avatar>
                                                                                                        <div className="space-y-1">
                                                                                                            <p className="text-sm font-medium">
                                                                                                                {participant.pn ? formatPhoneNumber(participant.pn) : "Unknown Number"}
                                                                                                            </p>
                                                                                                            <p className="text-xs text-muted-foreground font-mono">
                                                                                                                {participant.lid || "No LID"}
                                                                                                            </p>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                    <div className="flex items-center space-x-2">
                                                                                                        {getAdminBadge(participant.admin)}
                                                                                                        {participant.id === groupData.owner && (
                                                                                                            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                                                                                                Owner
                                                                                                            </Badge>
                                                                                                        )}
                                                                                                    </div>
                                                                                                </div>
                                                                                            ))}
                                                                                        </div>
                                                                                    )}
                                                                                </CardContent>
                                                                            </Card>
                                                                        </div>
                                                                    ))
                                                                ) : (
                                                                    <span>No data</span>
                                                                )}
                                                            </div>
                                                        </DialogContent>
                                                    </Dialog>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

        </div>
    )
}

export default AllMessageData