import Sidebar from "@/components/layout/Sidebar"
import type { ReactNode } from "react"

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* 管理员顶部栏 */}
      <div className="h-16 bg-white border-b border-gray-200 flex items-center px-6">
        <h1 className="text-lg font-bold text-blue-600">Mini Mall · 后台管理</h1>
      </div>
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 bg-gray-50 p-6">{children}</main>
      </div>
    </div>
  )
}
