import { prisma } from "@/lib/prisma"
import Card from "@/components/ui/Card"

export default async function AdminDashboard() {
  const [productCount, categoryCount, orderCount, userCount, recentOrders] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.order.count(),
    prisma.user.count(),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true } } },
    }),
  ])

  const paidOrders = await prisma.order.count({ where: { status: "paid" } })
  const totalRevenue = await prisma.order.aggregate({
    where: { status: { not: "cancelled" } },
    _sum: { total: true },
  })

  const stats = [
    { label: "商品总数", value: productCount, color: "text-blue-600" },
    { label: "分类总数", value: categoryCount, color: "text-green-600" },
    { label: "订单总数", value: orderCount, color: "text-purple-600" },
    { label: "用户总数", value: userCount, color: "text-orange-600" },
    { label: "已支付订单", value: paidOrders, color: "text-teal-600" },
    { label: "总收入 (¥)", value: totalRevenue._sum.total?.toFixed(2) || "0.00", color: "text-red-600" },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">仪表盘</h1>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
          </Card>
        ))}
      </div>

      {/* 最近订单 */}
      <Card>
        <h2 className="font-semibold text-gray-900 mb-4">最近订单</h2>
        {recentOrders.length === 0 ? (
          <p className="text-sm text-gray-400">暂无订单</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 text-gray-500 font-medium">订单号</th>
                <th className="text-left py-2 text-gray-500 font-medium">用户</th>
                <th className="text-right py-2 text-gray-500 font-medium">金额</th>
                <th className="text-right py-2 text-gray-500 font-medium">状态</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id} className="border-b border-gray-100">
                  <td className="py-2">#{order.id}</td>
                  <td className="py-2">{order.user.name}</td>
                  <td className="py-2 text-right">¥{order.total.toFixed(2)}</td>
                  <td className="py-2 text-right text-gray-500">{order.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  )
}
