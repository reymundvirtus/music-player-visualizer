"use client"

import { useState, useCallback } from "react"

export interface PlaylistTrack {
    id: string
    name: string
    artist: string
    file: File
    url: string
    duration: number
}

export function usePlaylist() {
    const [playlist, setPlaylist] = useState<PlaylistTrack[]>([])
    const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(-1)
    const [isShuffled, setIsShuffled] = useState(false)
    const [repeatMode, setRepeatMode] = useState<"none" | "one" | "all">("none")
    const [shuffledIndices, setShuffledIndices] = useState<number[]>([])

    const addTrack = useCallback((file: File) => {
        const fileName = file.name.replace(/\.[^/.]+$/, "")
        const [artist, name] = fileName.includes(" - ") ? fileName.split(" - ", 2) : ["Unknown Artist", fileName]

        const track: PlaylistTrack = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            name: name || "Unknown Track",
            artist: artist || "Unknown Artist",
            file,
            url: URL.createObjectURL(file),
            duration: 0,
        }

        setPlaylist((prev) => {
            const newPlaylist = [...prev, track]
            // If this is the first track, make it current
            if (prev.length === 0) {
                setCurrentTrackIndex(0)
            }
            return newPlaylist
        })

        return track
    }, [])

    const addMultipleTracks = useCallback((files: File[]) => {
        const newTracks = files.map((file) => {
            const fileName = file.name.replace(/\.[^/.]+$/, "")
            const [artist, name] = fileName.includes(" - ") ? fileName.split(" - ", 2) : ["Unknown Artist", fileName]

            return {
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9) + file.name,
                name: name || "Unknown Track",
                artist: artist || "Unknown Artist",
                file,
                url: URL.createObjectURL(file),
                duration: 0,
            }
        })

        setPlaylist((prev) => {
            const newPlaylist = [...prev, ...newTracks]
            // If this is the first batch of tracks, make the first one current
            if (prev.length === 0 && newTracks.length > 0) {
                setCurrentTrackIndex(0)
            }
            return newPlaylist
        })

        return newTracks
    }, [])

    const removeTrack = useCallback(
        (trackId: string) => {
            setPlaylist((prev) => {
                const trackIndex = prev.findIndex((track) => track.id === trackId)
                if (trackIndex === -1) return prev

                const newPlaylist = prev.filter((track) => track.id !== trackId)

                // Adjust current track index
                if (trackIndex === currentTrackIndex) {
                    // If removing current track, move to next or previous
                    if (newPlaylist.length === 0) {
                        setCurrentTrackIndex(-1)
                    } else if (currentTrackIndex >= newPlaylist.length) {
                        setCurrentTrackIndex(newPlaylist.length - 1)
                    }
                } else if (trackIndex < currentTrackIndex) {
                    setCurrentTrackIndex((prev) => prev - 1)
                }

                return newPlaylist
            })
        },
        [currentTrackIndex],
    )

    const clearPlaylist = useCallback(() => {
        // Clean up object URLs
        playlist.forEach((track) => URL.revokeObjectURL(track.url))
        setPlaylist([])
        setCurrentTrackIndex(-1)
    }, [playlist])

    const playTrack = useCallback(
        (trackId: string) => {
            const index = playlist.findIndex((track) => track.id === trackId)
            if (index !== -1) {
                setCurrentTrackIndex(index)
            }
        },
        [playlist],
    )

    const shuffleArray = useCallback((array: number[]) => {
        const shuffled = [...array]
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
                ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
        }
        return shuffled
    }, [])

    const toggleShuffle = useCallback(() => {
        setIsShuffled((prev) => {
            if (!prev) {
                // Enable shuffle
                const indices = playlist.map((_, index) => index)
                const shuffled = shuffleArray(indices)
                setShuffledIndices(shuffled)
            } else {
                // Disable shuffle
                setShuffledIndices([])
            }
            return !prev
        })
    }, [playlist, shuffleArray])

    const toggleRepeat = useCallback(() => {
        setRepeatMode((prev) => {
            switch (prev) {
                case "none":
                    return "all"
                case "all":
                    return "one"
                case "one":
                    return "none"
                default:
                    return "none"
            }
        })
    }, [])

    const getNextTrackIndex = useCallback(() => {
        if (playlist.length === 0 || currentTrackIndex === -1) return -1

        if (repeatMode === "one") {
            return currentTrackIndex
        }

        const indices = isShuffled ? shuffledIndices : playlist.map((_, index) => index)
        const currentIndexInOrder = isShuffled ? shuffledIndices.indexOf(currentTrackIndex) : currentTrackIndex

        if (currentIndexInOrder < indices.length - 1) {
            return indices[currentIndexInOrder + 1]
        } else if (repeatMode === "all") {
            return indices[0]
        }

        return -1
    }, [playlist.length, currentTrackIndex, repeatMode, isShuffled, shuffledIndices])

    const getPreviousTrackIndex = useCallback(() => {
        if (playlist.length === 0 || currentTrackIndex === -1) return -1

        if (repeatMode === "one") {
            return currentTrackIndex
        }

        const indices = isShuffled ? shuffledIndices : playlist.map((_, index) => index)
        const currentIndexInOrder = isShuffled ? shuffledIndices.indexOf(currentTrackIndex) : currentTrackIndex

        if (currentIndexInOrder > 0) {
            return indices[currentIndexInOrder - 1]
        } else if (repeatMode === "all") {
            return indices[indices.length - 1]
        }

        return -1
    }, [playlist.length, currentTrackIndex, repeatMode, isShuffled, shuffledIndices])

    const nextTrack = useCallback(() => {
        const nextIndex = getNextTrackIndex()
        if (nextIndex !== -1) {
            setCurrentTrackIndex(nextIndex)
            return playlist[nextIndex]
        }
        return null
    }, [getNextTrackIndex, playlist])

    const previousTrack = useCallback(() => {
        const prevIndex = getPreviousTrackIndex()
        if (prevIndex !== -1) {
            setCurrentTrackIndex(prevIndex)
            return playlist[prevIndex]
        }
        return null
    }, [getPreviousTrackIndex, playlist])

    const currentTrack =
        currentTrackIndex >= 0 && currentTrackIndex < playlist.length ? playlist[currentTrackIndex] : null

    return {
        playlist,
        currentTrack,
        currentTrackIndex,
        isShuffled,
        repeatMode,
        addTrack,
        addMultipleTracks,
        removeTrack,
        clearPlaylist,
        playTrack,
        nextTrack,
        previousTrack,
        toggleShuffle,
        toggleRepeat,
        hasNext: getNextTrackIndex() !== -1,
        hasPrevious: getPreviousTrackIndex() !== -1,
    }
}
