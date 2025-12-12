import { User } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import SettingsModal from '@/components/SettingsModal'
import { LogOut } from 'lucide-react'

export default function Header({ user, currency = '$' }: { user: User, currency?: string }) {
    const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'

    return (
        <header className="flex items-center justify-between p-6 bg-card shadow-sm sticky top-0 z-10 transition-colors">
            <div>
                <h1 className="text-xl font-bold text-primary tracking-tight">SpendTrace</h1>
                <p className="text-xs text-muted-foreground font-medium">
                    {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
            </div>
            <div className="flex items-center gap-4">
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
        </header>
    )
}
