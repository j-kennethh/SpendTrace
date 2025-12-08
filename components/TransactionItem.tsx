'use client'

import { useState } from 'react'
import { MoreHorizontal, Pencil, Trash2, Loader2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { deleteExpense, updateExpense } from '@/app/actions'

type Category = {
  id: number
  name: string
  icon: string | null
}

type Expense = {
  id: number
  amount: number
  description: string | null
  date: string
  category_id: number | null
}

export default function TransactionItem({
  expense,
  category,
  allCategories
}: {
  expense: Expense,
  category?: Category,
  allCategories: Category[]
}) {
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Handle Delete
  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this expense?')) {
      await deleteExpense(expense.id)
    }
  }

  // Handle Update
  const handleUpdate = async (formData: FormData) => {
    setIsLoading(true)
    await updateExpense(formData)
    setIsLoading(false)
    setIsEditOpen(false)
  }

  return (
    <>
      <div className="flex items-center justify-between p-4 bg-card rounded-xl border shadow-sm group">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-secondary/30 flex items-center justify-center text-lg">
            {category?.icon || '💸'}
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-sm">{expense.description}</span>
            <span className="text-xs text-muted-foreground">{new Date(expense.date).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-bold text-foreground">-${Number(expense.amount).toFixed(2)}</span>

          {/* Dropdown Menu for Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Edit Dialog - Reusing the form structure */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
          </DialogHeader>
          <form action={handleUpdate} className="grid gap-4 py-4">
            <input type="hidden" name="id" value={expense.id} />

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                name="description"
                defaultValue={expense.description || ''}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="amount">Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1.5 text-muted-foreground">$</span>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  defaultValue={expense.amount}
                  className="pl-7"
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select name="category" defaultValue={expense.category_id?.toString()}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {allCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      <span className="mr-2">{cat.icon}</span>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                name="date"
                type="date"
                required
                defaultValue={expense.date}
              />
            </div>

            <DialogFooter>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? <Loader2 className="animate-spin mr-2" /> : null}
                Update Expense
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}