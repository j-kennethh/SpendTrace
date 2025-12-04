'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function seedCategories(_formData: FormData) {
  const supabase = await createClient()

  // 1. Get User
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // 2. Define Default Student Categories
  const defaults = [
    { user_id: user.id, name: 'Food', icon: '🍴', monthly_budget: 200 },
    { user_id: user.id, name: 'Transport', icon: '🚌', monthly_budget: 100 },
    { user_id: user.id, name: 'Personal', icon: '🧴', monthly_budget: 50 },
    { user_id: user.id, name: 'School', icon: '📚', monthly_budget: 50 },
    { user_id: user.id, name: 'Leisure', icon: '🎉', monthly_budget: 100 },
  ]

  // 3. Insert into Supabase
  const { error } = await supabase.from('categories').insert(defaults)

  if (error) {
    console.error('Error seeding categories:', error)
    return
  }

  // 4. Refresh the Dashboard immediately to show new data
  revalidatePath('/')
}

export async function addExpense(formData: FormData) {
  const supabase = await createClient()

  // 1. Get User
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // 2. Extract Data from Form
  const amount = formData.get('amount')
  const description = formData.get('description')
  const category_id = formData.get('category')
  const date = formData.get('date')

  // 3. Insert into Supabase
  const { error } = await supabase.from('expenses').insert({
    user_id: user.id,
    amount: amount,
    description: description,
    category_id: category_id,
    date: date
  })

  if (error) {
    console.error('Error adding expense:', error)
    return
  }

  // 4. Refresh Data
  revalidatePath('/')
}

export async function deleteExpense(id: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id) // Security: Ensure user owns the expense

  if (error) {
    console.error('Error deleting expense:', error)
    return
  }

  revalidatePath('/')
}

export async function updateExpense(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const id = formData.get('id')
  const amount = formData.get('amount')
  const description = formData.get('description')
  const category_id = formData.get('category')
  const date = formData.get('date')

  const { error } = await supabase
    .from('expenses')
    .update({
      amount,
      description,
      category_id,
      date
    })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error updating expense:', error)
    return
  }

  revalidatePath('/')
}