"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { type Theme, themes } from "@/lib/themes"
import { Palette } from "lucide-react"

interface ThemeSelectorProps {
    currentTheme: Theme
    onThemeChange: (theme: Theme) => void
}

export function ThemeSelector({ currentTheme, onThemeChange }: ThemeSelectorProps) {
    return (
        <Card className="w-full" style={{ backgroundColor: currentTheme.colors.surface }}>
            <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4">
                    <Palette className="w-5 h-5" style={{ color: currentTheme.colors.text }} />
                    <h3 className="font-semibold" style={{ color: currentTheme.colors.text }}>
                        Choose Your Mood
                    </h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {themes.map((theme) => (
                        <Button
                            key={theme.name}
                            variant={currentTheme.name === theme.name ? "default" : "outline"}
                            className="flex flex-col h-auto p-3 transition-all duration-200"
                            onClick={() => onThemeChange(theme)}
                            style={{
                                backgroundColor: currentTheme.name === theme.name ? theme.colors.primary : "transparent",
                                borderColor: theme.colors.primary,
                                color: currentTheme.name === theme.name ? "#ffffff" : currentTheme.colors.text,
                            }}
                        >
                            <div className="flex gap-1 mb-2">
                                {theme.colors.visualizer.slice(0, 3).map((color, index) => (
                                    <div key={index} className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                                ))}
                            </div>
                            <span className="text-xs font-medium">{theme.name}</span>
                            <span className="text-xs opacity-70">{theme.mood}</span>
                        </Button>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
