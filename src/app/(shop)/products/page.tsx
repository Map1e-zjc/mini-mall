import { Suspense } from "react"
import { prisma } from "@/lib/prisma"
import ProductCard from "@/components/products/ProductCard"
import SearchBar from "@/components/products/SearchBar"
import Link from "next/link"

interface PageProps {
  searchParams: Promise<{ keyword?: string; categoryId?: string }>
}

async function ProductList({ keyword, categoryId }: { keyword?: string; categoryId?: string }) {
  const where: Record<string, unknown> = {}
  if (keyword) {
    where.name = { contains: keyword }
  }
  if (categoryId) {
    where.categoryId = Number(categoryId)
  }

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ])

  const activeCategory = categoryId ? Number(categoryId) : undefined

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* 分类筛选 */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <Link
          href="/products"
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            !activeCategory
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          全部
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/products?categoryId=${cat.id}`}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeCategory === cat.id
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {cat.name}
          </Link>
        ))}
      </div>

      {/* 搜索结果提示 */}
      {keyword && (
        <p className="text-sm text-gray-500 mb-4">
          搜索 &ldquo;{keyword}&rdquo;，共找到 {products.length} 个商品
        </p>
      )}

      {/* 商品网格 */}
      {products.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-4">🔍</p>
          <p>暂无商品</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const { keyword, categoryId } = await searchParams

  return (
    <div>
      {/* 搜索栏 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Suspense fallback={null}>
            <SearchBar />
          </Suspense>
        </div>
      </div>

      {/* 商品列表 */}
      <Suspense fallback={<div className="text-center py-20 text-gray-400">加载中...</div>}>
        <ProductList keyword={keyword} categoryId={categoryId} />
      </Suspense>
    </div>
  )
}
