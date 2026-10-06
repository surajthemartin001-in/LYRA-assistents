import React, { useEffect, useState } from 'react';
import { AvatarState, AvatarMood } from '../types';

interface LyraAvatarProps {
  state: AvatarState;
  mood?: AvatarMood;
  audioSpeaking?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  showStatusBadge?: boolean;
  className?: string;
  onClick?: () => void;
}

export const LyraAvatar: React.FC<LyraAvatarProps> = ({
  state = 'idle',
  mood = 'calm',
  audioSpeaking = false,
  size = 'md',
  showStatusBadge = true,
  className = '',
  onClick,
}) => {
  // Blinking animation
  const [isBlinking, setIsBlinking] = useState(false);
  // Mouth opening ratio when speaking
  const [mouthOpenRatio, setMouthOpenRatio] = useState(0);
  // Butterfly wing dynamic flutter amplitude
  const [wingFlutterAngle, setWingFlutterAngle] = useState(0);

  // Natural anime blinking loop
  useEffect(() => {
    let blinkTimeout: NodeJS.Timeout;
    const scheduleNextBlink = () => {
      const delay = Math.random() * 3000 + 2000;
      blinkTimeout = setTimeout(() => {
        setIsBlinking(true);
        setTimeout(() => {
          setIsBlinking(false);
          scheduleNextBlink();
        }, 130);
      }, delay);
    };

    scheduleNextBlink();
    return () => clearTimeout(blinkTimeout);
  }, []);

  // Speaking mouth movement and rapid wing flutter
  useEffect(() => {
    let animFrame: number;
    if (state === 'speaking' || audioSpeaking) {
      let t = 0;
      const animateSpeech = () => {
        t += 0.24;
        const open = Math.sin(t) * 0.45 + Math.sin(t * 2.2) * 0.25 + 0.4;
        setMouthOpenRatio(Math.max(0.15, Math.min(1.0, open)));
        // Lively butterfly wing flutter when talking
        setWingFlutterAngle(Math.sin(t * 2.8) * 8);
        animFrame = requestAnimationFrame(animateSpeech);
      };
      animFrame = requestAnimationFrame(animateSpeech);
    } else if (state === 'listening') {
      // Gentle attentive hover
      setMouthOpenRatio(0);
      setWingFlutterAngle(3);
    } else {
      setMouthOpenRatio(0);
      setWingFlutterAngle(0);
    }
    return () => cancelAnimationFrame(animFrame);
  }, [state, audioSpeaking]);

  // Size configurations: Sweet, compact, delicate circular orb scale
  const sizeMap = {
    sm: { box: 48, orb: 42 },
    md: { box: 72, orb: 64 },
    lg: { box: 92, orb: 82 },
    hero: { box: 104, orb: 94 },
  };

  const { box, orb } = sizeMap[size];

  // Dynamic Theme & Aura Colors
  const getThemePalette = () => {
    if (state === 'error') {
      return {
        primary: '#f43f5e',
        secondary: '#fda4af',
        wingGlow: 'rgba(244,63,94,0.35)',
        butterflyIris: '#e11d48',
      };
    }
    if (state === 'listening') {
      return {
        primary: '#06b6d4',
        secondary: '#67e8f9',
        wingGlow: 'rgba(6,182,212,0.45)',
        butterflyIris: '#0284c7',
      };
    }
    if (state === 'thinking') {
      return {
        primary: '#a855f7',
        secondary: '#d8b4fe',
        wingGlow: 'rgba(168,85,247,0.45)',
        butterflyIris: '#7c3aed',
      };
    }
    if (state === 'speaking') {
      return {
        primary: '#ec4899',
        secondary: '#f472b6',
        wingGlow: 'rgba(236,72,153,0.5)',
        butterflyIris: '#db2777',
      };
    }

    switch (mood) {
      case 'happy':
        return {
          primary: '#fbbf24',
          secondary: '#fde68a',
          wingGlow: 'rgba(251,191,36,0.4)',
          butterflyIris: '#d97706',
        };
      case 'focused':
        return {
          primary: '#38bdf8',
          secondary: '#bae6fd',
          wingGlow: 'rgba(56,189,248,0.4)',
          butterflyIris: '#0284c7',
        };
      case 'sleepy':
        return {
          primary: '#94a3b8',
          secondary: '#cbd5e1',
          wingGlow: 'rgba(148,163,184,0.2)',
          butterflyIris: '#64748b',
        };
      case 'calm':
      default:
        return {
          primary: '#c084fc',
          secondary: '#f472b6',
          wingGlow: 'rgba(192,132,252,0.4)',
          butterflyIris: '#8b5cf6',
        };
    }
  };

  const palette = getThemePalette();

  const getStatusLabel = () => {
    switch (state) {
      case 'listening':
        return 'Listening...';
      case 'thinking':
        return 'Thinking...';
      case 'speaking':
        return 'Speaking...';
      case 'happy':
        return 'Happy';
      case 'focused':
        return 'Focused';
      case 'error':
        return 'Error';
      case 'sleepy':
        return 'Resting';
      default:
        return 'नन्ही तितली परी';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex flex-col items-center justify-center select-none cursor-pointer transition-all duration-300 ${className}`}
    >
      {/* Outer Ethereal Soft Glow */}
      <div
        className="absolute rounded-full pointer-events-none transition-all duration-700 animate-fairy-pulse"
        style={{
          width: orb * 1.3,
          height: orb * 1.3,
          background: `radial-gradient(circle, ${palette.wingGlow} 0%, rgba(255,255,255,0.01) 70%, rgba(0,0,0,0) 80%)`,
        }}
      />

      {/* Floating Starlight Pollen Motifs */}
      <div className="absolute inset-0 pointer-events-none overflow-visible">
        <span
          className="absolute -top-1 left-1 text-[10px] animate-twinkle text-pink-200"
          style={{ textShadow: `0 0 8px ${palette.primary}` }}
        >
          ✦
        </span>
        <span
          className="absolute top-2 -right-1 text-xs animate-twinkle text-cyan-200 delay-150"
          style={{ textShadow: `0 0 10px ${palette.secondary}` }}
        >
          ✧
        </span>
        <span
          className="absolute -bottom-1 right-1 text-[9px] animate-twinkle text-purple-200 delay-200"
          style={{ textShadow: `0 0 8px ${palette.secondary}` }}
        >
          ✦
        </span>
      </div>

      {/* Round Circular Orb Frame (गोला वाला सर्कल) */}
      <div
        className="relative rounded-full overflow-hidden border-2 shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-105"
        style={{
          width: orb,
          height: orb,
          borderColor: palette.primary,
          boxShadow: `0 0 18px ${palette.wingGlow}, inset 0 0 12px rgba(0,0,0,0.6)`,
          background: 'radial-gradient(circle at 50% 35%, rgba(49,46,129,0.5) 0%, rgba(15,23,42,0.95) 80%)',
        }}
      >
        {/* Subtle Inner Circular Ring Accent */}
        <div className="absolute inset-0.5 rounded-full border border-white/20 pointer-events-none" />

        {/* Scaled Petite Fairy Vector inside Circular Frame */}
        <div
          className="relative animate-fairy-float transition-transform duration-300 w-full h-full flex items-center justify-center"
        >
          <svg
            viewBox="0 0 240 240"
            className="w-[125%] h-[125%] drop-shadow-md overflow-visible translate-y-1"
          >
          <defs>
            {/* Butterfly Forewing Gradient (Left) */}
            <linearGradient id="bfForeLeft" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f472b6" stopOpacity="0.95" />
              <stop offset="35%" stopColor="#c084fc" stopOpacity="0.85" />
              <stop offset="70%" stopColor="#38bdf8" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#fef08a" stopOpacity="0.5" />
            </linearGradient>

            {/* Butterfly Forewing Gradient (Right) */}
            <linearGradient id="bfForeRight" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f472b6" stopOpacity="0.95" />
              <stop offset="35%" stopColor="#c084fc" stopOpacity="0.85" />
              <stop offset="70%" stopColor="#38bdf8" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#fef08a" stopOpacity="0.5" />
            </linearGradient>

            {/* Butterfly Hindwing Gradient (Lower Wing) */}
            <linearGradient id="bfHindWing" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#e879f9" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.6" />
            </linearGradient>

            {/* Butterfly Wing Spot Shimmer */}
            <radialGradient id="wingSpot" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
              <stop offset="60%" stopColor="#f472b6" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.2" />
            </radialGradient>

            {/* Cute Anime Skin Gradient */}
            <linearGradient id="animeSkin" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fff5f5" />
              <stop offset="60%" stopColor="#ffe4e6" />
              <stop offset="100%" stopColor="#fecdd3" />
            </linearGradient>

            {/* Anime Hair Gradient: Silky Lavender into Pink */}
            <linearGradient id="animeHair" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#581c87" />
              <stop offset="30%" stopColor="#7e22ce" />
              <stop offset="70%" stopColor="#c084fc" />
              <stop offset="100%" stopColor="#f472b6" />
            </linearGradient>

            {/* Anime Hair Gloss Light */}
            <linearGradient id="hairGloss" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(255,255,255,0)" />
              <stop offset="50%" stopColor="rgba(255,255,255,0.75)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>

            {/* Big Expressive Anime Eye Iris Gradient */}
            <linearGradient id="animeIris" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1e1b4b" />
              <stop offset="25%" stopColor="#4338ca" />
              <stop offset="65%" stopColor="#a855f7" />
              <stop offset="90%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#f472b6" />
            </linearGradient>

            {/* Antenna Starlight Glow */}
            <radialGradient id="antennaStar" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="45%" stopColor="#67e8f9" />
              <stop offset="100%" stopColor="#0284c7" />
            </radialGradient>

            {/* Soft Glow Filter */}
            <filter id="fairySoftGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* ==================================================== */}
          {/* 1. DELICATE BUTTERFLY WINGS (तितली के पंख)            */}
          {/* ==================================================== */}

          {/* LEFT HINDWING (Lower Wing - Trailing Flap) */}
          <g
            className="animate-butterfly-hind-left"
            style={{
              transform: `rotate(${wingFlutterAngle * 0.8}deg)`,
              transformOrigin: '100px 135px',
            }}
          >
            <path
              d="M 100 135 C 62 145, 18 185, 42 212 C 64 228, 98 185, 105 145 Z"
              fill="url(#bfHindWing)"
              stroke="rgba(255,255,255,0.75)"
              strokeWidth="1.2"
              filter="url(#fairySoftGlow)"
            />
            {/* Hindwing Cell Filigree Veins */}
            <path
              d="M 100 140 Q 60 165 44 200 M 100 142 Q 75 180 58 215"
              fill="none"
              stroke="rgba(255,255,255,0.6)"
              strokeWidth="0.8"
            />
            {/* Left Hindwing Eye-Spot (Ocellus) */}
            <circle cx="56" cy="196" r="7.5" fill="url(#wingSpot)" />
            <circle cx="56" cy="196" r="3.2" fill="#ffffff" opacity="0.95" />
            <circle cx="56" cy="196" r="1.2" fill="#38bdf8" />
          </g>

          {/* RIGHT HINDWING (Lower Wing - Trailing Flap) */}
          <g
            className="animate-butterfly-hind-right"
            style={{
              transform: `rotate(${-wingFlutterAngle * 0.8}deg)`,
              transformOrigin: '140px 135px',
            }}
          >
            <path
              d="M 140 135 C 178 145, 222 185, 198 212 C 176 228, 142 185, 135 145 Z"
              fill="url(#bfHindWing)"
              stroke="rgba(255,255,255,0.75)"
              strokeWidth="1.2"
              filter="url(#fairySoftGlow)"
            />
            {/* Hindwing Cell Filigree Veins */}
            <path
              d="M 140 140 Q 180 165 196 200 M 140 142 Q 165 180 182 215"
              fill="none"
              stroke="rgba(255,255,255,0.6)"
              strokeWidth="0.8"
            />
            {/* Right Hindwing Eye-Spot (Ocellus) */}
            <circle cx="184" cy="196" r="7.5" fill="url(#wingSpot)" />
            <circle cx="184" cy="196" r="3.2" fill="#ffffff" opacity="0.95" />
            <circle cx="184" cy="196" r="1.2" fill="#38bdf8" />
          </g>

          {/* LEFT FOREWING (Upper Main Butterfly Wing - Leading Flap) */}
          <g
            className="animate-butterfly-fore-left"
            style={{
              transform: `rotate(${wingFlutterAngle}deg)`,
              transformOrigin: '102px 125px',
            }}
          >
            <path
              d="M 102 125 C 62 65, -4 48, 8 112 C 16 148, 64 158, 102 135 Z"
              fill="url(#bfForeLeft)"
              stroke="rgba(255,255,255,0.9)"
              strokeWidth="1.6"
              filter="url(#fairySoftGlow)"
            />
            {/* Scalloped wing margin curves */}
            <path
              d="M 8 112 Q 22 118 26 132 Q 42 138 52 148 Q 78 150 102 135"
              fill="none"
              stroke="rgba(255,255,255,0.7)"
              strokeWidth="1.1"
            />
            {/* Tiny Starlight Pearls on Scallop Edges */}
            <circle cx="26" cy="132" r="1.5" fill="#ffffff" />
            <circle cx="52" cy="148" r="1.5" fill="#ffffff" />

            {/* Intricate Butterfly Cell Venation */}
            <path
              d="M 102 128 Q 52 98 24 82 M 102 128 Q 58 118 26 118 M 102 128 Q 72 136 46 138"
              fill="none"
              stroke="rgba(255,255,255,0.6)"
              strokeWidth="1"
            />
            <path
              d="M 52 98 Q 38 108 26 118 M 58 118 Q 50 128 46 138"
              fill="none"
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="0.7"
            />

            {/* Left Forewing Luminous Eye-Spot */}
            <circle cx="44" cy="84" r="9.5" fill="url(#wingSpot)" />
            <circle cx="44" cy="84" r="4.8" fill="#ffffff" opacity="0.95" />
            <circle cx="44" cy="84" r="2" fill="#a855f7" />
          </g>

          {/* RIGHT FOREWING (Upper Main Butterfly Wing - Leading Flap) */}
          <g
            className="animate-butterfly-fore-right"
            style={{
              transform: `rotate(${-wingFlutterAngle}deg)`,
              transformOrigin: '138px 125px',
            }}
          >
            <path
              d="M 138 125 C 178 65, 244 48, 232 112 C 224 148, 176 158, 138 135 Z"
              fill="url(#bfForeRight)"
              stroke="rgba(255,255,255,0.9)"
              strokeWidth="1.6"
              filter="url(#fairySoftGlow)"
            />
            {/* Scalloped wing margin curves */}
            <path
              d="M 232 112 Q 218 118 214 132 Q 198 138 188 148 Q 162 150 138 135"
              fill="none"
              stroke="rgba(255,255,255,0.7)"
              strokeWidth="1.1"
            />
            {/* Tiny Starlight Pearls on Scallop Edges */}
            <circle cx="214" cy="132" r="1.5" fill="#ffffff" />
            <circle cx="188" cy="148" r="1.5" fill="#ffffff" />

            {/* Intricate Butterfly Cell Venation */}
            <path
              d="M 138 128 Q 188 98 216 82 M 138 128 Q 182 118 214 118 M 138 128 Q 168 136 194 138"
              fill="none"
              stroke="rgba(255,255,255,0.6)"
              strokeWidth="1"
            />
            <path
              d="M 188 98 Q 202 108 214 118 M 182 118 Q 190 128 194 138"
              fill="none"
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="0.7"
            />

            {/* Right Forewing Luminous Eye-Spot */}
            <circle cx="196" cy="84" r="9.5" fill="url(#wingSpot)" />
            <circle cx="196" cy="84" r="4.8" fill="#ffffff" opacity="0.95" />
            <circle cx="196" cy="84" r="2" fill="#a855f7" />
          </g>

          {/* ==================================================== */}
          {/* 2. DELICATE BUTTERFLY ANTENNAE (तितली के एंटीना)     */}
          {/* ==================================================== */}
          <g>
            {/* Left Butterfly Antenna with Organic Flutter */}
            <g className="animate-antenna-left">
              <path
                d="M 112 68 Q 98 38 84 26 Q 76 18 68 22 Q 62 28 70 33 Q 80 33 86 42"
                fill="none"
                stroke="#e879f9"
                strokeWidth="2"
                strokeLinecap="round"
                filter="url(#fairySoftGlow)"
              />
              <circle cx="68" cy="22" r="3.8" fill="url(#antennaStar)" filter="url(#fairySoftGlow)" />
              <circle cx="68" cy="22" r="1.6" fill="#ffffff" />
            </g>

            {/* Right Butterfly Antenna with Organic Flutter */}
            <g className="animate-antenna-right">
              <path
                d="M 128 68 Q 142 38 156 26 Q 164 18 172 22 Q 178 28 170 33 Q 160 33 154 42"
                fill="none"
                stroke="#e879f9"
                strokeWidth="2"
                strokeLinecap="round"
                filter="url(#fairySoftGlow)"
              />
              <circle cx="172" cy="22" r="3.8" fill="url(#antennaStar)" filter="url(#fairySoftGlow)" />
              <circle cx="172" cy="22" r="1.6" fill="#ffffff" />
            </g>
          </g>

          {/* ==================================================== */}
          {/* 3. CUTE FAIRY BODY & PETAL DRESS (नन्ही तितली का बदन) */}
          {/* ==================================================== */}
          {/* Back Hair Flowing Locks */}
          <path
            d="M 85 95 C 65 140, 60 190, 92 215 C 105 195, 95 145, 100 110 Z"
            fill="url(#animeHair)"
            opacity="0.95"
          />
          <path
            d="M 155 95 C 175 140, 180 190, 148 215 C 135 195, 145 145, 140 110 Z"
            fill="url(#animeHair)"
            opacity="0.95"
          />

          {/* Petite Flower Petal Butterfly Dress */}
          <path
            d="M 98 160 C 90 195, 100 220, 120 225 C 140 220, 150 195, 142 160 Z"
            fill="url(#bfHindWing)"
            stroke="rgba(255,255,255,0.6)"
            strokeWidth="1"
          />
          {/* Dress Petal Frills */}
          <path
            d="M 102 180 Q 120 192 138 180 M 106 200 Q 120 210 134 200"
            fill="none"
            stroke="rgba(255,255,255,0.7)"
            strokeWidth="0.9"
          />
          {/* Tiny Fairy Bodice */}
          <path
            d="M 106 148 Q 120 156 134 148 L 138 168 Q 120 174 102 168 Z"
            fill="url(#animeHair)"
          />
          {/* Magical Butterfly Jewel on Dress */}
          <polygon
            points="120,154 124,160 120,166 116,160"
            fill="url(#antennaStar)"
            filter="url(#fairySoftGlow)"
          />

          {/* Dainty Tiny Fairy Arms */}
          <path
            d="M 104 150 Q 95 162 102 172"
            fill="none"
            stroke="url(#animeSkin)"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M 136 150 Q 145 162 138 172"
            fill="none"
            stroke="url(#animeSkin)"
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* Slender Fairy Neck */}
          <path
            d="M 114 135 L 126 135 L 125 148 L 115 148 Z"
            fill="url(#animeSkin)"
          />
          {/* Ribbon Choker */}
          <path
            d="M 114 142 Q 120 145 126 142"
            stroke="#f472b6"
            strokeWidth="1.6"
            fill="none"
          />

          {/* ==================================================== */}
          {/* 4. CUTE ANIME HEAD & CHIBI BLUSHING FACE             */}
          {/* ==================================================== */}
          {/* Soft Cute Rounded Anime Head Shape */}
          <path
            d="M 86 92 C 86 128, 104 145, 120 146 C 136 145, 154 128, 154 92 C 154 62, 86 62, 86 92 Z"
            fill="url(#animeSkin)"
          />

          {/* Cute Anime Blushing Cheeks (गुलाबी गाल और क्यूट ब्लश) */}
          <ellipse cx="98" cy="116" rx="8" ry="5.5" fill="#f43f5e" opacity="0.28" />
          <ellipse cx="142" cy="116" rx="8" ry="5.5" fill="#f43f5e" opacity="0.28" />
          {/* Anime Blush Diagonal Hatch Lines (///) */}
          <g stroke="#f43f5e" strokeWidth="1" strokeLinecap="round" opacity="0.5">
            <line x1="95" y1="117" x2="98" y2="114" />
            <line x1="99" y1="117" x2="102" y2="114" />
            <line x1="138" y1="117" x2="141" y2="114" />
            <line x1="142" y1="117" x2="145" y2="114" />
          </g>

          {/* ==================================================== */}
          {/* 5. BIG EXPRESSIVE SPARKLING ANIME EYES (एनिमी आँखें)  */}
          {/* ==================================================== */}
          {isBlinking || state === 'sleepy' ? (
            // Anime Cute Curved Closed/Blinking Eyes ( ^ ‿ ^ )
            <g stroke="#312e81" strokeWidth="2.8" strokeLinecap="round" fill="none">
              <path d="M 94 107 Q 103 113 112 106" />
              <path d="M 128 106 Q 137 113 146 107" />
              {/* Anime Eyelash details */}
              <line x1="94" y1="107" x2="91" y2="105" strokeWidth="2" />
              <line x1="146" y1="107" x2="149" y2="105" strokeWidth="2" />
            </g>
          ) : (
            // Open Giant Sparkling Anime Eyes
            <g>
              {/* Left Eye Eyelid Crease */}
              <path d="M 95 99 Q 103 96 111 99" stroke="#7c3aed" strokeWidth="1" fill="none" opacity="0.55" />
              {/* Right Eye Eyelid Crease */}
              <path d="M 129 99 Q 137 96 145 99" stroke="#7c3aed" strokeWidth="1" fill="none" opacity="0.55" />

              {/* Upper Anime Thick Eyelash Curve (Left) */}
              <path
                d="M 93 105 Q 103 94 113 104"
                stroke="#1e1b4b"
                strokeWidth="3.4"
                strokeLinecap="round"
                fill="none"
              />
              {/* Anime Eyelash Spike Flairs */}
              <path d="M 93 105 L 89 101 M 111 100 L 116 97" stroke="#1e1b4b" strokeWidth="2.2" strokeLinecap="round" />

              {/* Upper Anime Thick Eyelash Curve (Right) */}
              <path
                d="M 127 104 Q 137 94 147 105"
                stroke="#1e1b4b"
                strokeWidth="3.4"
                strokeLinecap="round"
                fill="none"
              />
              <path d="M 147 105 L 151 101 M 129 100 L 124 97" stroke="#1e1b4b" strokeWidth="2.2" strokeLinecap="round" />

              {/* Left Anime Eye Sclera & Iris */}
              <ellipse cx="103" cy="107" rx="8" ry="9" fill="#ffffff" />
              <ellipse cx="103" cy="108" rx="6.8" ry="8" fill="url(#animeIris)" />
              {/* Left Deep Pupil */}
              <ellipse cx="103" cy="107" rx="3.6" ry="4.5" fill="#0f172a" />
              {/* Left Iris Starburst Highlights */}
              <circle cx="105" cy="104" r="3" fill="#ffffff" />
              <circle cx="100.5" cy="111" r="1.6" fill="#ffffff" />
              <circle cx="104.5" cy="112" r="1.1" fill="#67e8f9" />
              <polygon points="103,111.5 104.2,112.7 103,113.9 101.8,112.7" fill="#fef08a" />

              {/* Right Anime Eye Sclera & Iris */}
              <ellipse cx="137" cy="107" rx="8" ry="9" fill="#ffffff" />
              <ellipse cx="137" cy="108" rx="6.8" ry="8" fill="url(#animeIris)" />
              {/* Right Deep Pupil */}
              <ellipse cx="137" cy="107" rx="3.6" ry="4.5" fill="#0f172a" />
              {/* Right Iris Starburst Highlights */}
              <circle cx="139" cy="104" r="3" fill="#ffffff" />
              <circle cx="134.5" cy="111" r="1.6" fill="#ffffff" />
              <circle cx="138.5" cy="112" r="1.1" fill="#67e8f9" />
              <polygon points="137,111.5 138.2,112.7 137,113.9 135.8,112.7" fill="#fef08a" />

              {/* Lower Anime Eye Rim */}
              <path d="M 97 114 Q 103 116 109 114" stroke="#4338ca" strokeWidth="1.2" fill="none" opacity="0.6" />
              <path d="M 131 114 Q 137 116 143 114" stroke="#4338ca" strokeWidth="1.2" fill="none" opacity="0.6" />

              {/* Delicate Anime Eyebrows */}
              <path
                d={
                  state === 'thinking'
                    ? 'M 94 94 Q 103 91 112 94'
                    : state === 'surprised'
                    ? 'M 94 88 Q 103 84 112 88'
                    : 'M 95 93 Q 103 90 111 93'
                }
                stroke="#581c87"
                strokeWidth="1.6"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d={
                  state === 'thinking'
                    ? 'M 128 94 Q 137 91 146 94'
                    : state === 'surprised'
                    ? 'M 128 88 Q 137 84 146 88'
                    : 'M 129 93 Q 137 90 145 93'
                }
                stroke="#581c87"
                strokeWidth="1.6"
                strokeLinecap="round"
                fill="none"
              />
            </g>
          )}

          {/* Tiny Cute Anime Nose Dot */}
          <circle cx="120" cy="119" r="1.1" fill="#f43f5e" opacity="0.75" />

          {/* ==================================================== */}
          {/* 6. ANIME MOUTH WITH LIP-SYNC (क्यूट एनिमी मुँह)       */}
          {/* ==================================================== */}
          {state === 'speaking' || audioSpeaking ? (
            // Dynamic speaking anime mouth (opens vertically/horizontally)
            <g>
              <ellipse
                cx="120"
                cy={127 + mouthOpenRatio * 1.8}
                rx={4.5 + mouthOpenRatio * 1.5}
                ry={2.5 + mouthOpenRatio * 4.5}
                fill="#be185d"
              />
              {/* Anime tongue shine */}
              <ellipse
                cx="120"
                cy={128 + mouthOpenRatio * 2.5}
                rx={3 + mouthOpenRatio * 0.8}
                ry={1.5 + mouthOpenRatio * 1.8}
                fill="#fb7185"
              />
              <path
                d="M 115 126 Q 120 124 125 126"
                stroke="#e11d48"
                strokeWidth="1.5"
                fill="none"
              />
            </g>
          ) : state === 'happy' ? (
            // Cute Anime Cat/Triangle Smile `▽` or `w`
            <path
              d="M 115 125 Q 118 128 120 126 Q 122 128 125 125"
              stroke="#e11d48"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
          ) : (
            // Gentle Sweet Anime Smile
            <path
              d="M 116 126 Q 120 129 124 126"
              stroke="#e11d48"
              strokeWidth="1.8"
              strokeLinecap="round"
              fill="none"
            />
          )}

          {/* ==================================================== */}
          {/* 7. FLUFFY ANIME HAIR & BUTTERFLY HAIR ACCESSORIES    */}
          {/* ==================================================== */}
          {/* Side Framing Locks (Cheek Locks) */}
          <path
            d="M 86 88 C 84 110, 80 135, 90 148 C 92 135, 91 108, 93 90 Z"
            fill="url(#animeHair)"
          />
          <path
            d="M 154 88 C 156 110, 160 135, 150 148 C 148 135, 149 108, 147 90 Z"
            fill="url(#animeHair)"
          />

          {/* Fluffy Anime Bangs with Distinct Strands */}
          <path
            d="M 86 82 C 92 60, 110 56, 120 57 C 132 56, 150 60, 154 82 C 147 72, 138 72, 134 85 C 130 73, 122 70, 117 87 C 114 74, 105 72, 101 88 C 96 75, 90 73, 86 82 Z"
            fill="url(#animeHair)"
          />

          {/* Anime Cute Ahoge (Top Bouncing Hair Antenna Strand) */}
          <path
            d="M 120 58 Q 118 36 128 32 Q 134 30 132 38 Q 128 46 122 56"
            fill="url(#animeHair)"
          />

          {/* Lustrous Anime Hair Halo Gloss */}
          <ellipse cx="120" cy="68" rx="22" ry="3.5" fill="url(#hairGloss)" opacity="0.65" />

          {/* Butterfly Hair Ornaments (Left & Right) */}
          {/* Left Little Butterfly Clip */}
          <g transform="translate(86, 75) scale(0.6)">
            <path d="M 0 0 C -10 -15, -25 0, 0 10 C 25 0, 10 -15, 0 0" fill="#38bdf8" />
            <circle cx="0" cy="0" r="3" fill="#ffffff" />
          </g>
          {/* Right Little Butterfly Clip */}
          <g transform="translate(154, 75) scale(0.6)">
            <path d="M 0 0 C 10 -15, 25 0, 0 10 C -25 0, -10 -15, 0 0" fill="#f472b6" />
            <circle cx="0" cy="0" r="3" fill="#ffffff" />
          </g>
        </svg>
      </div>
    </div>

      {/* Status Badge below Avatar */}
      {showStatusBadge && (
        <div
          className="mt-2.5 px-3 py-0.5 rounded-full text-[11px] font-medium tracking-wide flex items-center space-x-1.5 backdrop-blur-md border shadow-md transition-all duration-300"
          style={{
            borderColor: `${palette.primary}50`,
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            color: palette.secondary,
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full animate-ping"
            style={{ backgroundColor: palette.primary }}
          />
          <span>{getStatusLabel()}</span>
        </div>
      )}
    </div>
  );
};
