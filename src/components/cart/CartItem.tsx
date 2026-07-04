"use client"

import { formatPrice } from "@/lib/utils"
import Button from "@/components/ui/Button"

interface CartItemProps {
  item: {
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
  onQuantityChange: (productId: number, delta: number) => void
  onRemove: (productId: number) => void
}

export default function CartItem({ item, onQuantityChange, onRemove }: CartItemProps) {
  return (
    <div className="flex items-center gap-4 py-4 border-b border-gray-100 last:border-0">
      {/* 商品图片 */}
      <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
        {item.product.image ? (
          <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover rounded-lg" />
        ) : (
          <span className="text-2xl text-gray-300">📦</span>
        )}
      </div>

      {/* 商品信息 */}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-gray-900 truncate">{item.product.name}</h3>
        <p className="text-sm text-red-500 font-medium mt-1">
          {formatPrice(item.product.price)}
        </p>
      </div>

      {/* 数量调整 */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onQuantityChange(item.product.id, -1)}
          disabled={item.quantity <= 1}
          className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          -
        </button>
        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
        <button
          onClick={() => onQuantityChange(item.product.id, 1)}
          disabled={item.quantity >= item.product.stock}
          className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          +
        </button>
      </div>

      {/* 小计 */}
      <div className="text-right w-24">
        <p className="font-medium text-gray-900">
          {formatPrice(item.product.price * item.quantity)}
        </p>
      </div>

      {/* 删除 */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onRemove(item.product.id)}
        className="!text-red-500 !hover:text-red-700"
      >
        删除
      </Button>
    </div>
  )
}
