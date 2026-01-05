# Costela PDV (Frontend)

System for point of sale (PDV) management, featuring a modern dashboard for sales, financial, and user management.

## 🚀 Features

### PDV (Point of Sale)

- **Product Management**: Search and selection of products for sale.
- **Cart System**: Add, remove, and adjust quantities of items.
- **Payments**: Support for multiple payment methods (Cash, Card, PIX).
- **Printing**: Integration with thermal printers (ESC/POS) via Serial Port for receipts.
- **Settings**:
  - **Printer Config**: Select terminal, printer type, and width.
  - **Test Printer**: Helper to verify printer connection.

### Dashboard

- **Products**: Complete CRUD for product management.
- **Financial**:
  - Sales overview and reports.
  - Charts for visual data analysis.
  - Export data to Excel.
  - Date range filtering.
- **Users**: User management system.

### General

- **Customization**:
  - Theme toggling (Light/Dark/System).
  - Configurable application name and logo.
- **Responsive**: Fully responsive design with mobile-friendly sidebar.

## 🛠️ Tech Stack

### Frontend

- **Framework**: [Next.js 16](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components**: [Shadcn/ui](https://ui.shadcn.com/) (Radix Primitives)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Forms**: React Hook Form + Zod
- **Data Fetching**: Axios
- **Charts**: Recharts

### Backend (Context)

- **Framework**: NestJS
- **Database**: PostgreSQL (Prisma ORM)
- **Real-time**: Socket.io
- **Hardware**: SerialPort (for thermal printer communication)

## 📦 Getting Started

### Prerequisites

- Node.js (v18+)
- npm / yarn / pnpm

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   ```

2. Navigate to the frontend directory:

   ```bash
   cd pdv-frontend
   ```

3. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

4. Configure Environment Variables:
   Create a `.env` file based on `.env.example` (if available) or ensure your backend URL is configured.

5. Run the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📂 Project Structure

- `src/app`: App Router pages and layouts.
- `src/components`: Reusable UI components.
- `src/services`: API integration services.
- `src/hooks`: Custom React hooks.
- `src/types`: TypeScript type definitions.
- `src/modules`: Feature-specific modules (legacy/backend context).

## 📄 License

This project is proprietary.
