"use client"

import { useState, useEffect } from "react"
import Card from "@/components/ui/Card"
import Button from "@/components/ui/Button"
import Badge from "@/components/ui/Badge"
import { formatPrice, formatDate, orderStatusMap, orderStatusColorMap } from "@/lib/utils"

interface Order {
  id: number
  total: number
  status: string
  createdAt: string
  user: { id: number; name: string; email: string }
  items: { id: number; quantity: number; price: number; product: { name: string } }[]
}

const STATUS_FLOW = ["pending", "paid", "shipped", "delivered"]

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("")

  useEffect(() => {
    const url = statusFilter ? `/api/admin/orders?status=${statusFilter}` : "/api/admin/orders"
    fetch(url)
      .then((r) => r.json())
      .then((d) => setOrders(d.orders || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [statusFilter])

  async function handleUpdateStatus(orderId: number, newStatus: string) {
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    })
    if (res.ok) {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      )
    }
  }

  function getNextStatus(current: string): string | null {
    const idx = STATUS_FLOW.indexOf(current)
    if (idx >= 0 && idx < STATUS_FLOW.length - 1) return STATUS_FLOW[idx + 1]
    return null
  }

  if (loading) return <div className="text-center py-12 text-gray-400">加载中...</div>

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">订单管理</h1>

      {/* 状态筛选 */}
      <div className="flex gap-2 mb-6">
        {["", "pending", "paid", "shipped", "delivered", "cancelled"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              statusFilter === s
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {s ? orderStatusMap[s] || s : "全部"}
          </button>
        ))}
      </div>

      <Card padding={false}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left py-3 px-4 font-medium text-gray-500">订单号</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">用户</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">商品</th>
              <th className="text-right py-3 px-4 font-medium text-gray-500">金额</th>
              <th className="text-center py-3 px-4 font-medium text-gray-500">状态</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">时间</th>
              <th className="text-center py-3 px-4 font-medium text-gray-500">操作</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4">#{order.id}</td>
                <td className="py-3 px-4">
                  <p className="font-medium">{order.user.name}</p>
                  <p className="text-xs text-gray-400">{order.user.email}</p>
                </td>
                <td className="py-3 px-4">
                  <div className="max-w-xs truncate">
                    {order.items.slice(0, 2).map((i) => i.product.name).join(", ")}
                    {order.items.length > 2 && "..."}
                  </div>
                </td>
                <td className="py-3 px-4 text-right font-medium">{formatPrice(order.total)}</td>
                <td className="py-3 px-4 text-center">
                  <Badge className={orderStatusColorMap[order.status] || ""}>
                    {orderStatusMap[order.status] || order.status}
                  </Badge>
                </td>
                <td className="py-3 px-4 text-gray-500 text-xs">{formatDate(order.createdAt)}</td>
                <td className="py-3 px-4 text-center">
                  {order.status !== "cancelled" && order.status !== "delivered" && (() => {
                    const next = getNextStatus(order.status)
                    if (!next) return null
                    return (
                      <Button size="sm" onClick={() => handleUpdateStatus(order.id, next)}>
                        {next === "paid" ? "标记支付" : next === "shipped" ? "标记发货" : "标记完成"}
                      </Button>
                    )
                  })()}
                  {order.status === "pending" && (
                    <Button size="sm" variant="danger" className="ml-2" onClick={() => handleUpdateStatus(order.id, "cancelled")}>
                      取消
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && <p className="text-center py-8 text-gray-400">暂无订单</p>}
      </Card>
    </div>
  )
}
