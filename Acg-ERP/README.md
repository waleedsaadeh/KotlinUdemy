# ACG ERP

<div align="right">

## نظام ACG لتخطيط موارد الشركات (ERP)

</div>

A modern, flexible, **bilingual (Arabic / English)** ERP system for companies —
built to be easy to extend, module by module.

نظام ERP عصري ومرن **ثنائي اللغة (عربي / إنجليزي)** مع دعم كامل للاتجاه من اليمين
لليسار (RTL)، مبني ليكون سهل التوسعة والتعديل، وحدةً تلو الأخرى.

---

## ✨ Features / المزايا

- 🌍 **Bilingual** — full Arabic (RTL) & English (LTR) support, switchable at runtime.
- 🎨 **Modern UI** — clean, responsive design built with TailwindCSS.
- 🔐 **Auth & Roles** — JWT authentication with role-based access (Admin / Manager / User).
- 📦 **Inventory module** — products, categories, and warehouses (first module, more to come).
- 🧩 **Modular architecture** — each business area is an isolated module, easy to add/edit.
- ⚡ **Type-safe** — TypeScript across the whole stack.

## 🏗️ Tech Stack / التقنيات

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite + TailwindCSS + i18next |
| Backend | Node.js + Express + TypeScript |
| ORM / DB | Prisma + PostgreSQL |
| Auth | JWT + bcrypt |

## 📁 Structure / الهيكل

```
Acg-ERP/
├── server/          # Backend API (Express + Prisma)
│   ├── prisma/      # Database schema & seed
│   └── src/
│       ├── modules/ # Feature modules (auth, inventory, ...)
│       └── ...
└── client/          # Frontend (React + Vite)
    └── src/
        ├── pages/
        ├── components/
        └── i18n/    # Arabic & English translations
```

## 🚀 Getting Started / التشغيل

### 1. Backend

```bash
cd server
cp .env.example .env      # then set DATABASE_URL & JWT_SECRET
npm install
npm run db:migrate        # create database tables
npm run db:seed           # seed admin user + sample data
npm run dev               # starts API on http://localhost:4000
```

**Default admin login:** `admin@acg.com` / `Admin@123`

### 2. Frontend

```bash
cd client
npm install
npm run dev               # starts app on http://localhost:5173
```

## 🗺️ Roadmap / خارطة الطريق

- [x] Foundation: auth, roles, bilingual UI, layout
- [x] Inventory: products, categories, warehouses
- [ ] Sales & Invoicing / المبيعات والفواتير
- [ ] Accounting / المحاسبة
- [ ] HR & Payroll / الموارد البشرية والرواتب
- [ ] Reports & Dashboards / التقارير ولوحات المعلومات

---

Built with ❤️ for ACG.
