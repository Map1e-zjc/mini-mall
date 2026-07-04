"use client"

import { useRouter } from "next/navigation"
import { formatPrice } from "@/lib/utils"
import Button from "@/components/ui/Button"

interface CartSummaryProps {
  total: number
  itemCount: number
}

export default function CartSummary({ total, itemCount }: CartSummaryProps) {
  const router = useRouter()

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4">订单摘要</h2>

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
          <div className="flex justify-between text-lg font-bold text-gray-900">
            <span>合计</span>
            <span className="text-red-500">{formatPrice(total)}</span>
          </div>
        </div>
      </div>

      <Button
        className="w-full mt-6"
        size="lg"
        disabled={itemCount === 0}
        onClick={() => router.push("/checkout")}
      >
        去结算
      </Button>
    </div>
  )
}
