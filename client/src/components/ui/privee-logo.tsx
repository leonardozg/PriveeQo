// PRIVEE Logo embebido como SVG recreando fielmente el diseño original
// Los assets en attached_assets/ se pierden en Replit deployment

export function PriveeLogo({ className = "h-40 w-40" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 400 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Recreación fiel del logo PRIVEE original */}
      <g transform="translate(200,150)">
        {/* Símbolo central - recreando las formas orgánicas del logo original */}
        
        {/* Forma superior izquierda */}
        <path
          d="M-45,-30 Q-65,-50 -45,-70 Q-25,-50 -35,-30 Q-55,-10 -45,-30"
          fill="#333333"
          strokeWidth="1"
        />
        
        {/* Forma superior derecha */}
        <path
          d="M45,-30 Q65,-50 45,-70 Q25,-50 35,-30 Q55,-10 45,-30"
          fill="#333333"
          strokeWidth="1"
        />
        
        {/* Forma inferior izquierda */}
        <path
          d="M-45,30 Q-65,50 -45,70 Q-25,50 -35,30 Q-55,10 -45,30"
          fill="#333333"
          strokeWidth="1"
        />
        
        {/* Forma inferior derecha */}
        <path
          d="M45,30 Q65,50 45,70 Q25,50 35,30 Q55,10 45,30"
          fill="#333333"
          strokeWidth="1"
        />
        
        {/* Líneas centrales que forman la cruz estilizada */}
        <path
          d="M-50,0 L50,0"
          stroke="#333333"
          strokeWidth="8"
          strokeLinecap="round"
        />
        
        <path
          d="M0,-50 L0,50"
          stroke="#333333"
          strokeWidth="8"
          strokeLinecap="round"
        />
        
        {/* Elementos curvos conectores */}
        <path
          d="M-35,-35 Q-15,-15 -35,0 Q-15,15 -35,35"
          fill="none"
          stroke="#333333"
          strokeWidth="4"
          strokeLinecap="round"
        />
        
        <path
          d="M35,-35 Q15,-15 35,0 Q15,15 35,35"
          fill="none"
          stroke="#333333"
          strokeWidth="4"
          strokeLinecap="round"
        />
        
        <path
          d="M-35,-35 Q-15,-15 0,-35 Q15,-15 35,-35"
          fill="none"
          stroke="#333333"
          strokeWidth="4"
          strokeLinecap="round"
        />
        
        <path
          d="M-35,35 Q-15,15 0,35 Q15,15 35,35"
          fill="none"
          stroke="#333333"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </g>
      
      {/* Texto PRIVEE con el espaciado correcto */}
      <text
        x="200"
        y="320"
        textAnchor="middle"
        fontSize="38"
        fontFamily="Arial, sans-serif"
        fontWeight="300"
        fill="#333333"
        letterSpacing="12px"
      >
        PRIVEE
      </text>
    </svg>
  );
}