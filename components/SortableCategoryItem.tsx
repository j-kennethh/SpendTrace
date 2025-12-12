'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import CategoryCard from './CategoryCard'

type Category = {
    id: number
    name: string
    icon: string | null
    monthly_budget: number
}

export default function SortableCategoryItem({
    category,
    spent,
    currency = '$'
}: {
    category: Category
    spent: number
    currency?: string
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: category.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 1 : 0,
        position: 'relative' as const,
    }

    return (
        <div ref={setNodeRef} style={style}>
            <CategoryCard
                category={category}
                spent={spent}
                currency={currency}
                dragProps={{
                    attributes,
                    listeners
                }}
            />
        </div>
    )
}
