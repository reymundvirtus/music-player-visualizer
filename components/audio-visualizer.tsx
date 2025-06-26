"use client"

import { useEffect, useState } from "react"
import type { Theme } from "@/lib/themes"
import { useBeatDetection } from "@/hooks/use-beat-detection"
import { BarVisualizer } from "./visualizers/bar-visualizer"
import { CircularVisualizer } from "./circular-visualizer"
import { FrequencyLabels } from "./frequesncy-labels"

interface AudioVisualizerProps {
  theme: Theme
  isPlaying: boolean
  getAudioData: () => Uint8Array
  type: "bars" | "circular"
  sensitivity: number
  showFrequencyLabels: boolean
  beatDetection: boolean
  bpm: number
}

export function AudioVisualizer({
  theme,
  isPlaying,
  getAudioData,
  type,
  sensitivity,
  showFrequencyLabels,
  beatDetection,
  bpm,
}: AudioVisualizerProps) {
  const [audioData, setAudioData] = useState<number[]>([])
  const [isBeat, setIsBeat] = useState(false)
  const { detectBeat } = useBeatDetection()

  useEffect(() => {
    if (!isPlaying) {
      setAudioData([])
      setIsBeat(false)
      return
    }

    const updateAudioData = () => {
      const data = getAudioData()
      if (data.length > 0) {
        setAudioData([...data])

        if (beatDetection) {
          const beat = detectBeat(data)
          if (beat) {
            setIsBeat(true)
            setTimeout(() => setIsBeat(false), 150)
          }
        }
      } else {
        // Fallback to random data for demo
        const fakeData = Array.from({ length: 64 }, () => Math.random() * 255)
        setAudioData(fakeData)
      }
    }

    const interval = setInterval(updateAudioData, 50)
    return () => clearInterval(interval)
  }, [isPlaying, getAudioData, beatDetection, detectBeat])

  const renderVisualizer = () => {
    const props = { theme, audioData, isPlaying, sensitivity, isBeat }

    switch (type) {
      case "bars":
        return <BarVisualizer {...props} />
      case "circular":
        return <CircularVisualizer {...props} />
      default:
        return <BarVisualizer {...props} />
    }
  }

  return (
    <div className="relative w-full h-64">
      {renderVisualizer()}
      <FrequencyLabels theme={theme} show={showFrequencyLabels && type === "bars"} />

      {/* BPM Display */}
      {beatDetection && bpm > 0 && (
        <div className="absolute top-4 right-4">
          <div
            className="px-3 py-1 rounded-full text-sm font-bold"
            style={{
              backgroundColor: `${theme.colors.primary}20`,
              border: `1px solid ${theme.colors.primary}`,
              color: theme.colors.text,
              backdropFilter: "blur(10px)",
            }}
          >
            {bpm} BPM
          </div>
        </div>
      )}

      {/* Beat Indicator */}
      {beatDetection && isBeat && (
        <div
          className="absolute inset-0 pointer-events-none rounded-lg animate-pulse"
          style={{
            boxShadow: `inset 0 0 50px ${theme.colors.primary}40`,
            border: `2px solid ${theme.colors.primary}60`,
          }}
        />
      )}
    </div>
  )
}
