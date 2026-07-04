import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/** GET /api/products/:id — 商品详情 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
