"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useBeatDetection } from "./use-beat-detection"
import type { PlaylistTrack } from "./use-playlist"

export function useAudioPlayer() {
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const audioContextRef = useRef<AudioContext | null>(null)
    const analyserRef = useRef<AnalyserNode | null>(null)
    const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)
    const isAudioContextSetupRef = useRef<boolean>(false)
    const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null)
    const autoPlayRef = useRef<boolean>(false)
    const playPromiseRef = useRef<Promise<void> | null>(null)
    const isLoadingNewTrackRef = useRef<boolean>(false)
    const targetVolumeRef = useRef<number>(75)

    const [currentTrack, setCurrentTrack] = useState<PlaylistTrack | null>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [volume, setVolume] = useState(75)
    const [isLoading, setIsLoading] = useState(false)
    const [isFading, setIsFading] = useState(false)
    const { getBPM } = useBeatDetection()

    // Initialize audio element
    useEffect(() => {
        audioRef.current = new Audio()
        audioRef.current.crossOrigin = "anonymous"
        const audio = audioRef.current

        const handleTimeUpdate = () => {
            setCurrentTime(audio.currentTime)

            // Check if we're near the end for fade out
            if (audio.duration && audio.currentTime > 0) {
                const timeLeft = audio.duration - audio.currentTime
                if (timeLeft <= 3 && timeLeft > 0 && !isFading) {
                    startFadeOut()
                }
            }
        }

        const handleDurationChange = () => {
            setDuration(audio.duration || 0)
        }

        const handleEnded = () => {
            setIsPlaying(false)
            setCurrentTime(0)
            setIsFading(false)
            playPromiseRef.current = null
            // Reset volume after fade
            if (audioRef.current) {
                audioRef.current.volume = targetVolumeRef.current / 100
            }
        }

        const handleLoadStart = () => {
            setIsLoading(true)
        }

        const handleCanPlay = () => {
            setIsLoading(false)
            isLoadingNewTrackRef.current = false
            setupAudioContext()

            // Auto-play if requested
            if (autoPlayRef.current) {
                autoPlayRef.current = false
                play()
            }
        }

        const handleError = () => {
            setIsLoading(false)
            isLoadingNewTrackRef.current = false
            console.error("Error loading audio file")
        }

        const handlePause = () => {
            setIsPlaying(false)
            playPromiseRef.current = null
        }

        const handlePlay = () => {
            setIsPlaying(true)
        }

        const setupAudioContext = () => {
            // Only setup audio context once per audio element
            if (!isAudioContextSetupRef.current && audio) {
                try {
                    // Create audio context if it doesn't exist
                    if (!audioContextRef.current) {
                        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
                    }

                    // Create analyser if it doesn't exist
                    if (!analyserRef.current) {
                        analyserRef.current = audioContextRef.current.createAnalyser()
                        analyserRef.current.fftSize = 256
                    }

                    // Create source only if it doesn't exist
                    if (!sourceRef.current) {
                        sourceRef.current = audioContextRef.current.createMediaElementSource(audio)
                        sourceRef.current.connect(analyserRef.current)
                        analyserRef.current.connect(audioContextRef.current.destination)
                        isAudioContextSetupRef.current = true
                    }
                } catch (error) {
                    console.error("Error setting up audio context:", error)
                }
            }
        }

        audio.addEventListener("timeupdate", handleTimeUpdate)
        audio.addEventListener("durationchange", handleDurationChange)
        audio.addEventListener("ended", handleEnded)
        audio.addEventListener("loadstart", handleLoadStart)
        audio.addEventListener("canplay", handleCanPlay)
        audio.addEventListener("error", handleError)
        audio.addEventListener("pause", handlePause)
        audio.addEventListener("play", handlePlay)

        return () => {
            audio.removeEventListener("timeupdate", handleTimeUpdate)
            audio.removeEventListener("durationchange", handleDurationChange)
            audio.removeEventListener("ended", handleEnded)
            audio.removeEventListener("loadstart", handleLoadStart)
            audio.removeEventListener("canplay", handleCanPlay)
            audio.removeEventListener("error", handleError)
            audio.removeEventListener("pause", handlePause)
            audio.removeEventListener("play", handlePlay)

            // Wait for any pending play promise before pausing
            if (playPromiseRef.current) {
                playPromiseRef.current
                    .then(() => {
                        audio.pause()
                    })
                    .catch(() => {
                        // Ignore errors during cleanup
                    })
            } else {
                audio.pause()
            }

            // Clean up fade interval
            if (fadeIntervalRef.current) {
                clearInterval(fadeIntervalRef.current)
            }

            // Clean up audio context
            if (audioContextRef.current && audioContextRef.current.state !== "closed") {
                audioContextRef.current.close()
            }
        }
    }, [])

    // Update volume when it changes - but don't interfere with fading
    useEffect(() => {
        targetVolumeRef.current = volume

        if (audioRef.current && !isFading) {
            audioRef.current.volume = volume / 100
            console.log("Volume updated to:", volume, "Audio volume:", audioRef.current.volume)
        } else if (isFading) {
            console.log("Volume change ignored during fade, target set to:", volume)
        }
    }, [volume, isFading])

    const stopFade = useCallback(() => {
        if (fadeIntervalRef.current) {
            clearInterval(fadeIntervalRef.current)
            fadeIntervalRef.current = null
        }
        setIsFading(false)
    }, [])

    const startFadeOut = useCallback(() => {
        if (!audioRef.current || isFading) return

        console.log("Starting fade out")
        setIsFading(true)
        const audio = audioRef.current
        const startVolume = audio.volume
        const fadeSteps = 30 // Number of steps for fade
        const stepTime = 100 // Time between steps in ms
        let currentStep = 0

        if (fadeIntervalRef.current) {
            clearInterval(fadeIntervalRef.current)
        }

        fadeIntervalRef.current = setInterval(() => {
            currentStep++
            const newVolume = startVolume * (1 - currentStep / fadeSteps)

            if (audio && newVolume > 0) {
                audio.volume = Math.max(0, newVolume)
            } else {
                // Fade complete
                console.log("Fade out complete")
                if (fadeIntervalRef.current) {
                    clearInterval(fadeIntervalRef.current)
                    fadeIntervalRef.current = null
                }
                setIsFading(false)
                // Restore target volume
                audio.volume = targetVolumeRef.current / 100
            }
        }, stepTime)
    }, [isFading])

    const startFadeIn = useCallback(() => {
        if (!audioRef.current) return

        console.log("Starting fade in")
        const audio = audioRef.current
        const targetVolume = targetVolumeRef.current / 100
        const fadeSteps = 20 // Number of steps for fade in
        const stepTime = 50 // Time between steps in ms
        let currentStep = 0

        // Start with volume at 0
        audio.volume = 0
        setIsFading(true)

        if (fadeIntervalRef.current) {
            clearInterval(fadeIntervalRef.current)
        }

        fadeIntervalRef.current = setInterval(() => {
            currentStep++
            const newVolume = targetVolume * (currentStep / fadeSteps)

            if (audio && currentStep <= fadeSteps) {
                audio.volume = Math.min(targetVolume, newVolume)
            } else {
                // Fade in complete
                console.log("Fade in complete")
                if (fadeIntervalRef.current) {
                    clearInterval(fadeIntervalRef.current)
                    fadeIntervalRef.current = null
                }
                setIsFading(false)
                audio.volume = targetVolume
            }
        }, stepTime)
    }, [])

    const loadTrack = useCallback(
        (track: PlaylistTrack, shouldAutoPlay = false) => {
            if (!audioRef.current) return

            console.log("Loading track:", track.name, "shouldAutoPlay:", shouldAutoPlay)
            isLoadingNewTrackRef.current = true

            // Wait for any pending play promise before making changes
            const handleLoad = async () => {
                try {
                    if (playPromiseRef.current) {
                        await playPromiseRef.current
                    }
                } catch (error) {
                    console.error("Error waiting for previous play promise:", error)
                    // Ignore play promise errors during track switching
                }

                // Stop current playback
                audioRef.current!.pause()
                setIsPlaying(false)
                setCurrentTime(0)

                // Stop any ongoing fade
                stopFade()
                playPromiseRef.current = null

                // Set auto-play flag
                autoPlayRef.current = shouldAutoPlay

                // Set new track
                setCurrentTrack(track)
                audioRef.current!.src = track.url
                audioRef.current!.load()
            }

            handleLoad()
        },
        [stopFade],
    )

    const play = useCallback(async () => {
        if (audioRef.current && currentTrack && !isLoadingNewTrackRef.current) {
            try {
                // Wait for any existing play promise to resolve
                if (playPromiseRef.current) {
                    try {
                        await playPromiseRef.current
                    } catch (error) {
                        console.error("Error waiting for previous play promise:", error)
                        // Ignore previous play promise errors
                    }
                }

                // Resume audio context if suspended
                if (audioContextRef.current && audioContextRef.current.state === "suspended") {
                    await audioContextRef.current.resume()
                }

                // Start new play promise
                playPromiseRef.current = audioRef.current.play()
                await playPromiseRef.current

                setIsPlaying(true)
                playPromiseRef.current = null

                // Start with fade in for new tracks
                startFadeIn()
            } catch (error) {
                console.error("Error playing audio:", error)
                playPromiseRef.current = null
                setIsPlaying(false)
            }
        }
    }, [currentTrack, startFadeIn])

    const pause = useCallback(async () => {
        if (audioRef.current) {
            try {
                // Wait for any pending play promise
                if (playPromiseRef.current) {
                    await playPromiseRef.current
                }
            } catch (error) {
                console.error("Error waiting for previous play promise:", error)
                // Ignore play promise errors
            }

            // Stop any fade effects when pausing
            stopFade()

            audioRef.current.pause()
            setIsPlaying(false)
            playPromiseRef.current = null

            // Restore target volume
            audioRef.current.volume = targetVolumeRef.current / 100
        }
    }, [stopFade])

    const togglePlayPause = useCallback(() => {
        if (isPlaying) {
            pause()
        } else {
            play()
        }
    }, [isPlaying, play, pause])

    const seek = useCallback(
        (time: number) => {
            if (audioRef.current) {
                audioRef.current.currentTime = time
                setCurrentTime(time)

                // Stop fade and restore volume when seeking
                stopFade()
                audioRef.current.volume = targetVolumeRef.current / 100
            }
        },
        [stopFade],
    )

    const setVolumeLevel = useCallback((newVolume: number) => {
        console.log("Setting volume to:", newVolume)
        setVolume(newVolume)
    }, [])

    const getAudioData = useCallback(() => {
        if (!analyserRef.current) return new Uint8Array(0)

        const bufferLength = analyserRef.current.frequencyBinCount
        const dataArray = new Uint8Array(bufferLength)
        analyserRef.current.getByteFrequencyData(dataArray)
        return dataArray
    }, [])

    return {
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        volume,
        isLoading,
        isFading,
        loadTrack,
        togglePlayPause,
        seek,
        setVolume: setVolumeLevel,
        getAudioData,
        audioElement: audioRef.current,
        bpm: getBPM(),
    }
}
