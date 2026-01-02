import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent } from "@/components/ui/card"
import { Wallet, LogOut } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { seedCategories } from './actions'
import AddExpenseModal from '@/components/AddExpenseModal'
import CreateCategoryModal from '@/components/CreateCategoryModal'
import CategoryList from '@/components/CategoryList'
import TransactionList from '@/components/TransactionList' // Was missing in previous broken edit
import Header from "@/components/Header"

export default async function Dashboard(props: { searchParams: Promise<{ date?: string }> }) {
  const searchParams = await props.searchParams
  const supabase = await createClient()

  // 1. Check if user is logged in
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // 2. Fetch Categories (Ordered by sort_order now)
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', user.id)
    .order('sort_order', { ascending: true })
    .order('id', { ascending: true }) // Fallback for old categories

  // 3. Fetch ALL Expenses for this month (for correct totals & client-side pagination)
  const now = new Date()
  let currentMonthDate = now

  if (searchParams?.date) {
    const [year, month] = searchParams.date.split('-').map(Number)
    if (!isNaN(year) && !isNaN(month)) {
      currentMonthDate = new Date(year, month - 1, 1)
    }
  }

  const startOfMonth = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth(), 1).toISOString()
  const startOfNextMonth = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 1).toISOString()

  const { data: expenses } = await supabase
    .from('expenses')
    .select('*')
    .eq('user_id', user.id)
    .gte('date', startOfMonth)
    .lt('date', startOfNextMonth)
    .order('date', { ascending: false })
    .order('id', { ascending: false })

  // --- NEW LOGIC START ---
  // 4. Calculate Totals & Group by Category
  const totalSpent = expenses?.reduce((sum, item) => sum + Number(item.amount), 0) || 0
  const monthlyBudget = categories?.reduce((sum, item) => sum + Number(item.monthly_budget), 0) || 0

  // Create a map of { category_id: total_spent }
  const spendByCategory: Record<number, number> = {}
  expenses?.forEach((expense) => {
    const catId = expense.category_id
    if (catId) {
      spendByCategory[catId] = (spendByCategory[catId] || 0) + Number(expense.amount)
    }
  })
  // --- NEW LOGIC END ---

  // Calculate overall progress
  const progressPercentage = monthlyBudget > 0 ? (totalSpent / monthlyBudget) * 100 : 0

  const currency = user.user_metadata.currency_symbol || '$'

  return (
    <div className="min-h-screen bg-background">
      {/* HEADER */}
      <Header user={user} currency={currency} currentMonth={currentMonthDate} />

      <main className="p-6 space-y-6">

        {/* HERO CARD: Total Spent */}
        <Card className="bg-primary text-primary-foreground border-none shadow-xl">
          <CardContent>
            <div className="flex justify-between items-start mb-2">
              <span className="text-primary-foreground/80 text-sm font-medium">Total Spent</span>
            </div>
            <div className="text-4xl font-bold mb-4">
              {currency}{totalSpent.toFixed(2)}
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs opacity-90">
                <span>{progressPercentage.toFixed(0)}% of Budget</span>
                <span>{currency}{monthlyBudget.toFixed(2)} Limit</span>
              </div>
              <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-foreground rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CATEGORIES / BUDGETS LIST */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-foreground">Budgets</h2>
            <CreateCategoryModal currency={currency} isLimitReached={(categories?.length || 0) >= 5} />
          </div>

          <CategoryList
            categories={categories || []}
            spendByCategory={spendByCategory}
            currency={currency}
          >
            {/* Empty State */}
            <Card className="border-dashed border-2 shadow-none">
              <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                <div className="h-12 w-12 bg-secondary rounded-full flex items-center justify-center mb-4">
                  <Wallet className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">No Budgets Yet</h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-[200px]">
                  Create your first category to start tracking your expenses.
                </p>
                <form action={seedCategories}>
                  <Button variant="outline" type="submit">Create Default Categories</Button>
                </form>
              </CardContent>
            </Card>
          </CategoryList>
        </div>

        {/* RECENT TRANSACTIONS */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-foreground">Recent Transactions</h2>
            <AddExpenseModal categories={categories || []} currency={currency} />
          </div>
          <TransactionList
            expenses={expenses || []}
            categories={categories || []}
            currency={currency}
          />
        </div>
      </main>

      {/* MODAL - kept for safety if needed, but AddExpenseModal is now inline above title */}
      {/* <AddExpenseModal categories={categories || []} /> */}
    </div>
  )
}