import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin"

/** GET /api/admin/categories — 分类列表 */
export async function GET() {
  const err = await requireAdmin()
  if (err) return err

  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  })
  return NextResponse.json({ categories })
}

/** POST /api/admin/categories — 创建分类 */
export async function POST(req: Request) {
  const err = await requireAdmin()
  if (err) return err

  const { name, slug } = await req.json()
  if (!name || !slug) {
    return NextResponse.json({ message: "名称和标识为必填项" }, { status: 400 })
  }

  const existing = await prisma.category.findUnique({ where: { slug } })
  if (existing) {
    return NextResponse.json({ message: "该标识已被使用" }, { status: 409 })
  }

  const category = await prisma.category.create({ data: { name, slug } })
  return NextResponse.json({ category }, { status: 201 })
}
