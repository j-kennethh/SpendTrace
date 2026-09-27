import { createClient } from './server'

// ---------------------------------------------------------------------------
// Simple query helpers — each creates a fresh server client (cookie-based auth)
// and runs the Supabase query. Called via Promise.all in page server components
// for parallel fetching.
// ---------------------------------------------------------------------------

export async function getCategories(userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', userId)
    .order('sort_order', { ascending: true })
    .order('id', { ascending: true })
  return data ?? []
}

export async function getMonthExpenses(
  userId: string,
  startOfMonth: string,
  startOfNextMonth: string
) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('expenses')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startOfMonth)
    .lt('date', startOfNextMonth)
    .order('date', { ascending: false })
    .order('id', { ascending: false })
  return data ?? []
}

export async function getRangeExpenses(
  userId: string,
  startDate: string,
  endDate: string
) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('expenses')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate)
    .lt('date', endDate)
    .order('date', { ascending: true })
  return data ?? []
}
