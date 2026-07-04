"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Card from "@/components/ui/Card"
import Badge from "@/components/ui/Badge"
import { formatPrice, formatDate, orderStatusMap, orderStatusColorMap } from "@/lib/utils"

interface OrderItemData {
  id: number
  quantity: number
  price: number
  product: { id: number; name: string }
}

interface OrderData {
  id: number
  total: number
  status: string
  createdAt: string
  items: OrderItemData[]
}

export default function OrdersPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<OrderData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session?.user) {
      router.push("/auth/login")
      return
    }
    fetch("/api/orders")
      .then((res) => res.json())
      .then((data) => setOrders(data.orders || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [session, router])

  if (loading) {
    return <div className="max-w-3xl mx-auto px-4 py-20 text-center text-gray-400">加载中...</div>
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">我的订单</h1>

      {orders.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <p className="text-5xl mb-4">📋</p>
            <p className="text-gray-500 mb-4">暂无订单</p>
            <button
              onClick={() => router.push("/products")}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              去购物 →
            </button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link key={order.id} href={`/orders/${order.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-500">
                    订单号：{order.id}
                  </span>
                  <Badge className={orderStatusColorMap[order.status] || ""}>
                    {orderStatusMap[order.status] || order.status}
                  </Badge>
                </div>

                <div className="space-y-1 mb-3">
                  {order.items.slice(0, 3).map((item) => (
                    <p key={item.id} className="text-sm text-gray-600">
                      {item.product.name} x{item.quantity}
                    </p>
                  ))}
                  {order.items.length > 3 && (
                    <p className="text-xs text-gray-400">
                      还有 {order.items.length - 3} 件商品...
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">{formatDate(order.createdAt)}</span>
                  <span className="font-bold text-red-500">
                    {formatPrice(order.total)}
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
