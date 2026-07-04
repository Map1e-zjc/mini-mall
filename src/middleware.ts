import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  // 保护管理员路由
  if (pathname.startsWith("/admin")) {
    if (!session?.user) {
      const loginUrl = new URL("/auth/login", req.url)
      loginUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(loginUrl)
    }
    if (session.user.role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url))
    }
  }

  // 已登录用户访问登录/注册页，重定向到首页
  if (session?.user && (pathname.startsWith("/auth/login") || pathname.startsWith("/auth/register"))) {
    return NextResponse.redirect(new URL("/", req.url))
  }

  return NextResponse.next()
})

// 匹配需要鉴权的路由
export const config = {
  matcher: ["/admin/:path*", "/auth/login", "/auth/register"],
}
