# Mini Mall — 微型电商项目

## 技术栈

- Next.js 16 (App Router) + TypeScript
- Prisma 7 + SQLite
- TailwindCSS 4
- NextAuth v5 (beta) + bcryptjs
- npm

## 项目结构

```
src/
├── app/
│   ├── globals.css              # TailwindCSS 全局样式
│   ├── layout.tsx               # 根布局（SessionProvider）
│   ├── page.tsx                 # 首页（商品列表）
│   ├── (shop)/                  # C 端路由组
│   │   ├── layout.tsx           # 含导航栏
│   │   ├── products/[id]/page.tsx
│   │   ├── cart/page.tsx
│   │   ├── checkout/page.tsx
│   │   ├── orders/page.tsx
│   │   ├── orders/[id]/page.tsx
│   │   ├── auth/login/page.tsx
│   │   ├── auth/register/page.tsx
│   │   └── profile/page.tsx
│   ├── admin/                   # B 端路由组
│   │   ├── layout.tsx           # 管理员布局 + 侧边栏
│   │   ├── page.tsx             # 仪表盘
│   │   ├── products/
│   │   ├── categories/
│   │   └── orders/
│   └── api/                     # Route Handlers
│       ├── auth/
│       │   ├── [...nextauth]/route.ts
│       │   ├── register/route.ts
│       │   └── me/route.ts
│       ├── products/route.ts
│       ├── products/[id]/route.ts
│       ├── categories/route.ts
│       ├── cart/route.ts
│       └── orders/route.ts
├── components/
│   ├── ui/                      # 通用组件（Button, Card, Input, Modal...）
│   ├── layout/                  # Header, Footer, Sidebar
│   ├── products/                # ProductCard, ProductGrid, SearchBar
│   ├── cart/                    # CartItem, CartSummary
│   └── admin/                   # 后台专用组件
├── lib/
│   ├── prisma.ts                # PrismaClient 单例
│   ├── auth.ts                  # NextAuth v5 配置
│   └── utils.ts                 # 工具函数（格式化价格、时间等）
├── generated/prisma/            # Prisma Client（自动生成）
└── middleware.ts                # 路由鉴权

prisma/
├── schema.prisma                # 数据模型定义
└── seed.ts                      # 种子数据脚本
```

## 数据模型（6 个表）

- **User** — `id, email, name, password(bcrypt), role(user|admin), level, totalSpent`
- **Category** — `id, name, slug`
- **Product** — `id, name, description, price, image, stock, categoryId`
- **CartItem** — `id, userId, productId, quantity` (用户-商品唯一)
- **Order** — `id, userId, total, status(pending|paid|shipped|delivered|cancelled)`
- **OrderItem** — `id, orderId, productId, quantity, price`(快照)

## 认证方案

- NextAuth v5 Credentials Provider (邮箱 + 密码)
- JWT Session 策略
- 密码 bcryptjs 哈希
- Session 存储：`id, email, name, role`
- middleware 保护 `/admin/*` 路由

## 会员等级

```
level = Math.floor(totalSpent / 2000)
```

订单状态变为 `paid` 时，通过 `$transaction` 原子更新 `totalSpent` 和 `level`。

## 开发命令

```bash
npm run dev          # 启动开发服务器
npm run build        # 构建
npx prisma generate  # 生成 Prisma Client
npx prisma db push   # 同步 Schema 到数据库
npx prisma db seed   # 填充种子数据
npx prisma studio    # 数据库管理界面
```

## 实施顺序

1. 项目创建 + 依赖安装 ✅
2. Prisma Schema + 数据库初始化 ✅
3. NextAuth 认证系统
4. 通用布局和 UI 组件
5. 商品浏览（列表/详情/搜索/分类筛选）
6. 购物车
7. 下单和订单管理（模拟支付）
8. 会员等级系统
9. 后台管理（商品/分类/订单 CRUD）
10. 种子数据 + 收尾
