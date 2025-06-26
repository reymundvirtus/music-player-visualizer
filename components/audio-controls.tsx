"use client"

import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent } from "@/components/ui/card"
import {
    Play,
    Pause,
    SkipBack,
    SkipForward,
    Volume2,
    Shuffle,
    Repeat,
    Repeat1Icon as RepeatOne,
    Upload,
} from "lucide-react"
import type { Theme } from "@/lib/themes"
import type { PlaylistTrack } from "@/hooks/use-playlist"

interface AudioControlsProps {
    theme: Theme
    isPlaying: boolean
    onPlayPause: () => void
    volume: number
    onVolumeChange: (volume: number) => void
    currentTime: number
    duration: number
    onSeek: (time: number) => void
    onFileUpload: (file: File) => void
    currentTrack: PlaylistTrack | null
    onNextTrack: () => void
    onPreviousTrack: () => void
    hasNext: boolean
    hasPrevious: boolean
    isShuffled: boolean
    onToggleShuffle: () => void
    repeatMode: "none" | "one" | "all"
    onToggleRepeat: () => void
}

export function AudioControls({
    theme,
    isPlaying,
    onPlayPause,
    volume,
    onVolumeChange,
    currentTime,
    duration,
    onSeek,
    onFileUpload,
    currentTrack,
    onNextTrack,
    onPreviousTrack,
    hasNext,
    hasPrevious,
    isShuffled,
    onToggleShuffle,
    repeatMode,
    onToggleRepeat,
}: AudioControlsProps) {
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${mins}:${secs.toString().padStart(2, "0")}`
    }

    const getRepeatIcon = () => {
        switch (repeatMode) {
            case "one":
                return RepeatOne
            case "all":
                return Repeat
            default:
                return Repeat
        }
    }

    const RepeatIcon = getRepeatIcon()

    return (
        <Card className="w-full" style={{ backgroundColor: theme.colors.surface }}>
            <CardContent className="p-6">
                {/* Track Info */}
                <div className="text-center mb-6">
                    <h2 className="text-xl font-bold mb-1" style={{ color: theme.colors.text }}>
                        {currentTrack?.name || "No Track Selected"}
                    </h2>
                    <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                        {currentTrack?.artist || "Add music files to your playlist"}
                    </p>
                </div>

                {/* File Upload for single track */}
                {!currentTrack && (
                    <div className="mb-6">
                        <label
                            htmlFor="audio-upload"
                            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200 hover:scale-105"
                            style={{
                                borderColor: theme.colors.primary,
                                backgroundColor: `${theme.colors.primary}10`,
                            }}
                        >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="w-8 h-8 mb-2" style={{ color: theme.colors.primary }} />
                                <p className="mb-2 text-sm font-medium" style={{ color: theme.colors.text }}>
                                    <span>Click to upload</span> or drag and drop
                                </p>
                                <p className="text-xs" style={{ color: theme.colors.textSecondary }}>
                                    MP3, WAV, OGG, M4A (MAX. 50MB)
                                </p>
                            </div>
                            <input
                                id="audio-upload"
                                type="file"
                                className="hidden"
                                accept="audio/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) onFileUpload(file)
                                }}
                            />
                        </label>
                    </div>
                )}

                {/* Progress Bar */}
                <div className="mb-6">
                    <Slider
                        value={[currentTime]}
                        max={duration}
                        step={1}
                        onValueChange={(value) => onSeek(value[0])}
                        className="w-full"
                        disabled={!currentTrack}
                    />
                    <div className="flex justify-between text-xs mt-2" style={{ color: theme.colors.textSecondary }}>
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                    </div>
                </div>

                {/* Main Controls */}
                <div className="flex items-center justify-center gap-4 mb-6">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-opacity-20"
                        onClick={onToggleShuffle}
                        style={{
                            color: isShuffled ? theme.colors.primary : theme.colors.text,
                            backgroundColor: isShuffled ? `${theme.colors.primary}20` : "transparent",
                        }}
                    >
                        <Shuffle className="w-5 h-5" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-opacity-20"
                        onClick={onPreviousTrack}
                        disabled={!hasPrevious}
                        style={{ color: theme.colors.text }}
                    >
                        <SkipBack className="w-6 h-6" />
                    </Button>

                    <Button
                        size="icon"
                        className="w-12 h-12 rounded-full transition-all duration-200 hover:scale-105"
                        onClick={onPlayPause}
                        disabled={!currentTrack}
                        style={{
                            backgroundColor: theme.colors.primary,
                            boxShadow: `0 0 20px ${theme.colors.primary}60`,
                        }}
                    >
                        {isPlaying ? <Pause className="w-6 h-6 text-white" /> : <Play className="w-6 h-6 text-white ml-1" />}
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-opacity-20"
                        onClick={onNextTrack}
                        disabled={!hasNext}
                        style={{ color: theme.colors.text }}
                    >
                        <SkipForward className="w-6 h-6" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-opacity-20"
                        onClick={onToggleRepeat}
                        style={{
                            color: repeatMode !== "none" ? theme.colors.primary : theme.colors.text,
                            backgroundColor: repeatMode !== "none" ? `${theme.colors.primary}20` : "transparent",
                        }}
                    >
                        <RepeatIcon className="w-5 h-5" />
                    </Button>
                </div>

                {/* Volume Control */}
                <div className="flex items-center gap-3">
                    <Volume2 className="w-5 h-5" style={{ color: theme.colors.text }} />
                    <Slider
                        value={[volume]}
                        max={100}
                        step={1}
                        onValueChange={(value) => onVolumeChange(value[0])}
                        className="flex-1"
                    />
                    <span className="text-sm w-8" style={{ color: theme.colors.textSecondary }}>
                        {volume}
                    </span>
                </div>
            </CardContent>
        </Card>
    )
}
