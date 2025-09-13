// PRIVEE Logo recreado fielmente como SVG
// Basado exactamente en la imagen original de PRIVEE

export function PriveeLogoFaithful({ className = "h-40 w-40" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 400 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Recreación exacta del logo PRIVEE original */}
      <g transform="translate(200,140)">
        {/* Símbolo central - recreando exactamente las formas del logo original */}
        
        {/* Línea vertical principal */}
        <rect x="-4" y="-60" width="8" height="120" fill="#333333" />
        
        {/* Línea horizontal principal */}
        <rect x="-60" y="-4" width="120" height="8" fill="#333333" />
        
        {/* Forma orgánica superior izquierda - corazón invertido */}
        <path
          d="M-30,-35 Q-50,-55 -70,-35 Q-50,-15 -30,-35 Q-45,-50 -30,-35"
          fill="#333333"
        />
        
        {/* Forma orgánica superior derecha - corazón invertido */}
        <path
          d="M30,-35 Q50,-55 70,-35 Q50,-15 30,-35 Q45,-50 30,-35"
          fill="#333333"
        />
        
        {/* Forma orgánica inferior izquierda - corazón */}
        <path
          d="M-30,35 Q-50,15 -70,35 Q-50,55 -30,35 Q-45,20 -30,35"
          fill="#333333"
        />
        
        {/* Forma orgánica inferior derecha - corazón */}
        <path
          d="M30,35 Q50,15 70,35 Q50,55 30,35 Q45,20 30,35"
          fill="#333333"
        />
        
        {/* Curvas conectoras que dan fluidez al diseño */}
        <path
          d="M-25,-25 Q-10,-40 -25,-55 Q-40,-40 -25,-25"
          stroke="#333333"
          strokeWidth="2"
          fill="none"
        />
        
        <path
          d="M25,-25 Q40,-40 25,-55 Q10,-40 25,-25"
          stroke="#333333"
          strokeWidth="2"
          fill="none"
        />
        
        <path
          d="M-25,25 Q-10,40 -25,55 Q-40,40 -25,25"
          stroke="#333333"
          strokeWidth="2"
          fill="none"
        />
        
        <path
          d="M25,25 Q40,40 25,55 Q10,40 25,25"
          stroke="#333333"
          strokeWidth="2"
          fill="none"
        />
      </g>
      
      {/* Texto PRIVEE con tipografía exacta */}
      <text
        x="200"
        y="300"
        textAnchor="middle"
        fontSize="48"
        fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="400"
        fill="#333333"
        letterSpacing="8px"
      >
        PRIVEE
      </text>
    </svg>
  );
}