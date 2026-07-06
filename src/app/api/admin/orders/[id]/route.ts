import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin"

/** GET /api/admin/orders/:id — 订单详情 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const err = await requireAdmin()
  if (err) return err

  const { id } = await params
  const order = await prisma.order.findUnique({
    where: { id: Number(id) },
    include: {
      user: { select: { id: true, name: true, email: true } },
      items: { include: { product: true } },
    },
  })

  if (!order) {
    return NextResponse.json({ message: "订单不存在" }, { status: 404 })
  }

  return NextResponse.json({ order })
}

/** PATCH /api/admin/orders/:id — 更新订单状态 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const err = await requireAdmin()
  if (err) return err

  const { id } = await params
  const { status } = await req.json()

  const validStatuses = ["pending", "paid", "shipped", "delivered", "cancelled"]
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ message: "无效的状态" }, { status: 400 })
  }

  const order = await prisma.order.findUnique({
    where: { id: Number(id) },
    include: { items: true },
  })
  if (!order) {
    return NextResponse.json({ message: "订单不存在" }, { status: 404 })
  }

  // 如果标记为 paid，同时更新用户消费和等级
  if (status === "paid" && order.status !== "paid") {
    const updated = await prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id: Number(id) },
        data: { status: "paid" },
        include: { items: { include: { product: true } }, user: { select: { name: true } } },
      })

      const user = await tx.user.findUnique({ where: { id: order.userId } })
      if (user) {
        const newTotalSpent = user.totalSpent + order.total
        const newLevel = Math.floor(newTotalSpent / 2000)
        await tx.user.update({
          where: { id: order.userId },
          data: { totalSpent: newTotalSpent, level: newLevel },
        })
      }

      return updatedOrder
    })

    return NextResponse.json({ order: updated })
  }

  // 取消订单时恢复库存
  if (status === "cancelled" && order.status !== "cancelled") {
    const updated = await prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id: Number(id) },
        data: { status: "cancelled" },
        include: { items: { include: { product: true } }, user: { select: { name: true } } },
      })

      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        })
      }

      return updatedOrder
    })

    return NextResponse.json({ order: updated })
  }

  const updated = await prisma.order.update({
    where: { id: Number(id) },
    data: { status },
    include: { items: { include: { product: true } }, user: { select: { name: true } } },
  })

  return NextResponse.json({ order: updated })
}
