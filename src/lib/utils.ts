/** 格式化价格，例：¥19.99 */
export function formatPrice(price: number): string {
  return `¥${price.toFixed(2)}`
}

/** 格式化日期，例：2024-01-15 14:30 */
export function formatDate(date: Date | string): string {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  const hours = String(d.getHours()).padStart(2, "0")
  const minutes = String(d.getMinutes()).padStart(2, "0")
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

/** 订单状态中文映射 */
export const orderStatusMap: Record<string, string> = {
  pending: "待支付",
  paid: "已支付",
  shipped: "已发货",
  delivered: "已完成",
  cancelled: "已取消",
}

/** 订单状态对应颜色 */
export const orderStatusColorMap: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-gray-100 text-gray-800",
}
