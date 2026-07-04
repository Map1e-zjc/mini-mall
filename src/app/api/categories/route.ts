import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/** GET /api/categories — 所有分类 */
export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  })
  return NextResponse.json({ categories })
}
