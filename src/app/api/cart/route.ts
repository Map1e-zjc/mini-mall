import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/** GET /api/cart — 获取购物车列表 */
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ message: "请先登录" }, { status: 401 })
  }

  const items = await prisma.cartItem.findMany({
    where: { userId: Number(session.user.id) },
    include: {
      product: {
        include: { category: true },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json({ items })
}

/** POST /api/cart — 添加/更新购物车商品 */
export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ message: "请先登录" }, { status: 401 })
  }

  const { productId, quantity } = await req.json()
  const userId = Number(session.user.id)

  // 检查商品是否存在
  const product = await prisma.product.findUnique({
    where: { id: Number(productId) },
  })
  if (!product) {
    return NextResponse.json({ message: "商品不存在" }, { status: 404 })
  }

  // 检查是否已在购物车中
  const existing = await prisma.cartItem.findUnique({
    where: { userId_productId: { userId, productId: Number(productId) } },
  })

  if (existing) {
    // 更新数量
    const updated = await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + (quantity || 1) },
    })
    return NextResponse.json({ item: updated })
  }

  // 新增
  const item = await prisma.cartItem.create({
    data: {
      userId,
      productId: Number(productId),
      quantity: quantity || 1,
    },
  })

  return NextResponse.json({ item }, { status: 201 })
}

/** DELETE /api/cart — 删除购物车商品 */
export async function DELETE(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ message: "请先登录" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const productId = searchParams.get("productId")

  if (!productId) {
    return NextResponse.json({ message: "缺少商品 ID" }, { status: 400 })
  }

  await prisma.cartItem.deleteMany({
    where: {
      userId: Number(session.user.id),
      productId: Number(productId),
    },
  })

  return NextResponse.json({ message: "已删除" })
}
