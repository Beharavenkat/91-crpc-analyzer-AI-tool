"use client"

import { useRouter, usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

import {
    BarChart3,
    Search,
    MessageCircle,
    FileText,
    Mail,
    Users,
    // FolderOpen,
    TrendingUp,
    Clock,
    // Workflow,
} from "lucide-react"

export type ModuleType =
    | "dashboard"
    | "message-classification"
    | "cases"
    | "decoy-chat"
    | "form-generator"
    | "email-workflow"
    | "case-management"
    // | "master-data"
    | "analytics"
    | "sla-monitoring"
    // | "workflow-integration"

const navItems = [
    { id: "dashboard" as ModuleType, label: "Dashboard", icon: BarChart3, path: "/" },
    { id: "message-classification" as ModuleType, label: "Message Classification", icon: Search, path: "/message-classification" },
    { id: "cases" as ModuleType, label: "Cases", icon: Search, path: "/cases" },
    { id: "decoy-chat" as ModuleType, label: "Decoy Chat", icon: MessageCircle, path: "/decoy-chat" },
    { id: "form-generator" as ModuleType, label: "91 CrPC Forms", icon: FileText, path: "/form-generator" },
    { id: "email-workflow" as ModuleType, label: "Email Workflow", icon: Mail, path: "/email-workflow" },
    { id: "sla-monitoring" as ModuleType, label: "SLA Monitoring", icon: Clock, path: "/sla-monitoring" },
    { id: "case-management" as ModuleType, label: "Case Management", icon: Users, path: "/case-management" },
    { id: "analytics" as ModuleType, label: "Analytics", icon: TrendingUp, path: "/analytics" },
    // { id: "master-data" as ModuleType, label: "Master Data", icon: FolderOpen, path: "/master-data" },
    // { id: "workflow-integration" as ModuleType, label: "n8n Workflows", icon: Workflow, path: "/workflow-integration" },
]

export function Sidebar() {
    const router = useRouter()
    const pathname = usePathname()

    // Determine active module by matching current path
    const activePath = pathname === "/" ? "/dashboard" : pathname

    return (
        <nav className="w-70 bg-sidebar border-r p-6 sticky top-20 h-[calc(100vh-80px)] overflow-y-auto">
            <div className="flex flex-col gap-1">
                {navItems.map((item) => {
                    const Icon = item.icon
                    return (
                        <button
                            key={item.id}
                            onClick={() => router.push(item.path)}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                                activePath === item.path
                                    ? "bg-sidebar-active text-white"
                                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                            )}
                        >
                            <Icon className="w-5 h-5" />
                            <span>{item.label}</span>
                        </button>
                    )
                })}
            </div>
        </nav>
    )
}
