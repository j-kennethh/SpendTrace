'use client'

import { useState, useEffect } from 'react'
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    TouchSensor,
    MouseSensor
} from '@dnd-kit/core'
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import SortableCategoryItem from './SortableCategoryItem'
import { updateCategoryOrder } from '@/app/actions'
import { Wallet, LogOut } from 'lucide-react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import CategoryCard from './CategoryCard'

type Category = {
    id: number
    name: string
    icon: string | null
    monthly_budget: number
}

// Helper to seed categories if needed (imported from actions via a form in parent, 
// but here we just need to render the list or empty state).
// Actually, the parent (Page) handles the empty state logic mostly.
// But we should handle the list rendering.

export default function CategoryList({
    categories: initialCategories,
    spendByCategory,
    children,
    currency = '$'
}: {
    categories: Category[]
    spendByCategory: Record<number, number>
    children?: React.ReactNode // For the empty state or other injected content if needed
    currency?: string
}) {
    const [categories, setCategories] = useState(initialCategories)
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    // Sync with prop updates (e.g. if new category created)
    useEffect(() => {
        setCategories(initialCategories)
    }, [initialCategories])

    const sensors = useSensors(
        useSensor(MouseSensor, {
            activationConstraint: {
                distance: 10,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250,
                tolerance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    async function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event

        if (over && active.id !== over.id) {
            // 1. Calculate new order first (pure calculation)
            const oldIndex = categories.findIndex((item) => item.id === active.id)
            const newIndex = categories.findIndex((item) => item.id === over.id)

            if (oldIndex !== -1 && newIndex !== -1) {
                const newItems = arrayMove(categories, oldIndex, newIndex)

                // 2. Update local state
                setCategories(newItems)

                // 3. Trigger server action (side effect)
                updateCategoryOrder(newItems.map(item => item.id))
            }
        }
    }

    if (!categories || categories.length === 0) {
        return <>{children}</>
    }

    // Prevent hydration mismatch by rendering static list first
    if (!isMounted) {
        return (
            <div className="space-y-3">
                {categories.map((cat) => {
                    const spent = spendByCategory[cat.id] || 0
                    return (
                        <div key={cat.id} className="relative">
                            <CategoryCard
                                category={cat}
                                spent={spent}
                                currency={currency}
                            />
                        </div>
                    )
                })}
            </div>
        )
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            // reset id to avoid collision with other dnd contexts if any, or just stability
            id="category-list-dnd"
        >
            <SortableContext
                items={categories.map(c => c.id)}
                strategy={verticalListSortingStrategy}
            >
                <div className="space-y-3">
                    {categories.map((cat) => {
                        const spent = spendByCategory[cat.id] || 0
                        return (
                            <SortableCategoryItem
                                key={cat.id}
                                category={cat}
                                spent={spent}
                                currency={currency}
                            />
                        )
                    })}
                </div>
            </SortableContext>
        </DndContext>
    )
}
