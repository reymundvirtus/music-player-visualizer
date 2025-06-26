"use client"

import { useEffect, useState } from "react"
import type { Theme } from "@/lib/themes"

interface VisualizerBarsProps {
    theme: Theme
    isPlaying: boolean
    barCount?: number
}

export function VisualizerBars({ theme, isPlaying, barCount = 64 }: VisualizerBarsProps) {
    const [heights, setHeights] = useState<number[]>(Array(barCount).fill(0))

    useEffect(() => {
        if (!isPlaying) {
            setHeights(Array(barCount).fill(0))
            return
        }

        const interval = setInterval(() => {
            setHeights((prev) => prev.map(() => Math.random() * 100 + 10))
        }, 100)

        return () => clearInterval(interval)
    }, [isPlaying, barCount])

    return (
        <div className="flex items-end justify-center gap-1 h-64 px-4">
            {heights.map((height, index) => (
                <div
                    key={index}
                    className="transition-all duration-100 ease-out rounded-t-sm"
                    style={{
                        height: `${height}%`,
                        backgroundColor: theme.colors.visualizer[index % theme.colors.visualizer.length],
                        width: `${Math.max(2, 100 / barCount)}%`,
                        boxShadow: `0 0 10px ${theme.colors.visualizer[index % theme.colors.visualizer.length]}40`,
                    }}
                />
            ))}
        </div>
    )
}
