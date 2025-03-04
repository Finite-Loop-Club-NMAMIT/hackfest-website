import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";
const svgToDataUri = require("mini-svg-data-uri");

const colors = require("tailwindcss/colors");
const {
  default: flattenColorPalette,
} = require("tailwindcss/lib/util/flattenColorPalette");

const config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
  	container: {
  		center: true,
  		padding: '2rem',
  		screens: {
  			'2xl': '1400px'
  		}
  	},
  	extend: {
  		fontFamily: {
  			obscura: [
  				'var(--font-obscura)',
  				'Poppins',
  				'sans-serif'
  			],
  			religath: [
  				'Religath',
  				'sans-serif'
  			],
  			neo: [
  				'NCLNeovibes',
  				'sans-serif'
  			],
  			herkules: 'var(--font-herkules)',
  			'ceasar-dressing': 'var(--font-caesar-dressing)',
  			metal: [
  				'Aboreto',
  				'sans-serif'
  			],
  			geraldine: [
  				'Geraldine',
  				'sans-serif'
  			],
  			valty: [
  				'Valty',
  				'sans-serif'
  			],
  			anton: [
  				'Anton',
  				'serif'
  			]
  		},
  		backgroundImage: {
  			'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
  			'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
  			gold: 'repeating-linear-gradient(45deg, #dea500 0%, #f6f278 25%, #dea500 50%)'
  		},
  		colors: {
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			base: {
  				'50': '#DFE4F6',
  				'100': '#BFC8ED',
  				'200': '#8092DB',
  				'300': '#405BC9',
  				'400': '#283D8F',
  				'500': '#172352',
  				'600': '#121B40',
  				'700': '#0D1430',
  				'800': '#090E20',
  				'900': '#040710',
  				'950': '#020308'
  			},
  			supporting: {
  				'50': '#E5E5FF',
  				'100': '#CCCCFF',
  				'200': '#9E9EFF',
  				'300': '#6B6BFF',
  				'400': '#3D3DFF',
  				'500': '#0A0AFF',
  				'600': '#0000D6',
  				'700': '#00009E',
  				'800': '#00006B',
  				'900': '#000033',
  				'950': '#000019'
  			},
  			tertiary: {
  				'50': '#E5FFFB',
  				'100': '#CCFFF7',
  				'200': '#99FFEE',
  				'300': '#66FFE6',
  				'400': '#33FFDD',
  				'500': '#00FED3',
  				'600': '#00CCAA',
  				'700': '#009980',
  				'800': '#006655',
  				'900': '#00332B',
  				'950': '#001915'
  			},
  			highlight1: {
  				'50': '#FFF2EB',
  				'100': '#FFE8DB',
  				'200': '#FFCDB3',
  				'300': '#FFB68F',
  				'400': '#FF9F6B',
  				'500': '#FF8644',
  				'600': '#FF5D05',
  				'700': '#C24400',
  				'800': '#802D00',
  				'900': '#421700',
  				'950': '#1F0B00'
  			},
  			highlight2: {
  				'50': '#FFFEF5',
  				'100': '#FFFDEB',
  				'200': '#FFFAD1',
  				'300': '#FFF7BD',
  				'400': '#FFF4A3',
  				'500': '#FFF18E',
  				'600': '#FFE83D',
  				'700': '#F0D400',
  				'800': '#9E8C00',
  				'900': '#524800',
  				'950': '#292400'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			},
  			meteor: {
  				'0%': {
  					transform: 'rotate(215deg) translateX(0)',
  					opacity: '1'
  				},
  				'70%': {
  					opacity: '1'
  				},
  				'100%': {
  					transform: 'rotate(215deg) translateX(-500px)',
  					opacity: '0'
  				}
  			},
  			flicker: {
  				'0%': {
  					opacity: '0.1'
  				},
  				'1%': {
  					opacity: '1'
  				},
  				'4%': {
  					opacity: '0.1'
  				},
  				'4.5%': {
  					opacity: '1'
  				},
  				'6%': {
  					opacity: '0.1'
  				},
  				'10%': {
  					opacity: '1'
  				},
  				'12.5%': {
  					opacity: '0.3'
  				},
  				'15%': {
  					opacity: '1'
  				},
  				'35%': {
  					opacity: '0.7'
  				},
  				'36%': {
  					opacity: '0.2'
  				},
  				'38.5%': {
  					opacity: '0.9'
  				},
  				'50%': {
  					opacity: '0.9'
  				},
  				'100%': {
  					opacity: '1'
  				}
  			},
  			move: {
  				'0%': {
  					'background-position-y': '0px'
  				},
  				'100%': {
  					'background-position-y': '164px'
  				}
  			},
  			'hue-rotate': {
  				'0%': {
  					filter: 'hue-rotate(0deg)'
  				},
  				'100%': {
  					filter: 'hue-rotate(360deg)'
  				}
  			},
  			marquee: {
  				'0%': {
  					'background-position-x': '0vw'
  				},
  				'100%': {
  					'background-position-x': '100vw'
  				}
  			},
  			'click-me': {
  				'0%': {
  					transform: 'translateY(0)'
  				},
  				'40%': {
  					transform: 'translateY(0)'
  				},
  				'50%': {
  					transform: 'translateY(-5px)'
  				},
  				'60%': {
  					transform: 'translateY(0)'
  				},
  				'100%': {
  					transform: 'translateY(0)'
  				}
  			},
  			jump: {
  				'0%': {
  					transform: 'translateY(-10%)'
  				},
  				'40%': {
  					transform: 'translateY(30%)'
  				},
  				'90%': {
  					transform: 'translateY(-10%)'
  				},
  				'100%': {
  					transform: 'translateY(-10%)'
  				}
  			},
  			scale: {
  				'0%': {
  					transform: 'scaleY(1)'
  				},
  				'10%': {
  					transform: 'scaleY(1)'
  				},
  				'70%': {
  					transform: 'scaleY(1)'
  				},
  				'50%': {
  					transform: 'scaleY(0.4)'
  				},
  				'100%': {
  					transform: 'scaleY(1)'
  				}
  			},
  			rotate: {
  				'0%': {
  					transform: 'rotateX(70deg) rotateZ(45deg)'
  				},
  				'10%': {
  					transform: 'rotateX(70deg) rotateZ(45deg)'
  				},
  				'25%': {
  					transform: 'rotateX(70deg) rotateZ(135deg)'
  				},
  				'35%': {
  					transform: 'rotateX(70deg) rotateZ(135deg)'
  				},
  				'50%': {
  					transform: 'rotateX(70deg) rotateZ(225deg)'
  				},
  				'65%': {
  					transform: 'rotateX(70deg) rotateZ(225deg)'
  				},
  				'75%': {
  					transform: 'rotateX(70deg) rotateZ(315deg)'
  				},
  				'85%': {
  					transform: 'rotateX(70deg) rotateZ(315deg)'
  				},
  				'100%': {
  					transform: 'rotateX(70deg) rotateZ(405deg)'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'meteor-effect': 'meteor 5s linear infinite',
  			flicker: 'flicker 20s linear infinite',
  			move: 'move 5s linear infinite',
  			'hue-rotate': 'hue-rotate 100s linear infinite',
  			marquee: 'marquee 6s linear infinite',
  			'click-me': 'click-me 2s linear infinite',
  			jump: 'jump 1s cubic-bezier(0.785, 0.135, 0.15, 0.86) infinite',
  			scale: 'scale 1s cubic-bezier(0.785, 0.135, 0.15, 0.86) infinite',
  			rotate: 'rotate 4s 0.5s cubic-bezier(0.645, 0.045, 0.355, 1) infinite reverse'
  		}
  	}

  },
  plugins: [
    require("tailwindcss-animate"),
    plugin(function ({ addUtilities }) {
      addUtilities({
        ".rotate-x-20": {
          transform: "rotateX(20deg)",
        },
        ".rotate-x-45": {
          transform: "rotateX(45deg)",
        },
      });
    }),
    plugin(function ({ addUtilities }) {
      addUtilities({
        ".-rotate-z-20": {
          transform: "rotateZ(-20deg)",
        },
      });
    }),
    plugin(function ({ matchUtilities, theme }) {
      matchUtilities(
        {
          "translate-z": (value) => ({
            "--tw-translate-z": value,
            transform: ` translate3d(var(--tw-translate-x), var(--tw-translate-y), var(--tw-translate-z)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))`,
          }), // this is actual CSS
          "text-shadow": (value) => ({
            textShadow: value,
          }),
        },
        { values: theme("translate"), supportsNegativeValues: true },
      );
    }),
    plugin(function ({ matchUtilities, theme }: any) {
      matchUtilities(
        {
          "bg-grid": (value: any) => ({
            backgroundImage: `url("${svgToDataUri(
              `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" fill="none" stroke="${value}"><path d="M0 .5H31.5V32"/></svg>`,
            )}")`,
          }),
          "bg-grid-small": (value: any) => ({
            backgroundImage: `url("${svgToDataUri(
              `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="8" height="8" fill="none" stroke="${value}"><path d="M0 .5H31.5V32"/></svg>`,
            )}")`,
          }),
          "bg-dot": (value: any) => ({
            backgroundImage: `url("${svgToDataUri(
              `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="16" height="16" fill="none"><circle fill="${value}" id="pattern-circle" cx="10" cy="10" r="1.6257413380501518"></circle></svg>`,
            )}")`,
          }),
        },
        {
          values: flattenColorPalette(theme("backgroundColor")),
          type: "color",
        },
      );
    }),
  ],
} satisfies Config;

export default config;
