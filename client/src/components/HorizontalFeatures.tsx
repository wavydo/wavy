import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

type Feature = {
  number: string;
  title: string;
  description: string;
  icon: JSX.Element;
  gradient: string;
};

const FEATURES: Feature[] = [
  {
    number: '01',
    title: 'Built for Real Life',
    description: 'Wavy works in the background while you live your life. No scanning QR codes, no complicated check-ins. Just walk in, and we\'ll let you know what\'s available.',
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
      </svg>
    ),
    gradient: 'from-blue-500/20 to-purple-500/20',
  },
  {
    number: '02',
    title: 'Privacy First',
    description: 'Your location data stays on your device. We only know you\'re near a place when you want us to. No tracking, no selling your data, no creepy surveillance.',
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
      </svg>
    ),
    gradient: 'from-purple-500/20 to-pink-500/20',
  },
  {
    number: '03',
    title: 'Location-Aware',
    description: 'Wavy knows where you are and shows you what\'s nearby. Walk into a place, and your phone lights up with what\'s available. No searching, no guessing—just instant access to offers around you.',
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"></path>
        <circle cx="12" cy="10" r="3"></circle>
      </svg>
    ),
    gradient: 'from-pink-500/20 to-orange-500/20',
  },
  {
    number: '04',
    title: 'Everything in One Place',
    description: 'Your rewards, offers, and favorite places all in one simple app. Check your balance, browse nearby deals, track your visits, and redeem instantly.',
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
        <line x1="12" y1="18" x2="12" y2="18"></line>
      </svg>
    ),
    gradient: 'from-orange-500/20 to-yellow-500/20',
  },
];

type HorizontalFeaturesProps = {
  title?: string;
  subtitle?: string;
  textColor?: string;
  accentColor?: string;
  bgColor?: string;
};

export default function HorizontalFeatures({
  title = 'Why Wavy is Different',
  subtitle = 'Not just another rewards app. A new way to experience your neighborhood.',
  textColor = '#16141f',
  accentColor = '#5e79db',
  bgColor = '#f3f3f6',
}: HorizontalFeaturesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!containerRef.current || !sliderRef.current) return;

    const ctx = gsap.context(() => {
      const scrollWidth = sliderRef.current!.scrollWidth - window.innerWidth;

      // Main horizontal scroll animation
      const mainTl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 20%',
          end: () => `+=${scrollWidth}`,
          scrub: 2.5,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      mainTl.to(sliderRef.current, {
        x: -scrollWidth,
        ease: 'none',
        force3D: true,
      });

      // Simple staggered card animations - no complex onUpdate
      mainTl.to('.feature-card-0', { opacity: 1, y: 0, ease: 'power1.out', duration: 0.15 }, 0);
      mainTl.to('.feature-card-1', { opacity: 1, y: 0, ease: 'power1.out', duration: 0.15 }, 0.15);
      mainTl.to('.feature-card-2', { opacity: 1, y: 0, ease: 'power1.out', duration: 0.15 }, 0.3);
      mainTl.to('.feature-card-3', { opacity: 1, y: 0, ease: 'power1.out', duration: 0.15 }, 0.45);

      // Set initial state
      gsap.set(['.feature-card-0', '.feature-card-1', '.feature-card-2', '.feature-card-3'], {
        opacity: 0,
        y: 20,
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        backgroundColor: bgColor,
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        paddingTop: 'clamp(60px, 8vw, 100px)',
      }}
    >
      <div
        ref={sliderRef}
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          paddingTop: 'clamp(60px, 8vw, 100px)',
          minHeight: 'calc(100vh - clamp(60px, 8vw, 100px))',
          width: 'fit-content',
          paddingLeft: 'max(5vw, 40px)',
          paddingRight: 'max(5vw, 40px)',
          gap: 'max(2vw, 32px)',
          willChange: 'transform',
          transform: 'translate3d(0, 0, 0)',
        }}
      >
        {/* Header Section */}
        <div
          style={{
            minWidth: 'min(450px, 85vw)',
            maxWidth: '500px',
            flexShrink: 0,
            paddingRight: 'max(3vw, 40px)',
          }}
        >
          <p
            style={{
              fontSize: 'clamp(11px, 1vw, 13px)',
              fontWeight: 600,
              color: textColor,
              opacity: 0.5,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              marginBottom: '1rem',
            }}
          >
            Features
          </p>
          <h2
            style={{
              fontSize: 'clamp(32px, 3.8vw, 52px)',
              fontWeight: 400,
              color: textColor,
              marginBottom: '1rem',
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
            }}
          >
            {title}
          </h2>
          <p
            style={{
              fontSize: 'clamp(13px, 1.2vw, 15px)',
              color: textColor,
              opacity: 0.6,
              lineHeight: 1.5,
              maxWidth: '28em',
            }}
          >
            {subtitle}
          </p>
        </div>

        {/* Feature Cards */}
        {FEATURES.map((feature, index) => (
          <div
            key={index}
            className={`feature-card-${index}`}
            style={{
              minWidth: 'min(400px, 85vw)',
              maxWidth: '420px',
              height: 'min(500px, 70vh)',
              background: `linear-gradient(135deg, ${accentColor}15, ${accentColor}05)`,
              borderRadius: '24px',
              padding: 'clamp(2rem, 4vw, 3rem)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              flexShrink: 0,
              border: `1px solid ${accentColor}20`,
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06)',
            }}
          >
            {/* Gradient overlay */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: `linear-gradient(to bottom right, transparent, ${bgColor}20)`,
                pointerEvents: 'none',
              }}
            />

            {/* Card Content */}
            <div style={{ position: 'relative', zIndex: 2 }}>
              <div
                style={{
                  fontSize: 'clamp(0.75rem, 0.9vw, 0.875rem)',
                  fontFamily: 'monospace',
                  color: textColor,
                  opacity: 0.4,
                  marginBottom: '2rem',
                  fontWeight: 500,
                }}
              >
                ( {feature.number} )
              </div>
              <div
                style={{
                  marginBottom: 'auto',
                  color: textColor,
                }}
              >
                {feature.icon}
              </div>
            </div>

            <div style={{ position: 'relative', zIndex: 2 }}>
              <h3
                style={{
                  fontSize: 'clamp(1.25rem, 1.8vw, 1.5rem)',
                  fontWeight: 400,
                  color: textColor,
                  marginBottom: '0.75rem',
                  letterSpacing: '0.02em',
                  lineHeight: 1.2,
                }}
              >
                {feature.title}
              </h3>
              <p
                style={{
                  fontSize: 'clamp(0.9rem, 1.1vw, 1rem)',
                  color: textColor,
                  opacity: 0.7,
                  lineHeight: 1.6,
                }}
              >
                {feature.description}
              </p>
            </div>
          </div>
        ))}

        {/* End Spacer */}
        <div
          style={{
            minWidth: '100px',
            height: '1px',
          }}
        />
      </div>
    </div>
  );
}
