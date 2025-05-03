/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                dark: {
                    bg: '#1a1a1a',
                    text: '#ffffff',
                    border: '#2d2d2d',
                },
            },
        },
    },
    plugins: [],
}