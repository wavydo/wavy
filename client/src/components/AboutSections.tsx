// Este es el contenido EXACTO de About.tsx copiado para usarse en Home
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function AboutSections() {
  const heroRef = useRef(null);
  const benefitsRef = useRef(null);
  const ctaRef = useRef(null);
  const howItWorksRef = useRef(null);
  
  const benefitsInView = useInView(benefitsRef, { once: true, amount: 0.15 });
  const ctaInView = useInView(ctaRef, { once: true, amount: 0.15 });
  
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  const { scrollYProgress: benefitsScroll } = useScroll({
    target: benefitsRef,
    offset: ["start end", "end start"]
  });
  
  const heroY = useTransform(heroScroll, [0, 1], [0, 200]);
  const heroOpacity = useTransform(heroScroll, [0, 0.5, 1], [1, 0.8, 0]);
  const benefitsY = useTransform(benefitsScroll, [0, 1], [100, -100]);

  // GSAP ScrollTrigger effects MEJORADOS
  useEffect(() => {
    // Refresh ScrollTrigger on mount to account for hero section
    ScrollTrigger.refresh();
    
    // Detectar si estamos en mobile
    const isMobile = () => window.innerWidth <= 768;
    
    // Parallax en "How It Works" cards
    const cards = gsap.utils.toArray('.how-it-works-card');
    cards.forEach((card: any, i) => {
      if (isMobile()) {
        // Mobile: movimiento muy sutil para mantener espaciado uniforme
        gsap.to(card, {
          y: i % 2 === 0 ? -15 : 15,
          rotation: i % 2 === 0 ? -0.5 : 0.5,
          scrollTrigger: {
            trigger: card,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.5,
          }
        });
      } else {
        // Desktop: mantener parallax dramático original
        gsap.to(card, {
          y: i % 2 === 0 ? -80 : 80,
          rotation: i % 2 === 0 ? -2 : 2,
          scrollTrigger: {
            trigger: card,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.5,
          }
        });
      }

      // Fade in/out según scroll
      gsap.to(card, {
        opacity: 1,
        scrollTrigger: {
          trigger: card,
          start: 'top bottom-=100',
          end: 'bottom top+=100',
          scrub: 0.5,
          toggleActions: 'play none none reverse'
        }
      });
    });

    // PIN SECTION: Benefits con HORIZONTAL SCROLL + FADE
    const benefitsSection = benefitsRef.current;
    if (benefitsSection) {
      const benefitsCards = gsap.utils.toArray('.benefits-card');
      
      // Pin la sección
      ScrollTrigger.create({
        trigger: benefitsSection,
        start: 'top top',
        end: () => `+=${benefitsCards.length * 100}%`, // Dinámico
        pin: true,
        anticipatePin: 1,
        scrub: 1,
      });

      // Horizontal scroll de las cards
      gsap.to(benefitsCards, {
        xPercent: -100 * (benefitsCards.length - 1),
        ease: 'none',
        scrollTrigger: {
          trigger: benefitsSection,
          start: 'top top',
          end: () => `+=${benefitsCards.length * 100}%`,
          scrub: 0.5,
        }
      });

      // Fade suave de cada card (SIN blur, SIN scale extremo)
      benefitsCards.forEach((card: any, i) => {
        ScrollTrigger.create({
          trigger: benefitsSection,
          start: 'top top',
          end: () => `+=${benefitsCards.length * 100}%`,
          scrub: 0.5,
          onUpdate: (self) => {
            const progress = self.progress * benefitsCards.length;
            const cardProgress = progress - i; // De 0 a 1 para cada card
            
            // Solo fade suave, nada de blur ni scale extremo
            let opacity = 1;
            if (cardProgress < 0) {
              opacity = 0.3; // Card anterior
            } else if (cardProgress > 1) {
              opacity = 0.3; // Card siguiente
            } else {
              opacity = 1; // Card actual
            }
            
            gsap.to(card, {
              opacity: opacity,
              duration: 0.1
            });
          }
        });
      });
      // Actualizar indicadores de progreso
      ScrollTrigger.create({
        trigger: benefitsSection,
        start: 'top top',
        end: () => `+=${benefitsCards.length * 100}%`,
        scrub: 0.5,
        onEnter: () => {
          // Mostrar indicadores cuando entramos a Benefits
          gsap.to('.benefits-progress-indicator', {
            opacity: 1,
            duration: 0.3
          });
        },
        onLeaveBack: () => {
          // Ocultar cuando salimos hacia atrás
          gsap.to('.benefits-progress-indicator', {
            opacity: 0,
            duration: 0.3
          });
        },
        onUpdate: (self) => {
          const progress = self.progress * benefitsCards.length;
          const activeIndex = Math.floor(progress);
          
          // Actualizar dots
          for (let i = 0; i < benefitsCards.length; i++) {
            const dot = document.querySelector(`.benefits-progress-dot-${i}`);
            if (dot) {
              if (i === activeIndex) {
                gsap.to(dot, {
                  background: 'rgba(255,255,255,0.9)',
                  scale: 1.3,
                  duration: 0.3
                });
              } else {
                gsap.to(dot, {
                  background: 'rgba(255,255,255,0.2)',
                  scale: 1,
                  duration: 0.3
                });
              }
            }
          }
        }
      });
    }

    // PIN SECTION: CTA con TEXTO CAMBIANTE + COUNTER ANIMADO
    const ctaSection = ctaRef.current;
    if (ctaSection) {
      // Ocultar indicadores cuando entramos al CTA
      ScrollTrigger.create({
        trigger: ctaSection,
        start: 'top bottom',
        onEnter: () => {
          gsap.to('.benefits-progress-indicator', {
            opacity: 0,
            duration: 0.3
          });
        }
      });

      const messages = [
        { title: 'Descuentos reales', subtitle: '10-25% en cada visita' },
        { title: 'Eventos exclusivos', subtitle: 'Descubre y asiste primero' },
        { title: 'Cashback automático', subtitle: 'Ahorra mientras disfrutas' },
        { title: 'Únete a TAPP', subtitle: 'La red que hace salir más rentable' }
      ];
      
      let currentIndex = 0;
      const ctaTitle = document.querySelector('.cta-animated-title');
      const ctaSubtitle = document.querySelector('.cta-animated-subtitle');
      const progressBar = document.querySelector('.cta-progress-bar');
      
      ScrollTrigger.create({
        trigger: ctaSection,
        start: 'top top',
        end: '+=400%', // Más largo para más control
        pin: true,
        anticipatePin: 1,
        scrub: 0.5,
        onUpdate: (self) => {
          // Update progress bar
          if (progressBar) {
            gsap.to(progressBar, {
              scaleX: self.progress,
              duration: 0.1
            });
          }

          // Change text based on progress
          const newIndex = Math.floor(self.progress * messages.length);
          if (newIndex !== currentIndex && newIndex < messages.length) {
            currentIndex = newIndex;
            const message = messages[currentIndex];
            
            if (ctaTitle) {
              gsap.to(ctaTitle, {
                opacity: 0,
                y: -30,
                scale: 0.95,
                duration: 0.3,
                ease: 'power2.in',
                onComplete: () => {
                  ctaTitle.textContent = message.title;
                  gsap.fromTo(ctaTitle, 
                    { opacity: 0, y: 30, scale: 0.95 },
                    { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: 'power2.out' }
                  );
                }
              });
            }
            
            if (ctaSubtitle) {
              gsap.to(ctaSubtitle, {
                opacity: 0,
                x: -20,
                duration: 0.2,
                onComplete: () => {
                  ctaSubtitle.textContent = message.subtitle;
                  gsap.fromTo(ctaSubtitle,
                    { opacity: 0, x: 20 },
                    { opacity: 1, x: 0, duration: 0.2 }
                  );
                }
              });
            }
          }
        }
      });

      // Animar stats con counter
      const stats = document.querySelectorAll('.cta-stat-value');
      stats.forEach((stat: any) => {
        const finalValue = stat.dataset.value;
        gsap.fromTo(stat,
          { textContent: '0' },
          {
            textContent: finalValue,
            duration: 2,
            scrollTrigger: {
              trigger: ctaSection,
              start: 'top center',
              toggleActions: 'play none none reverse'
            },
            snap: { textContent: 1 },
            onUpdate: function() {
              stat.textContent = Math.floor(this.targets()[0].textContent);
            }
          }
        );
      });
    }

    // Recalcular ScrollTrigger en resize para mobile/desktop switch
    const handleResize = () => {
      // Matar todos los ScrollTriggers y recrearlos
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      ScrollTrigger.refresh();
      
      // Recrear animaciones de cards
      const cards = gsap.utils.toArray('.how-it-works-card');
      cards.forEach((card: any, i) => {
        if (isMobile()) {
          gsap.to(card, {
            y: i % 2 === 0 ? -15 : 15,
            rotation: i % 2 === 0 ? -0.5 : 0.5,
            scrollTrigger: {
              trigger: card,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 0.5,
            }
          });
        } else {
          gsap.to(card, {
            y: i % 2 === 0 ? -80 : 80,
            rotation: i % 2 === 0 ? -2 : 2,
            scrollTrigger: {
              trigger: card,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 0.5,
            }
          });
        }
      });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="about-sections-container" style={{
      background: '#000',
      minHeight: '100vh',
      color: '#fff'
    }}>
      {/* Video Background - Fixed */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0
      }}>
        <video 
          src="/b2b.mp4" 
          autoPlay 
          playsInline 
          muted 
          loop 
          preload="auto"
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.75)',
          zIndex: 1
        }}></div>
      </div>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 10 }}>
        
        {/* Hero - Mejorado con tipografía balanceada */}
        <section 
          ref={heroRef}
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            position: 'relative'
          }}
        >
          <motion.div 
            style={{ 
              maxWidth: '1200px', 
              textAlign: 'center',
              y: heroY,
              opacity: heroOpacity,
              willChange: 'transform, opacity'
            }}
          >
            {/* Título en una línea */}
            <div style={{ overflow: 'hidden' }}>
              <motion.h1 
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  fontSize: 'clamp(2.5rem, 7vw, 5.5rem)',
                  fontWeight: 100,
                  letterSpacing: '-0.05em',
                  marginBottom: '3rem',
                  lineHeight: 1,
                  color: '#fff',
                  whiteSpace: 'nowrap'
                }}
              >
                Sal más, <span style={{ color: 'rgba(255,255,255,0.35)' }}>vive mejor</span>
              </motion.h1>
            </div>
            
            {/* Línea separadora */}
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              style={{
                width: '80px',
                height: '1px',
                background: 'rgba(255,255,255,0.15)',
                margin: '0 auto 2.5rem'
              }}
            />
            
            {/* Descripción en una línea */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              style={{
                fontSize: 'clamp(0.9rem, 1.8vw, 1.2rem)',
                color: 'rgba(255,255,255,0.4)',
                lineHeight: 1.4,
                fontWeight: 300,
                maxWidth: '900px',
                margin: '0 auto',
                letterSpacing: '-0.01em',
                whiteSpace: 'nowrap'
              }}
            >
              La red para todo lo que haces afuera
            </motion.p>
          </motion.div>
        </section>

        {/* How It Works */}
        <section 
          ref={howItWorksRef}
          style={{
            padding: '6rem 2rem',
            position: 'relative'
          }}
        >
          <div style={{
            maxWidth: '1400px',
            margin: '0 auto',
            width: '100%'
          }}>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              style={{
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                fontWeight: 300,
                marginBottom: '4rem',
                textAlign: 'center',
                letterSpacing: '-0.02em'
              }}
            >
              Cómo Funciona
            </motion.h2>

            <div 
              className="how-it-works-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '2rem'
              }}
            >
              {[
                { num: '01', title: 'Descubre', desc: 'Restaurantes, eventos y experiencias con beneficios reales' },
                { num: '02', title: 'Tap', desc: 'Activa descuentos, cashback y acceso exclusivo' },
                { num: '03', title: 'Disfruta', desc: 'Ahorra en cada visita mientras vives más' },
                { num: '04', title: 'Acumula', desc: 'Puntos que se convierten en más beneficios' }
              ].map((step, i) => (
                <motion.div
                  key={i}
                  className="how-it-works-card"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    padding: '2.5rem 2rem',
                    borderTop: '1px solid rgba(255,255,255,0.08)',
                    cursor: 'default',
                    willChange: 'transform',
                    pointerEvents: 'none'
                  }}
                >
                  <div style={{
                    fontSize: '0.7rem',
                    color: 'rgba(255,255,255,0.25)',
                    marginBottom: '1.5rem',
                    fontWeight: 500,
                    letterSpacing: '0.1em'
                  }}>
                    {step.num}
                  </div>
                  <h3 style={{
                    fontSize: '1.3rem',
                    fontWeight: 400,
                    marginBottom: '1rem',
                    color: 'rgba(255,255,255,0.95)'
                  }}>
                    {step.title}
                  </h3>
                  <p style={{
                    color: 'rgba(255,255,255,0.4)',
                    lineHeight: 1.7,
                    fontSize: '0.95rem',
                    fontWeight: 300
                  }}>
                    {step.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits - HORIZONTAL SCROLL PREMIUM con fade y scale */}
        <section 
          ref={benefitsRef}
          style={{
            position: 'relative',
            height: '100vh',
            overflow: 'hidden',
            background: '#000'
          }}
        >
          <div 
            className="benefits-container"
            style={{
              height: '100vh',
              display: 'flex',
              alignItems: 'center',
              width: '100%'
            }}
          >
            <div style={{
              display: 'flex',
              width: 'fit-content',
              gap: '0',
              paddingLeft: '0'
            }}>
              {[
                {
                  label: 'Perks',
                  title: 'Beneficios\nreales',
                  items: [
                    'Descuentos de 10-25% en restaurantes y establecimientos',
                    'Cashback automático en cada compra',
                    'Puntos TAPP que acumulas con cada visita',
                    'Ofertas exclusivas para miembros',
                    'Drops sorpresa con beneficios únicos'
                  ]
                },
                {
                  label: 'Events',
                  title: 'Experiencias\nexclusivas',
                  items: [
                    'Descubre eventos antes que nadie',
                    'Acceso anticipado y entradas exclusivas',
                    'Planes con amigos sin complicaciones',
                    'Divide gastos automáticamente con Fiao',
                    'Beneficios especiales en eventos TAPP'
                  ]
                },
                {
                  label: 'Network',
                  title: 'Una red\nque crece',
                  items: [
                    'Más de 100 establecimientos en la red',
                    'Nuevos lugares se integran cada semana',
                    'Cuanto más usas, más beneficios obtienes',
                    'Una sola tarjeta para todo',
                    'TAPP hace que salir sea más rentable'
                  ]
                }
              ].map((section, index) => (
                <div
                  key={index}
                  className="benefits-card"
                  style={{
                    minWidth: '100vw',
                    height: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '4rem',
                    position: 'relative'
                  }}
                >
                  {/* Número grande de fondo */}
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    fontSize: '25vw',
                    fontWeight: 100,
                    color: 'rgba(255,255,255,0.02)',
                    lineHeight: 1,
                    pointerEvents: 'none',
                    userSelect: 'none'
                  }}>
                    0{index + 1}
                  </div>

                  <div style={{
                    maxWidth: '700px',
                    width: '100%',
                    position: 'relative',
                    zIndex: 1
                  }}>
                    {/* Label */}
                    <div style={{
                      fontSize: '0.65rem',
                      color: 'rgba(255,255,255,0.25)',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.3em',
                      marginBottom: '1.5rem'
                    }}>
                      {section.label}
                    </div>

                    {/* Título principal - más pequeño */}
                    <h3 style={{
                      fontSize: 'clamp(2.5rem, 6vw, 4rem)',
                      fontWeight: 100,
                      color: '#fff',
                      letterSpacing: '-0.04em',
                      lineHeight: 1,
                      marginBottom: '3rem',
                      whiteSpace: 'pre-line'
                    }}>
                      {section.title}
                    </h3>

                    {/* Línea decorativa */}
                    <div style={{
                      width: '60px',
                      height: '1px',
                      background: 'rgba(255,255,255,0.15)',
                      marginBottom: '2.5rem'
                    }} />

                    {/* Items con mejor espaciado */}
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '1.5rem' 
                    }}>
                      {section.items.map((item, i) => (
                        <div
                          key={i}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '1rem',
                            opacity: 0.9
                          }}
                        >
                          <div style={{
                            width: '4px',
                            height: '4px',
                            background: 'rgba(255,255,255,0.2)',
                            borderRadius: '50%',
                            flexShrink: 0,
                            marginTop: '0.6rem'
                          }} />
                          <span style={{
                            color: 'rgba(255,255,255,0.6)',
                            fontSize: '0.95rem',
                            fontWeight: 300,
                            lineHeight: 1.6,
                            letterSpacing: '-0.01em'
                          }}>
                            {item}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Indicador de progreso - solo visible en la sección Benefits */}
          <div style={{
            position: 'fixed',
            bottom: '3rem',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '0.75rem',
            zIndex: 10,
            opacity: 0,
            pointerEvents: 'none'
          }}
          className="benefits-progress-indicator"
          >
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`benefits-progress-dot benefits-progress-dot-${i}`}
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.2)',
                  transition: 'all 0.3s ease'
                }}
              />
            ))}
          </div>
        </section>

        {/* CTA - Con TEXTO CAMBIANTE + PROGRESS BAR + SUBTITLE */}
        <section 
          ref={ctaRef}
          style={{
            padding: '0',
            position: 'relative',
            overflow: 'hidden',
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#000'
          }}
        >
          {/* Grid sutil de fondo */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
            pointerEvents: 'none',
            opacity: 0.5
          }} />

          {/* Progress bar superior */}
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'rgba(255,255,255,0.1)',
            zIndex: 100
          }}>
            <div 
              className="cta-progress-bar"
              style={{
                height: '100%',
                background: '#fff',
                transformOrigin: 'left',
                transform: 'scaleX(0)'
              }}
            />
          </div>
          
          <div style={{ 
            maxWidth: '1200px', 
            width: '100%',
            textAlign: 'center',
            margin: '0 auto',
            position: 'relative',
            zIndex: 1,
            padding: '2rem'
          }}>
            {/* Título en una línea */}
            <h2 
              className="cta-animated-title"
              style={{
                fontSize: 'clamp(2rem, 7vw, 5rem)',
                fontWeight: 100,
                lineHeight: 1,
                letterSpacing: '-0.05em',
                color: '#fff',
                marginBottom: '2rem',
                minHeight: '1em',
                transition: 'all 0.3s ease',
                whiteSpace: 'nowrap'
              }}
            >
              Únete a la comunidad
            </h2>

            {/* Subtitle en una línea */}
            <p 
              className="cta-animated-subtitle"
              style={{
                fontSize: 'clamp(0.85rem, 1.8vw, 1.1rem)',
                color: 'rgba(255,255,255,0.4)',
                marginBottom: '3rem',
                lineHeight: 1.4,
                fontWeight: 300,
                letterSpacing: '-0.01em',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              }}
            >
              Miles de vecinos ya forman parte
            </p>
            
            {/* Línea decorativa */}
            <div style={{
              width: '80px',
              height: '1px',
              background: 'rgba(255,255,255,0.1)',
              margin: '0 auto 4rem'
            }} />

            {/* Botones con mejor proporción */}
            <div style={{ 
              display: 'flex', 
              gap: '1rem', 
              justifyContent: 'center', 
              flexWrap: 'wrap',
              marginBottom: '6rem'
            }}>
              <motion.button
                onClick={() => window.location.href = '/auth'}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.99 }}
                transition={{ duration: 0.15 }}
                style={{
                  padding: '1rem 2.5rem',
                  background: '#fff',
                  border: 'none',
                  borderRadius: '0',
                  color: '#000',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                  minWidth: '180px'
                }}
              >
                Obtener TAPP
              </motion.button>
              
              <motion.button
                onClick={() => window.location.href = '/business'}
                whileHover={{ 
                  y: -2,
                  background: 'rgba(255,255,255,0.1)',
                  borderColor: 'rgba(255,255,255,0.3)'
                }}
                whileTap={{ scale: 0.99 }}
                transition={{ duration: 0.15 }}
                style={{
                  padding: '1rem 2.5rem',
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '0',
                  color: '#fff',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                  minWidth: '180px'
                }}
              >
                Para Negocios
              </motion.button>
            </div>

            {/* Stats con tamaño balanceado */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '4rem',
              maxWidth: '800px',
              margin: '0 auto',
              paddingTop: '3rem',
              borderTop: '1px solid rgba(255,255,255,0.06)'
            }}>
              {[
                { value: '25', label: 'Descuento' },
                { value: '0', label: 'Comisiones' },
                { value: '100', label: 'Local' }
              ].map((stat, i) => (
                <div 
                  key={i}
                  style={{ 
                    textAlign: 'center',
                    cursor: 'default'
                  }}
                >
                  <div 
                    className="cta-stat-value"
                    data-value={stat.value}
                    style={{
                      fontSize: 'clamp(2rem, 4vw, 3rem)',
                      fontWeight: 100,
                      color: '#fff',
                      marginBottom: '0.75rem',
                      letterSpacing: '-0.04em'
                    }}
                  >
                    {stat.value}
                  </div>
                  <div style={{
                    fontSize: '0.7rem',
                    color: 'rgba(255,255,255,0.25)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.3em',
                    fontWeight: 500
                  }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Estilos responsive para mobile - How It Works */}
      <style>{`
        @media (max-width: 768px) {
          .how-it-works-grid {
            display: flex !important;
            flex-direction: column !important;
            gap: 0.5rem !important;
            padding: 0 1rem !important;
            align-items: stretch !important;
          }

          .how-it-works-card {
            padding: 2rem 1.5rem !important;
            margin-bottom: 0 !important;
            width: 85% !important;
            max-width: 320px !important;
            aspect-ratio: 1 / 1 !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
          }

          /* Layout tipo snake - alternando derecha/izquierda */
          .how-it-works-card:nth-child(1) {
            align-self: flex-end !important;
            margin-right: 0 !important;
          }

          .how-it-works-card:nth-child(2) {
            align-self: flex-start !important;
            margin-left: 0 !important;
          }

          .how-it-works-card:nth-child(3) {
            align-self: flex-end !important;
            margin-right: 0 !important;
          }

          .how-it-works-card:nth-child(4) {
            align-self: flex-start !important;
            margin-left: 0 !important;
          }

          /* Tipografía más pequeña */
          .how-it-works-card div[style*="font-size: 0.7rem"] {
            font-size: 0.6rem !important;
          }

          .how-it-works-card h3 {
            font-size: 1.1rem !important;
          }

          .how-it-works-card p {
            font-size: 0.8rem !important;
            line-height: 1.5 !important;
          }
        }

        @media (max-width: 480px) {
          .how-it-works-grid {
            gap: 0.25rem !important;
          }

          .how-it-works-card {
            padding: 1.5rem 1.25rem !important;
            width: 90% !important;
            max-width: 280px !important;
          }

          .how-it-works-card div[style*="font-size: 0.7rem"] {
            font-size: 0.55rem !important;
          }

          .how-it-works-card h3 {
            font-size: 1rem !important;
          }

          .how-it-works-card p {
            font-size: 0.75rem !important;
          }
        }
      `}</style>
    </div>
  );
}
