"use client"

import { useState, useEffect } from "react"
import Card from "@/components/ui/Card"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"

interface Category {
  id: number
  name: string
  slug: string
  _count: { products: number }
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: "", slug: "" })
  const [editingId, setEditingId] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { fetchCategories() }, [])

  function fetchCategories() {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    const url = editingId
      ? `/api/admin/categories/${editingId}`
      : "/api/admin/categories"
    const method = editingId ? "PUT" : "POST"

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })

    if (res.ok) {
      setForm({ name: "", slug: "" })
      setShowForm(false)
      setEditingId(null)
      fetchCategories()
    }
    setSubmitting(false)
  }

  async function handleDelete(id: number) {
    if (!confirm("确定删除该分类？")) return
    const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" })
    if (res.ok) fetchCategories()
    else {
      const data = await res.json()
      alert(data.message || "删除失败")
    }
  }

  function startEdit(cat: Category) {
    setForm({ name: cat.name, slug: cat.slug })
    setEditingId(cat.id)
    setShowForm(true)
  }

  if (loading) return <div className="text-center py-12 text-gray-400">加载中...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">分类管理</h1>
        <Button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ name: "", slug: "" }) }}>
          {showForm ? "取消" : "新增分类"}
        </Button>
      </div>

      {/* 表单 */}
      {showForm && (
        <Card className="mb-6">
          <form onSubmit={handleSubmit} className="flex gap-4 items-end">
            <Input label="分类名称" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <Input label="标识 (slug)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
            <Button type="submit" loading={submitting}>{editingId ? "保存" : "创建"}</Button>
          </form>
        </Card>
      )}

      {/* 列表 */}
      <Card padding={false}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left py-3 px-4 font-medium text-gray-500">ID</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">名称</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">标识</th>
              <th className="text-center py-3 px-4 font-medium text-gray-500">商品数</th>
              <th className="text-center py-3 px-4 font-medium text-gray-500">操作</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4">{c.id}</td>
                <td className="py-3 px-4 font-medium">{c.name}</td>
                <td className="py-3 px-4 text-gray-500">{c.slug}</td>
                <td className="py-3 px-4 text-center">{c._count.products}</td>
                <td className="py-3 px-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => startEdit(c)}>编辑</Button>
                    <Button variant="ghost" size="sm" className="!text-red-500" onClick={() => handleDelete(c.id)}>删除</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {categories.length === 0 && <p className="text-center py-8 text-gray-400">暂无分类</p>}
      </Card>
    </div>
  )
}
