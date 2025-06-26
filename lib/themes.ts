export interface Theme {
    name: string
    mood: string
    colors: {
        primary: string
        secondary: string
        accent: string
        background: string
        surface: string
        text: string
        textSecondary: string
        visualizer: string[]
    }
    gradient: string
}

export const themes: Theme[] = [
    {
        name: "Energetic",
        mood: "High Energy",
        colors: {
            primary: "#ff6b6b",
            secondary: "#4ecdc4",
            accent: "#45b7d1",
            background: "#1a1a2e",
            surface: "#16213e",
            text: "#ffffff",
            textSecondary: "#a0a0a0",
            visualizer: ["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#feca57"],
        },
        gradient: "from-red-500 via-purple-500 to-blue-500",
    },
    {
        name: "Calm",
        mood: "Peaceful",
        colors: {
            primary: "#74b9ff",
            secondary: "#81ecec",
            accent: "#a29bfe",
            background: "#2d3436",
            surface: "#636e72",
            text: "#ddd",
            textSecondary: "#b2bec3",
            visualizer: ["#74b9ff", "#81ecec", "#a29bfe", "#fd79a8", "#fdcb6e"],
        },
        gradient: "from-blue-400 via-cyan-300 to-purple-400",
    },
    {
        name: "Dark",
        mood: "Mysterious",
        colors: {
            primary: "#00ff88",
            secondary: "#ff0080",
            accent: "#0080ff",
            background: "#0a0a0a",
            surface: "#1a1a1a",
            text: "#ffffff",
            textSecondary: "#888888",
            visualizer: ["#00ff88", "#ff0080", "#0080ff", "#ffff00", "#ff8000"],
        },
        gradient: "from-green-400 via-pink-500 to-blue-500",
    },
    {
        name: "Retro",
        mood: "Nostalgic",
        colors: {
            primary: "#ff6b9d",
            secondary: "#c44569",
            accent: "#f8b500",
            background: "#1e3799",
            surface: "#3c6382",
            text: "#ffffff",
            textSecondary: "#ddd",
            visualizer: ["#ff6b9d", "#c44569", "#f8b500", "#00d2d3", "#ff9ff3"],
        },
        gradient: "from-pink-500 via-red-500 to-yellow-500",
    },
    {
        name: "Nature",
        mood: "Organic",
        colors: {
            primary: "#27ae60",
            secondary: "#2ecc71",
            accent: "#f39c12",
            background: "#2c3e50",
            surface: "#34495e",
            text: "#ecf0f1",
            textSecondary: "#bdc3c7",
            visualizer: ["#27ae60", "#2ecc71", "#f39c12", "#e67e22", "#16a085"],
        },
        gradient: "from-green-500 via-emerald-500 to-yellow-500",
    },
    {
        name: "Sunset",
        mood: "Warm",
        colors: {
            primary: "#ff7675",
            secondary: "#fd79a8",
            accent: "#fdcb6e",
            background: "#2d1b69",
            surface: "#341f97",
            text: "#ffffff",
            textSecondary: "#ddd",
            visualizer: ["#ff7675", "#fd79a8", "#fdcb6e", "#e17055", "#a29bfe"],
        },
        gradient: "from-orange-400 via-pink-500 to-purple-600",
    },
    {
        name: "Ocean",
        mood: "Deep",
        colors: {
            primary: "#0984e3",
            secondary: "#00b894",
            accent: "#00cec9",
            background: "#2c3e50",
            surface: "#34495e",
            text: "#ecf0f1",
            textSecondary: "#95a5a6",
            visualizer: ["#0984e3", "#00b894", "#00cec9", "#74b9ff", "#55a3ff"],
        },
        gradient: "from-blue-600 via-teal-500 to-cyan-400",
    },
    {
        name: "Fire",
        mood: "Intense",
        colors: {
            primary: "#e17055",
            secondary: "#d63031",
            accent: "#fdcb6e",
            background: "#2d1b1b",
            surface: "#3d2626",
            text: "#ffffff",
            textSecondary: "#ddd",
            visualizer: ["#e17055", "#d63031", "#fdcb6e", "#ff7675", "#fab1a0"],
        },
        gradient: "from-red-600 via-orange-500 to-yellow-400",
    },
    {
        name: "Galaxy",
        mood: "Cosmic",
        colors: {
            primary: "#6c5ce7",
            secondary: "#a29bfe",
            accent: "#fd79a8",
            background: "#1a1a2e",
            surface: "#16213e",
            text: "#ffffff",
            textSecondary: "#b2bec3",
            visualizer: ["#6c5ce7", "#a29bfe", "#fd79a8", "#00b894", "#fdcb6e"],
        },
        gradient: "from-purple-600 via-blue-500 to-pink-500",
    },
    {
        name: "Forest",
        mood: "Natural",
        colors: {
            primary: "#00b894",
            secondary: "#55a3ff",
            accent: "#fdcb6e",
            background: "#1e3d2f",
            surface: "#2d5a3d",
            text: "#ffffff",
            textSecondary: "#95a5a6",
            visualizer: ["#00b894", "#55a3ff", "#fdcb6e", "#27ae60", "#74b9ff"],
        },
        gradient: "from-green-600 via-blue-500 to-yellow-400",
    },
]
