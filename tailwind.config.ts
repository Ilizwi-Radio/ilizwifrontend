import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        green: {
          950: "#0b2a1c",
          900: "#0f3d26",
          800: "#16522f",
          700: "#1c6b3c",
        },
        orange: {
          600: "#ea6a10",
          500: "#f6821f",
        },
        yellow: {
          400: "#f4c430",
        },
      },
      backgroundImage: {
        "hero-gradient":
          "radial-gradient(120% 120% at 15% 10%, #123d28 0%, #0d3020 35%, #16522f 60%, #7a3a17 100%)",
        "nav-gradient":
          "linear-gradient(90deg, #16522f 0%, #1c6b3c 55%, #7a3a17 100%)",
        "kente-stripe":
          "repeating-linear-gradient(90deg, #ea6a10 0 10px, #f4c430 10px 20px, #1c6b3c 20px 30px, #ea6a10 30px 40px)",
      },
    },
  },
  plugins: [],
};
export default config;
