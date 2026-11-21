import { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

type TimelineEvent = {
  year: string;
  month: string;
  title: string;
  description: string;
};

type SimpleTimelineProps = {
  title?: string;
  subtitle?: string;
  events?: TimelineEvent[];
  primaryColor?: string;
  textColor?: string;
  backgroundColor?: string;
};

const DEFAULT_EVENTS: TimelineEvent[] = [
  {
    year: '2024',
    month: 'March',
    title: 'Platform Launch',
    description: 'Platform connects businesses with customers through proximity',
  },
  {
    year: '2024',
    month: 'May',
    title: 'Beta Testing',
    description: 'Beta testing with 50 local businesses validates core loyalty mechanics',
  },
  {
    year: '2024',
    month: 'July',
    title: 'Rewards Program',
    description: 'Rewards program goes live with first cashback offers at local merchants',
  },
  {
    year: '2024',
    month: 'December',
    title: '10K Users',
    description: 'Customer app reaches 10,000 users discovering nearby offers and events',
  },
  {
    year: '2025',
    month: 'April',
    title: 'Events Feature',
    description: 'Events feature enables businesses to promote experiences and drive foot traffic',
  },
  {
    year: '2025',
    month: 'September',
    title: 'Business Dashboard',
    description: 'Business dashboard launches with analytics and campaign management tools',
  },
  {
    year: '2026',
    month: 'May',
    title: 'Global Expansion',
    description: 'International expansion brings Wavy to new cities and markets worldwide',
  },
];

export default function SimpleTimeline({
  title = 'Our Journey',
  subtitle = '2024-2026',
  events = DEFAULT_EVENTS,
  primaryColor = '#5e79db',
  textColor = '#16141f',
  backgroundColor = '#f3f3f6',
}: SimpleTimelineProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!sectionRef.current || !containerRef.current) return;

    const ctx = gsap.context(() => {
      // Horizontal scroll animation
      const scrollWidth = containerRef.current!.scrollWidth - window.innerWidth;
      
      gsap.to(containerRef.current, {
        x: -scrollWidth,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: () => `+=${scrollWidth}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // Stagger fade in for items as they come into view
      gsap.set('.timeline-item', { opacity: 1, y: 0 });
    }, sectionRef);

    return () => ctx.revert();
  }, [events]);

  return (
    <section
      ref={sectionRef}
      id="journey"
      className="timeline-section"
      style={{
        backgroundColor,
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        ref={containerRef}
        style={{
          display: 'flex',
          alignItems: 'center',
          minHeight: '100vh',
          width: 'fit-content',
          paddingLeft: 'max(5vw, 40px)',
          paddingRight: 'max(5vw, 40px)',
        }}
      >
        {/* Header */}
        <div
          style={{
            minWidth: '40vw',
            maxWidth: '500px',
            marginRight: 'max(8vw, 80px)',
            flexShrink: 0,
            zIndex: 10,
          }}
        >
          <h2
            style={{
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: 800,
              color: textColor,
              marginBottom: '1rem',
              lineHeight: 1.1,
            }}
          >
            {title}
          </h2>
          <p
            style={{
              fontSize: 'clamp(1rem, 1.5vw, 1.25rem)',
              color: textColor,
              opacity: 0.6,
            }}
          >
            {subtitle}
          </p>
        </div>

        {/* Timeline */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'max(4vw, 60px)',
            position: 'relative',
            zIndex: 10,
          }}
        >
          {/* Line */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: 0,
              right: 0,
              height: '2px',
              backgroundColor: primaryColor,
              opacity: 0.3,
              zIndex: 0,
            }}
          />

          {/* Events */}
          {events.map((event, index) => (
            <div
              key={index}
              className={`timeline-item timeline-item-${index}`}
              style={{
                position: 'relative',
                minWidth: 'max(25vw, 300px)',
                maxWidth: '400px',
                padding: '2rem',
                backgroundColor: 'white',
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                zIndex: 1,
                opacity: 1,
              }}
            >
              {/* Dot */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  backgroundColor: primaryColor,
                  border: `4px solid ${backgroundColor}`,
                }}
              />

              <div
                style={{
                  fontSize: 'clamp(0.75rem, 1vw, 0.875rem)',
                  fontWeight: 600,
                  color: primaryColor,
                  marginBottom: '0.5rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {event.month} {event.year}
              </div>
              <h3
                style={{
                  fontSize: 'clamp(1.25rem, 1.8vw, 1.5rem)',
                  fontWeight: 700,
                  color: textColor,
                  marginBottom: '0.75rem',
                  lineHeight: 1.3,
                }}
              >
                {event.title}
              </h3>
              <p
                style={{
                  fontSize: 'clamp(0.875rem, 1.1vw, 1rem)',
                  color: textColor,
                  opacity: 0.7,
                  lineHeight: 1.6,
                }}
              >
                {event.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
