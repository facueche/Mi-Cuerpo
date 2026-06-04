interface HealthLogoProps {
    className?: string;
}

const HealthLogo = ({ className = "w-32 h-32" }: HealthLogoProps) => {
    return (
        <div className={className}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="100%" height="100%">
                <defs>
                    <linearGradient id="medPulseGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#2563eb" />
                        <stop offset="40%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                    <filter id="smoothShadow" x="-10%" y="-10%" width="120%" height="120%">
                        <feDropShadow dx="0" dy="16" stdDeviation="20" floodColor="#0f172a" floodOpacity="0.12" />
                    </filter>
                </defs>
                <rect width="800" height="800" rx="180" fill="#ffffff" />
                <g filter="url(#smoothShadow)">
                    <path
                        d="M 400 150 
               C 425 150 435 170 435 200 
               L 435 315 
               L 550 315 
               C 580 315 600 325 600 350 
               C 600 375 580 385 550 385 
               L 505 385 
               L 465 300 
               L 415 480 
               L 365 395 
               L 250 395 
               C 220 395 200 385 200 360 
               C 200 335 220 325 250 325 
               L 365 325 
               L 365 200 
               C 365 170 375 150 400 150 Z"
                        fill="url(#medPulseGrad)"
                    />
                    <circle cx="465" cy="300" r="22" fill="#ffffff" />
                    <circle cx="465" cy="300" r="14" fill="#10b981" />
                    <circle cx="415" cy="480" r="16" fill="#2563eb" />
                </g>
            </svg>
        </div>
    );
}

export default HealthLogo;
