import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/** GET /api/orders — 获取当前用户的订单列表 */
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ message: "请先登录" }, { status: 401 })
  }

  const orders = await prisma.order.findMany({
    where: { userId: Number(session.user.id) },
    include: {
      items: {
        include: { product: true },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json({ orders })
}

/** POST /api/orders — 从购物车创建订单 */
export async function POST() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ message: "请先登录" }, { status: 401 })
  }

  const userId = Number(session.user.id)

  // 获取购物车商品
  const cartItems = await prisma.cartItem.findMany({
    where: { userId },
    include: { product: true },
  })

  if (cartItems.length === 0) {
    return NextResponse.json({ message: "购物车是空的" }, { status: 400 })
  }

  // 计算总价
  const total = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  )

  // 事务：创建订单 + 订单项 + 清空购物车
  const order = await prisma.$transaction(async (tx) => {
    // 创建订单
    const newOrder = await tx.order.create({
      data: {
        userId,
        total,
        status: "pending",
        items: {
          create: cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price,
          })),
        },
      },
      include: { items: { include: { product: true } } },
    })

    // 清空购物车
    await tx.cartItem.deleteMany({ where: { userId } })

    return newOrder
  })

  return NextResponse.json({ order }, { status: 201 })
}
