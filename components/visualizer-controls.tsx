"use client"

import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent } from "@/components/ui/card"
import { Settings } from "lucide-react"
import type { Theme } from "@/lib/themes"

interface VisualizerControlsProps {
    theme: Theme
    sensitivity: number
    onSensitivityChange: (value: number) => void
    showFrequencyLabels: boolean
    onToggleFrequencyLabels: () => void
    beatDetection: boolean
    onToggleBeatDetection: () => void
}

export function VisualizerControls({
    theme,
    sensitivity,
    onSensitivityChange,
    showFrequencyLabels,
    onToggleFrequencyLabels,
    beatDetection,
    onToggleBeatDetection,
}: VisualizerControlsProps) {
    return (
        <Card className="w-full" style={{ backgroundColor: theme.colors.surface }}>
            <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4">
                    <Settings className="w-5 h-5" style={{ color: theme.colors.text }} />
                    <h3 className="font-semibold" style={{ color: theme.colors.text }}>
                        Visualizer Controls
                    </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Sensitivity Control */}
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text }}>
                            Sensitivity: {sensitivity}%
                        </label>
                        <Slider
                            value={[sensitivity]}
                            max={200}
                            min={25}
                            step={5}
                            onValueChange={(value) => onSensitivityChange(value[0])}
                            className="w-full"
                        />
                    </div>

                    {/* Controls */}
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant={showFrequencyLabels ? "default" : "outline"}
                            size="sm"
                            onClick={onToggleFrequencyLabels}
                            style={{
                                backgroundColor: showFrequencyLabels ? theme.colors.primary : "transparent",
                                borderColor: theme.colors.primary,
                                color: showFrequencyLabels ? "#ffffff" : theme.colors.text,
                            }}
                        >
                            Frequency Labels
                        </Button>

                        <Button
                            variant={beatDetection ? "default" : "outline"}
                            size="sm"
                            onClick={onToggleBeatDetection}
                            style={{
                                backgroundColor: beatDetection ? theme.colors.primary : "transparent",
                                borderColor: theme.colors.primary,
                                color: beatDetection ? "#ffffff" : theme.colors.text,
                            }}
                        >
                            Beat Detection
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
