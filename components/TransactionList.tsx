'use client'

import { useState, useMemo } from 'react'
import TransactionItem from '@/components/TransactionItem'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from '@/components/ui/dialog'
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination'
import { ArrowUpDown, Filter, SlidersHorizontal, X } from 'lucide-react'

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

type SortField = 'date' | 'amount'
type SortDir = 'asc' | 'desc'

// ─────────────────────────────────────────────
// Shared control blocks (rendered in both desktop toolbar and mobile dialog)
// ─────────────────────────────────────────────
function FilterControls({
    categories,
    filterCategory,
    setFilterCategory,
    filterDateFrom,
    setFilterDateFrom,
    filterDateTo,
    setFilterDateTo,
    onReset,
}: {
    categories: Category[]
    filterCategory: string
    setFilterCategory: (v: string) => void
    filterDateFrom: string
    setFilterDateFrom: (v: string) => void
    filterDateTo: string
    setFilterDateTo: (v: string) => void
    onReset?: () => void
}) {
    return (
        <>
            {/* Category */}
            <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger id="filter-category" className="h-8 text-xs w-40 gap-1 shrink-0">
                    <Filter className="h-3 w-3 text-muted-foreground shrink-0" />
                    <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {categories.map(cat => (
                        <SelectItem key={cat.id} value={String(cat.id)}>
                            {cat.icon ?? '📂'} {cat.name}
                        </SelectItem>
                    ))}
                    <SelectItem value="uncategorized">❓ Uncategorized</SelectItem>
                </SelectContent>
            </Select>

            {/* Date From */}
            <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-xs text-muted-foreground">From</span>
                <Input
                    id="filter-date-from"
                    type="date"
                    value={filterDateFrom}
                    onChange={e => setFilterDateFrom(e.target.value)}
                    className="h-8 text-xs w-36"
                />
            </div>

            {/* Date To */}
            <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-xs text-muted-foreground">To</span>
                <Input
                    id="filter-date-to"
                    type="date"
                    value={filterDateTo}
                    onChange={e => setFilterDateTo(e.target.value)}
                    className="h-8 text-xs w-36"
                />
            </div>

            {/* Clear button (desktop inline) */}
            {onReset && (filterCategory !== 'all' || filterDateFrom || filterDateTo) && (
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-xs text-muted-foreground hover:text-destructive gap-1 shrink-0"
                    onClick={onReset}
                >
                    <X className="h-3 w-3" />
                    Clear
                </Button>
            )}
        </>
    )
}

