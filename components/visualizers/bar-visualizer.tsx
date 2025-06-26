"use client"

import type { Theme } from "@/lib/themes"

interface BarVisualizerProps {
    theme: Theme
    audioData: number[]
    isPlaying: boolean
    sensitivity: number
    isBeat: boolean
}

export function BarVisualizer({ theme, audioData, isPlaying, sensitivity, isBeat }: BarVisualizerProps) {
    const displayData = audioData.length > 0 ? audioData.slice(0, 64) : Array(64).fill(0)

    return (
        <div className="flex items-end justify-center gap-1 h-64 px-4">
            {displayData.map((value, index) => {
                const height = isPlaying ? Math.max((value / 255) * (sensitivity / 100) * 100, 2) : 0
                const glowIntensity = isBeat ? 20 : 10

                return (
                    <div
                        key={index}
                        className="transition-all duration-75 ease-out rounded-t-sm"
                        style={{
                            height: `${height}%`,
                            backgroundColor: theme.colors.visualizer[index % theme.colors.visualizer.length],
                            width: `${Math.max(1, 100 / displayData.length)}%`,
                            boxShadow:
                                height > 10
                                    ? `0 0 ${glowIntensity}px ${theme.colors.visualizer[index % theme.colors.visualizer.length]}60`
                                    : "none",
                            transform: isBeat ? "scaleY(1.1)" : "scaleY(1)",
                        }}
                    />
                )
            })}
        </div>
    )
}
