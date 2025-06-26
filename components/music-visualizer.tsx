"use client"

import { useState, useEffect, useRef } from "react"
import { themes, type Theme } from "@/lib/themes"
import { Button } from "@/components/ui/button"
import { BarChart3, Circle } from "lucide-react"
import { useAudioPlayer } from "@/hooks/use-audio-player"
import { usePlaylist } from "@/hooks/use-playlist"
import { ThemeSelector } from "./theme-selector"
import { PlaylistPanel } from "./playlist-panel"
import { VisualizerControls } from "./visualizer-controls"
import { AudioVisualizer } from "./audio-visualizer"
import { AudioControls } from "./audio-controls"

export default function MusicVisualizer() {
    const [currentTheme, setCurrentTheme] = useState<Theme>(themes[0])
    const [visualizerType, setVisualizerType] = useState<"bars" | "circular">("bars")
    const [sensitivity, setSensitivity] = useState(100)
    const [showFrequencyLabels, setShowFrequencyLabels] = useState(false)
    const [beatDetection, setBeatDetection] = useState(true)
    const [showPlaylist, setShowPlaylist] = useState(false)
    const trackEndedRef = useRef(false)
    const lastTrackIdRef = useRef<string | null>(null)
    const isButtonNavigatingRef = useRef(false)

    const {
        currentTrack: audioCurrentTrack,
        isPlaying,
        currentTime,
        duration,
        volume,
        isLoading,
        isFading,
        loadTrack,
        togglePlayPause,
        seek,
        setVolume,
        getAudioData,
        bpm,
    } = useAudioPlayer()

    const {
        playlist,
        currentTrack: playlistCurrentTrack,
        currentTrackIndex,
        addTrack,
        addMultipleTracks,
        removeTrack,
        clearPlaylist,
        playTrack,
        nextTrack,
        previousTrack,
        toggleShuffle,
        toggleRepeat,
        hasNext,
        hasPrevious,
        isShuffled,
        repeatMode,
    } = usePlaylist()

    // Sync playlist current track with audio player
    useEffect(() => {
        if (playlistCurrentTrack && playlistCurrentTrack.id !== lastTrackIdRef.current) {
            console.log("=== TRACK SYNC ===")
            console.log("Loading track:", playlistCurrentTrack.name, "at index:", currentTrackIndex)
            console.log("Previous track ID:", lastTrackIdRef.current)
            console.log("New track ID:", playlistCurrentTrack.id)
            console.log("Is button navigating:", isButtonNavigatingRef.current)

            // Auto-play if there was already a track playing or if this is from navigation
            // const shouldAutoPlay = isPlaying || lastTrackIdRef.current !== null
            loadTrack(playlistCurrentTrack)
            trackEndedRef.current = false
            lastTrackIdRef.current = playlistCurrentTrack.id
        }
    }, [playlistCurrentTrack, loadTrack, currentTrackIndex, isPlaying])

    // Auto-advance to next track when current track ends
    useEffect(() => {
        // Track ended if not playing, currentTime is 0, we have a track, duration > 0, and we haven't already handled this end
        if (
            !isPlaying &&
            currentTime === 0 &&
            audioCurrentTrack &&
            duration > 0 &&
            !trackEndedRef.current &&
            !isButtonNavigatingRef.current
        ) {
            trackEndedRef.current = true
            console.log("Track ended, advancing to next")

            if (hasNext) {
                setTimeout(() => {
                    const next = nextTrack()
                    console.log("Auto-advance to next track:", next?.name)
                }, 1000) // Wait for fade to complete
            }
        }

        // Reset the flag when a new track starts playing
        if (isPlaying && currentTime > 0) {
            trackEndedRef.current = false
        }
    }, [isPlaying, currentTime, audioCurrentTrack, duration, hasNext, nextTrack])

    const handleFileUpload = (file: File) => {
        // Validate file size (50MB limit)
        if (file.size > 50 * 1024 * 1024) {
            alert("File size must be less than 50MB")
            return
        }

        // Validate file type
        if (!file.type.startsWith("audio/")) {
            alert("Please select a valid audio file")
            return
        }

        const track = addTrack(file)
        console.log("Added track:", track?.name)
    }

    const handlePlayTrack = (trackId: string) => {
        if (isButtonNavigatingRef.current) return // Prevent rapid clicks

        console.log("=== MANUAL TRACK SELECTION ===")
        console.log("Playing track with ID:", trackId)
        const trackIndex = playlist.findIndex((t) => t.id === trackId)
        console.log("Track index:", trackIndex)

        isButtonNavigatingRef.current = true
        playTrack(trackId)

        setTimeout(() => {
            isButtonNavigatingRef.current = false
        }, 1000) // Longer timeout for manual selection
    }

    const handleNextTrack = () => {
        if (isButtonNavigatingRef.current) return // Prevent rapid clicks

        console.log("=== NEXT BUTTON CLICKED ===")
        console.log("Current index before next:", currentTrackIndex)

        isButtonNavigatingRef.current = true
        const next = nextTrack()
        console.log("Next track result:", next?.name)

        // Clear the flag after track has had time to load
        setTimeout(() => {
            isButtonNavigatingRef.current = false
            console.log("Navigation cooldown cleared")
        }, 1000)
    }

    const handlePreviousTrack = () => {
        if (isButtonNavigatingRef.current) return // Prevent rapid clicks

        console.log("=== PREVIOUS BUTTON CLICKED ===")
        console.log("Current index before previous:", currentTrackIndex)

        isButtonNavigatingRef.current = true
        const prev = previousTrack()
        console.log("Previous track result:", prev?.name)

        // Clear the flag after track has had time to load
        setTimeout(() => {
            isButtonNavigatingRef.current = false
            console.log("Navigation cooldown cleared")
        }, 1000)
    }

    const visualizerTypes = [
        { type: "bars" as const, icon: BarChart3, label: "Bars" },
        { type: "circular" as const, icon: Circle, label: "Circular" },
    ]

    return (
        <div
            className="min-h-screen transition-all duration-500 p-4"
            style={{
                background: `linear-gradient(135deg, ${currentTheme.colors.background}, ${currentTheme.colors.surface})`,
            }}
        >
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="text-center py-8">
                    <h1
                        className={`text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r ${currentTheme.gradient} bg-clip-text text-transparent`}
                    >
                        Music Visualizer
                    </h1>
                    <p className="text-lg" style={{ color: currentTheme.colors.textSecondary }}>
                        Experience your music with dynamic themes and playlists
                    </p>
                </div>

                {/* Theme Selector */}
                <ThemeSelector currentTheme={currentTheme} onThemeChange={setCurrentTheme} />

                {/* Playlist Panel */}
                <PlaylistPanel
                    theme={currentTheme}
                    playlist={playlist}
                    currentTrack={playlistCurrentTrack}
                    isPlaying={isPlaying}
                    onPlayTrack={handlePlayTrack}
                    onRemoveTrack={removeTrack}
                    onClearPlaylist={clearPlaylist}
                    onAddTracks={addMultipleTracks}
                    show={showPlaylist}
                    onToggle={() => setShowPlaylist(!showPlaylist)}
                />

                {/* Debug Info */}
                {/* <div className="text-xs p-2 bg-gray-800 text-white rounded">
                    <div>Current Track Index: {currentTrackIndex}</div>
                    <div>Playlist Length: {playlist.length}</div>
                    <div>Current Track: {playlistCurrentTrack?.name || "None"}</div>
                    <div>Audio Track: {audioCurrentTrack?.name || "None"}</div>
                    <div>Last Track ID: {lastTrackIdRef.current || "None"}</div>
                    <div>Is Button Navigating: {isButtonNavigatingRef.current ? "Yes" : "No"}</div>
                    <div>Is Shuffled: {isShuffled ? "Yes" : "No"}</div>
                    <div>Repeat Mode: {repeatMode}</div>
                    <div>Has Previous: {hasPrevious ? "Yes" : "No"}</div>
                    <div>Has Next: {hasNext ? "Yes" : "No"}</div>
                    <div>Is Playing: {isPlaying ? "Yes" : "No"}</div>
                    <div>Is Fading: {isFading ? "Yes" : "No"}</div>
                    <div>Track IDs Match: {playlistCurrentTrack?.id === audioCurrentTrack?.id ? "Yes" : "No"}</div>
                </div> */}

                {/* Visualizer Controls */}
                <VisualizerControls
                    theme={currentTheme}
                    sensitivity={sensitivity}
                    onSensitivityChange={setSensitivity}
                    showFrequencyLabels={showFrequencyLabels}
                    onToggleFrequencyLabels={() => setShowFrequencyLabels(!showFrequencyLabels)}
                    beatDetection={beatDetection}
                    onToggleBeatDetection={() => setBeatDetection(!beatDetection)}
                />

                {/* Visualizer Type Toggle */}
                <div className="flex justify-center gap-2">
                    {visualizerTypes.map(({ type, icon: Icon, label }) => (
                        <Button
                            key={type}
                            variant={visualizerType === type ? "default" : "outline"}
                            onClick={() => setVisualizerType(type)}
                            className="gap-2"
                            style={{
                                backgroundColor: visualizerType === type ? currentTheme.colors.primary : "transparent",
                                borderColor: currentTheme.colors.primary,
                                color: visualizerType === type ? "#ffffff" : currentTheme.colors.text,
                            }}
                        >
                            <Icon className="w-4 h-4" />
                            {label}
                        </Button>
                    ))}
                </div>

                {/* Visualizer */}
                <div
                    className="rounded-lg p-8 transition-all duration-300 relative"
                    style={{
                        backgroundColor: `${currentTheme.colors.surface}40`,
                        backdropFilter: "blur(10px)",
                        border: `1px solid ${currentTheme.colors.primary}30`,
                        opacity: isFading ? 0.7 : 1,
                    }}
                >
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                            <div className="text-center">
                                <div
                                    className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-2"
                                    style={{ borderColor: currentTheme.colors.primary }}
                                ></div>
                                <p style={{ color: currentTheme.colors.text }}>Loading audio...</p>
                            </div>
                        </div>
                    )}
                    {isFading && (
                        <div className="absolute top-4 left-4 z-10">
                            <div
                                className="px-3 py-1 rounded-full text-sm font-bold"
                                style={{
                                    backgroundColor: `${currentTheme.colors.accent}20`,
                                    border: `1px solid ${currentTheme.colors.accent}`,
                                    color: currentTheme.colors.text,
                                    backdropFilter: "blur(10px)",
                                }}
                            >
                                Fading...
                            </div>
                        </div>
                    )}
                    <AudioVisualizer
                        theme={currentTheme}
                        isPlaying={isPlaying}
                        getAudioData={getAudioData}
                        type={visualizerType}
                        sensitivity={sensitivity}
                        showFrequencyLabels={showFrequencyLabels}
                        beatDetection={beatDetection}
                        bpm={bpm}
                    />
                </div>

                {/* Audio Controls */}
                <AudioControls
                    theme={currentTheme}
                    isPlaying={isPlaying}
                    onPlayPause={togglePlayPause}
                    volume={volume}
                    onVolumeChange={setVolume}
                    currentTime={currentTime}
                    duration={duration}
                    onSeek={seek}
                    onFileUpload={handleFileUpload}
                    currentTrack={playlistCurrentTrack}
                    onNextTrack={handleNextTrack}
                    onPreviousTrack={handlePreviousTrack}
                    hasNext={hasNext}
                    hasPrevious={hasPrevious}
                    isShuffled={isShuffled}
                    onToggleShuffle={toggleShuffle}
                    repeatMode={repeatMode}
                    onToggleRepeat={toggleRepeat}
                />
            </div>
        </div>
    )
}
