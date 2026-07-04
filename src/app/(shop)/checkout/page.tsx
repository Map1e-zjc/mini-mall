"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Card from "@/components/ui/Card"
import Button from "@/components/ui/Button"
import { formatPrice } from "@/lib/utils"

interface CartItemData {
  id: number
  quantity: number
  product: {
    id: number
    name: string
    price: number
    image: string
  }
}

export default function CheckoutPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [items, setItems] = useState<CartItemData[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!session?.user) {
      router.push("/auth/login")
      return
    }
    fetch("/api/cart")
      .then((res) => res.json())
      .then((data) => setItems(data.items || []))
      .catch(() => setError("加载购物车失败"))
      .finally(() => setLoading(false))
  }, [session, router])

  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  async function handleSubmit() {
    setSubmitting(true)
    setError("")

    try {
      const res = await fetch("/api/orders", { method: "POST" })
      const data = await res.json()

      if (!res.ok) {
        setError(data.message || "下单失败")
        setSubmitting(false)
        return
      }

      router.push(`/orders/${data.order.id}`)
    } catch {
      setError("网络错误，请稍后重试")
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="max-w-2xl mx-auto px-4 py-20 text-center text-gray-400">加载中...</div>
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-5xl mb-4">🛒</p>
        <p className="text-gray-500 mb-4">购物车是空的，无法结算</p>
        <Button onClick={() => router.push("/products")}>去购物</Button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">确认订单</h1>

      <Card className="mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">商品清单</h2>
        <div className="divide-y divide-gray-100">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 py-3">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-xl text-gray-300">📦</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{item.product.name}</p>
                <p className="text-xs text-gray-500">x{item.quantity}</p>
              </div>
              <p className="text-sm font-medium text-gray-900">
                {formatPrice(item.product.price * item.quantity)}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* 价格汇总 */}
      <Card className="mb-6">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>商品数量</span>
            <span>{itemCount} 件</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>商品小计</span>
            <span>{formatPrice(total)}</span>
          </div>
          <div className="border-t border-gray-200 pt-2 mt-2">
            <div className="flex justify-between text-lg font-bold">
              <span>应付总额</span>
              <span className="text-red-500">{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* 模拟支付提示 */}
      <Card className="mb-6 bg-yellow-50 border-yellow-200">
        <p className="text-sm text-yellow-800">
          💡 本项目为模拟支付，提交订单后可在订单详情页点击"模拟支付"完成支付流程。
        </p>
      </Card>

      {error && <p className="text-sm text-red-600 text-center mb-4">{error}</p>}

      <Button onClick={handleSubmit} loading={submitting} size="lg" className="w-full">
        提交订单
      </Button>
    </div>
  )
}
