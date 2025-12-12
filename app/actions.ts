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
    { user_id: user.id, name: 'Food', icon: '🍴', monthly_budget: 300, sort_order: 0 },
    { user_id: user.id, name: 'Transport', icon: '🚌', monthly_budget: 100, sort_order: 1 },
    { user_id: user.id, name: 'Leisure', icon: '🎉', monthly_budget: 200, sort_order: 2 },
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

export async function updateCategory(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const id = formData.get('id')
  const name = formData.get('name')
  const icon = formData.get('icon')
  const monthly_budget = formData.get('monthly_budget')

  const { error } = await supabase
    .from('categories')
    .update({
      name,
      icon,
      monthly_budget
    })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error updating category:', error)
    return
  }

  revalidatePath('/')
}

export async function createCategory(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const name = formData.get('name')
  const icon = formData.get('icon')
  const monthly_budget = formData.get('monthly_budget')

  // Get max sort_order
  const { data: maxOrderData } = await supabase
    .from('categories')
    .select('sort_order')
    .eq('user_id', user.id)
    .order('sort_order', { ascending: false })
    .limit(1)
    .single()

  const nextOrder = (maxOrderData?.sort_order ?? -1) + 1

  const { error } = await supabase.from('categories').insert({
    user_id: user.id,
    name,
    icon,
    monthly_budget,
    sort_order: nextOrder
  })

  if (error) {
    console.error('Error creating category:', error)
    return
  }

  revalidatePath('/')
}

export async function deleteCategory(id: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'User not authenticated' }

  // 1. Delete associated expenses first to avoid FK constraint errors
  const { error: expenseError } = await supabase
    .from('expenses')
    .delete()
    .eq('category_id', id)
    .eq('user_id', user.id)

  if (expenseError) {
    console.error('Error deleting associated expenses:', expenseError)
    return { error: `Error deleting expenses: ${expenseError.message}` }
  }

  // 2. Delete the category
  const { error, count } = await supabase
    .from('categories')
    .delete({ count: 'exact' })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error deleting category:', error)
    return { error: `Error deleting category: ${error.message}` }
  }

  if (count === 0) {
    return { error: 'Category not found or access denied' }
  }

  revalidatePath('/')
  return { error: null }
}

export async function updateCategoryOrder(orderedIds: number[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // Update loop
  const updates = orderedIds.map((id, index) =>
    supabase
      .from('categories')
      .update({ sort_order: index })
      .eq('id', id)
      .eq('user_id', user.id)
  )

  await Promise.all(updates)
  revalidatePath('/')
}

export async function updateUserName(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const name = formData.get('name') as string

  const { error } = await supabase.auth.updateUser({
    data: { full_name: name }
  })

  if (error) {
    console.error('Error updating user name:', error)
    return { error: error.message }
  }

  revalidatePath('/')
  return { error: null }
}