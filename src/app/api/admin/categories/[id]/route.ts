import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin"

/** PUT /api/admin/categories/:id — 更新分类 */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const err = await requireAdmin()
  if (err) return err

  const { id } = await params
  const { name, slug } = await req.json()

  const category = await prisma.category.update({
    where: { id: Number(id) },
    data: { name, slug },
  })

  return NextResponse.json({ category })
}

/** DELETE /api/admin/categories/:id — 删除分类 */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const err = await requireAdmin()
  if (err) return err

  const { id } = await params

  // 检查是否有商品关联
  const productCount = await prisma.product.count({
    where: { categoryId: Number(id) },
  })
  if (productCount > 0) {
    return NextResponse.json(
      { message: `该分类下有 ${productCount} 个商品，无法删除` },
      { status: 400 }
    )
  }

  await prisma.category.delete({ where: { id: Number(id) } })
  return NextResponse.json({ message: "已删除" })
}
