"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Card from "@/components/ui/Card"
import { formatPrice } from "@/lib/utils"

function getLevelBadge(level: number) {
  if (level >= 10) return { label: "至尊会员", color: "bg-yellow-100 text-yellow-800", icon: "👑" }
  if (level >= 5) return { label: "黄金会员", color: "bg-amber-100 text-amber-800", icon: "⭐" }
  if (level >= 2) return { label: "白银会员", color: "bg-gray-100 text-gray-800", icon: "🥈" }
  if (level >= 1) return { label: "青铜会员", color: "bg-orange-100 text-orange-800", icon: "🥉" }
  return { label: "普通会员", color: "bg-blue-100 text-blue-800", icon: "🆕" }
}

function getNextLevel(level: number) {
  return level + 1
}

export default function ProfilePage() {
  const { data: session, update } = useSession()
  const router = useRouter()
  const [userData, setUserData] = useState<{ level: number; totalSpent: number } | null>(null)

  useEffect(() => {
    if (!session?.user) {
      router.push("/auth/login")
      return
    }
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) setUserData(d.user)
      })
      .catch(() => {})
  }, [session, router])

  if (!session?.user || !userData) return null

  const levelInfo = getLevelBadge(userData.level)
  const nextLevel = getNextLevel(userData.level)
  const progress = ((userData.totalSpent % 2000) / 2000) * 100
  const nextLevelSpent = nextLevel * 2000

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">个人中心</h1>

      {/* 用户信息 */}
      <Card className="mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-2xl font-bold">
            {session.user.name?.[0]}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{session.user.name}</h2>
            <p className="text-sm text-gray-500">{session.user.email}</p>
          </div>
        </div>
      </Card>

      {/* 会员等级 */}
      <Card className="mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">会员等级</h2>

        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">{levelInfo.icon}</span>
          <div>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${levelInfo.color}`}>
              {levelInfo.label}
            </span>
            <p className="text-xs text-gray-500 mt-1">
              等级 {userData.level}
            </p>
          </div>
        </div>

        {/* 进度条 */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-500 mb-1">
            <span>累计消费：{formatPrice(userData.totalSpent)}</span>
            <span>距下一级还需消费 {formatPrice(nextLevelSpent - userData.totalSpent)}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">
            每消费 ¥2,000 升一级
          </p>
        </div>
      </Card>

      {/* 快捷入口 */}
      <Card>
        <h2 className="font-semibold text-gray-900 mb-4">快捷入口</h2>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => router.push("/orders")}
            className="p-4 rounded-lg border border-gray-200 text-left hover:bg-gray-50 transition-colors"
          >
            <p className="text-2xl mb-1">📋</p>
            <p className="text-sm font-medium text-gray-900">我的订单</p>
          </button>
          <button
            onClick={() => router.push("/cart")}
            className="p-4 rounded-lg border border-gray-200 text-left hover:bg-gray-50 transition-colors"
          >
            <p className="text-2xl mb-1">🛒</p>
            <p className="text-sm font-medium text-gray-900">购物车</p>
          </button>
        </div>
      </Card>
    </div>
  )
}
