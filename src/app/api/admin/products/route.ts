import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin"

/** GET /api/admin/products — 商品列表（含分页） */
export async function GET(req: Request) {
  const err = await requireAdmin()
  if (err) return err

  const { searchParams } = new URL(req.url)
  const page = Number(searchParams.get("page") || "1")
  const pageSize = 20
  const skip = (page - 1) * pageSize

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.product.count(),
  ])

  return NextResponse.json({ products, total, page, pageSize })
}

/** POST /api/admin/products — 创建商品 */
export async function POST(req: Request) {
  const err = await requireAdmin()
  if (err) return err

  const body = await req.json()
  const { name, description, price, image, stock, categoryId } = body

  if (!name || price === undefined || !categoryId) {
    return NextResponse.json({ message: "名称、价格和分类为必填项" }, { status: 400 })
  }

  const product = await prisma.product.create({
    data: {
      name,
      description: description || "",
      price: Number(price),
      image: image || "",
      stock: Number(stock || 0),
      categoryId: Number(categoryId),
    },
    include: { category: true },
  })

  return NextResponse.json({ product }, { status: 201 })
}
