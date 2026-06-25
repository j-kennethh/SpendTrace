import { User } from '@supabase/supabase-js'
import { Button, buttonVariants } from '@/components/ui/button'
import SettingsModal from '@/components/SettingsModal'
import { LogOut } from 'lucide-react'
import MonthPicker from '@/components/MonthPicker'
import Link from 'next/link'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface HeaderProps {
    user: User
    currency?: string
    currentMonth: Date
    activeTab?: 'dashboard' | 'analytics'
}

export default function Header({ 
    user, 
    currency = '$', 
    currentMonth,
    activeTab = 'dashboard'
}: HeaderProps) {
    const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
    const dateParam = format(currentMonth, 'yyyy-MM')
    const dashboardHref = `/?date=${dateParam}`
    const analyticsHref = `/analytics?date=${dateParam}`

    return (
        <header className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-card shadow-sm sticky top-0 z-10 transition-colors">
            <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                <div>
                    <h1 className="text-xl font-bold text-primary tracking-tight">SpendTrace</h1>
                    <div className="mt-1">
                        <MonthPicker currentMonth={currentMonth} />
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="flex items-center gap-1 bg-muted p-1 rounded-lg text-sm font-medium">
                <Link 
                    href={dashboardHref}
                    className={cn(
                        buttonVariants({ 
                            variant: activeTab === 'dashboard' ? 'secondary' : 'ghost', 
                            size: 'sm' 
                        }),
                        `h-8 px-4 font-semibold rounded-md transition-all no-underline ${
                            activeTab === 'dashboard' 
                            ? 'bg-background shadow-sm hover:bg-background text-foreground' 
                            : 'text-muted-foreground hover:text-foreground'
                        }`
                    )}
                >
                    Dashboard
                </Link>
                <Link 
                    href={analyticsHref}
                    className={cn(
                        buttonVariants({ 
                            variant: activeTab === 'analytics' ? 'secondary' : 'ghost', 
                            size: 'sm' 
                        }),
                        `h-8 px-4 font-semibold rounded-md transition-all no-underline ${
                            activeTab === 'analytics' 
                            ? 'bg-background shadow-sm hover:bg-background text-foreground' 
                            : 'text-muted-foreground hover:text-foreground'
                        }`
                    )}
                >
                    Analytics
                </Link>
            </nav>

            <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                <div className="flex items-center gap-3 text-sm font-medium ml-auto sm:ml-0">
                    <span className="text-foreground">{name}</span>
                </div>
                <div className="flex items-center gap-1 pl-2 border-l border-border/50">
                    <SettingsModal initialName={name} initialCurrency={currency} />
                    <form action="/auth/signout" method="post">
                        <Button variant="ghost" size="icon" className="hover:bg-destructive/10 hover:text-destructive transition-colors" title="Sign out">
                            <LogOut className="h-5 w-5" />
                        </Button>
                    </form>
                </div>
            </div>
        </header>
    )
}

