"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Card from "@/components/ui/Card"
import Button from "@/components/ui/Button"
import Badge from "@/components/ui/Badge"
import { formatPrice, formatDate } from "@/lib/utils"

interface Product {
  id: number
  name: string
  price: number
  stock: number
  createdAt: string
  category: { name: string }
}

export default function AdminProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/products")
      .then((r) => r.json())
      .then((d) => setProducts(d.products || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function handleDelete(id: number) {
    if (!confirm("确定删除该商品？")) return
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" })
    if (res.ok) setProducts((prev) => prev.filter((p) => p.id !== id))
  }

  if (loading) return <div className="text-center py-12 text-gray-400">加载中...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">商品管理</h1>
        <Button onClick={() => router.push("/admin/products/new")}>新增商品</Button>
      </div>

      <Card padding={false}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left py-3 px-4 font-medium text-gray-500">ID</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">名称</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">分类</th>
              <th className="text-right py-3 px-4 font-medium text-gray-500">价格</th>
              <th className="text-right py-3 px-4 font-medium text-gray-500">库存</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">创建时间</th>
              <th className="text-center py-3 px-4 font-medium text-gray-500">操作</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4">{p.id}</td>
                <td className="py-3 px-4 font-medium">{p.name}</td>
                <td className="py-3 px-4"><Badge className="bg-gray-100 text-gray-700">{p.category.name}</Badge></td>
                <td className="py-3 px-4 text-right">{formatPrice(p.price)}</td>
                <td className="py-3 px-4 text-right">
                  <span className={p.stock > 0 ? "text-green-600" : "text-red-500"}>{p.stock}</span>
                </td>
                <td className="py-3 px-4 text-gray-500">{formatDate(p.createdAt)}</td>
                <td className="py-3 px-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => router.push(`/admin/products/${p.id}/edit`)}>
                      编辑
                    </Button>
                    <Button variant="ghost" size="sm" className="!text-red-500" onClick={() => handleDelete(p.id)}>
                      删除
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && <p className="text-center py-8 text-gray-400">暂无商品</p>}
      </Card>
    </div>
  )
}
