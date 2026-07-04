"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Button from "@/components/ui/Button"

interface AddToCartButtonProps {
  productId: number
  disabled?: boolean
}

export default function AddToCartButton({ productId, disabled }: AddToCartButtonProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [added, setAdded] = useState(false)

  async function handleAddToCart() {
    if (!session?.user) {
      router.push("/auth/login?callbackUrl=" + encodeURIComponent(window.location.pathname))
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: 1 }),
      })

      if (res.ok) {
        setAdded(true)
        setTimeout(() => setAdded(false), 2000)
      }
    } catch {
      // 静默失败
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleAddToCart}
      disabled={disabled || loading}
      loading={loading}
      size="lg"
      className={added ? "!bg-green-600" : ""}
    >
      {disabled ? "已售罄" : added ? "已加入购物车 ✓" : "加入购物车"}
    </Button>
  )
}
