import { config } from "dotenv"
import { resolve } from "path"
config({ path: resolve(process.cwd(), ".env") })

import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaLibSql } from "@prisma/adapter-libsql"
import { hash } from "bcryptjs"

function createPrismaClient() {
  const url = process.env.DATABASE_URL ?? "file:./dev.db"
  const adapter = new PrismaLibSql({ url })
  return new PrismaClient({ adapter })
}

const prisma = createPrismaClient()

async function main() {
  console.log("🌱 开始填充种子数据...")

  // 创建管理员
  const adminPassword = await hash("admin123", 12)
  await prisma.user.upsert({
    where: { email: "admin@minimall.com" },
    update: {},
    create: {
      email: "admin@minimall.com",
      name: "管理员",
      password: adminPassword,
      role: "admin",
    },
  })
  console.log("✅ 管理员：admin@minimall.com / admin123")

  // 创建测试用户
  const userPassword = await hash("123456", 12)
  await prisma.user.upsert({
    where: { email: "user@test.com" },
    update: {},
    create: {
      email: "user@test.com",
      name: "测试用户",
      password: userPassword,
      role: "user",
    },
  })
  console.log("✅ 测试用户：user@test.com / 123456")

  // 创建分类
  const categoriesData = [
    { name: "电子产品", slug: "electronics" },
    { name: "服装配饰", slug: "clothing" },
    { name: "食品饮料", slug: "food" },
    { name: "图书文具", slug: "books" },
    { name: "家居生活", slug: "home" },
  ]

  const categories = []
  for (const cat of categoriesData) {
    const c = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    })
    categories.push(c)
  }
  console.log(`✅ ${categories.length} 个分类`)

  // 创建商品
  const productsData = [
    { name: "无线蓝牙耳机", description: "高品质降噪蓝牙耳机，续航 30 小时，佩戴舒适。", price: 299, stock: 100, slug: "electronics" },
    { name: "智能手表", description: "多功能智能手表，支持心率监测、运动追踪、消息提醒。", price: 599, stock: 50, slug: "electronics" },
    { name: "便携充电宝", description: "20000mAh 大容量，支持快充，轻薄便携。", price: 129, stock: 200, slug: "electronics" },
    { name: "纯棉T恤", description: "100% 纯棉面料，舒适透气，多色可选。", price: 79, stock: 300, slug: "clothing" },
    { name: "轻薄羽绒服", description: "高蓬松度白鹅绒填充，轻薄保暖，适合秋冬。", price: 399, stock: 80, slug: "clothing" },
    { name: "休闲运动鞋", description: "舒适缓震，透气网面，适合日常运动和通勤。", price: 259, stock: 150, slug: "clothing" },
    { name: "有机绿茶", description: "高山有机绿茶，清香回甘，250g 装。", price: 68, stock: 500, slug: "food" },
    { name: "坚果礼盒", description: "每日坚果混合装，6 种坚果果干搭配，500g。", price: 99, stock: 200, slug: "food" },
    { name: "手冲咖啡套装", description: "包含手冲壶、滤杯、滤纸和 200g 咖啡豆。", price: 199, stock: 60, slug: "food" },
    { name: "编程入门指南", description: "零基础学编程，图文并茂，适合初学者。", price: 49, stock: 1000, slug: "books" },
    { name: "设计心理学", description: "经典设计理论书籍，理解人与产品的交互。", price: 59, stock: 300, slug: "books" },
    { name: "精美笔记本", description: "A5 硬面笔记本，180 度平摊，128 页方格内页。", price: 25, stock: 500, slug: "books" },
    { name: "LED台灯", description: "无频闪护眼台灯，三档色温可调，USB 充电。", price: 89, stock: 120, slug: "home" },
    { name: "毛绒抱枕", description: "柔软舒适毛绒抱枕，可拆洗，45x45cm。", price: 45, stock: 200, slug: "home" },
    { name: "香薰蜡烛", description: "天然大豆蜡制作，薰衣草香氛，燃烧时长 40 小时。", price: 35, stock: 150, slug: "home" },
  ]

  // 先清除已有商品再重建
  await prisma.product.deleteMany()

  for (const data of productsData) {
    const category = categories.find((c) => c.slug === data.slug)
    if (!category) continue
    await prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        stock: data.stock,
        categoryId: category.id,
      },
    })
  }
  console.log(`✅ ${productsData.length} 个商品`)

  console.log("🎉 种子数据填充完成！")
}

main()
  .catch((e) => {
    console.error("❌ 失败:", e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
