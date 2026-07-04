import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/** GET /api/orders/:id — 订单详情 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ message: "请先登录" }, { status: 401 })
  }

  const { id } = await params
  const order = await prisma.order.findUnique({
    where: { id: Number(id) },
    include: {
      items: { include: { product: true } },
    },
  })

  if (!order) {
    return NextResponse.json({ message: "订单不存在" }, { status: 404 })
  }

  // 普通用户只能看自己的订单
  if (session.user.role !== "admin" && order.userId !== Number(session.user.id)) {
    return NextResponse.json({ message: "无权限" }, { status: 403 })
  }

  return NextResponse.json({ order })
}

/** PATCH /api/orders/:id — 更新订单状态（模拟支付） */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ message: "请先登录" }, { status: 401 })
  }

  const { id } = await params
  const { status } = await req.json()

  const order = await prisma.order.findUnique({
    where: { id: Number(id) },
  })

  if (!order) {
    return NextResponse.json({ message: "订单不存在" }, { status: 404 })
  }

  // 普通用户只能执行"支付"操作
  if (status === "paid") {
    if (order.userId !== Number(session.user.id)) {
      return NextResponse.json({ message: "无权限" }, { status: 403 })
    }
    if (order.status !== "pending") {
      return NextResponse.json({ message: "订单状态不允许支付" }, { status: 400 })
    }

    // 事务：更新订单状态 + 更新用户消费额和会员等级
    const updated = await prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id: Number(id) },
        data: { status: "paid" },
        include: { items: { include: { product: true } } },
      })

      const user = await tx.user.findUnique({
        where: { id: order.userId },
      })

      if (user) {
        const newTotalSpent = user.totalSpent + order.total
        const newLevel = Math.floor(newTotalSpent / 2000)
        await tx.user.update({
          where: { id: order.userId },
          data: {
            totalSpent: newTotalSpent,
            level: newLevel,
          },
        })
      }

      return updatedOrder
    })

    return NextResponse.json({ order: updated })
  }

  // 管理员可以更新其他状态
  if (session.user.role === "admin") {
    const validStatuses = ["pending", "paid", "shipped", "delivered", "cancelled"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ message: "无效的状态" }, { status: 400 })
    }

    const updated = await prisma.order.update({
      where: { id: Number(id) },
      data: { status },
      include: { items: { include: { product: true } } },
    })

    return NextResponse.json({ order: updated })
  }

  return NextResponse.json({ message: "无权限" }, { status: 403 })
}
