import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent } from "@/components/ui/card"
import { Wallet, LogOut } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { seedCategories } from './actions'
import AddExpenseModal from '@/components/AddExpenseModal'
import CategoryCard from '@/components/CategoryCard'
import TransactionList from '@/components/TransactionList'

export default async function Dashboard() {
  const supabase = await createClient()

  // 1. Check if user is logged in
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // 2. Fetch Categories
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', user.id)
    .order('id', { ascending: true })

  // 3. Fetch ALL Expenses for this month (for correct totals & client-side pagination)
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()

  const { data: expenses } = await supabase
    .from('expenses')
    .select('*')
    .eq('user_id', user.id)
    .gte('date', startOfMonth)
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

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* HEADER */}
      <header className="flex items-center justify-between p-6 bg-card shadow-sm sticky top-0 z-10">
        <div>
          <h1 className="text-xl font-bold text-primary">SpendTrace</h1>
          <p className="text-xs text-muted-foreground">December 2025</p>
        </div>
        <form action="/auth/signout" method="post">
          <Button variant="ghost" size="icon">
            <LogOut className="h-5 w-5 text-muted-foreground" />
          </Button>
        </form>
      </header>

      <main className="p-6 space-y-6">

        {/* HERO CARD: Total Spent */}
        <Card className="bg-primary text-primary-foreground border-none shadow-xl">
          <CardContent>
            <div className="flex justify-between items-start mb-2">
              <span className="text-primary-foreground/80 text-sm font-medium">Total Spent</span>
              <Wallet className="h-5 w-5 opacity-80" />
            </div>
            <div className="text-4xl font-bold mb-4">
              ${totalSpent.toFixed(2)}
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs opacity-90">
                <span>{progressPercentage.toFixed(0)}% of Budget</span>
                <span>${monthlyBudget.toFixed(2)} Limit</span>
              </div>
              <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CATEGORIES / BUDGETS LIST */}
        <div>
          <h2 className="text-lg font-semibold mb-3 text-foreground">Budgets</h2>

          {categories && categories.length > 0 ? (
            <div className="space-y-3">
              {categories.map((cat) => {
                const spent = spendByCategory[cat.id] || 0
                return (
                  <CategoryCard
                    key={cat.id}
                    category={cat}
                    spent={spent}
                  />
                )
              })}
            </div>
          ) : (
            // EMPTY STATE
            <Card className="border-dashed border-2 shadow-none">
              <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                <div className="h-12 w-12 bg-secondary rounded-full flex items-center justify-center mb-4">
                  <Wallet className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">No Budgets Yet</h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-[200px]">
                  Create your first category to start tracking your student life expenses.
                </p>
                <form action={seedCategories}>
                  <Button variant="outline" type="submit">Create Default Categories</Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>

        {/* RECENT TRANSACTIONS */}
        <div className="pb-20">
          <h2 className="text-lg font-semibold mb-3 text-foreground">Recent Transactions</h2>
          <TransactionList
            expenses={expenses || []}
            categories={categories || []}
          />
        </div>
      </main>

      {/* MODAL */}
      <AddExpenseModal categories={categories || []} />
    </div>
  )
}