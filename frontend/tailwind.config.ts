import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ["var(--font-outfit)", "ui-sans-serif", "system-ui"],
                serif: ["var(--font-cinzel)", "ui-serif", "Georgia"],
                mono: ["ui-monospace", "SFMono-Regular"],
                outfit: ["var(--font-outfit)", "sans-serif"],
                cinzel: ["var(--font-cinzel)", "serif"],
            },
            colors: {
                gray: {
                    950: '#0a0a0f', // Custom very dark gray
                }
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic":
                    "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
            },
        },
    },
    plugins: [],
};
export default config;
