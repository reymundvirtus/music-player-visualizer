"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { PlaylistTrack } from "./use-playlist"
import { useBeatDetection } from "./use-beat-detection"

export function useAudioPlayer() {
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const audioContextRef = useRef<AudioContext | null>(null)
    const analyserRef = useRef<AnalyserNode | null>(null)
    const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)
    const isAudioContextSetupRef = useRef<boolean>(false)
    const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null)
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
            // Reset volume after fade
            if (audioRef.current) {
                audioRef.current.volume = volume / 100
            }
        }

        const handleLoadStart = () => {
            setIsLoading(true)
        }

        const handleCanPlay = () => {
            setIsLoading(false)
            setupAudioContext()
        }

        const handleError = () => {
            setIsLoading(false)
            console.error("Error loading audio file")
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

        return () => {
            audio.removeEventListener("timeupdate", handleTimeUpdate)
            audio.removeEventListener("durationchange", handleDurationChange)
            audio.removeEventListener("ended", handleEnded)
            audio.removeEventListener("loadstart", handleLoadStart)
            audio.removeEventListener("canplay", handleCanPlay)
            audio.removeEventListener("error", handleError)
            audio.pause()

            // Clean up fade interval
            if (fadeIntervalRef.current) {
                clearInterval(fadeIntervalRef.current)
            }

            // Clean up audio context
            if (audioContextRef.current && audioContextRef.current.state !== "closed") {
                audioContextRef.current.close()
            }
        }
    }, [volume, isFading])

    // Update volume when it changes
    useEffect(() => {
        if (audioRef.current && !isFading) {
            audioRef.current.volume = volume / 100
        }
    }, [volume, isFading])

    const startFadeOut = useCallback(() => {
        if (!audioRef.current || isFading) return

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
                if (fadeIntervalRef.current) {
                    clearInterval(fadeIntervalRef.current)
                    fadeIntervalRef.current = null
                }
                setIsFading(false)
            }
        }, stepTime)
    }, [isFading])

    const startFadeIn = useCallback(() => {
        if (!audioRef.current) return

        const audio = audioRef.current
        const targetVolume = volume / 100
        const fadeSteps = 20 // Number of steps for fade in
        const stepTime = 50 // Time between steps in ms
        let currentStep = 0

        // Start with volume at 0
        audio.volume = 0

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
                if (fadeIntervalRef.current) {
                    clearInterval(fadeIntervalRef.current)
                    fadeIntervalRef.current = null
                }
            }
        }, stepTime)
    }, [volume])

    const loadTrack = useCallback((track: PlaylistTrack) => {
        if (!audioRef.current) return

        // Stop current playback
        audioRef.current.pause()
        setIsPlaying(false)
        setCurrentTime(0)
        setIsFading(false)

        // Clear any ongoing fade
        if (fadeIntervalRef.current) {
            clearInterval(fadeIntervalRef.current)
            fadeIntervalRef.current = null
        }

        // Set new track
        setCurrentTrack(track)
        audioRef.current.src = track.url
        audioRef.current.load()
    }, [])

    const play = useCallback(async () => {
        if (audioRef.current && currentTrack) {
            try {
                // Resume audio context if suspended
                if (audioContextRef.current && audioContextRef.current.state === "suspended") {
                    await audioContextRef.current.resume()
                }

                await audioRef.current.play()
                setIsPlaying(true)

                // Start with fade in for new tracks
                startFadeIn()
            } catch (error) {
                console.error("Error playing audio:", error)
            }
        }
    }, [currentTrack, startFadeIn])

    const pause = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause()
            setIsPlaying(false)
        }
    }, [])

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
                setIsFading(false)
                // Reset volume after seeking
                audioRef.current.volume = volume / 100
            }
        },
        [volume],
    )

    const setVolumeLevel = useCallback((newVolume: number) => {
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
