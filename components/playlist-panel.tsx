"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Music, Play, Pause, X, Upload, Trash2, List } from "lucide-react"
import type { Theme } from "@/lib/themes"
import type { PlaylistTrack } from "@/hooks/use-playlist"

interface PlaylistPanelProps {
    theme: Theme
    playlist: PlaylistTrack[]
    currentTrack: PlaylistTrack | null
    isPlaying: boolean
    onPlayTrack: (trackId: string) => void
    onRemoveTrack: (trackId: string) => void
    onClearPlaylist: () => void
    onAddTracks: (files: File[]) => void
    show: boolean
    onToggle: () => void
}

export function PlaylistPanel({
    theme,
    playlist,
    currentTrack,
    isPlaying,
    onPlayTrack,
    onRemoveTrack,
    onClearPlaylist,
    onAddTracks,
    show,
    onToggle,
}: PlaylistPanelProps) {
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        if (files.length > 0) {
            // Validate files
            const validFiles = files.filter((file) => {
                if (file.size > 50 * 1024 * 1024) {
                    alert(`${file.name} is too large (max 50MB)`)
                    return false
                }
                if (!file.type.startsWith("audio/")) {
                    alert(`${file.name} is not a valid audio file`)
                    return false
                }
                return true
            })

            if (validFiles.length > 0) {
                onAddTracks(validFiles)
            }
        }
        // Reset input
        e.target.value = ""
    }

    const formatDuration = (seconds: number) => {
        if (!seconds || seconds === 0) return "--:--"
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${mins}:${secs.toString().padStart(2, "0")}`
    }

    return (
        <>
            {/* Toggle Button */}
            <Button
                variant="outline"
                size="sm"
                onClick={onToggle}
                className="gap-2 mb-4"
                style={{
                    borderColor: theme.colors.primary,
                    color: theme.colors.text,
                }}
            >
                <List className="w-4 h-4" />
                {show ? "Hide" : "Show"} Playlist ({playlist.length})
            </Button>

            {/* Playlist Panel */}
            {show && (
                <Card className="w-full" style={{ backgroundColor: theme.colors.surface }}>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2" style={{ color: theme.colors.text }}>
                                <Music className="w-5 h-5" />
                                Playlist ({playlist.length} tracks)
                            </CardTitle>
                            <div className="flex gap-2">
                                <label htmlFor="playlist-upload">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="gap-2 cursor-pointer"
                                        style={{
                                            borderColor: theme.colors.primary,
                                            color: theme.colors.text,
                                        }}
                                        asChild
                                    >
                                        <span>
                                            <Upload className="w-4 h-4" />
                                            Add Files
                                        </span>
                                    </Button>
                                </label>
                                <input
                                    id="playlist-upload"
                                    type="file"
                                    multiple
                                    accept="audio/*"
                                    className="hidden"
                                    onChange={handleFileUpload}
                                />
                                {playlist.length > 0 && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={onClearPlaylist}
                                        className="gap-2"
                                        style={{
                                            borderColor: theme.colors.accent,
                                            color: theme.colors.text,
                                        }}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Clear
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="p-0">
                        {playlist.length === 0 ? (
                            <div className="p-8 text-center">
                                <Music className="w-12 h-12 mx-auto mb-4 opacity-50" style={{ color: theme.colors.textSecondary }} />
                                <p className="text-lg font-medium mb-2" style={{ color: theme.colors.text }}>
                                    No tracks in playlist
                                </p>
                                <p className="text-sm mb-4" style={{ color: theme.colors.textSecondary }}>
                                    Add some music files to get started
                                </p>
                                <label htmlFor="playlist-upload-empty">
                                    <Button
                                        variant="outline"
                                        className="gap-2 cursor-pointer"
                                        style={{
                                            borderColor: theme.colors.primary,
                                            color: theme.colors.text,
                                        }}
                                        asChild
                                    >
                                        <span>
                                            <Upload className="w-4 h-4" />
                                            Add Music Files
                                        </span>
                                    </Button>
                                </label>
                                <input
                                    id="playlist-upload-empty"
                                    type="file"
                                    multiple
                                    accept="audio/*"
                                    className="hidden"
                                    onChange={handleFileUpload}
                                />
                            </div>
                        ) : (
                            <ScrollArea className="h-64">
                                <div className="p-2">
                                    {playlist.map((track, index) => (
                                        <div
                                            key={track.id}
                                            className={`flex items-center gap-3 p-3 rounded-lg mb-2 transition-all duration-200 cursor-pointer hover:bg-opacity-80 ${currentTrack?.id === track.id ? "ring-2" : ""
                                                }`}
                                            style={{
                                                backgroundColor:
                                                    currentTrack?.id === track.id ? `${theme.colors.primary}20` : `${theme.colors.background}40`,
                                                ringColor: currentTrack?.id === track.id ? theme.colors.primary : "transparent",
                                            }}
                                            onClick={() => onPlayTrack(track.id)}
                                        >
                                            {/* Play/Pause Button */}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="w-8 h-8 p-0 flex-shrink-0"
                                                style={{ color: theme.colors.text }}
                                            >
                                                {currentTrack?.id === track.id && isPlaying ? (
                                                    <Pause className="w-4 h-4" />
                                                ) : (
                                                    <Play className="w-4 h-4" />
                                                )}
                                            </Button>

                                            {/* Track Number */}
                                            <div
                                                className="w-6 text-sm font-mono text-center flex-shrink-0"
                                                style={{ color: theme.colors.textSecondary }}
                                            >
                                                {index + 1}
                                            </div>

                                            {/* Track Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium truncate" style={{ color: theme.colors.text }}>
                                                    {track.name}
                                                </div>
                                                <div className="text-sm truncate" style={{ color: theme.colors.textSecondary }}>
                                                    {track.artist}
                                                </div>
                                            </div>

                                            {/* Duration */}
                                            <div className="text-sm font-mono flex-shrink-0" style={{ color: theme.colors.textSecondary }}>
                                                {formatDuration(track.duration)}
                                            </div>

                                            {/* Remove Button */}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="w-8 h-8 p-0 flex-shrink-0 opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:bg-opacity-20"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    onRemoveTrack(track.id)
                                                }}
                                                style={{ color: theme.colors.textSecondary }}
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        )}
                    </CardContent>
                </Card>
            )}
        </>
    )
}
