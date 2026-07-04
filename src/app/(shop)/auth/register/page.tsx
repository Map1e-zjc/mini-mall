"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Card from "@/components/ui/Card"
import Input from "@/components/ui/Input"
import Button from "@/components/ui/Button"

export default function RegisterPage() {
  const router = useRouter()

  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (form.password !== form.confirmPassword) {
      setError("两次密码输入不一致")
      return
    }

    if (form.password.length < 6) {
      setError("密码至少需要 6 个字符")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || "注册失败")
        setLoading(false)
        return
      }

      router.push("/auth/login?registered=true")
    } catch {
      setError("网络错误，请稍后重试")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">注册</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="用户名"
            placeholder="请输入用户名"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <Input
            label="邮箱"
            type="email"
            placeholder="请输入邮箱"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <Input
            label="密码"
            type="password"
            placeholder="至少 6 个字符"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            minLength={6}
          />
          <Input
            label="确认密码"
            type="password"
            placeholder="请再次输入密码"
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            required
          />

          {error && (
            <p className="text-sm text-red-600 text-center">{error}</p>
          )}

          <Button type="submit" loading={loading} className="w-full">
            注册
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          已有账号？
          <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 ml-1">
            立即登录
          </Link>
        </p>
      </Card>
    </div>
  )
}
