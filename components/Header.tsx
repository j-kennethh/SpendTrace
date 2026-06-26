'use client'

import { useState } from 'react'
import { User } from '@supabase/supabase-js'
import { Button, buttonVariants } from '@/components/ui/button'
import SettingsModal from '@/components/SettingsModal'
import { LogOut, Menu, X } from 'lucide-react'
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
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    
    const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
    const dateParam = format(currentMonth, 'yyyy-MM')
    const dashboardHref = `/?date=${dateParam}`
    const analyticsHref = `/analytics?date=${dateParam}`

    return (
        <header className="flex items-center justify-between md:grid md:grid-cols-3 gap-4 p-6 bg-card shadow-sm sticky top-0 z-10 transition-colors">
            {/* Left Section (Always Visible) */}
            <div className="flex items-center gap-4">
                <div>
                    <h1 className="text-xl font-bold text-primary tracking-tight">SpendTrace</h1>
                    <div className="mt-1">
                        <MonthPicker currentMonth={currentMonth} />
                    </div>
                </div>
            </div>

            {/* Desktop Navigation Tabs (Hidden on mobile) */}
            <nav className="hidden md:flex justify-self-center items-center gap-1 bg-muted p-1 rounded-lg text-sm font-medium">
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

            {/* Right Section: Desktop User controls & Mobile Menu trigger */}
            <div className="flex items-center justify-end md:justify-self-end gap-4">
                {/* Desktop User Section (Hidden on mobile) */}
                <div className="hidden md:flex items-center gap-4">
                    <div className="flex items-center gap-3 text-sm font-medium">
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

                {/* Mobile Menu Button (Visible on mobile) */}
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="md:hidden hover:bg-muted/50 rounded-md animate-duration-150" 
                    onClick={() => setIsMobileMenuOpen(true)}
                    title="Open menu"
                >
                    <Menu className="h-6 w-6 text-foreground" />
                </Button>
            </div>

            {/* Mobile Sidebar Navigation Drawer */}
            {/* Backdrop */}
            <div 
                className={cn(
                    "fixed inset-0 bg-black/40 backdrop-blur-xs z-50 transition-opacity duration-300 md:hidden",
                    isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                )}
                onClick={() => setIsMobileMenuOpen(false)}
            />
            {/* Slide-over panel */}
            <div 
                className={cn(
                    "fixed top-0 right-0 h-full w-64 bg-card border-l border-border/50 shadow-2xl p-6 z-50 flex flex-col gap-5 transform transition-transform duration-300 ease-in-out md:hidden",
                    isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
                )}
            >
                {/* Close Button Header */}
                <div className="flex items-center justify-between border-b border-border/50 pb-3">
                    <span className="font-bold text-lg text-primary tracking-tight truncate mr-2">{name}</span>
                    <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)} title="Close menu" className="rounded-md">
                        <X className="h-5 w-5 text-foreground" />
                    </Button>
                </div>

                {/* Navigation links */}
                <div className="flex flex-col gap-2">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">Navigate</span>
                    <Link 
                        href={dashboardHref}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                            buttonVariants({ 
                                variant: activeTab === 'dashboard' ? 'secondary' : 'ghost', 
                                size: 'default' 
                            }),
                            `justify-start gap-2.5 font-semibold rounded-md transition-all w-full no-underline ${
                                activeTab === 'dashboard' 
                                ? 'bg-muted text-foreground' 
                                : 'text-muted-foreground hover:text-foreground'
                            }`
                        )}
                    >
                        Dashboard
                    </Link>
                    <Link 
                        href={analyticsHref}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                            buttonVariants({ 
                                variant: activeTab === 'analytics' ? 'secondary' : 'ghost', 
                                size: 'default' 
                            }),
                            `justify-start gap-2.5 font-semibold rounded-md transition-all w-full no-underline ${
                                activeTab === 'analytics' 
                                ? 'bg-muted text-foreground' 
                                : 'text-muted-foreground hover:text-foreground'
                            }`
                        )}
                    >
                        Analytics
                    </Link>
                </div>

                <div className="border-t border-border/50" />

                {/* Preferences & Settings */}
                <div className="flex flex-col gap-2">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">Preferences</span>
                    <div onClick={() => setIsMobileMenuOpen(false)}>
                        <SettingsModal initialName={name} initialCurrency={currency} triggerText="Settings" />
                    </div>
                    
                    <form action="/auth/signout" method="post" className="w-full">
                        <Button 
                            variant="ghost" 
                            type="submit"
                            className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 font-semibold rounded-md"
                            title="Sign out"
                        >
                            <LogOut className="h-5 w-5" />
                            Log Out
                        </Button>
                    </form>
                </div>
            </div>
        </header>
    )
}

