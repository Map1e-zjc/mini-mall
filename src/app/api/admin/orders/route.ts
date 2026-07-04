import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin"

/** GET /api/admin/orders — 所有订单列表 */
export async function GET(req: Request) {
  const err = await requireAdmin()
  if (err) return err

  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status")
  const page = Number(searchParams.get("page") || "1")
  const pageSize = 20

  const where: Record<string, unknown> = {}
  if (status) where.status = status

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: { include: { product: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.order.count({ where }),
  ])

  return NextResponse.json({ orders, total, page, pageSize })
}
