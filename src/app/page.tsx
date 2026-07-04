"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"

export default function HomePage() {
  const { data: session } = useSession()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Mini Mall
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          一个基于 Next.js 16 的微型电商项目
        </p>

        <div className="flex items-center justify-center gap-4">
          <Link
            href="/products"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            浏览商品
          </Link>
          {!session?.user && (
            <Link
              href="/auth/login"
              className="px-6 py-3 bg-white text-blue-600 rounded-lg font-medium border border-blue-200 hover:bg-blue-50 transition-colors"
            >
              登录
            </Link>
          )}
        </div>

        {session?.user && (
          <div className="mt-8 p-4 bg-white rounded-xl shadow-sm">
            <p className="text-gray-700">
              欢迎回来，<span className="font-semibold">{session.user.name}</span>
            </p>
            {session.user.role === "admin" && (
              <Link href="/admin" className="text-sm text-blue-600 hover:text-blue-700 mt-1 inline-block">
                进入后台管理 →
              </Link>
            )}
          </div>
        )}

        {/* 功能简介 */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {[
            { title: "商品浏览", desc: "浏览商品列表、查看详情、搜索和分类筛选" },
            { title: "购物下单", desc: "加入购物车、下单购买、模拟支付体验" },
            { title: "后台管理", desc: "商品管理、分类管理、订单管理一站式操作" },
          ].map((item) => (
            <div key={item.title} className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
