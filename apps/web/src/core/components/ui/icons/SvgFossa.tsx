import { SVGProps } from "react";
import { cn } from "src/core/utils/components";

export const SvgFossa = (props: SVGProps<SVGSVGElement>) => (
    <svg
        width="120"
        height="36"
        viewBox="0 0 120 36"
        fill="none"
        preserveAspectRatio="xMidYMid meet"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
        className={cn("h-8 min-h-8", props.className)}>
        <defs>
            <linearGradient id="fossa-grad-primary" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38BDF8" />
                <stop offset="50%" stopColor="#6366F1" />
                <stop offset="100%" stopColor="#EC4899" />
            </linearGradient>
            <linearGradient id="fossa-grad-subtle" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#818CF8" />
                <stop offset="100%" stopColor="#C084FC" />
            </linearGradient>
        </defs>

        {/* FOSSA Iconic Monogram Badge */}
        <g transform="translate(2, 2)">
            {/* Hexagonal / Rounded Shield Background */}
            <rect
                x="0"
                y="0"
                width="32"
                height="32"
                rx="8"
                fill="url(#fossa-grad-primary)"
            />
            {/* Inner dynamic 'F' glyph */}
            <path
                d="M10 8.5 H22 C23.1 8.5 24 9.4 24 10.5 C24 11.6 23.1 12.5 22 12.5 H14 V14.5 H20 C21.1 14.5 22 15.4 22 16.5 C22 17.6 21.1 18.5 20 18.5 H14 V23.5 C14 24.6 13.1 25.5 12 25.5 C10.9 25.5 10 24.6 10 23.5 Z"
                fill="#FFFFFF"
            />
            {/* Accent dot / spark */}
            <circle cx="21" cy="23" r="2.2" fill="#FFFFFF" fillOpacity="0.9" />
        </g>

        {/* Wordmark: F O S S A */}
        <text
            x="44"
            y="24"
            fill="currentColor"
            fontFamily="Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
            fontSize="21"
            fontWeight="800"
            letterSpacing="0.16em">
            FOSSA
        </text>
    </svg>
);
