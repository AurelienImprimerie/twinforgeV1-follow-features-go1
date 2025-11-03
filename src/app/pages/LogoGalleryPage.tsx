/**
 * Logo Gallery Page
 * Special page to present and select logo proposals for TWINFØRGE
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../../ui/cards/GlassCard';
import { Haptics } from '../../utils/haptics';

interface LogoProposal {
  id: string;
  name: string;
  description: string;
  svg: string;
  theme: string;
  style: string;
}

const logoProposals: LogoProposal[] = [
  {
    id: 'logo-1',
    name: 'Forge Hammer T',
    description: 'T massif et imposant comme un marteau de forge avec étincelles',
    theme: 'Puissance brute',
    style: 'Industriel moderne',
    svg: `<svg viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#FF6B35;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#F7931E;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#FDC830;stop-opacity:1" />
        </linearGradient>
        <filter id="glow1">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      <!-- Massive Hammer/T shape with beveled edges -->
      <path d="M 20 10 L 85 10 L 85 28 L 65 28 L 65 70 L 40 70 L 40 28 L 20 28 Z"
            fill="url(#grad1)" filter="url(#glow1)" stroke="#1e293b" stroke-width="3"/>

      <!-- Inner shadow for 3D effect -->
      <path d="M 23 13 L 82 13 L 82 25 L 65 25 L 65 67 L 40 67 L 40 25 L 23 25 Z"
            fill="none" stroke="#FFD700" stroke-width="1.5" opacity="0.5"/>

      <!-- Spark effects -->
      <circle cx="80" cy="18" r="3" fill="#FDC830" opacity="0.9">
        <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite"/>
        <animate attributeName="r" values="2;3.5;2" dur="1.5s" repeatCount="indefinite"/>
      </circle>
      <circle cx="25" cy="16" r="2.5" fill="#FF6B35" opacity="0.8">
        <animate attributeName="opacity" values="0.2;0.9;0.2" dur="2s" repeatCount="indefinite"/>
      </circle>
      <circle cx="75" cy="24" r="2" fill="#FDC830" opacity="0.7">
        <animate attributeName="opacity" values="0.3;0.8;0.3" dur="1.8s" repeatCount="indefinite"/>
      </circle>

      <!-- TWINFØRGE text -->
      <text x="95" y="38" font-family="'Inter', sans-serif" font-size="20" font-weight="900" fill="#ffffff" letter-spacing="1.5">
        TWIN
      </text>
      <text x="153" y="38" font-family="'Inter', sans-serif" font-size="20" font-weight="900" fill="#ffffff" letter-spacing="1.5">
        FØRGE
      </text>
      <path d="M 152 42 L 200 42" stroke="url(#grad1)" stroke-width="3"/>
    </svg>`
  },
  {
    id: 'logo-2',
    name: 'Anvil T',
    description: 'T intégré dans une enclume de forge stylisée',
    theme: 'Solidité et forge',
    style: 'Emblème classique',
    svg: `<svg viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad2" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#8B7355;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#5D4E37;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#3E342B;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="metallic" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#4A4A4A;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#9E9E9E;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#4A4A4A;stop-opacity:1" />
        </linearGradient>
      </defs>

      <!-- Anvil base -->
      <path d="M 25 45 L 25 55 L 70 55 L 70 45 L 60 40 L 35 40 Z" fill="url(#grad2)" stroke="#1e293b" stroke-width="2"/>

      <!-- T on anvil -->
      <path d="M 30 25 L 65 25 L 65 32 L 52 32 L 52 50 L 43 50 L 43 32 L 30 32 Z"
            fill="url(#metallic)" stroke="#FF6B35" stroke-width="2"/>

      <!-- TWINFØRGE text -->
      <text x="80" y="35" font-family="'Inter', sans-serif" font-size="18" font-weight="800" fill="#ffffff" letter-spacing="1">
        TWIN
      </text>
      <text x="135" y="35" font-family="'Inter', sans-serif" font-size="18" font-weight="800" fill="#FF6B35" letter-spacing="1">
        FØRGE
      </text>
    </svg>`
  },
  {
    id: 'logo-3',
    name: 'Fire T',
    description: 'T massif enflammé avec puissant effet de feu de forge',
    theme: 'Intensité du feu',
    style: 'Dynamique énergétique',
    svg: `<svg viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="fire" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" style="stop-color:#CC0000;stop-opacity:1" />
          <stop offset="30%" style="stop-color:#FF0000;stop-opacity:1" />
          <stop offset="60%" style="stop-color:#FF6B00;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#FFD700;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="fireCore" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" style="stop-color:#FF6B00;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#FFD700;stop-opacity:1" />
        </linearGradient>
        <filter id="fireGlow">
          <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      <!-- Massive Flame T with thick structure -->
      <path d="M 18 12 L 82 12 L 82 32 L 62 32 L 62 66 Q 62 72 52 72 Q 42 72 42 66 L 42 32 L 18 32 Z"
            fill="url(#fire)" filter="url(#fireGlow)" stroke="#660000" stroke-width="3"/>

      <!-- Inner core for depth -->
      <path d="M 22 16 L 78 16 L 78 28 L 62 28 L 62 64 Q 62 68 52 68 Q 42 68 42 64 L 42 28 L 22 28 Z"
            fill="url(#fireCore)" opacity="0.7"/>

      <!-- Multiple flame tips -->
      <path d="M 52 8 Q 48 3 52 -2 Q 56 3 52 8" fill="#FFD700" opacity="0.95">
        <animateTransform attributeName="transform" type="translate" values="0,0; 0,-4; 0,0" dur="0.9s" repeatCount="indefinite"/>
      </path>
      <path d="M 38 14 Q 36 10 38 6 Q 40 10 38 14" fill="#FF8C00" opacity="0.85">
        <animateTransform attributeName="transform" type="translate" values="0,0; 0,-3; 0,0" dur="1.1s" repeatCount="indefinite"/>
      </path>
      <path d="M 66 14 Q 64 10 66 6 Q 68 10 66 14" fill="#FF8C00" opacity="0.85">
        <animateTransform attributeName="transform" type="translate" values="0,0; 0,-3; 0,0" dur="1.3s" repeatCount="indefinite"/>
      </path>

      <!-- Heat shimmer particles -->
      <circle cx="28" cy="20" r="2" fill="#FFD700" opacity="0.7">
        <animate attributeName="opacity" values="0.3;1;0.3" dur="1.2s" repeatCount="indefinite"/>
        <animate attributeName="cy" values="20;10;20" dur="1.2s" repeatCount="indefinite"/>
      </circle>
      <circle cx="76" cy="22" r="2" fill="#FF8C00" opacity="0.7">
        <animate attributeName="opacity" values="0.4;1;0.4" dur="1.5s" repeatCount="indefinite"/>
        <animate attributeName="cy" values="22;12;22" dur="1.5s" repeatCount="indefinite"/>
      </circle>

      <!-- TWINFØRGE text -->
      <text x="92" y="38" font-family="'Inter', sans-serif" font-size="20" font-weight="900" fill="#ffffff" letter-spacing="1.5">
        TWIN
      </text>
      <text x="150" y="38" font-family="'Inter', sans-serif" font-size="20" font-weight="900" fill="#FFD700" letter-spacing="1.5">
        FØRGE
      </text>
      <circle cx="175" cy="30" r="3" fill="#FF6B00" opacity="0.9">
        <animate attributeName="opacity" values="0.4;1;0.4" dur="1s" repeatCount="indefinite"/>
      </circle>
    </svg>`
  },
  {
    id: 'logo-4',
    name: 'Metal T Shield',
    description: 'T dans un bouclier métallique avec effet forgé',
    theme: 'Protection et force',
    style: 'Héraldique moderne',
    svg: `<svg viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="shield" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#2C3E50;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#34495E;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#1A252F;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="tMetal" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#BDC3C7;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#ECF0F1;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#95A5A6;stop-opacity:1" />
        </linearGradient>
      </defs>

      <!-- Shield -->
      <path d="M 47.5 10 Q 47.5 10 50 12 Q 52.5 10 52.5 10 L 65 15 L 65 40 Q 65 55 50 65 Q 35 55 35 40 L 35 15 Z"
            fill="url(#shield)" stroke="#E67E22" stroke-width="2.5"/>

      <!-- T -->
      <path d="M 40 25 L 60 25 L 60 30 L 52.5 30 L 52.5 50 L 47.5 50 L 47.5 30 L 40 30 Z"
            fill="url(#tMetal)" stroke="#E67E22" stroke-width="1"/>

      <!-- TWINFØRGE text -->
      <text x="75" y="35" font-family="'Inter', sans-serif" font-size="18" font-weight="800" fill="#ffffff" letter-spacing="1">
        TWIN
      </text>
      <text x="130" y="35" font-family="'Inter', sans-serif" font-size="18" font-weight="800" fill="#E67E22" letter-spacing="1">
        FØRGE
      </text>
    </svg>`
  },
  {
    id: 'logo-5',
    name: 'Dual Ingot T',
    description: 'T formé par deux lingots métalliques jumeaux',
    theme: 'Dualité et forge',
    style: 'Minimaliste premium',
    svg: `<svg viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ingot1" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#C0392B;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#E74C3C;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#C0392B;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="ingot2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#7F8C8D;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#BDC3C7;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#7F8C8D;stop-opacity:1" />
        </linearGradient>
      </defs>

      <!-- Horizontal bar (ingot) -->
      <rect x="25" y="15" width="50" height="10" rx="2" fill="url(#ingot1)" stroke="#8B0000" stroke-width="1.5"/>

      <!-- Vertical bars (ingots) -->
      <rect x="45" y="25" width="10" height="40" rx="2" fill="url(#ingot2)" stroke="#2C3E50" stroke-width="1.5"/>
      <rect x="55" y="25" width="10" height="40" rx="2" fill="url(#ingot2)" stroke="#2C3E50" stroke-width="1.5"/>

      <!-- TWINFØRGE text -->
      <text x="80" y="35" font-family="'Inter', sans-serif" font-size="18" font-weight="800" fill="#ffffff" letter-spacing="1">
        TWIN
      </text>
      <text x="135" y="35" font-family="'Inter', sans-serif" font-size="18" font-weight="800" fill="#E74C3C" letter-spacing="1">
        FØRGE
      </text>
      <line x1="134" y1="38" x2="195" y2="38" stroke="#7F8C8D" stroke-width="2"/>
    </svg>`
  },
  {
    id: 'logo-6',
    name: 'Geometric Forge T',
    description: 'T avec formes géométriques évoquant une forge moderne',
    theme: 'Modernité technique',
    style: 'Géométrique tech',
    svg: `<svg viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="geom" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#3498DB;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#2980B9;stop-opacity:1" />
        </linearGradient>
      </defs>

      <!-- Geometric T -->
      <polygon points="25,15 75,15 75,28 58,28 58,65 42,65 42,28 25,28"
               fill="url(#geom)" stroke="#1ABC9C" stroke-width="2.5" stroke-linejoin="bevel"/>

      <!-- Corner accents -->
      <polygon points="25,15 35,15 25,25" fill="#1ABC9C" opacity="0.8"/>
      <polygon points="75,15 65,15 75,25" fill="#1ABC9C" opacity="0.8"/>
      <polygon points="42,65 42,55 52,55" fill="#16A085" opacity="0.6"/>
      <polygon points="58,65 58,55 48,55" fill="#16A085" opacity="0.6"/>

      <!-- TWINFØRGE text -->
      <text x="85" y="35" font-family="'Inter', sans-serif" font-size="18" font-weight="800" fill="#ffffff" letter-spacing="1">
        TWIN
      </text>
      <text x="140" y="35" font-family="'Inter', sans-serif" font-size="18" font-weight="800" fill="#1ABC9C" letter-spacing="1">
        FØRGE
      </text>
    </svg>`
  },
  {
    id: 'logo-7',
    name: 'Molten T',
    description: 'T liquide comme du métal en fusion',
    theme: 'Transformation fluide',
    style: 'Organique dynamique',
    svg: `<svg viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="molten" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#FFA500;stop-opacity:1" />
          <stop offset="30%" style="stop-color:#FF8C00;stop-opacity:1" />
          <stop offset="70%" style="stop-color:#FF6347;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#DC143C;stop-opacity:1" />
        </linearGradient>
        <filter id="liquidGlow">
          <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      <!-- Liquid T with drips -->
      <path d="M 28 15 Q 25 15 25 18 L 25 25 Q 25 28 28 28 L 43 28 L 43 60 Q 43 63 45 63
               L 43 66 Q 43 68 45 68 L 55 68 Q 57 68 57 66 L 55 63 Q 57 63 57 60
               L 57 28 L 72 28 Q 75 28 75 25 L 75 18 Q 75 15 72 15 Z"
            fill="url(#molten)" filter="url(#liquidGlow)" stroke="#8B0000" stroke-width="1"/>

      <!-- Dripping effect -->
      <ellipse cx="47" cy="70" rx="3" ry="4" fill="#DC143C" opacity="0.7">
        <animate attributeName="ry" values="4;5;4" dur="2s" repeatCount="indefinite"/>
      </ellipse>

      <!-- TWINFØRGE text -->
      <text x="85" y="35" font-family="'Inter', sans-serif" font-size="18" font-weight="800" fill="#ffffff" letter-spacing="1">
        TWIN
      </text>
      <text x="140" y="35" font-family="'Inter', sans-serif" font-size="18" font-weight="800" fill="#FF6347" letter-spacing="1">
        FØRGE
      </text>
    </svg>`
  },
  {
    id: 'logo-8',
    name: 'Rune Forge T',
    description: 'T nordique avec runes et style viking forge',
    theme: 'Héritage nordique',
    style: 'Rune mystique',
    svg: `<svg viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="rune" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#2C3E50;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#34495E;stop-opacity:1" />
        </linearGradient>
      </defs>

      <!-- Runic T with carved effect -->
      <path d="M 30 15 L 70 15 L 70 25 L 55 25 L 55 65 L 45 65 L 45 25 L 30 25 Z"
            fill="url(#rune)" stroke="#95A5A6" stroke-width="3"/>

      <!-- Rune marks on T -->
      <line x1="40" y1="20" x2="45" y2="20" stroke="#E67E22" stroke-width="2"/>
      <line x1="55" y1="20" x2="60" y2="20" stroke="#E67E22" stroke-width="2"/>
      <line x1="48" y1="35" x2="52" y2="35" stroke="#E67E22" stroke-width="2"/>
      <line x1="48" y1="50" x2="52" y2="50" stroke="#E67E22" stroke-width="2"/>

      <!-- Corner decorations -->
      <path d="M 28 13 L 33 13 L 28 18" stroke="#E67E22" stroke-width="1.5" fill="none"/>
      <path d="M 72 13 L 67 13 L 72 18" stroke="#E67E22" stroke-width="1.5" fill="none"/>

      <!-- TWINFØRGE text -->
      <text x="80" y="35" font-family="'Inter', sans-serif" font-size="18" font-weight="800" fill="#ffffff" letter-spacing="1">
        TWIN
      </text>
      <text x="135" y="35" font-family="'Inter', sans-serif" font-size="18" font-weight="800" fill="#E67E22" letter-spacing="1">
        FØRGE
      </text>
    </svg>`
  },
  {
    id: 'logo-9',
    name: 'Circuit T',
    description: 'T avec circuits électriques, forge technologique',
    theme: 'Tech et performance',
    style: 'Cyber forge',
    svg: `<svg viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="circuit" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#00D4FF;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#0099CC;stop-opacity:1" />
        </linearGradient>
      </defs>

      <!-- Main T -->
      <path d="M 28 15 L 72 15 L 72 24 L 56 24 L 56 65 L 44 65 L 44 24 L 28 24 Z"
            fill="none" stroke="url(#circuit)" stroke-width="3"/>

      <!-- Circuit nodes -->
      <circle cx="28" cy="15" r="3" fill="#00D4FF" stroke="#0099CC" stroke-width="1"/>
      <circle cx="72" cy="15" r="3" fill="#00D4FF" stroke="#0099CC" stroke-width="1"/>
      <circle cx="44" cy="65" r="3" fill="#00D4FF" stroke="#0099CC" stroke-width="1"/>
      <circle cx="56" cy="65" r="3" fill="#00D4FF" stroke="#0099CC" stroke-width="1"/>

      <!-- Circuit lines -->
      <line x1="25" y1="15" x2="20" y2="15" stroke="#00D4FF" stroke-width="2" opacity="0.6"/>
      <line x1="75" y1="15" x2="80" y2="15" stroke="#00D4FF" stroke-width="2" opacity="0.6"/>

      <!-- Pulse effect -->
      <circle cx="50" cy="45" r="4" fill="none" stroke="#00D4FF" stroke-width="1" opacity="0.8">
        <animate attributeName="r" values="4;8;4" dur="2s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.8;0;0.8" dur="2s" repeatCount="indefinite"/>
      </circle>

      <!-- TWINFØRGE text -->
      <text x="90" y="35" font-family="'Inter', sans-serif" font-size="18" font-weight="800" fill="#ffffff" letter-spacing="1">
        TWIN
      </text>
      <text x="145" y="35" font-family="'Inter', sans-serif" font-size="18" font-weight="800" fill="#00D4FF" letter-spacing="1">
        FØRGE
      </text>
    </svg>`
  },
  {
    id: 'logo-10',
    name: 'Crystalline T',
    description: 'T massif cristallisé comme du métal refroidi et solidifié',
    theme: 'Structure moléculaire',
    style: 'Cristal premium',
    svg: `<svg viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="crystal" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#A8E6CF;stop-opacity:1" />
          <stop offset="40%" style="stop-color:#3DD6D0;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#1BA39C;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="crystalLight" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#FFFFFF;stop-opacity:0.6" />
          <stop offset="50%" style="stop-color:#A8E6CF;stop-opacity:0.4" />
          <stop offset="100%" style="stop-color:#FFFFFF;stop-opacity:0.6" />
        </linearGradient>
        <filter id="crystalGlow">
          <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      <!-- Massive Crystalline T structure with geometric facets -->
      <polygon points="15,10 40,18 65,10 85,12 85,30 66,33 66,66 60,72 45,72 39,66 39,33 15,30 15,12"
               fill="url(#crystal)" filter="url(#crystalGlow)" stroke="#0D8479" stroke-width="3.5"/>

      <!-- Inner crystalline structure -->
      <polygon points="20,14 40,20 60,14 80,16 80,28 66,30 66,64 45,64 39,30 20,28 20,16"
               fill="url(#crystalLight)" opacity="0.5"/>

      <!-- Large crystal facets for 3D depth -->
      <polygon points="25,16 40,20 25,24" fill="#FFFFFF" opacity="0.6"/>
      <polygon points="55,16 40,20 55,24" fill="#FFFFFF" opacity="0.6"/>
      <polygon points="75,18 70,22 75,26" fill="#E0F7FA" opacity="0.5"/>

      <!-- Vertical facets -->
      <polygon points="45,38 39,43 45,48" fill="#FFFFFF" opacity="0.5"/>
      <polygon points="60,38 66,43 60,48" fill="#FFFFFF" opacity="0.5"/>
      <polygon points="45,52 39,58 45,64" fill="#E0F7FA" opacity="0.4"/>
      <polygon points="60,52 66,58 60,64" fill="#E0F7FA" opacity="0.4"/>

      <!-- Enhanced sparkle effects -->
      <circle cx="22" cy="18" r="2.5" fill="#FFFFFF" opacity="0.95">
        <animate attributeName="opacity" values="0.4;1;0.4" dur="1.3s" repeatCount="indefinite"/>
        <animate attributeName="r" values="2;3;2" dur="1.3s" repeatCount="indefinite"/>
      </circle>
      <circle cx="78" cy="18" r="2.5" fill="#FFFFFF" opacity="0.95">
        <animate attributeName="opacity" values="0.4;1;0.4" dur="1.7s" repeatCount="indefinite"/>
        <animate attributeName="r" values="2;3;2" dur="1.7s" repeatCount="indefinite"/>
      </circle>
      <circle cx="52" cy="12" r="2" fill="#A8E6CF" opacity="0.9">
        <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite"/>
      </circle>

      <!-- TWINFØRGE text -->
      <text x="95" y="38" font-family="'Inter', sans-serif" font-size="20" font-weight="900" fill="#ffffff" letter-spacing="1.5">
        TWIN
      </text>
      <text x="153" y="38" font-family="'Inter', sans-serif" font-size="20" font-weight="900" fill="#3DD6D0" letter-spacing="1.5">
        FØRGE
      </text>
      <line x1="152" y1="42" x2="200" y2="42" stroke="#1BA39C" stroke-width="3"/>
    </svg>`
  }
];

export default function LogoGalleryPage() {
  const [selectedLogo, setSelectedLogo] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'showcase'>('grid');

  const handleSelectLogo = (logoId: string) => {
    setSelectedLogo(logoId);
    Haptics.success();

    // Could save to localStorage or send to API
    localStorage.setItem('selectedLogo', logoId);
  };

  const selectedLogoData = logoProposals.find(logo => logo.id === selectedLogo);

  return (
    <div className="min-h-screen p-6 md:p-12" style={{
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)'
    }}>
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            TWIN<span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-red-500 to-orange-400">FØRGE</span>
          </h1>
          <p className="text-xl text-white/70 mb-2">Sélection du Logo Définitif</p>
          <p className="text-sm text-white/50 max-w-2xl mx-auto">
            Choisissez le logo qui représentera au mieux l'esprit de la forge et la dualité de votre application de training
          </p>
        </motion.div>

        {/* View Mode Toggle */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              viewMode === 'grid'
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/50'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            Vue Galerie
          </button>
          <button
            onClick={() => setViewMode('showcase')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              viewMode === 'showcase'
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/50'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            Vue Détaillée
          </button>
        </div>
      </div>

      {/* Grid View */}
      <AnimatePresence mode="wait">
        {viewMode === 'grid' && (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-7xl mx-auto"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {logoProposals.map((logo, index) => (
                <motion.div
                  key={logo.id}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <GlassCard
                    className={`p-6 cursor-pointer transition-all duration-300 ${
                      selectedLogo === logo.id
                        ? 'ring-4 ring-orange-500 shadow-2xl shadow-orange-500/50'
                        : 'hover:scale-105 hover:shadow-xl'
                    }`}
                    onClick={() => handleSelectLogo(logo.id)}
                  >
                    {/* Logo Preview */}
                    <div
                      className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl p-6 mb-4 flex items-center justify-center"
                      style={{ minHeight: '120px' }}
                      dangerouslySetInnerHTML={{ __html: logo.svg }}
                    />

                    {/* Logo Info */}
                    <div className="space-y-2">
                      <h3 className="text-lg font-bold text-white">{logo.name}</h3>
                      <p className="text-sm text-white/60">{logo.description}</p>

                      <div className="flex gap-2 pt-2">
                        <span className="px-2 py-1 rounded-lg text-xs font-semibold bg-orange-500/20 text-orange-300">
                          {logo.theme}
                        </span>
                        <span className="px-2 py-1 rounded-lg text-xs font-semibold bg-blue-500/20 text-blue-300">
                          {logo.style}
                        </span>
                      </div>

                      {selectedLogo === logo.id && (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-3 pt-3 border-t border-white/10"
                        >
                          <div className="flex items-center gap-2 text-green-400">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm font-semibold">Logo sélectionné</span>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Showcase View */}
        {viewMode === 'showcase' && (
          <motion.div
            key="showcase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-5xl mx-auto"
          >
            <div className="space-y-8">
              {logoProposals.map((logo, index) => (
                <motion.div
                  key={logo.id}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.08 }}
                >
                  <GlassCard
                    className={`p-8 cursor-pointer transition-all duration-300 ${
                      selectedLogo === logo.id
                        ? 'ring-4 ring-orange-500 shadow-2xl shadow-orange-500/50'
                        : 'hover:scale-102 hover:shadow-xl'
                    }`}
                    onClick={() => handleSelectLogo(logo.id)}
                  >
                    <div className="flex flex-col md:flex-row gap-8 items-center">
                      {/* Logo Large Preview */}
                      <div
                        className="flex-shrink-0 bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-8 flex items-center justify-center"
                        style={{ width: '300px', height: '150px' }}
                        dangerouslySetInnerHTML={{ __html: logo.svg }}
                      />

                      {/* Details */}
                      <div className="flex-1 space-y-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-2xl font-bold text-white">{logo.name}</h2>
                            {selectedLogo === logo.id && (
                              <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="px-3 py-1 rounded-full text-xs font-bold bg-green-500 text-white"
                              >
                                ✓ CHOISI
                              </motion.span>
                            )}
                          </div>
                          <p className="text-base text-white/70">{logo.description}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-white/50 mb-1">Thème</p>
                            <p className="text-sm font-semibold text-orange-400">{logo.theme}</p>
                          </div>
                          <div>
                            <p className="text-xs text-white/50 mb-1">Style</p>
                            <p className="text-sm font-semibold text-blue-400">{logo.style}</p>
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectLogo(logo.id);
                          }}
                          className={`w-full py-3 rounded-xl font-semibold transition-all ${
                            selectedLogo === logo.id
                              ? 'bg-green-500 text-white'
                              : 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-lg hover:shadow-orange-500/50'
                          }`}
                        >
                          {selectedLogo === logo.id ? 'Logo Sélectionné' : 'Choisir ce Logo'}
                        </button>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Footer */}
      {selectedLogo && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50"
        >
          <GlassCard className="px-8 py-4 shadow-2xl shadow-orange-500/30">
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-8"
                dangerouslySetInnerHTML={{ __html: selectedLogoData?.svg || '' }}
              />
              <div>
                <p className="text-sm text-white/70">Logo sélectionné</p>
                <p className="font-bold text-white">{selectedLogoData?.name}</p>
              </div>
              <button
                onClick={() => {
                  alert(`Logo "${selectedLogoData?.name}" sauvegardé! Il sera appliqué au prochain rechargement.`);
                  Haptics.success();
                }}
                className="ml-4 px-6 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold hover:shadow-lg hover:shadow-green-500/50 transition-all"
              >
                Confirmer le choix
              </button>
            </div>
          </GlassCard>
        </motion.div>
      )}
    </div>
  );
}
