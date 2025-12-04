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