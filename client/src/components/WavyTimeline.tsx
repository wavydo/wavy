import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

type TimelineEvent = {
  id: string;
  year: string;
  month: string;
  title: string;
  isTop: boolean;
};

const WAVY_EVENTS: TimelineEvent[] = [
  { id: '2024-march', year: '2024', month: 'March', title: 'Platform launch connects businesses with customers', isTop: true },
  { id: '2024-may', year: '2024', month: 'May', title: 'Beta testing with 50 local businesses', isTop: false },
  { id: '2024-july', year: '2024', month: 'July', title: 'Rewards program goes live with cashback offers', isTop: true },
  { id: '2024-december', year: '2024', month: 'December', title: 'Customer app reaches 10,000 users', isTop: false },
  { id: '2025-april', year: '2025', month: 'April', title: 'Events feature enables business promotions', isTop: true },
  { id: '2025-september', year: '2025', month: 'September', title: 'Business dashboard with analytics launches', isTop: false },
  { id: '2026-may', year: '2026', month: 'May', title: 'International expansion worldwide', isTop: true },
];

type WavyTimelineProps = {
  title?: string;
  periodLabel?: string;
  activeColor?: string;
  textColor?: string;
  mutedTextColor?: string;
  backgroundColor?: string;
};

export default function WavyTimeline({
  title = 'Wavy Journey',
  periodLabel = '2024-2026',
  activeColor = '#5e79db',
  textColor = '#16141f',
  mutedTextColor = '#5c5969',
  backgroundColor = '#f3f3f6',
}: WavyTimelineProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!sectionRef.current || !sliderRef.current) return;

    const ctx = gsap.context(() => {
      const isMobile = window.innerWidth < 600;
      const slidePercent = isMobile ? -57 : -65;

      // Horizontal scroll animation
      gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: isMobile ? '82% 50%' : '92% bottom',
          scrub: true,
          pin: true,
        },
      }).fromTo(
        sliderRef.current,
        { xPercent: 0 },
        { xPercent: slidePercent }
      );

      // Animate the journey line
      gsap.to('.wavy-journey-line', {
        width: isMobile ? '65%' : '98%',
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: isMobile ? 'top 30%' : 'top 25%',
          end: isMobile ? '80% 50%' : '92% bottom',
          scrub: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const topEvents = WAVY_EVENTS.filter(e => e.isTop);
  const bottomEvents = WAVY_EVENTS.filter(e => !e.isTop);

  return (
    <section
      ref={sectionRef}
      id="journey"
      className="h-[200vh] w-full relative"
      style={{ backgroundColor }}
    >
      <div className="h-screen w-screen sticky top-0 pt-[10%] overflow-hidden">
        <div
          ref={sliderRef}
          className="flex h-[30vw] w-[240vw] items-center gap-[5vw] px-[5vw] max-[600px]:h-[80vh] max-[600px]:w-[800vw]"
        >
          <div className="relative h-full w-full">
            {/* Horizontal line */}
            <div className="w-full absolute left-0 top-[49%] flex items-center h-fit">
              <div
                className="h-[0.8vw] w-[0.8vw] rounded-full max-[600px]:h-[2vw] max-[600px]:w-[2vw]"
                style={{ backgroundColor: activeColor }}
              />
              <div
                className="wavy-journey-line h-px w-0 rounded-full"
                style={{ backgroundColor: activeColor }}
              />
              <div
                className="h-[0.8vw] w-[0.8vw] rounded-full max-[600px]:h-[2vw] max-[600px]:w-[2vw]"
                style={{ backgroundColor: activeColor }}
              />
            </div>

            {/* Top row */}
            <div className="flex h-1/2 w-full items-center justify-start gap-[0.5vw]">
              <div className="h-full w-[20%] pt-[2vw] max-[600px]:pt-[5vw]">
                <h2
                  className="w-[65%] text-[3vw] leading-[0.95] max-[600px]:text-[8.5vw]"
                  style={{ color: textColor }}
                >
                  {title}
                </h2>
              </div>

              <div className="w-full flex h-full gap-x-[15vw] max-[600px]:gap-x-[40vw]">
                {topEvents.map((event) => (
                  <div
                    key={event.id}
                    className="relative h-full w-[30vw] px-[3vw] max-[600px]:w-[70vw] max-[600px]:px-[7vw]"
                  >
                    {/* Vertical line and dot */}
                    <div className="w-full absolute left-0 bottom-0 top-0 h-full">
                      <div
                        className="size-[1vw] translate-x-[-50%] relative rounded-full max-[600px]:size-[2.5vw]"
                        style={{ backgroundColor: activeColor }}
                      />
                      <div
                        className="h-[94%] w-px origin-bottom rounded-full"
                        style={{ backgroundColor: activeColor }}
                      />
                    </div>

                    <div className="mt-[-1vw] space-y-[1vw] max-[600px]:mt-[-2vw]">
                      <h4
                        className="text-[2.5vw] leading-none max-[600px]:text-[6.4vw]"
                        style={{ color: textColor }}
                      >
                        {event.year} {event.month}
                      </h4>
                      <p
                        className="w-[90%] text-[1.5vw] leading-[1.15] max-[600px]:text-[4.8vw]"
                        style={{ color: mutedTextColor }}
                      >
                        {event.title}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom row */}
            <div className="h-1/2 flex items-center justify-start w-full">
              <div className="w-[34%] pt-[2vw] h-full max-[600px]:w-[30%] max-[600px]:pt-[5vw]">
                <p
                  className="text-[1.65vw] leading-none max-[600px]:text-[4.2vw]"
                  style={{ color: mutedTextColor }}
                >
                  {periodLabel}
                </p>
              </div>

              <div className="w-full flex h-full gap-x-[20vw] ml-[7vw] max-[600px]:gap-x-[40vw]">
                {bottomEvents.map((event) => (
                  <div
                    key={event.id}
                    className="relative h-full w-[25vw] px-[3vw] max-[600px]:w-[70vw] max-[600px]:px-[7vw]"
                  >
                    {/* Vertical line and dot */}
                    <div className="w-full absolute left-0 bottom-[-1%] h-full">
                      <div
                        className="h-[94%] origin-top w-px rounded-full"
                        style={{ backgroundColor: activeColor }}
                      />
                      <div
                        className="size-[1vw] translate-x-[-50%] relative rounded-full max-[600px]:size-[2.5vw]"
                        style={{ backgroundColor: activeColor }}
                      />
                    </div>

                    <div className="flex h-full w-full flex-col justify-end space-y-[1vw]">
                      <h4
                        className="text-[2.5vw] leading-none max-[600px]:text-[6.4vw]"
                        style={{ color: textColor }}
                      >
                        {event.year} {event.month}
                      </h4>
                      <p
                        className="w-[90%] text-[1.5vw] leading-[1.15] max-[600px]:text-[4.8vw]"
                        style={{ color: mutedTextColor }}
                      >
                        {event.title}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
