import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/** GET /api/products — 商品列表（支持搜索和分类筛选） */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const keyword = searchParams.get("keyword") || ""
  const categoryId = searchParams.get("categoryId")

  const where: Record<string, unknown> = {}
  if (keyword) {
    where.name = { contains: keyword }
  }
  if (categoryId) {
    where.categoryId = Number(categoryId)
  }

  const products = await prisma.product.findMany({
    where,
    include: { category: true },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json({ products })
}
