# SpendTrace

SpendTrace is a sleek, modern, mobile-first personal finance and expense tracking application built using Next.js 16 (React 19) and Supabase. It empowers users to define custom monthly budgets, effortlessly log and manage expenses, filter and sort transactions, and gain actionable spending insights through interactive, zero-dependency SVG charts.

**Live Demo:** [https://spendtrace.vercel.app](https://spendtrace.vercel.app)

---

## Key Features

### 📊 Dashboard & Budget Management
- **Total Spend Overview**: A dynamic hero card displaying real-time monthly spending against total budget limits, complete with an animated progress bar that transitions from brand color to yellow (at 80% capacity) and destructive red (when over budget).
- **Interactive Month Navigation**: Travel back and forth across past and upcoming months using the header `MonthPicker`. Selected dates persist across page navigation via URL query parameters (`?date=YYYY-MM`).
- **Category Budgets**: Create, edit, and delete budget categories with custom names, icons/emojis, and monthly target limits.
- **Category Limit Guard**: Enforces a strict 5-category maximum both on the client and server to keep budgeting focused and intentional.
- **Drag & Drop Reordering**: Seamlessly reorder categories with smooth animations powered by `@dnd-kit`, persisting custom sort orders in PostgreSQL.
- **Quick-Start Seed Defaults**: One-click seeding of default budget categories ("Food 🍴", "Transport 🚌", "Leisure 🎉") for immediate onboarding.
- **Expense Logging**: Add expenses on the fly using either the floating action button (FAB) or section trigger, with custom descriptions, amounts, categories, and dates.

### 🔍 Advanced Transaction Management
- **Multi-Criteria Filtering**: Filter transaction records by specific category (including "Uncategorized" detections) and custom date ranges (From / To).
- **Multi-Field Sorting**: Instantly sort transactions by **Date** or **Amount** in ascending or descending order.
- **Responsive Toolbar Architecture**:
  - **Desktop (`md+`)**: Standardized, unified single-row toolbar featuring explicit `Filter:` and `Sort:` labels, uniform control heights, inline "Clear" button, and active result counts.
  - **Mobile**: Minimalist header row with result counter and a dedicated "Filter & Sort" trigger button with an active indicator badge that opens a responsive dialog popup.
- **Paginated List**: Built-in 5-items-per-page pagination with automatic page reset upon filter or sort change, plus context-aware empty states.
- **Safe Transaction Actions**: Inline dropdown menus to edit transaction details or delete expenses with confirmation dialogs.

### 📈 Interactive Visualizations & Analytics
- **Category Breakdown Pie Chart**: Zero-dependency, pure SVG pie chart with dynamic slice geometry, custom color palette, percentage breakdowns, and hover/touch tooltips. Uncategorized spending is automatically grouped.
- **Daily Spending Heatmap**: A GitHub-inspired monthly calendar contribution grid tracking expenditure intensity across 5 color-density levels, featuring localized date and amount tooltips.
- **6-Month Spending Trend Chart**: Responsive SVG area and line chart mapping spending trajectory over the preceding 6 months leading up to the selected month, complete with auto-scaling gridlines and interactive data points.

### ⚙️ User Settings & Customization
- **Currency Preferences**: Toggle between global currency formats (`$`, `€`, `£`, `¥`, `₩`, `₱`) in user settings to dynamically format all financial values app-wide.
- **Profile Management**: Update your display name with immediate sync across navigation bars and mobile drawer headers.
- **Theme Support**: Seamless Light, Dark, and System appearance toggles powered by `next-themes` and CSS variables.
- **Secure Authentication**: Built-in email/password registration with verification links, along with one-click Google OAuth authentication via Supabase Auth and session-protecting proxy routing.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Server Actions, React 19) |
| **Backend & DB** | [Supabase](https://supabase.com/) (PostgreSQL, Row-Level Security, Auth) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) with PostCSS & CSS variables |
| **UI Components** | [Radix UI](https://www.radix-ui.com/) Primitives & [shadcn/ui](https://ui.shadcn.com/) patterns |
| **Drag & Drop** | [@dnd-kit/core](https://dndkit.com/) & [@dnd-kit/sortable](https://dndkit.com/) |
| **Date Utilities** | [date-fns v4](https://date-fns.org/) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Theme Engine** | [next-themes](https://github.com/pacocoursey/next-themes) |

---

## Project Structure

```text
spendtrace/
├── app/
│   ├── actions.ts              # Server actions (categories, expenses, profile)
│   ├── analytics/              # Analytics page route
│   │   └── page.tsx            # Server-rendered 6-month analytics loader
│   ├── auth/                   # Auth handlers (OAuth callback, signout)
│   │   ├── callback/route.ts   # Exchange OAuth code for session
│   │   └── signout/route.ts    # Session destruction endpoint
│   ├── login/                  # Authentication page (Email/password & Google)
│   │   └── page.tsx
│   ├── globals.css             # Tailwind v4 theme variables and base styling
│   ├── layout.tsx              # Root HTML shell & ThemeProvider
│   └── page.tsx                # Main dashboard page (month budget overview)
├── components/
│   ├── ui/                     # Radix UI primitives (dialog, select, popover, etc.)
│   ├── AddExpenseModal.tsx     # Floating / inline expense creation modal
│   ├── AnalyticsClient.tsx     # Client analytics (SVG Pie, Heatmap, Trend line)
│   ├── CategoryCard.tsx        # Budget card with progress indicator & options
│   ├── CategoryList.tsx        # Dnd-kit drag-and-drop sortable category container
│   ├── ConfirmModal.tsx        # Reusable alert confirmation dialog
│   ├── CreateCategoryModal.tsx # New category creation modal with 5-item cap
│   ├── Footer.tsx              # Application footer
│   ├── Header.tsx              # Navigation bar, MonthPicker, tabs & user drawer
│   ├── ModeToggle.tsx          # Light/dark mode toggle
│   ├── MonthPicker.tsx         # Popover year/month picker synced to URL state
│   ├── SettingsModal.tsx       # Profile name, currency, and theme settings
│   ├── SortableCategoryItem.tsx# Dnd-kit sortable wrapper component
│   ├── theme-provider.tsx      # NextThemes wrapper
│   ├── TransactionItem.tsx     # Transaction row with inline edit & delete
│   └── TransactionList.tsx     # Filter, sort, pagination, and transaction listing
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # Browser Supabase client
│   │   ├── queries.ts          # Server database query helpers
│   │   └── server.ts           # Server component / action Supabase client
│   └── utils.ts                # Tailwind class merge utility (cn)
├── proxy.ts                    # Edge session check & path proxy
└── README.md
```

---

## Database Setup (Supabase)

SpendTrace relies on Supabase PostgreSQL with Row Level Security (RLS) enabled. Run the following SQL queries in your Supabase SQL Editor:

```sql
-- 1. Create categories table
create table categories (
  id bigint generated by default as identity primary key,
  user_id uuid references auth.users not null,
  name text not null,
  icon text,
  monthly_budget numeric not null default 0,
  sort_order integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS and create policy for categories
alter table categories enable row level security;

create policy "Users can manage their own categories" on categories
  for all using (auth.uid() = user_id);

-- 2. Create expenses table
create table expenses (
  id bigint generated by default as identity primary key,
  user_id uuid references auth.users not null,
  category_id bigint references categories(id) on delete cascade,
  amount numeric not null,
  description text,
  date date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS and create policy for expenses
alter table expenses enable row level security;

create policy "Users can manage their own expenses" on expenses
  for all using (auth.uid() = user_id);
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18.17+ or v20+)
- npm, pnpm, or yarn
- A free [Supabase](https://supabase.com/) account and project

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/j-kennethh/SpendTrace.git
   cd spendtrace
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

4. **Enable Google OAuth (Optional)**:
   In your Supabase project dashboard under **Authentication > Providers > Google**, add your Google Client ID and Secret. In Google Cloud Console, set your redirect URL to:
   ```text
   https://<your-project-ref>.supabase.co/auth/v1/callback
   ```

5. **Run the development server**:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Scripts

- `npm run dev` — Starts the Next.js development server with Turbopack.
- `npm run build` — Builds the optimized production application.
- `npm run start` — Runs the compiled production server.
- `npm run lint` — Runs ESLint checks.

---

## License

This project is open-source and licensed under the [MIT License](LICENSE).
