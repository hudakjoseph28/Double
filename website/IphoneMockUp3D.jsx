import React from 'react';

const style = `
.iphone-mockup-3d {
  max-width: clamp(250px, 30vw, 400px);
  aspect-ratio: 390 / 844;
  display: flex;
  justify-content: center;
  align-items: center;
  /* No background here, so it can be set globally */
  border-radius: 2.5rem;
  box-shadow: 0 16px 48px 0 rgba(31, 38, 135, 0.22), 0 2px 8px 0 #0008;
  padding: 0;
  position: relative;
  background: none;
}
.iphone-close-btn {
  position: absolute;
  top: 18px;
  right: 18px;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: rgba(30,30,40,0.55);
  backdrop-filter: blur(8px) saturate(1.2);
  -webkit-backdrop-filter: blur(8px) saturate(1.2);
  border: 1.5px solid rgba(255,255,255,0.13);
  box-shadow: 0 4px 16px 0 #2B3F8722, 0 1.5px 8px 0 #ff407f22;
  color: #fff;
  font-size: 1.7rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: background 0.2s, color 0.2s, box-shadow 0.2s;
}
.iphone-close-btn:hover, .iphone-close-btn:focus {
  background: rgba(255, 64, 127, 0.18);
  color: #ff407f;
  box-shadow: 0 8px 24px 0 #ff407f44;
  outline: none;
}
.iphone-glass-bg {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 410px;
  height: 870px;
  transform: translate(-50%, -50%) scale(1.04);
  z-index: 0;
  pointer-events: none;
}
.iphone-svg {
  width: 100%;
  height: auto;
  display: block;
  z-index: 1;
  filter: drop-shadow(0 12px 36px #0008);
}
.iphone-shadow {
  filter: blur(8px);
}
.iphone-screen-content {
  position: absolute;
  left: 28px;
  top: 38px;
  width: 334px;
  height: 768px;
  border-radius: 44px;
  overflow: hidden;
  z-index: 2;
  pointer-events: auto;
  display: flex;
  flex-direction: column;
  background: transparent;
}
`;

const IphoneMockup3D = ({ children, onClose }) => (
  <div className="iphone-mockup-3d">
    <style>{style}</style>
    {onClose && (
      <button className="iphone-close-btn" aria-label="Close iPhone mockup" onClick={onClose}>
        &times;
      </button>
    )}
    {/* Glassy blurred glowing panel behind the iPhone */}
    <div className="iphone-glass-bg glass-panel" />
    <svg viewBox="0 0 390 844" className="iphone-svg" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Outer drop shadow for floating effect */}
      <ellipse cx="195" cy="830" rx="140" ry="24" fill="#000" opacity="0.22"/>
      {/* Metallic frame with gradient and bevel */}
      <g>
        <rect x="6" y="6" width="378" height="832" rx="62" fill="url(#frameMetal)" stroke="url(#frameBevel)" strokeWidth="8"/>
        {/* Left side: volume buttons and mute switch */}
        <rect x="-2" y="170" width="7" height="48" rx="3.5" fill="url(#btnMetal)"/>
        <rect x="-2" y="230" width="7" height="32" rx="3.5" fill="url(#btnMetal)"/>
        <rect x="-4" y="280" width="11" height="10" rx="5" fill="url(#muteMetal)"/>
        {/* Right side: power button */}
        <rect x="385" y="260" width="7" height="70" rx="3.5" fill="url(#btnMetal)"/>
        {/* Antenna lines */}
        <rect x="6" y="120" width="12" height="4" rx="2" fill="#e0e0e0" opacity="0.7"/>
        <rect x="372" y="120" width="12" height="4" rx="2" fill="#e0e0e0" opacity="0.7"/>
        <rect x="6" y="720" width="12" height="4" rx="2" fill="#e0e0e0" opacity="0.7"/>
        <rect x="372" y="720" width="12" height="4" rx="2" fill="#e0e0e0" opacity="0.7"/>
      </g>
      {/* Screen glass with glossy reflection and inner shadow */}
      <g>
        <rect x="28" y="38" width="334" height="768" rx="44" fill="url(#screenGradient)"/>
        {/* Inner shadow for screen inset */}
        <rect x="28" y="38" width="334" height="768" rx="44" fill="none" stroke="url(#screenInsetShadow)" strokeWidth="7"/>
        {/* Glossy curved reflection */}
        <path d="M60,70 Q180,120 330,70 Q320,160 60,160 Z" fill="white" opacity="0.10"/>
      </g>
      {/* Dynamic Island Notch with sensors and shadow */}
      <g>
        {/* Notch main shape */}
        <rect x="120" y="38" width="150" height="36" rx="18" fill="#181818" filter="url(#notchShadow)"/>
        {/* Speaker slit */}
        <rect x="185" y="50" width="20" height="7" rx="3.5" fill="#333"/>
        {/* Camera dot */}
        <circle cx="170" cy="58" r="6" fill="#222" stroke="#444" strokeWidth="2"/>
        {/* Sensor dot */}
        <circle cx="220" cy="58" r="3" fill="#333"/>
      </g>
      <defs>
        <linearGradient id="frameMetal" x1="0" y1="0" x2="390" y2="844" gradientUnits="userSpaceOnUse">
          <stop stopColor="#e0e0e0"/>
          <stop offset="0.2" stopColor="#b0b0b0"/>
          <stop offset="0.5" stopColor="#f8f8f8"/>
          <stop offset="0.8" stopColor="#b0b0b0"/>
          <stop offset="1" stopColor="#e0e0e0"/>
        </linearGradient>
        <linearGradient id="frameBevel" x1="0" y1="0" x2="390" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fff" stopOpacity="0.7"/>
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.2"/>
          <stop offset="1" stopColor="#fff" stopOpacity="0.7"/>
        </linearGradient>
        <linearGradient id="btnMetal" x1="0" y1="0" x2="0" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f2f2f7"/>
          <stop offset="1" stopColor="#b0b0b0"/>
        </linearGradient>
        <linearGradient id="muteMetal" x1="0" y1="0" x2="0" y2="10" gradientUnits="userSpaceOnUse">
          <stop stopColor="#e0e0e0"/>
          <stop offset="1" stopColor="#b0b0b0"/>
        </linearGradient>
        <linearGradient id="screenGradient" x1="0" y1="38" x2="334" y2="806" gradientUnits="userSpaceOnUse">
          <stop stopColor="#222"/>
          <stop offset="1" stopColor="#444"/>
        </linearGradient>
        <linearGradient id="screenInsetShadow" x1="0" y1="38" x2="334" y2="806" gradientUnits="userSpaceOnUse">
          <stop stopColor="#000" stopOpacity="0.18"/>
          <stop offset="1" stopColor="#000" stopOpacity="0.05"/>
        </linearGradient>
        <filter id="notchShadow" x="0" y="0" width="390" height="844" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="3" stdDeviation="2" flood-color="#000" flood-opacity="0.18"/>
        </filter>
      </defs>
    </svg>
    {/* Screen content slot */}
    <div className="iphone-screen-content">
      {children}
    </div>
  </div>
);

export default IphoneMockup3D; 