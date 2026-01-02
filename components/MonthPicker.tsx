'use client'

import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { format, addMonths, subMonths, setMonth, setYear, startOfMonth } from 'date-fns'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'

export default function MonthPicker({ currentMonth }: { currentMonth: Date }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [date, setDate] = React.useState<Date>(currentMonth)
    const [open, setOpen] = React.useState(false)

    // Sync state with prop if it changes (e.g. navigation)
    React.useEffect(() => {
        setDate(currentMonth)
    }, [currentMonth])

    const handleMonthSelect = (monthIndex: number) => {
        const newDate = setMonth(date, monthIndex)
        setDate(newDate)
        updateUrl(newDate)
        setOpen(false)
    }

    const handleYearChange = (increment: number) => {
        setDate((prev) => setYear(prev, prev.getFullYear() + increment))
    }

    const updateUrl = (newDate: Date) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('date', format(newDate, 'yyyy-MM'))
        router.push(`?${params.toString()}`)
    }

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ]

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant={"ghost"}
                    className={cn(
                        "w-auto justify-start p-0 pl-0 h-auto font-medium text-muted-foreground hover:text-foreground hover:bg-transparent data-[state=open]:text-foreground",
                        !date && "text-muted-foreground"
                    )}
                    style={{ padding: 0 }} // Inline style as a fallback safety
                >
                    {date ? format(date, 'MMMM yyyy') : <span>Pick a month</span>}
                    <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <div className="p-3">
                    <div className="flex items-center justify-between mb-4">
                        <Button variant="outline" size="icon" onClick={() => handleYearChange(-1)}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="font-semibold text-lg">{date.getFullYear()}</div>
                        <Button variant="outline" size="icon" onClick={() => handleYearChange(1)}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {months.map((month, index) => (
                            <Button
                                key={month}
                                variant={date.getMonth() === index ? "default" : "ghost"}
                                className={cn(
                                    "text-sm h-9 w-full",
                                    date.getMonth() === index && "bg-primary text-primary-foreground"
                                )}
                                onClick={() => handleMonthSelect(index)}
                            >
                                {month.slice(0, 3)}
                            </Button>
                        ))}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}
