"use client"

import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import Image from "next/image"
import { useEffect, useState } from "react"

export function Header() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => setMounted(true), [])

    return (
        <header className="bg-header text-header p-4 shadow-md sticky top-0 z-50">
            <div className="flex justify-between items-center max-w-[1400px] mx-auto">
                <div className="flex items-center gap-4">
                    <Image
                        src="/images/APPolice.png"
                        alt="AP Police Logo"
                        width={40}
                        height={40}
                        className="w-14 h-14 rounded-2xl"
                    />
                    <div>
                        <h1 className="text-xl font-semibold">AP Police Investigation System</h1>
                        <p className="text-sm opacity-90">IT Act Cases Management</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <div className="font-medium">Inspector Sharma</div>
                        <div className="text-xs bg-white/20 px-2 py-1 rounded-full">Active</div>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                        className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                        {mounted && (theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />)}
                    </Button>
                </div>
            </div>
        </header>
    )
}
