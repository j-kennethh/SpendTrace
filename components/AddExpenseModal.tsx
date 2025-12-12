'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Plus, Loader2 } from 'lucide-react'
import { addExpense } from '@/app/actions'

// Define the shape of a Category
type Category = {
  id: number
  name: string
  icon: string | null
}

export default function AddExpenseModal({ categories, currency = '$' }: { categories: Category[], currency?: string }) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Wrapper to handle closing the modal after submission
  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    await addExpense(formData)
    setIsLoading(false)
    setOpen(false) // Close the modal
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* The Floating Action Button Trigger */}
      <DialogTrigger asChild>
        <div className="fixed bottom-6 right-6">
          <Button className="h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90">
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Expense</DialogTitle>
        </DialogHeader>

        <form action={handleSubmit} className="grid gap-4 py-4">

          {/* Description Input */}
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              name="description"
              placeholder="e.g. Lunch at Canteen"
              required
              autoFocus
            />
          </div>

          {/* Amount Input */}
          <div className="grid gap-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1.5 text-muted-foreground">{currency}</span>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                className="pl-7"
                required
              />
            </div>
          </div>

          {/* Category Select */}
          <div className="grid gap-2">
            <Label htmlFor="category">Category</Label>
            <Select name="category" required>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id.toString()}>
                    <span className="mr-2">{cat.icon}</span>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Picker (Native is best for mobile) */}
          <div className="grid gap-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              name="date"
              type="date"
              required
              defaultValue={new Date().toISOString().split('T')[0]} // Default to today
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? <Loader2 className="animate-spin mr-2" /> : null}
              Save Expense
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}