import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Plus, LogOut, Wallet } from 'lucide-react'
import { Button } from "@/components/ui/button"

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

  // 3. Fetch Expenses for this month
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
  
  const { data: expenses } = await supabase
    .from('expenses')
    .select('*')
    .eq('user_id', user.id)
    .gte('date', startOfMonth)
    .order('date', { ascending: false })

  // 4. Calculate Totals
  const totalSpent = expenses?.reduce((sum, item) => sum + Number(item.amount), 0) || 0
  const monthlyBudget = categories?.reduce((sum, item) => sum + Number(item.monthly_budget), 0) || 0 // Simple sum of all category budgets
  
  // Calculate progress (Avoid division by zero)
  const progressPercentage = monthlyBudget > 0 ? (totalSpent / monthlyBudget) * 100 : 0

  return (
    <div className="min-h-screen bg-background pb-20">
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
              {/* Custom White Progress Bar for Contrast */}
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
              {categories.map((cat) => (
                <Card key={cat.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{cat.icon || '📂'}</span>
                        <span className="font-medium">{cat.name}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        ${cat.monthly_budget}
                      </span>
                    </div>
                    {/* Placeholder for individual category progress - we will add this logic later */}
                    <Progress value={0} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1 text-right">
                      $0.00 spent
                    </p>
                  </CardContent>
                </Card>
              ))}
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
                  Create your first category to start tracking your expenses.
                </p>
                <Button variant="outline">Create Default Categories</Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* RECENT TRANSACTIONS */}
        <div>
          <h2 className="text-lg font-semibold mb-3 text-foreground">Recent</h2>
           {expenses && expenses.length > 0 ? (
             <div className="space-y-2">
               {expenses.map((expense) => (
                 <div key={expense.id} className="flex items-center justify-between p-3 bg-card rounded-lg border">
                   <div className="flex flex-col">
                     <span className="font-medium">{expense.description}</span>
                     <span className="text-xs text-muted-foreground">{expense.date}</span>
                   </div>
                   <span className="font-bold text-foreground">-${expense.amount}</span>
                 </div>
               ))}
             </div>
           ) : (
             <p className="text-sm text-muted-foreground text-center py-4">No recent transactions.</p>
           )}
        </div>
      </main>

      {/* FLOATING ACTION BUTTON (Mobile Style) */}
      <div className="fixed bottom-6 right-6">
        <Button className="h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90">
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </div>
  )
}
