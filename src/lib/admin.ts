import { NextResponse } from "next/server"
import { auth } from "./auth"

/** 检查当前 session 是否为管理员，否则返回 403 */
export async function requireAdmin() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ message: "请先登录" }, { status: 401 })
  }
  if (session.user.role !== "admin") {
    return NextResponse.json({ message: "无权限，需要管理员身份" }, { status: 403 })
  }
  return null
}
