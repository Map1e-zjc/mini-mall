"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import CartItem from "@/components/cart/CartItem"
import CartSummary from "@/components/cart/CartSummary"
import Card from "@/components/ui/Card"

interface CartItemData {
  id: number
  quantity: number
  product: {
    id: number
    name: string
    price: number
    image: string
    stock: number
  }
}

export default function CartPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [items, setItems] = useState<CartItemData[]>([])
  const [loading, setLoading] = useState(true)

  // 加载购物车
  const fetchCart = useCallback(async () => {
    if (!session?.user) return
    setLoading(true)
    try {
      const res = await fetch("/api/cart")
      const data = await res.json()
      setItems(data.items || [])
    } catch {
      // 静默失败
    } finally {
      setLoading(false)
    }
  }, [session])

  useEffect(() => {
    if (session?.user) {
      fetchCart()
    } else {
      setLoading(false)
    }
  }, [session, fetchCart])

  // 调整数量
  async function handleQuantityChange(productId: number, delta: number) {
    // 乐观更新 UI
    setItems((prev) =>
      prev.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    )

    // 同步服务端
    const item = items.find((i) => i.product.id === productId)
    if (item) {
      await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: delta }),
      })
    }
  }

  // 删除商品
  async function handleRemove(productId: number) {
    setItems((prev) => prev.filter((item) => item.product.id !== productId))
    await fetch(`/api/cart?productId=${productId}`, { method: "DELETE" })
  }

  // 计算总计
  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  if (!session?.user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-5xl mb-4">🛒</p>
        <p className="text-gray-500 mb-4">请先登录后查看购物车</p>
        <button
          onClick={() => router.push("/auth/login")}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          去登录 →
        </button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-gray-400">
        加载中...
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">购物车</h1>

      {items.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <p className="text-5xl mb-4">🛒</p>
            <p className="text-gray-500 mb-4">购物车是空的</p>
            <button
              onClick={() => router.push("/products")}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              去逛逛 →
            </button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 商品列表 */}
          <div className="lg:col-span-2">
            <Card>
              <div className="divide-y divide-gray-100">
                {items.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onQuantityChange={handleQuantityChange}
                    onRemove={handleRemove}
                  />
                ))}
              </div>
            </Card>
          </div>

          {/* 摘要 */}
          <div>
            <CartSummary total={total} itemCount={itemCount} />
          </div>
        </div>
      )}
    </div>
  )
}
