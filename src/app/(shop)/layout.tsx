import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import type { ReactNode } from "react"

export default function ShopLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  )
}
