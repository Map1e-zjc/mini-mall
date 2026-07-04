import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin"

/** GET /api/admin/products/:id — 商品详情 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const err = await requireAdmin()
  if (err) return err

  const { id } = await params
  const product = await prisma.product.findUnique({
    where: { id: Number(id) },
    include: { category: true },
  })
  if (!product) {
    return NextResponse.json({ message: "商品不存在" }, { status: 404 })
  }
  return NextResponse.json({ product })
}

/** PUT /api/admin/products/:id — 更新商品 */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const err = await requireAdmin()
  if (err) return err

  const { id } = await params
  const body = await req.json()
  const { name, description, price, image, stock, categoryId } = body

  const product = await prisma.product.update({
    where: { id: Number(id) },
    data: {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(price !== undefined && { price: Number(price) }),
      ...(image !== undefined && { image }),
      ...(stock !== undefined && { stock: Number(stock) }),
      ...(categoryId !== undefined && { categoryId: Number(categoryId) }),
    },
    include: { category: true },
  })

  return NextResponse.json({ product })
}

/** DELETE /api/admin/products/:id — 删除商品 */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const err = await requireAdmin()
  if (err) return err

  const { id } = await params
  await prisma.product.delete({ where: { id: Number(id) } })
  return NextResponse.json({ message: "已删除" })
}
