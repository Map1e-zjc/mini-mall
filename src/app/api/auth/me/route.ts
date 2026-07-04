import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/** GET /api/auth/me — 获取当前登录用户信息 */
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ message: "未登录" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: Number(session.user.id) },
    select: { id: true, email: true, name: true, role: true, level: true, totalSpent: true },
  })

  if (!user) {
    return NextResponse.json({ message: "用户不存在" }, { status: 404 })
  }

  return NextResponse.json({ user })
}
