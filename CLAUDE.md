# Mini Mall — 微型电商项目

## 技术栈

- Next.js 16 (App Router) + TypeScript (strict)
- Prisma 7 + SQLite (@prisma/adapter-libsql)
- TailwindCSS 4
- NextAuth v5 (beta) + bcryptjs
- npm

## 项目结构

```
src/
├── app/
│   ├── globals.css              # TailwindCSS 全局样式
│   ├── layout.tsx               # 根布局（SessionProvider）
│   ├── page.tsx                 # 首页
│   ├── (shop)/                  # C 端路由组
│   │   ├── layout.tsx           # Header + Footer
│   │   ├── products/page.tsx    # 商品列表（搜索 + 分类筛选）
│   │   ├── products/[id]/page.tsx
│   │   ├── cart/page.tsx
│   │   ├── checkout/page.tsx
│   │   ├── orders/page.tsx
│   │   ├── orders/[id]/page.tsx
│   │   ├── profile/page.tsx     # 个人中心（会员等级）
│   │   ├── auth/login/page.tsx
│   │   └── auth/register/page.tsx
│   ├── admin/                   # B 端路由组
│   │   ├── layout.tsx           # 管理员布局 + 侧边栏
│   │   ├── page.tsx             # 仪表盘
│   │   ├── products/page.tsx    # 商品 CRUD 列表
│   │   ├── products/new/page.tsx
│   │   ├── products/[id]/edit/page.tsx
│   │   ├── categories/page.tsx
│   │   └── orders/page.tsx
│   └── api/                     # Route Handlers
│       ├── auth/[...nextauth]/route.ts
│       ├── auth/register/route.ts
│       ├── auth/me/route.ts
│       ├── products/route.ts
│       ├── products/[id]/route.ts
│       ├── categories/route.ts
│       ├── cart/route.ts
│       ├── orders/route.ts
│       ├── orders/[id]/route.ts
│       ├── admin/products/route.ts
│       ├── admin/products/[id]/route.ts
│       ├── admin/categories/route.ts
│       ├── admin/categories/[id]/route.ts
│       ├── admin/orders/route.ts
│       └── admin/orders/[id]/route.ts
├── components/
│   ├── ui/                      # Button, Input, Card, Badge
│   ├── layout/                  # Header, Footer, Sidebar
│   ├── products/                # ProductCard, SearchBar, AddToCartButton
│   ├── cart/                    # CartItem, CartSummary
│   └── orders/
├── lib/
│   ├── prisma.ts                # PrismaClient 单例（适配 Prisma 7 adapter）
│   ├── auth.ts                  # NextAuth v5 配置
│   ├── admin.ts                 # 管理员权限校验辅助函数
│   └── utils.ts                 # 工具函数（formatPrice, formatDate, 订单状态映射）
├── generated/prisma/            # Prisma Client（自动生成）
└── middleware.ts                # 路由鉴权（Proxy Middleware）

prisma/
├── schema.prisma                # 数据模型定义
└── seed.ts                      # 种子数据脚本
```

## 数据模型（6 个表）

- **User** — `id, email, name, password(bcrypt), role(user|admin), level, totalSpent`
- **Category** — `id, name, slug`
- **Product** — `id, name, description, price, image, stock, categoryId`
- **CartItem** — `id, userId, productId, quantity` (用户-商品唯一约束)
- **Order** — `id, userId, total, status(pending|paid|shipped|delivered|cancelled)`
- **OrderItem** — `id, orderId, productId, quantity, price`(下单时价格快照)

## 认证方案

- NextAuth v5 Credentials Provider（邮箱 + 密码）
- JWT Session 策略，Session 存储：`id, email, name, role`
- 密码 bcryptjs 哈希
- `middleware.ts`（Proxy）保护 `/admin/*`，需 admin 角色
- 已登录用户访问登录/注册页自动跳转首页

## 会员等级

```
level = Math.floor(totalSpent / 2000)
```

订单状态变为 `paid` 时，通过 `$transaction` 原子更新 `totalSpent` 和 `level`。
等级对应的称号：0 普通会员 → 1-2 青铜会员 → 2-4 白银会员 → 5-9 黄金会员 → 10+ 至尊会员

## 测试账号

| 角色 | 邮箱 | 密码 |
|------|------|------|
| 管理员 | admin@minimall.com | admin123 |
| 测试用户 | user@test.com | 123456 |

运行 `npm run db:seed` 后创建。

## 种子数据

- 1 个管理员 + 1 个测试用户
- 5 个分类：电子产品、服装配饰、食品饮料、图书文具、家居生活
- 15 个商品（每个分类 3 个）

## 开发命令

```bash
npm run dev          # 启动开发服务器（http://localhost:3000）
npm run build        # 构建
npm run db:seed      # 填充种子数据
npx prisma generate  # 生成 Prisma Client（修改 schema 后执行）
npx prisma db push   # 同步 Schema 到数据库（新增字段后执行）
npx prisma studio    # 数据库管理界面
```

## 完整功能清单

- [x] 项目创建 + 依赖安装
- [x] Prisma Schema + 数据库初始化
- [x] NextAuth 认证系统（注册/登录/登出）
- [x] 通用布局（Header + Footer）和 UI 组件
- [x] 商品浏览（列表/详情/搜索/分类筛选）
- [x] 购物车（增删改查 + 乐观更新）
- [x] 下单和订单管理（模拟支付）
- [x] 会员等级系统（支付时自动升级）
- [x] 后台管理（商品/分类/订单 CRUD + 仪表盘）
- [x] 种子数据

## 注意事项

- Prisma 7 使用 `@prisma/adapter-libsql` 适配 SQLite，需在 PrismaClient 构造时传入 adapter
- 项目使用 `prisma-client` generator（非 `@prisma/client`），生成路径为 `src/generated/prisma/`
- SQLite 不支持 `enum`，订单状态使用 `String` 字段 + 代码校验
- `.env` 中的 `AUTH_SECRET` 为开发环境密钥，生产环境需重新生成
