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
            colors: {
                saffron: {
                    50: '#fff8f1',
                    100: '#ffefdb',
                    200: '#ffdbb0',
                    300: '#ffc17e',
                    400: '#ff9d44',
                    500: '#f26b02',
                    600: '#e55601',
                    700: '#bf3d02',
                    800: '#98300a',
                    900: '#7a280b',
                },
                cream: {
                    50: '#fdfbf7',
                    100: '#f8f4ea',
                    200: '#efe6d1',
                }
            },
            boxShadow: {
                'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                'card': '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025)',
                'float': '0 20px 25px -5px rgba(242, 107, 2, 0.15), 0 10px 10px -5px rgba(242, 107, 2, 0.1)',
            }
        },
    },
    plugins: [],
}
