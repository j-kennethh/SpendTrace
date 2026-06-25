import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Header from "../../components/Header"
import AnalyticsClient from '../../components/AnalyticsClient'

export default async function AnalyticsPage(props: { searchParams: Promise<{ date?: string }> }) {
  const searchParams = await props.searchParams
  const supabase = await createClient()

  // 1. Authenticate user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // 2. Determine selected month
  const now = new Date()
  let currentMonthDate = now

  if (searchParams?.date) {
    const [year, month] = searchParams.date.split('-').map(Number)
    if (!isNaN(year) && !isNaN(month)) {
      currentMonthDate = new Date(year, month - 1, 1)
    }
  }

  const y = currentMonthDate.getFullYear()
  const m = currentMonthDate.getMonth()

  // 3. Compute 6-month date range (ending at the selected month)
  // If selected month is June, range is Jan-June.
  const startOf6MonthsDate = new Date(y, m - 5, 1)
  const startOfNextMonthDate = new Date(y, m + 1, 1)

  const startOf6MonthsStr = `${startOf6MonthsDate.getFullYear()}-${String(startOf6MonthsDate.getMonth() + 1).padStart(2, '0')}-01`
  const startOfNextMonthStr = `${startOfNextMonthDate.getFullYear()}-${String(startOfNextMonthDate.getMonth() + 1).padStart(2, '0')}-01`

  // 4. Fetch Categories
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', user.id)
    .order('sort_order', { ascending: true })

  // 5. Fetch Expenses for the past 6 months (up to next month start)
  const { data: expenses } = await supabase
    .from('expenses')
    .select('*')
    .eq('user_id', user.id)
    .gte('date', startOf6MonthsStr)
    .lt('date', startOfNextMonthStr)
    .order('date', { ascending: true })

  const currency = user.user_metadata.currency_symbol || '$'

  // We convert currentMonthDate to a ISO string to avoid Next.js serialization warning
  const currentMonthISO = currentMonthDate.toISOString()

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} currency={currency} currentMonth={currentMonthDate} activeTab="analytics" />
      <main className="p-6 space-y-6">
        <AnalyticsClient
          expenses={expenses || []}
          categories={categories || []}
          currency={currency}
          selectedMonthISO={currentMonthISO}
        />
      </main>
    </div>
  )
}
