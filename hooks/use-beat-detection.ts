"use client"

import { useRef, useCallback } from "react"

export function useBeatDetection() {
    const beatHistoryRef = useRef<number[]>([])
    const lastBeatTimeRef = useRef<number>(0)
    const energyHistoryRef = useRef<number[]>([])

    const detectBeat = useCallback((audioData: Uint8Array): boolean => {
        if (audioData.length === 0) return false

        const now = Date.now()

        // Calculate current energy (sum of squares of frequency data)
        const currentEnergy = audioData.reduce((sum, value) => sum + value * value, 0) / audioData.length

        // Add to energy history
        energyHistoryRef.current.push(currentEnergy)
        if (energyHistoryRef.current.length > 43) {
            // ~1 second at 43 FPS
            energyHistoryRef.current.shift()
        }

        // Need at least 43 samples for beat detection
        if (energyHistoryRef.current.length < 43) return false

        // Calculate average energy and variance
        const avgEnergy = energyHistoryRef.current.reduce((sum, e) => sum + e, 0) / energyHistoryRef.current.length
        const variance =
            energyHistoryRef.current.reduce((sum, e) => sum + Math.pow(e - avgEnergy, 2), 0) / energyHistoryRef.current.length

        // Beat detection threshold
        const threshold = avgEnergy + Math.sqrt(variance) * 1.5

        // Check if current energy exceeds threshold and enough time has passed since last beat
        const isBeat = currentEnergy > threshold && now - lastBeatTimeRef.current > 300 // Min 300ms between beats

        if (isBeat) {
            lastBeatTimeRef.current = now
            beatHistoryRef.current.push(now)

            // Keep only recent beats (last 10 seconds)
            beatHistoryRef.current = beatHistoryRef.current.filter((time) => now - time < 10000)
        }

        return isBeat
    }, [])

    const getBPM = useCallback((): number => {
        const now = Date.now()
        const recentBeats = beatHistoryRef.current.filter((time) => now - time < 10000)

        if (recentBeats.length < 2) return 0

        const intervals = []
        for (let i = 1; i < recentBeats.length; i++) {
            intervals.push(recentBeats[i] - recentBeats[i - 1])
        }

        const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length
        return Math.round(60000 / avgInterval) // Convert to BPM
    }, [])

    return { detectBeat, getBPM }
}
