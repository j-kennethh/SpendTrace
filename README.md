# SpendTrace

SpendTrace is a sleek, modern personal finance and expense tracking application built to help you manage your monthly budgets efficiently. 

**Live Demo:** [https://spendtrace.vercel.app](https://spendtrace.vercel.app)

## Features

- **Dashboard & Monthly Overviews**: Easily track your total spend against your monthly budgets. Navigate through past and current months to see your spending history.
- **Budget Categories**: Create up to 5 custom budget categories with individual monthly limits and icons. 
- **Drag & Drop Organization**: Reorder your budget categories easily using drag and drop functionality.
- **Expense Tracking**: Log individual transactions with descriptions, amounts, dates, and assign them to your custom categories.
- **Visual Progress Tracking**: Beautiful progress bars show you exactly how much of your budget you've consumed.
- **Customizable Profile**: Set your preferred currency symbol.
- **Dark / Light Mode**: Built-in support for multiple color themes.
- **Secure Authentication**: User sign-up and login handled seamlessly.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, React 19)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with Radix UI components
- **Backend & Database**: [Supabase](https://supabase.com/)
- **Drag & Drop**: [@dnd-kit](https://dndkit.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

## Getting Started

### Prerequisites

You need [Node.js](https://nodejs.org/) installed on your machine and a [Supabase](https://supabase.com/) account.

### Installation

1. **Clone the repository** (or download the source):
   ```bash
   git clone <repository-url>
   cd spendtrace
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up Supabase**:
   - Create a new Supabase project.
   - Set up the necessary tables (`categories` and `expenses`).
   - Create a `.env.local` file in the root directory and add your Supabase credentials:
     ```env
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `app/`: Next.js App Router files, server actions (`actions.ts`), and main dashboard logic.
- `components/`: Reusable React components including Modals, Header, and drag-and-drop lists.
- `lib/supabase/`: Supabase client configuration for server-side rendering.

## License

This project is open-source and available under the MIT License.
