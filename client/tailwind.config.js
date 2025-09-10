/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: 'class',
	content: [
		'./index.html',
		'./src/**/*.{js,jsx,ts,tsx}',
	],
	theme: {
		extend: {
								colors: {
									background: {
										DEFAULT: '#181C14', // main background
										light: '#3C3D37',   // card/surface background
									},
									surface: '#3C3D37',   // card/surface background
									primary: {
										DEFAULT: '#697565', // accent/primary
									},
									accent: {
										DEFAULT: '#ECDFCC', // highlight/accent
									},
									text: {
										DEFAULT: '#ECDFCC', // main text
										muted: '#697565',   // muted text
									},
								},
			fontFamily: {
				sans: ['Inter', 'ui-sans-serif', 'system-ui'],
			},
		},
	},
	plugins: [],
};
