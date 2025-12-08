'use client'

import { useState } from 'react'
import TransactionItem from '@/components/TransactionItem'
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"

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

export default function TransactionList({
    expenses,
    categories
}: {
    expenses: Expense[],
    categories: Category[]
}) {
    const [currentPage, setCurrentPage] = useState(1)
    const ITEMS_PER_PAGE = 5

    // Calculate pagination
    const totalPages = Math.ceil(expenses.length / ITEMS_PER_PAGE)
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const currentTransactions = expenses.slice(startIndex, startIndex + ITEMS_PER_PAGE)

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
    }

    return (
        <div className="space-y-4">
            {currentTransactions.length > 0 ? (
                <div className="space-y-2">
                    {currentTransactions.map((expense) => {
                        const cat = categories.find(c => c.id === expense.category_id)
                        return (
                            <TransactionItem
                                key={expense.id}
                                expense={expense}
                                category={cat}
                                allCategories={categories}
                            />
                        )
                    })}
                </div>
            ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No recent transactions.</p>
            )}

            {/* PAGINATION */}
            {totalPages > 1 && (
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault()
                                    if (currentPage > 1) handlePageChange(currentPage - 1)
                                }}
                                className={currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                        </PaginationItem>

                        <PaginationItem>
                            <span className="text-sm text-muted-foreground px-2">
                                Page {currentPage} of {totalPages}
                            </span>
                        </PaginationItem>

                        <PaginationItem>
                            <PaginationNext
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault()
                                    if (currentPage < totalPages) handlePageChange(currentPage + 1)
                                }}
                                className={currentPage >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            )}
        </div>
    )
}
