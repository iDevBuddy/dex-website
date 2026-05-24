/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,jsx}'],
    theme: {
        extend: {
            colors: {
                dark: {
                    DEFAULT: '#030712', // Midnight Deep
                    deeper: '#02040a',  // Deep Obsidian Space
                    card: 'rgba(255, 255, 255, 0.02)', // Liquid Glass base
                    hover: 'rgba(255, 255, 255, 0.05)',
                },
                accent: {
                    DEFAULT: '#e05132', // Glowing Flame Orange
                    dim: 'rgba(224, 81, 50, 0.12)',
                    hover: '#c9432a',
                },
                cobalt: {
                    DEFAULT: '#2563eb', // Electric Cobalt Blue
                    dim: 'rgba(37, 99, 235, 0.12)',
                    hover: '#1d4ed8',
                },
                border: {
                    DEFAULT: 'rgba(255, 255, 255, 0.08)', // Frosted Border
                    hover: 'rgba(255, 255, 255, 0.14)',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                display: ['Outfit', 'sans-serif'], // Premium Headings
                mono: ['IBM Plex Mono', 'monospace'],
            },
        },
    },
    plugins: [],
}
