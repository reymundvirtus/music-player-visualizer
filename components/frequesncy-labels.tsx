"use client"

import type { Theme } from "@/lib/themes"

interface FrequencyLabelsProps {
    theme: Theme
    show: boolean
}

export function FrequencyLabels({ theme, show }: FrequencyLabelsProps) {
    if (!show) return null

    const labels = [
        { name: "Bass", range: "20-250 Hz", position: "left-4" },
        { name: "Low Mid", range: "250-500 Hz", position: "left-1/4" },
        { name: "Mid", range: "500-2K Hz", position: "left-1/2" },
        { name: "High Mid", range: "2K-4K Hz", position: "right-1/4" },
        { name: "Treble", range: "4K-20K Hz", position: "right-4" },
    ]

    return (
        <div className="absolute inset-x-0 bottom-0 h-16 pointer-events-none">
            {labels.map((label, index) => (
                <div key={index} className={`absolute ${label.position} bottom-2 text-center transform -translate-x-1/2`}>
                    <div
                        className="text-xs font-semibold mb-1"
                        style={{ color: theme.colors.text, textShadow: "0 0 4px rgba(0,0,0,0.8)" }}
                    >
                        {label.name}
                    </div>
                    <div
                        className="text-xs opacity-75"
                        style={{ color: theme.colors.textSecondary, textShadow: "0 0 4px rgba(0,0,0,0.8)" }}
                    >
                        {label.range}
                    </div>
                </div>
            ))}
        </div>
    )
}
