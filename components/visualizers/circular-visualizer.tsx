"use client"

import { useEffect, useState } from "react"
import type { Theme } from "@/lib/themes"

interface CircularVisualizerProps {
    theme: Theme
    audioData: number[]
    isPlaying: boolean
    sensitivity: number
    isBeat: boolean
}

export function CircularVisualizer({ theme, audioData, isPlaying, sensitivity, isBeat }: CircularVisualizerProps) {
    const [rotation, setRotation] = useState(0)

    useEffect(() => {
        if (!isPlaying) return

        const interval = setInterval(() => {
            setRotation((prev) => (prev + (isBeat ? 4 : 2)) % 360)
        }, 50)

        return () => clearInterval(interval)
    }, [isPlaying, isBeat])

    const averageAmplitude =
        audioData.length > 0
            ? (audioData.reduce((sum, val) => sum + val, 0) / audioData.length / 255) * (sensitivity / 100)
            : 0

    const pulseScale = isPlaying ? 0.8 + averageAmplitude * 0.6 : 1
    const beatScale = isBeat ? 1.2 : 1

    return (
        <div className="relative w-64 h-64 mx-auto">
            <div
                className="absolute inset-0 rounded-full border-4 transition-all duration-100"
                style={{
                    borderColor: theme.colors.primary,
                    transform: `rotate(${rotation}deg) scale(${pulseScale * beatScale})`,
                    boxShadow: `0 0 ${20 + averageAmplitude * 30}px ${theme.colors.primary}60`,
                }}
            />
            <div
                className="absolute inset-4 rounded-full border-2 transition-all duration-150"
                style={{
                    borderColor: theme.colors.secondary,
                    transform: `rotate(${-rotation * 1.5}deg) scale(${(1.1 - averageAmplitude * 0.2) * beatScale})`,
                    boxShadow: `0 0 ${15 + averageAmplitude * 20}px ${theme.colors.secondary}40`,
                }}
            />
            <div
                className="absolute inset-8 rounded-full border transition-all duration-100"
                style={{
                    borderColor: theme.colors.accent,
                    transform: `rotate(${rotation * 2}deg) scale(${pulseScale * 0.9 * beatScale})`,
                    boxShadow: `0 0 ${10 + averageAmplitude * 15}px ${theme.colors.accent}30`,
                }}
            />
            <div
                className="absolute inset-0 rounded-full flex items-center justify-center text-4xl font-bold transition-all duration-100"
                style={{
                    color: theme.colors.text,
                    transform: `scale(${pulseScale * beatScale})`,
                    textShadow: `0 0 ${10 + averageAmplitude * 15}px ${theme.colors.primary}80`,
                }}
            >
                ♪
            </div>
        </div>
    )
}
