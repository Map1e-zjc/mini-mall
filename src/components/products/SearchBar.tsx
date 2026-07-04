"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState, useCallback } from "react"

export default function SearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [keyword, setKeyword] = useState(searchParams.get("keyword") || "")

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      const params = new URLSearchParams(searchParams.toString())
      if (keyword.trim()) {
        params.set("keyword", keyword.trim())
      } else {
        params.delete("keyword")
      }
      params.delete("page")
      router.push(`/products?${params.toString()}`)
    },
    [keyword, router, searchParams]
  )

  return (
    <form onSubmit={handleSearch} className="flex gap-2">
      <input
        type="text"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="搜索商品..."
        className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
      >
        搜索
      </button>
    </form>
  )
}
