/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors:{
        primary:"##ed7152",
        secondary:"#8c2d2d",
        accentOne:"#43c981",
        accentTwo:"#35909c",
        bgone:"#eaeaea",
        bgtwo:"#FFFFFF",
        
      }
    },
  },
  plugins: [],
}