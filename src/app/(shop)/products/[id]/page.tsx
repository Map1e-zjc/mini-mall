import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { formatPrice } from "@/lib/utils"
import Link from "next/link"
import AddToCartButton from "@/components/products/AddToCartButton"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params
  const product = await prisma.product.findUnique({
    where: { id: Number(id) },
    include: { category: true },
  })

  if (!product) notFound()

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* 面包屑 */}
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-blue-600">首页</Link>
        <span className="mx-2">/</span>
        <Link href="/products" className="hover:text-blue-600">商品</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 商品图片 */}
        <div className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover rounded-xl"
            />
          ) : (
            <span className="text-8xl text-gray-300">📦</span>
          )}
        </div>

        {/* 商品信息 */}
        <div>
          <p className="text-sm text-blue-600 font-medium mb-2">
            {product.category.name}
          </p>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {product.name}
          </h1>
          <p className="text-3xl font-bold text-red-500 mb-6">
            {formatPrice(product.price)}
          </p>

          <div className="border-t border-gray-200 pt-6 mb-6">
            <h2 className="text-sm font-medium text-gray-900 mb-2">商品描述</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              {product.description || "暂无描述"}
            </p>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <span className={`text-sm ${product.stock > 0 ? "text-green-600" : "text-red-500"}`}>
              {product.stock > 0 ? `库存充足（${product.stock} 件）` : "已售罄"}
            </span>
          </div>

          <AddToCartButton productId={product.id} disabled={product.stock === 0} />
        </div>
      </div>
    </div>
  )
}
