/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  darkMode: "class", // or 'media' or false
  theme: {
    extend: {
      gridAutoRows: {
        max: "max-content",
      },
      backgroundImage: {
        map: "url('Assets/Map/mapWhite.png')",
        mapDark: "url('Assets/Map/mapDark.png')",
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
