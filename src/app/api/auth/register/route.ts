import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { prisma } from "@/lib/prisma"

/** POST /api/auth/register — 注册新用户 */
export async function POST(req: Request) {
  try {
    const { email, name, password } = await req.json()

    // 校验输入
    if (!email || !name || !password) {
      return NextResponse.json(
        { message: "邮箱、用户名和密码不能为空" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "密码至少需要 6 个字符" },
        { status: 400 }
      )
    }

    // 检查邮箱是否已注册
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { message: "该邮箱已被注册" },
        { status: 409 }
      )
    }

    // 创建用户
    const hashedPassword = await hash(password, 12)
    const user = await prisma.user.create({
      data: { email, name, password: hashedPassword },
      select: { id: true, email: true, name: true, role: true },
    })

    return NextResponse.json({ user }, { status: 201 })
  } catch {
    return NextResponse.json(
      { message: "注册失败，请稍后重试" },
      { status: 500 }
    )
  }
}
