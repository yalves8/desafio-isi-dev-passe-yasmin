import { useId, type SVGProps } from 'react'

/**
 * Bola de futebol clássica (pentágonos pretos sobre branco), usada como marcador de gol no
 * Figma: o lucide não tem esse ícone. Herda a cor do texto (`currentColor`) nos gomos e no contorno.
 */
export function SoccerBall(props: SVGProps<SVGSVGElement>) {
  const clip = useId()
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <defs>
        <clipPath id={clip}>
          <circle cx="12" cy="12" r="10.25" />
        </clipPath>
      </defs>
      <circle cx="12" cy="12" r="10.25" fill="white" />
      <g clipPath={`url(#${clip})`}>
        <polygon points="12.00,7.90 15.90,10.73 14.41,15.32 9.59,15.32 8.10,10.73" />
        <polygon points="12.00,5.30 8.10,2.47 9.59,-2.12 14.41,-2.12 15.90,2.47" />
        <polygon points="18.37,9.93 19.86,5.35 24.68,5.35 26.17,9.93 22.27,12.76" />
        <polygon points="15.94,17.42 20.76,17.42 22.25,22.00 18.35,24.84 14.45,22.00" />
        <polygon points="8.06,17.42 9.55,22.00 5.65,24.84 1.75,22.00 3.24,17.42" />
        <polygon points="5.63,9.93 1.73,12.76 -2.17,9.93 -0.68,5.35 4.14,5.35" />
        <path
          d="M12.00 7.90L12.00 5.30 M15.90 10.73L18.37 9.93 M14.41 15.32L15.94 17.42 M9.59 15.32L8.06 17.42 M8.10 10.73L5.63 9.93"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
        />
      </g>
      <circle cx="12" cy="12" r="10.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}
