/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
    theme: {
        extend: {
            colors: {
                background: '#050816',
                surface: '#0b1020',
                card: '#12182b',
                border: '#1f2940',
                primary: '#3b82f6',
                success: '#10b981',
                danger: '#ef4444',
                warning: '#f59e0b'
            },
        },
    },
    plugins: []
}