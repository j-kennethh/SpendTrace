'use client'

import { useState } from 'react'
import { Plus, Loader2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createCategory } from '@/app/actions'

export default function CreateCategoryModal() {
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    async function handleCreate(formData: FormData) {
        setIsLoading(true)
        await createCategory(formData)
        setIsLoading(false)
        setIsOpen(false)
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="gap-1">
                    <Plus className="h-4 w-4" />
                    New Category
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create New Category</DialogTitle>
                </DialogHeader>
                <form action={handleCreate} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="icon">Icon</Label>
                        <Input
                            id="icon"
                            name="icon"
                            placeholder="e.g. 🍔"
                            className="text-2xl h-12 w-16 text-center"
                            maxLength={2}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            name="name"
                            placeholder="e.g. Food"
                            required
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="monthly_budget">Monthly Budget</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1.5 text-muted-foreground">$</span>
                            <Input
                                id="monthly_budget"
                                name="monthly_budget"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                className="pl-7"
                                required
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={isLoading} className="w-full">
                            {isLoading ? <Loader2 className="animate-spin mr-2" /> : null}
                            Create Category
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
