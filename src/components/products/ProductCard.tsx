import Link from "next/link"
import { formatPrice } from "@/lib/utils"

interface ProductCardProps {
  product: {
    id: number
    name: string
    price: number
    image: string
    stock: number
    category: { name: string }
  }
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="group bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
    >
      {/* 商品图片占位 */}
      <div className="aspect-square bg-gray-100 flex items-center justify-center">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        ) : (
          <span className="text-4xl text-gray-300">📦</span>
        )}
      </div>

      {/* 商品信息 */}
      <div className="p-4">
        <p className="text-xs text-gray-500 mb-1">{product.category.name}</p>
        <h3 className="font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-lg font-bold text-red-500">
            {formatPrice(product.price)}
          </span>
          <span className={`text-xs ${product.stock > 0 ? "text-green-600" : "text-red-500"}`}>
            {product.stock > 0 ? `库存 ${product.stock}` : "已售罄"}
          </span>
        </div>
      </div>
    </Link>
  )
}
