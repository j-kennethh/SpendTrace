'use client'

import { useState } from 'react'
import { Settings, Moon, Sun, Laptop } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateUserName } from '@/app/actions'

interface SettingsModalProps {
    initialName: string
}

export default function SettingsModal({ initialName }: SettingsModalProps) {
    const [name, setName] = useState(initialName)
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const { setTheme, theme } = useTheme()

    const handleUpdateName = async (e: React.FormEvent) => {
        e.preventDefault()
        if (name === initialName) return

        setIsLoading(true)
        const formData = new FormData()
        formData.append('name', name)

        await updateUserName(formData)
        setIsLoading(false)
        setIsOpen(false)
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-muted/50" title="Settings">
                    <Settings className="h-5 w-5" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Settings</DialogTitle>
                    <DialogDescription>
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    {/* Profile Section */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Profile</h3>
                        <form onSubmit={handleUpdateName} className="grid gap-2">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">
                                    Name
                                </Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="flex justify-end">
                                <Button type="submit" disabled={isLoading || name === initialName} size="sm">
                                    {isLoading ? 'Saving...' : 'Save'}
                                </Button>
                            </div>
                        </form>
                    </div>

                    <div className="border-t" />

                    {/* Appearance Section */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Appearance</h3>
                        <div className="grid grid-cols-3 gap-2">
                            <Button
                                variant={theme === 'light' ? 'default' : 'outline'}
                                className="flex flex-col items-center justify-center h-20 gap-2"
                                onClick={() => setTheme('light')}
                            >
                                <Sun className="h-5 w-5" />
                                <span className="text-xs">Light</span>
                            </Button>
                            <Button
                                variant={theme === 'dark' ? 'default' : 'outline'}
                                className="flex flex-col items-center justify-center h-20 gap-2"
                                onClick={() => setTheme('dark')}
                            >
                                <Moon className="h-5 w-5" />
                                <span className="text-xs">Dark</span>
                            </Button>
                            <Button
                                variant={theme === 'system' ? 'default' : 'outline'}
                                className="flex flex-col items-center justify-center h-20 gap-2"
                                onClick={() => setTheme('system')}
                            >
                                <Laptop className="h-5 w-5" />
                                <span className="text-xs">System</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
