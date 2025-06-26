"use client"

import { useEffect, useState } from "react"
import type { Theme } from "@/lib/themes"

interface CircularVisualizerProps {
    theme: Theme
    isPlaying: boolean
}

export function CircularVisualizer({ theme, isPlaying }: CircularVisualizerProps) {
    const [rotation, setRotation] = useState(0)
    const [pulseScale, setPulseScale] = useState(1)

    useEffect(() => {
        if (!isPlaying) {
            setRotation(0)
            setPulseScale(1)
            return
        }

        const rotationInterval = setInterval(() => {
            setRotation((prev) => (prev + 2) % 360)
        }, 50)

        const pulseInterval = setInterval(() => {
            setPulseScale(0.8 + Math.random() * 0.4)
        }, 200)

        return () => {
            clearInterval(rotationInterval)
            clearInterval(pulseInterval)
        }
    }, [isPlaying])

    return (
        <div className="relative w-64 h-64 mx-auto">
            <div
                className="absolute inset-0 rounded-full border-4 transition-all duration-200"
                style={{
                    borderColor: theme.colors.primary,
                    transform: `rotate(${rotation}deg) scale(${pulseScale})`,
                    boxShadow: `0 0 30px ${theme.colors.primary}60`,
                }}
            />
            <div
                className="absolute inset-4 rounded-full border-2 transition-all duration-300"
                style={{
                    borderColor: theme.colors.secondary,
                    transform: `rotate(${-rotation * 1.5}deg) scale(${1.1 - pulseScale * 0.1})`,
                    boxShadow: `0 0 20px ${theme.colors.secondary}40`,
                }}
            />
            <div
                className="absolute inset-8 rounded-full border transition-all duration-150"
                style={{
                    borderColor: theme.colors.accent,
                    transform: `rotate(${rotation * 2}deg) scale(${pulseScale * 0.9})`,
                    boxShadow: `0 0 15px ${theme.colors.accent}30`,
                }}
            />
            <div
                className="absolute inset-0 rounded-full flex items-center justify-center text-4xl font-bold transition-all duration-200"
                style={{
                    color: theme.colors.text,
                    transform: `scale(${pulseScale})`,
                    textShadow: `0 0 10px ${theme.colors.primary}80`,
                }}
            >
                ♪
            </div>
        </div>
    )
}
