"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Card from "@/components/ui/Card"
import Input from "@/components/ui/Input"
import Button from "@/components/ui/Button"

interface Category {
  id: number
  name: string
}

export default function NewProductPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [form, setForm] = useState({ name: "", description: "", price: "", stock: "0", image: "", categoryId: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []))
      .catch(() => {})
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, price: Number(form.price), stock: Number(form.stock), categoryId: Number(form.categoryId) }),
    })

    const data = await res.json()
    if (!res.ok) {
      setError(data.message || "创建失败")
      setLoading(false)
      return
    }

    router.push("/admin/products")
    router.refresh()
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">新增商品</h1>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="商品名称" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">商品描述</label>
            <textarea
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="价格" type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
            <Input label="库存" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
          </div>
          <Input label="图片 URL" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="可选" />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
            <select
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              required
            >
              <option value="">请选择分类</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-3">
            <Button type="submit" loading={loading}>创建</Button>
            <Button variant="secondary" onClick={() => router.back()}>取消</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
