import { Header } from "@/components/Header"
import { Sidebar } from "@/components/Sidebar"

export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header />
            <div className="flex flex-1 max-w-[1400px] mx-auto w-full">
                <Sidebar />
                <main className="flex-1 p-8 overflow-y-auto">{children}</main>
            </div>
        </div>
    )
}
