import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import type { PrismaClient } from "@/generated/prisma/client"

declare module "next-auth" {
  interface User {
    role?: string
  }
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
    }
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string
    role: string
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "邮箱", type: "email" },
        password: { label: "密码", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string
        const password = credentials?.password as string

        if (!email || !password) return null

        // 动态导入 Prisma，避免 middleware（Edge Runtime）加载 Node.js 原生模块
        const { prisma } = await import("@/lib/prisma") as { prisma: PrismaClient }
        const user = await prisma.user.findUnique({ where: { email } })
        if (!user) return null

        const isValid = await compare(password, user.password)
        if (!isValid) return null

        return {
          id: String(user.id),
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id!
        token.role = user.role ?? "user"
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.id
      session.user.role = token.role
      return session
    },
  },
  pages: {
    signIn: "/auth/login",
  },
  trustHost: true,
})
