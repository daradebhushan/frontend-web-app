/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ['class', 'ignore-dark-mode'],
    content: [
        "./src/**/*.{html,ts}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Outfit', 'Inter', 'sans-serif'],
            },
            colors: {},
            boxShadow: {
                'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                'card': '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025)',
                'float': '0 20px 25px -5px rgba(242, 107, 2, 0.15), 0 10px 10px -5px rgba(242, 107, 2, 0.1)',
            }
        },
    },
    plugins: [],
}