function SortControls({
    sortField,
    sortDir,
    onToggle,
}: {
    sortField: SortField
    sortDir: SortDir
    onToggle: (field: SortField) => void
}) {
    return (
        <>
            <span className="text-xs text-muted-foreground shrink-0">Sort:</span>
            <Button
                id="sort-by-date"
                variant={sortField === 'date' ? 'secondary' : 'ghost'}
                size="sm"
                className="h-8 px-3 text-xs gap-1 shrink-0"
                onClick={() => onToggle('date')}
            >
                <ArrowUpDown className="h-3 w-3" />
                Date
                {sortField === 'date' && (
                    <span className="text-muted-foreground">{sortDir === 'desc' ? '↓' : '↑'}</span>
                )}
            </Button>
            <Button
                id="sort-by-amount"
                variant={sortField === 'amount' ? 'secondary' : 'ghost'}
                size="sm"
                className="h-8 px-3 text-xs gap-1 shrink-0"
                onClick={() => onToggle('amount')}
            >
                <ArrowUpDown className="h-3 w-3" />
                Amount
                {sortField === 'amount' && (
                    <span className="text-muted-foreground">{sortDir === 'desc' ? '↓' : '↑'}</span>
                )}
            </Button>
        </>
    )
}

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────
export default function TransactionList({
    expenses,
    categories,
    currency = '$',
}: {
    expenses: Expense[]
    categories: Category[]
    currency?: string
}) {
    const ITEMS_PER_PAGE = 10

    // Filter & Sort state
    const [filterCategory, setFilterCategory] = useState<string>('all')
    const [filterDateFrom, setFilterDateFrom] = useState<string>('')
    const [filterDateTo, setFilterDateTo] = useState<string>('')
    const [sortField, setSortField] = useState<SortField>('date')
    const [sortDir, setSortDir] = useState<SortDir>('desc')
    const [currentPage, setCurrentPage] = useState(1)
    const [mobileOpen, setMobileOpen] = useState(false)

    const hasActiveFilters = filterCategory !== 'all' || filterDateFrom !== '' || filterDateTo !== ''
    const hasNonDefaultSort = sortField !== 'date' || sortDir !== 'desc'
    const hasAnyActive = hasActiveFilters || hasNonDefaultSort

    function clearFilters() {
        setFilterCategory('all')
        setFilterDateFrom('')
        setFilterDateTo('')
        setCurrentPage(1)
    }

    function toggleSort(field: SortField) {
        if (sortField === field) {
            setSortDir(d => (d === 'desc' ? 'asc' : 'desc'))
        } else {
            setSortField(field)
            setSortDir('desc')
        }
        setCurrentPage(1)
    }

    // Reset page whenever a filter/sort control changes
    function withPageReset<T>(setter: (v: T) => void) {
        return (v: T) => { setter(v); setCurrentPage(1) }
    }

    // Derived: filtered + sorted list
    const processed = useMemo(() => {
        let list = [...expenses]

        if (filterCategory !== 'all') {
            if (filterCategory === 'uncategorized') {
                list = list.filter(e => !e.category_id)
            } else {
                const catId = Number(filterCategory)
                list = list.filter(e => e.category_id === catId)
            }
        }
        if (filterDateFrom) list = list.filter(e => e.date >= filterDateFrom)
        if (filterDateTo)   list = list.filter(e => e.date <= filterDateTo)

        list.sort((a, b) => {
            const cmp = sortField === 'date'
                ? a.date.localeCompare(b.date)
                : Number(a.amount) - Number(b.amount)
            return sortDir === 'asc' ? cmp : -cmp
        })

        return list
    }, [expenses, filterCategory, filterDateFrom, filterDateTo, sortField, sortDir])

    // Pagination
    const totalPages = Math.ceil(processed.length / ITEMS_PER_PAGE)
    const safePage = currentPage > totalPages && totalPages > 0 ? totalPages : currentPage
    const currentTransactions = processed.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE)

    return (
        <div className="space-y-3">

            {/* ── DESKTOP TOOLBAR (single row, hidden on mobile) ── */}
            <div className="hidden md:flex items-center gap-2 flex-wrap">
                {/* Filters */}
                <span className="text-xs text-muted-foreground shrink-0">Filter:</span>
                <FilterControls
                    categories={categories}
                    filterCategory={filterCategory}
                    setFilterCategory={withPageReset(setFilterCategory)}
                    filterDateFrom={filterDateFrom}
                    setFilterDateFrom={withPageReset(setFilterDateFrom)}
                    filterDateTo={filterDateTo}
                    setFilterDateTo={withPageReset(setFilterDateTo)}
                    onReset={clearFilters}
                />

                {/* Divider */}
                <div className="h-5 w-px bg-border mx-1 shrink-0" />

                {/* Sort */}
                <SortControls sortField={sortField} sortDir={sortDir} onToggle={toggleSort} />

                {/* Result count */}
                <span className="ml-auto text-xs text-muted-foreground shrink-0">
                    {processed.length} transaction{processed.length !== 1 ? 's' : ''}
                </span>
            </div>

            {/* ── MOBILE TOOLBAR (single trigger row, visible only on mobile) ── */}
            <div className="flex md:hidden items-center justify-between">
                {/* Result count */}
                <span className="text-xs text-muted-foreground">
                    {processed.length} transaction{processed.length !== 1 ? 's' : ''}
                </span>

                {/* Filter & Sort trigger */}
                <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
                    <DialogTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-3 text-xs gap-1.5 relative"
                        >
                            <SlidersHorizontal className="h-3.5 w-3.5" />
                            Filter &amp; Sort
                            {/* Active indicator dot */}
                            {hasAnyActive && (
                                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary" />
                            )}
                        </Button>
                    </DialogTrigger>

                    <DialogContent className="sm:max-w-sm" aria-describedby={undefined}>
                        <DialogHeader>
                            <DialogTitle className="text-base">Filter &amp; Sort</DialogTitle>
                        </DialogHeader>

                        <div className="flex flex-col gap-5 pt-1">
                            {/* ── Filter section ── */}
                            <div className="flex flex-col gap-3">
                                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Filter
                                </span>

                                {/* Category */}
                                <div className="flex flex-col gap-1.5">
                                    <span className="text-xs text-muted-foreground">Category</span>
                                    <Select
                                        value={filterCategory}
                                        onValueChange={withPageReset(setFilterCategory)}
                                    >
                                        <SelectTrigger id="mobile-filter-category" className="h-9 text-sm">
                                            <SelectValue placeholder="All categories" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All categories</SelectItem>
                                            {categories.map(cat => (
                                                <SelectItem key={cat.id} value={String(cat.id)}>
                                                    {cat.icon ?? '📂'} {cat.name}
                                                </SelectItem>
                                            ))}
                                            <SelectItem value="uncategorized">❓ Uncategorized</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Date From */}
                                <div className="flex flex-col gap-1.5">
                                    <span className="text-xs text-muted-foreground">From date</span>
                                    <Input
                                        id="mobile-filter-date-from"
                                        type="date"
                                        value={filterDateFrom}
                                        onChange={e => { setFilterDateFrom(e.target.value); setCurrentPage(1) }}
                                        className="h-9 text-sm"
                                    />
                                </div>

                                {/* Date To */}
                                <div className="flex flex-col gap-1.5">
                                    <span className="text-xs text-muted-foreground">To date</span>
                                    <Input
                                        id="mobile-filter-date-to"
                                        type="date"
                                        value={filterDateTo}
                                        onChange={e => { setFilterDateTo(e.target.value); setCurrentPage(1) }}
                                        className="h-9 text-sm"
                                    />
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="h-px bg-border" />

                            {/* ── Sort section ── */}
                            <div className="flex flex-col gap-3">
                                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Sort by
                                </span>
                                <div className="grid grid-cols-2 gap-2">
                                    <Button
                                        variant={sortField === 'date' ? 'secondary' : 'outline'}
                                        size="sm"
                                        className="gap-1.5 text-sm"
                                        onClick={() => toggleSort('date')}
                                    >
                                        <ArrowUpDown className="h-3.5 w-3.5" />
                                        Date
                                        {sortField === 'date' && (
                                            <span>{sortDir === 'desc' ? '↓' : '↑'}</span>
                                        )}
                                    </Button>
                                    <Button
                                        variant={sortField === 'amount' ? 'secondary' : 'outline'}
                                        size="sm"
                                        className="gap-1.5 text-sm"
                                        onClick={() => toggleSort('amount')}
                                    >
                                        <ArrowUpDown className="h-3.5 w-3.5" />
                                        Amount
                                        {sortField === 'amount' && (
                                            <span>{sortDir === 'desc' ? '↓' : '↑'}</span>
                                        )}
                                    </Button>
                                </div>
                            </div>

                            {/* ── Footer actions ── */}
                            <div className="flex gap-2 pt-1">
                                {hasActiveFilters && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="flex-1 gap-1 text-muted-foreground hover:text-destructive"
                                        onClick={clearFilters}
                                    >
                                        <X className="h-3.5 w-3.5" />
                                        Clear filters
                                    </Button>
                                )}
                                <DialogClose asChild>
                                    <Button size="sm" className="flex-1">
                                        Done
                                    </Button>
                                </DialogClose>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* ── TRANSACTION LIST ── */}
            {currentTransactions.length > 0 ? (
                <div className="space-y-2">
                    {currentTransactions.map(expense => {
                        const cat = categories.find(c => c.id === expense.category_id)
                        return (
                            <TransactionItem
                                key={expense.id}
                                expense={expense}
                                category={cat}
                                allCategories={categories}
                                currency={currency}
                            />
                        )
                    })}
                </div>
            ) : (
                <p className="text-sm text-muted-foreground text-center py-6">
                    {hasActiveFilters ? 'No transactions match your filters.' : 'No recent transactions.'}
                </p>
            )}

            {/* ── PAGINATION ── */}
            {totalPages > 1 && (
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                href="#"
                                onClick={e => { e.preventDefault(); if (safePage > 1) setCurrentPage(safePage - 1) }}
                                className={safePage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                            />
                        </PaginationItem>
                        <PaginationItem>
                            <span className="text-sm text-muted-foreground px-2">
                                Page {safePage} of {totalPages}
                            </span>
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationNext
                                href="#"
                                onClick={e => { e.preventDefault(); if (safePage < totalPages) setCurrentPage(safePage + 1) }}
                                className={safePage >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            )}
        </div>
    )
}
