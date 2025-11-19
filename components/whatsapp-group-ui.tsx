"use client"

import { saveGroupLinkToDB } from "@/Actions/server"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Calendar, Crown, Hash, Settings, Shield, User, Users } from "lucide-react"
import React, { useState } from "react"

interface WhatsAppGroupData {
    id?: string
    addressingMode?: string
    desc?: string,
    subject?: string
    subjectOwner?: string
    subjectTime?: number
    size?: number
    creation?: number
    owner?: string
    restrict?: boolean
    announce?: boolean
    isCommunity?: boolean
    isCommunityAnnounce?: boolean
    joinApprovalMode?: boolean
    memberAddMode?: boolean
    participants?: Array<{
        id: string
        pn: string
        lid: string
        admin: string | null
    }>
}

async function WhatsappUrlApi(url: string) {
    try {
        const response = await fetch("https://n8n.bestplanettechnology.com/webhook/get_group_details", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ url }),
        })
        const responseBody = await response.text()
        let data
        try {
            data = JSON.parse(responseBody)
        } catch {
            throw new Error("Invalid JSON response from server")
        }
        if (!response.ok) {
            throw new Error(data?.error || `HTTP error! status: ${response.status}`)
        }
        return data
    } catch (error) {
        throw error
    }
}

function formatDate(timestamp?: number) {
    if (!timestamp) return "Unknown"
    return new Date(timestamp * 1000).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    })
}

function formatPhoneNumber(phoneNumber: string) {
    const number = phoneNumber.replace("@s.whatsapp.net", "")
    return `+${number.slice(0, 2)} ${number.slice(2, 7)} ${number.slice(7)}`
}

function getAdminIcon(adminRole: string | null) {
    switch (adminRole) {
        case "superadmin":
            return <Crown className="h-4 w-4 text-yellow-500" />
        case "admin":
            return <Shield className="h-4 w-4 text-blue-500" />
        default:
            return <User className="h-4 w-4 text-gray-500" />
    }
}

function getAdminBadge(adminRole: string | null) {
    switch (adminRole) {
        case "superadmin":
            return (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                    Super Admin
                </Badge>
            )
        case "admin":
            return (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                    Admin
                </Badge>
            )
        default:
            return <Badge variant="outline">Member</Badge>
    }
}

export default function WhatsAppGroupUI() {
    const [inputUrl, setInputUrl] = useState("")
    const [groupData, setGroupData] = useState<WhatsAppGroupData | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [saveStatus, setSaveStatus] = useState<string | null>(null)
    const [isSaved, setIsSaved] = useState(false)
    const [saving, setSaving] = useState(false)

    const handleFetch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!inputUrl.trim()) {
            setError("Please enter a WhatsApp group URL.")
            return
        }
        setLoading(true)
        setError(null)
        setGroupData(null)
        setIsSaved(false)
        setSaveStatus(null)
        try {
            const data = await WhatsappUrlApi(inputUrl)
            console.log(data)
            setGroupData(data[0])
        } catch (err) {
            let msg = "Failed to fetch WhatsApp group data."
            if (err instanceof Error && err.message) {
                msg = err.message
            }
            setError(msg)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        setSaving(true)
        setSaveStatus(null)
        try {
            await saveGroupLinkToDB(inputUrl, JSON.stringify(groupData || {}) )
            setSaveStatus("Group link saved successfully.")
            setIsSaved(true)
        } catch {
            setSaveStatus("Failed to save group link.")
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* URL Input Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Enter WhatsApp Group URL</CardTitle>
                </CardHeader>
                <CardContent>
                    <form className="flex flex-col md:flex-row gap-4 items-center" onSubmit={handleFetch}>
                        <input
                            type="text"
                            className="flex-1 border rounded px-3 py-2"
                            placeholder="Paste WhatsApp group URL here..."
                            value={inputUrl}
                            onChange={e => setInputUrl(e.target.value)}
                            disabled={loading || saving}
                        />
                        {loading ? (
                            <button type="button" className="bg-green-600 text-white px-4 py-2 rounded" disabled>
                                fetching...
                            </button>
                        ) : groupData && !isSaved ? (
                            <button type="button" onClick={handleSave} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition" disabled={saving}>
                                {saving ? "Saving..." : "Save"}
                            </button>
                        ) : !groupData ? (
                            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition">
                                Fetch
                            </button>
                        ) : null}
                    </form>
                    {error && (
                        <p className="mt-2 text-sm text-red-500">{error}</p>
                    )}

                    {saveStatus && (
                        <p className="mt-2 text-sm text-green-500">{saveStatus}</p>
                    )}
                </CardContent>
            </Card>

            {/* Data Display */}
            {loading && (
                <Card>
                    <CardContent className="p-6">
                        <p className="text-center text-muted-foreground">Loading WhatsApp group data...</p>
                    </CardContent>
                </Card>
            )}

            {!loading && groupData && (
                <>
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
                            <div>
                                {groupData.desc}
                            </div>

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
                                    {groupData.participants.map((participant, index) => (
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
                </>
            )}

            {/* No data */}
            {!loading && !groupData && !error && (
                <Card>
                    <CardContent className="p-6">
                        <p className="text-center text-muted-foreground">No group data available</p>
                    </CardContent>
                </Card>
            )}
            {!loading && !handleFetch && (
                <Card>
                    <CardContent className="p-6">
                        <p className="text-center text-muted-foreground">fetch available</p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
