import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

type Event = {
  id: string;
  year: string;
  month: string;
  description: string;
  position: 'top' | 'bottom';
};

const EVENTS: Event[] = [
  { id: '1', year: '2024', month: 'March', description: 'Platform launch connects businesses with customers', position: 'top' },
  { id: '2', year: '2024', month: 'May', description: 'Beta testing with 50 local businesses', position: 'bottom' },
  { id: '3', year: '2024', month: 'July', description: 'Rewards program goes live', position: 'top' },
  { id: '4', year: '2024', month: 'December', description: '10,000 users discovering offers', position: 'bottom' },
  { id: '5', year: '2025', month: 'April', description: 'Events feature launches', position: 'top' },
  { id: '6', year: '2025', month: 'September', description: 'Business dashboard with analytics', position: 'bottom' },
  { id: '7', year: '2026', month: 'May', description: 'International expansion', position: 'top' },
];

type JourneyTimelineProps = {
  title?: string;
  subtitle?: string;
  activeColor?: string;
  textColor?: string;
  mutedColor?: string;
  bgColor?: string;
};

export default function JourneyTimeline({
  title = 'Wavy Journey',
  subtitle = '2024-2026',
  activeColor = '#5e79db',
  textColor = '#16141f',
  mutedColor = '#5c5969',
  bgColor = '#f3f3f6',
}: JourneyTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!containerRef.current || !sliderRef.current) return;

    const ctx = gsap.context(() => {
      const scrollWidth = sliderRef.current!.scrollWidth - window.innerWidth;

      // Pin the container and scroll horizontally
      gsap.to(sliderRef.current, {
        x: -scrollWidth,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: () => `+=${scrollWidth + window.innerHeight * 2}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // Animate the line
      gsap.fromTo(
        '.journey-progress-line',
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top top',
            end: () => `+=${scrollWidth + window.innerHeight * 2}`,
            scrub: 1,
          },
        }
      );

      // Animate events appearing
      EVENTS.forEach((event, i) => {
        gsap.fromTo(
          `.event-${event.id}`,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            scrollTrigger: {
              trigger: containerRef.current,
              start: `top+=${(i / EVENTS.length) * 40}% top`,
              end: `top+=${(i / EVENTS.length) * 40 + 15}% top`,
              scrub: 1,
            },
          }
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="journey-timeline-container"
      style={{
        backgroundColor: bgColor,
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        ref={sliderRef}
        style={{
          display: 'flex',
          alignItems: 'center',
          minHeight: '100vh',
          width: 'fit-content',
          paddingLeft: 'max(5vw, 40px)',
          paddingRight: 'max(5vw, 40px)',
        }}
      >
        {/* Title Section */}
        <div
          style={{
            minWidth: 'max(35vw, 400px)',
            marginRight: 'max(8vw, 100px)',
            flexShrink: 0,
          }}
        >
          <h2
            style={{
              fontSize: 'clamp(2.5rem, 4vw, 3.5rem)',
              fontWeight: 800,
              color: textColor,
              marginBottom: '1rem',
              lineHeight: 1,
            }}
          >
            {title}
          </h2>
          <p
            style={{
              fontSize: 'clamp(1rem, 1.5vw, 1.2rem)',
              color: mutedColor,
            }}
          >
            {subtitle}
          </p>
        </div>

        {/* Timeline Track */}
        <div
          style={{
            position: 'relative',
            minHeight: '60vh',
            display: 'flex',
            alignItems: 'center',
            minWidth: `${EVENTS.length * 400 + 200}px`,
          }}
        >
          {/* Main horizontal line container */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '0',
              right: '0',
              height: '2px',
              backgroundColor: activeColor,
              opacity: 0.2,
              transform: 'translateY(-50%)',
              zIndex: 1,
            }}
          >
            <div
              className="journey-progress-line"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                height: '100%',
                width: '100%',
                backgroundColor: activeColor,
                transformOrigin: 'left',
              }}
            />
          </div>

          {/* Events positioned absolutely along the line */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '60vh',
            }}
          >
            {EVENTS.map((event, index) => {
              const leftPosition = index * 400;
              const isTop = event.position === 'top';

              return (
                <div
                  key={event.id}
                  className={`event-${event.id}`}
                  style={{
                    position: 'absolute',
                    left: `${leftPosition}px`,
                    top: isTop ? '20%' : '55%',
                    width: '320px',
                    zIndex: 2,
                  }}
                >
                  {/* Vertical connector line */}
                  <div
                    style={{
                      position: 'absolute',
                      left: '20px',
                      top: isTop ? 'auto' : '0',
                      bottom: isTop ? '0' : 'auto',
                      width: '2px',
                      height: isTop ? '25%' : '80px',
                      backgroundColor: activeColor,
                      transform: 'translateX(-50%)',
                    }}
                  />
                  
                  {/* Dot on the line */}
                  <div
                    style={{
                      position: 'absolute',
                      left: '20px',
                      top: isTop ? 'auto' : '80px',
                      bottom: isTop ? '0' : 'auto',
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: activeColor,
                      border: `3px solid ${bgColor}`,
                      transform: 'translate(-50%, 0)',
                      zIndex: 3,
                    }}
                  />

                  {/* Event content */}
                  <div
                    style={{
                      paddingLeft: '45px',
                      paddingRight: '20px',
                    }}
                  >
                    <div
                      style={{
                        fontSize: 'clamp(0.75rem, 0.9vw, 0.875rem)',
                        fontWeight: 600,
                        color: activeColor,
                        marginBottom: '0.5rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {event.month} {event.year}
                    </div>
                    <p
                      style={{
                        fontSize: 'clamp(0.9rem, 1.1vw, 1.05rem)',
                        color: textColor,
                        lineHeight: 1.5,
                        fontWeight: 400,
                      }}
                    >
                      {event.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
