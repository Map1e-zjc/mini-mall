"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import Card from "@/components/ui/Card"
import Button from "@/components/ui/Button"
import Badge from "@/components/ui/Badge"
import { formatPrice, formatDate, orderStatusMap, orderStatusColorMap } from "@/lib/utils"

interface OrderItemData {
  id: number
  quantity: number
  price: number
  product: { id: number; name: string; image: string }
}

interface OrderData {
  id: number
  total: number
  status: string
  createdAt: string
  items: OrderItemData[]
}

export default function OrderDetailPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const [order, setOrder] = useState<OrderData | null>(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!session?.user) {
      router.push("/auth/login")
      return
    }
    fetch(`/api/orders/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.order) setOrder(data.order)
        else setError("订单不存在")
      })
      .catch(() => setError("加载失败"))
      .finally(() => setLoading(false))
  }, [session, router, params.id])

  async function handlePay() {
    setPaying(true)
    try {
      const res = await fetch(`/api/orders/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "paid" }),
      })
      const data = await res.json()
      if (res.ok) {
        setOrder(data.order)
      } else {
        setError(data.message || "支付失败")
      }
    } catch {
      setError("网络错误")
    } finally {
      setPaying(false)
    }
  }

  if (loading) {
    return <div className="max-w-2xl mx-auto px-4 py-20 text-center text-gray-400">加载中...</div>
  }

  if (error && !order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-500">{error}</p>
        <Button className="mt-4" onClick={() => router.push("/orders")}>
          返回订单列表
        </Button>
      </div>
    )
  }

  if (!order) return null

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* 订单标题 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">订单详情</h1>
          <p className="text-sm text-gray-500 mt-1">订单号：{order.id}</p>
        </div>
        <Badge className={orderStatusColorMap[order.status] || ""}>
          {orderStatusMap[order.status] || order.status}
        </Badge>
      </div>

      {/* 商品列表 */}
      <Card className="mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">商品信息</h2>
        <div className="divide-y divide-gray-100">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 py-3">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-xl text-gray-300">📦</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{item.product.name}</p>
                <p className="text-xs text-gray-500">单价：{formatPrice(item.price)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">x{item.quantity}</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 订单信息 */}
      <Card className="mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">订单信息</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">下单时间</span>
            <span className="text-gray-900">{formatDate(order.createdAt)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">订单状态</span>
            <span className="text-gray-900">{orderStatusMap[order.status] || order.status}</span>
          </div>
          <div className="border-t border-gray-200 pt-2 mt-2">
            <div className="flex justify-between text-lg font-bold">
              <span>合计</span>
              <span className="text-red-500">{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* 操作按钮 */}
      {order.status === "pending" && (
        <Card className="mb-6 bg-yellow-50 border-yellow-200">
          <p className="text-sm text-yellow-800 mb-4">
            点击下方按钮模拟支付，支付后将自动更新您的会员等级。
          </p>
          <Button onClick={handlePay} loading={paying} size="lg" className="w-full">
            模拟支付 ¥{order.total.toFixed(2)}
          </Button>
        </Card>
      )}

      {error && <p className="text-sm text-red-600 text-center mb-4">{error}</p>}

      <Button variant="ghost" onClick={() => router.push("/orders")} className="w-full">
        ← 返回订单列表
      </Button>
    </div>
  )
}
