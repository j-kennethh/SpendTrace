'use client'

import { useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Pencil, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateCategoryBudget } from '@/app/actions'

type Category = {
  id: number
  name: string
  icon: string | null
  monthly_budget: number
}

export default function CategoryCard({ 
  category, 
  spent 
}: { 
  category: Category
  spent: number 
}) {
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const budget = Number(category.monthly_budget)
  const percent = budget > 0 ? (spent / budget) * 100 : 0
  const isOverBudget = spent > budget

  async function handleUpdate(formData: FormData) {
    setIsLoading(true)
    await updateCategoryBudget(formData)
    setIsLoading(false)
    setIsEditOpen(false)
  }

  return (
    <>
      <Card className="overflow-hidden shadow-sm group relative">
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-secondary/50 flex items-center justify-center text-xl">
                {category.icon || '📂'}
              </div>
              <div>
                <span className="font-medium block">{category.name}</span>
                <span className="text-xs text-muted-foreground">
                   ${(budget - spent).toFixed(2)} left
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">
                ${spent.toFixed(2)} <span className="text-muted-foreground font-normal">/ ${budget}</span>
              </span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => setIsEditOpen(true)}
              >
                <Pencil className="h-3 w-3 text-muted-foreground" />
              </Button>
            </div>
          </div>
          
          <Progress 
            value={percent} 
            className="h-2" 
            indicatorClassName={isOverBudget ? "bg-destructive" : ""}
          />
        </CardContent>
      </Card>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Budget for {category.name}</DialogTitle>
          </DialogHeader>
          <form action={handleUpdate} className="grid gap-4 py-4">
            <input type="hidden" name="id" value={category.id} />
            
            <div className="grid gap-2">
              <Label htmlFor="monthly_budget">Monthly Budget</Label>
              <div className="relative">
                <span className="absolute left-3 top-1.5 text-muted-foreground">$</span>
                <Input 
                  id="monthly_budget" 
                  name="monthly_budget" 
                  type="number" 
                  step="0.01" 
                  defaultValue={budget}
                  className="pl-7" 
                  required 
                  autoFocus
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? <Loader2 className="animate-spin mr-2" /> : null}
                Save Budget
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
