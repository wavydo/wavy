"use client";

import * as React from "react";
import { ArrowUpRight } from "lucide-react";

export interface NotchedCardProps {
  href: string;
  title: string;
  description?: string;
  image: string;
  imageAlt?: string;
  badge?: string;
  tags?: string[];
  screen?: { src: string; alt: string; className?: string };
  dim?: number;
  monochrome?: boolean;
  surface?: string;
  accent?: string;
  accentForeground?: string;
  className?: string;
}

const DISC = 64;
const BLOCK = 80;
const FILLET = 28;

export function NotchedCard({
  href,
  title,
  description,
  image,
  imageAlt = "",
  badge,
  tags = [],
  screen,
  dim = screen ? 0.45 : 0,
  monochrome = false,
  surface = "#ffffff",
  accent,
  accentForeground = "#0a0a0a",
  className = "",
}: NotchedCardProps) {
  const tone = monochrome
    ? "grayscale transition-[filter,scale] duration-500 group-hover:grayscale-0 group-focus-visible:grayscale-0"
    : "transition-[scale] duration-500";

  return (
    <a
      href={href}
      className={`group flex flex-col rounded-[28px] outline-none focus-visible:ring-2 focus-visible:ring-offset-4 ${className}`}
      style={{ 
        textDecoration: 'none',
        color: 'inherit'
      }}
    >
      <div className="relative">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[28px]" style={{ background: '#f5f5f5' }}>
          <img
            src={image}
            alt={screen ? "" : imageAlt}
            className={`absolute inset-0 h-full w-full object-cover ${tone} ${!screen && "group-hover:scale-[1.04]"}`}
          />
          {dim > 0 && (
            <div aria-hidden className="absolute inset-0" style={{ backgroundColor: `rgb(0 0 0 / ${dim})` }} />
          )}
          {screen && (
            <img
              src={screen.src}
              alt={screen.alt}
              className={`absolute bottom-0 right-0 w-[82%] origin-bottom-right ${tone} group-hover:scale-[1.07]`}
              style={{
                filter: 'drop-shadow(0 18px 40px rgba(0,0,0,0.5))',
                transition: 'all 0.5s ease'
              }}
            />
          )}
          {badge && (
            <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center pt-4">
              <span 
                className="rounded-full px-2.5 py-1 text-[11px] font-medium text-white"
                style={{
                  border: '1px solid rgba(255,255,255,0.4)',
                  background: 'rgba(0,0,0,0.3)',
                  backdropFilter: 'blur(12px)'
                }}
              >
                {badge}
              </span>
            </div>
          )}
        </div>

        {/* Notch layers */}
        <div
          aria-hidden
          className="absolute bottom-0 right-0"
          style={{ 
            width: BLOCK, 
            height: BLOCK, 
            borderTopLeftRadius: BLOCK - DISC / 2, 
            background: surface 
          }}
        />
        {[
          { bottom: BLOCK, right: 0 },
          { bottom: 0, right: BLOCK },
        ].map((pos, i) => (
          <div
            key={i}
            aria-hidden
            className="absolute"
            style={{
              ...pos,
              width: FILLET,
              height: FILLET,
              background: `radial-gradient(circle at top left, transparent ${FILLET - 0.5}px, ${surface} ${FILLET}px)`,
            }}
          />
        ))}

        {/* Arrow disc */}
        <span
          aria-hidden
          className="absolute bottom-0 right-0 flex items-center justify-center rounded-full transition-all duration-300 group-hover:scale-105"
          style={{
            width: DISC,
            height: DISC,
            background: accent || 'var(--ink, #0a0a0a)',
            color: accentForeground,
          }}
        >
          <ArrowUpRight 
            className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" 
            size={20}
          />
        </span>
      </div>

      <h3 
        className="mt-5 text-2xl font-medium tracking-tight" 
        style={{ color: 'var(--ink, #0a0a0a)' }}
      >
        {title}
      </h3>
      {description && (
        <p 
          className="mt-2 text-sm leading-relaxed" 
          style={{ color: 'var(--muted, #64748b)' }}
        >
          {description}
        </p>
      )}
      {tags.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2">
          {tags.map((t, i) => (
            <li
              key={`${t}-${i}`}
              className="rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-wider"
              style={{
                background: 'rgba(14, 17, 22, 0.04)',
                color: 'var(--muted, #64748b)'
              }}
            >
              {t}
            </li>
          ))}
        </ul>
      )}
    </a>
  );
}

export default NotchedCard;
