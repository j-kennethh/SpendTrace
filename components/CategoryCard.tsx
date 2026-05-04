
'use client'

import { useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Pencil, Loader2, Trash2, MoreHorizontal, GripVertical } from 'lucide-react'
import { ConfirmModal } from './ConfirmModal'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateCategory, deleteCategory } from '@/app/actions'

type Category = {
  id: number
  name: string
  icon: string | null
  monthly_budget: number
}

export default function CategoryCard({
  category,
  spent,
  dragProps,
  currency = '$'
}: {
  category: Category
  spent: number
  currency?: string
  dragProps?: {
    attributes: any
    listeners: any
  }
}) {
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const budget = Number(category.monthly_budget)
  const percent = budget > 0 ? (spent / budget) * 100 : 0
  const isOverBudget = spent > budget
  const isHighUsage = !isOverBudget && percent >= 80
  const remainingPercent = Math.max(0, 100 - percent)
  const displayValue = isOverBudget ? 100 : remainingPercent

  async function handleUpdate(formData: FormData) {
    setIsLoading(true)
    setError(null)
    await updateCategory(formData)
    setIsLoading(false)
    setIsEditOpen(false)
  }

  async function handleDelete() {
    setIsDeleting(true)
    setError(null)
    const result = await deleteCategory(category.id)
    setIsDeleting(false)
    setIsDeleteOpen(false)

    if (result?.error) {
      alert(result.error) // Fallback as modal might be closed
    }
  }

  return (
    <>
      <Card className="overflow-hidden shadow-sm group relative">
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-3">
              {dragProps && (
                <div
                  {...dragProps.attributes}
                  {...dragProps.listeners}
                  className="cursor-move text-muted-foreground/30 hover:text-muted-foreground transition-colors -ml-1"
                >
                  <GripVertical className="h-5 w-5" />
                </div>
              )}
              <div className="h-10 w-10 rounded-full bg-secondary/50 flex items-center justify-center text-xl">
                {category.icon || '📂'}
              </div>
              <div>
                <span className="font-medium block">{category.name}</span>
                <span className="text-xs text-muted-foreground">
                  {currency}{(budget - spent).toFixed(2)} left
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">
                {currency}{spent.toFixed(2)} <span className="text-muted-foreground font-normal">/ {currency}{budget}</span>
              </span>

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
                  <DropdownMenuItem variant="destructive" onClick={() => setIsDeleteOpen(true)}>
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <Progress
            value={displayValue}
            className={`h-2 ${dragProps ? 'ml-8 w-[calc(100%-2.5rem)]' : ''}`}
            indicatorClassName={isOverBudget ? "bg-destructive" : isHighUsage ? "bg-yellow-500" : ""}
          />
        </CardContent>
      </Card>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Category: {category.name}</DialogTitle>
          </DialogHeader>
          <form action={handleUpdate} className="grid gap-4 py-4">
            <input type="hidden" name="id" value={category.id} />

            {error && (
              <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
                {error}
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="icon">Icon</Label>
              <Input
                id="icon"
                name="icon"
                defaultValue={category.icon || ''}
                placeholder=""
                className="text-2xl h-12 w-16 text-center"
                maxLength={2}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                defaultValue={category.name}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="monthly_budget">Monthly Budget</Label>
              <div className="relative">
                <span className="absolute left-3 top-1.5 text-muted-foreground">{currency}</span>
                <Input
                  id="monthly_budget"
                  name="monthly_budget"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={budget}
                  className="pl-7"
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? <Loader2 className="animate-spin mr-2" /> : null}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Category"
        description="Are you sure you want to delete this category? This will delete all expenses associated with it."
        variant="destructive"
        isLoading={isDeleting}
      />
    </>
  )
}
