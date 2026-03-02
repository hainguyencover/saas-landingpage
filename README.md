# SaaS Landing Page

A premium, high-performance landing page for the Salon SaaS platform, built with **Next.js 14**, **Tailwind CSS**, and **Framer Motion**.

## 🚀 Features

- **Dynamic Pricing**: Fetches real-time plans and pricing from the backend API.
- **Seamless Auth Integration**: Integrated login flow that redirects users directly to the SaaS Dashboard.
- **Mollie Payment Integration**: Automated status polling for subscriptions and add-on purchases after checkout.
- **Multi-language Support (i18n)**: Ready for internationalization with built-in context and locale management.
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices with professional aesthetics.
- **Performance Optimized**: Built with Next.js App Router and optimized assets for fast loading.

## 🛠 Tech Stack

- **Framework**: [Next.js 14 (App Router)](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js**: v18.x or higher
- **npm**: v9.x or higher

## ⚙️ Configuration

The project uses environment variables for dynamic URL handling. Create a `.env.local` file in the root directory:

```bash
# Backend API Base URL
NEXT_PUBLIC_API_URL=http://localhost:8080

# Frontend SaaS Dashboard URL
NEXT_PUBLIC_FRONTEND_URL=http://localhost:5173
```

> [!IMPORTANT]
> Ensure `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_FRONTEND_URL` are set correctly for production to avoid redirection errors.

## 🚀 Getting Started

### 1. Installation

```bash
# Clone the repository (if applicable)
# git clone <repository-url>

# Install dependencies
npm install
```

### 2. Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### 3. Production Build

Build the application for production:

```bash
npm run build
```

Start the production server:

```bash
npm run start
```

## 📂 Project Structure

- `src/app/`: Next.js App Router pages and layouts.
- `src/components/`: Reusable UI components (Auth, Layout, Pricing, etc.).
- `src/lib/`: Shared utilities, constants, and i18n context.
- `src/services/`: API service layers for fetching plans and settings.
- `public/`: Static assets (images, icons, fonts).

## 🌍 Redirection Logic

- **Login**: Redirects to `${NEXT_PUBLIC_FRONTEND_URL}/login`.
- **Registration**: Redirects to `${NEXT_PUBLIC_FRONTEND_URL}/register?plan=<id>`.
- **Mollie Return**: Handles the return trip from Mollie, polls the backend for payment status, and then redirects to `${NEXT_PUBLIC_FRONTEND_URL}/admin/my-subscription`.

## 📜 License

Private project - All rights reserved.
