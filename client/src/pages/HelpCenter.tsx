import { useState, useLayoutEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { ChevronDown } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function HelpCenter() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [, setLocation] = useLocation();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.help-hero-title',
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
      );
      
      gsap.fromTo('.help-hero-subtitle',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, delay: 0.2, ease: 'power3.out' }
      );

      gsap.fromTo('.help-search',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, delay: 0.3, ease: 'power3.out' }
      );

      const categoryCards = document.querySelectorAll('.category-card');
      if (categoryCards.length > 0) {
        gsap.fromTo('.category-card',
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out',
            scrollTrigger: { trigger: '.categories-section', start: 'top 75%' }
          }
        );
      }

      const faqCards = document.querySelectorAll('.faq-card');
      if (faqCards.length > 0) {
        gsap.fromTo('.faq-card',
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, stagger: 0.05, ease: 'power3.out',
            scrollTrigger: { trigger: '.faqs-section', start: 'top 70%' }
          }
        );
      }
    }, rootRef);

    return () => ctx.revert();
  }, []);

  const onLink = (e: React.MouseEvent, href: string) => {
    if (href.startsWith("/")) {
      e.preventDefault();
      window.scrollTo(0, 0);
      setLocation(href);
    }
  };

  const allFaqs = [
    // Getting Started
    { q: 'What is Wavy?', a: 'Wavy shows you offers and rewards from places nearby. Walk past a restaurant with a deal, your phone tells you. No searching, no scanning QR codes.', cat: 'getting-started' },
    { q: 'How do I get started?', a: 'Download the app, turn on location services, and that\'s it. When you\'re near a place with an offer, you\'ll get a notification.', cat: 'getting-started' },
    { q: 'Do I need to create an account?', a: 'Yes, but it takes 30 seconds. We need an account to track your rewards and make sure offers work correctly.', cat: 'getting-started' },
    { q: 'What phone do I need?', a: 'iPhone running iOS 14 or later, or Android 8.0 or later. Basically any phone from the last few years.', cat: 'getting-started' },
    { q: 'Does it work on tablets?', a: 'It works, but it\'s built for phones. Offers are about where you are physically, and most people don\'t carry tablets around.', cat: 'getting-started' },
    { q: 'Can I use it without internet?', a: 'You need a connection to see offers. Once you see an offer, you can redeem it even if you lose signal briefly.', cat: 'getting-started' },
    { q: 'How do I turn on notifications?', a: 'The app will ask when you first open it. If you said no, go to your phone settings → Wavy → Notifications and turn them on.', cat: 'getting-started' },
    { q: 'What if I don\'t get notifications?', a: 'Check that notifications are enabled, location is set to "always allow," and you have a data connection. Still not working? Email us.', cat: 'getting-started' },
    { q: 'Do I need to keep the app open?', a: 'No. As long as location services are on, you\'ll get notifications even when the app is closed.', cat: 'getting-started' },
    { q: 'How do I know if a place is on Wavy?', a: 'If they have an offer, you\'ll get a notification when you\'re close. You can also browse nearby places in the app.', cat: 'getting-started' },
    
    // Using Wavy
    { q: 'How close do I need to be?', a: 'Usually within a block or two. The exact range depends on the business and the offer.', cat: 'getting-started' },
    { q: 'Can I see offers before I go?', a: 'Not yet. Wavy is about discovering things as you move around, not planning ahead. That might change.', cat: 'getting-started' },
    { q: 'Do offers expire?', a: 'Some do. Each offer shows its expiration if it has one. Most are available all day or all week.', cat: 'getting-started' },
    { q: 'Can I use the same offer twice?', a: 'Depends on the offer. Some are one-time, some are daily, some are unlimited. It\'ll say in the details.', cat: 'getting-started' },
    { q: 'Do I need to show my phone to redeem?', a: 'Just tell them you\'re using Wavy. They\'ll confirm on their end. No QR codes, no screenshots.', cat: 'getting-started' },
    { q: 'What if I forget to mention Wavy?', a: 'Mention it before you pay. If you forget, you can still show them the offer in your app and they can apply it.', cat: 'getting-started' },
    { q: 'Can I combine offers with other discounts?', a: 'That\'s up to the business. Most will honor their own discounts alongside Wavy, but ask first.', cat: 'getting-started' },
    { q: 'Do I need to favorite places?', a: 'No, but you can. Favoriting a place means you\'ll get notifications about their offers even if you\'re not right next to them.', cat: 'getting-started' },
    { q: 'How do I unfavorite a place?', a: 'Go to the place\'s page in the app and tap the heart again.', cat: 'getting-started' },
    { q: 'Can I block certain types of offers?', a: 'Not yet. But if there\'s something you never want to see, let us know and we\'ll consider building it.', cat: 'getting-started' },
    
    // Privacy & Data
    { q: 'Is it really free?', a: 'Yes. No subscription, no hidden fees. Businesses pay to reach you, not the other way around.', cat: 'privacy' },
    { q: 'How does Wavy make money?', a: 'Businesses pay us to show their offers to people nearby. You get the deals for free, they get customers. Everyone wins.', cat: 'privacy' },
    { q: 'What about my location data?', a: 'We use your location to show you what\'s nearby right now. We don\'t sell it, we don\'t track where you go, and we don\'t build a history of your movements. When you close the app, we forget.', cat: 'privacy' },
    { q: 'Do you sell my data?', a: 'No. We don\'t sell your location, your purchase history, or anything else. That\'s not our business model.', cat: 'privacy' },
    { q: 'What data do you collect?', a: 'Your location when the app is active, what offers you see, what you redeem. We need that to make Wavy work.', cat: 'privacy' },
    { q: 'Can I delete my data?', a: 'Yes. Go to Settings → Privacy → Delete My Data. This removes everything we have about you.', cat: 'privacy' },
    { q: 'Do you track me when I\'m not using the app?', a: 'No. We only use your location to show nearby offers. We don\'t build a map of where you\'ve been.', cat: 'privacy' },
    { q: 'Can businesses see who redeemed offers?', a: 'They see that someone redeemed an offer, but not your personal details unless you share them directly.', cat: 'privacy' },
    { q: 'What about payment info?', a: 'We don\'t handle payments. You pay the business directly. We never see your credit card.', cat: 'privacy' },
    { q: 'Is my account secure?', a: 'Yes. We use industry-standard encryption and security practices. Your password is hashed, your data is encrypted.', cat: 'privacy' },
    { q: 'What if I lose my phone?', a: 'Log in on a new phone with your email and password. Your favorites and history will be there.', cat: 'privacy' },
    { q: 'Can I use Wavy on multiple devices?', a: 'Yes. Log in with the same account and everything syncs.', cat: 'privacy' },
    { q: 'Do you send marketing emails?', a: 'Only if you opt in. We\'ll send you updates about Wavy, but you can unsubscribe anytime.', cat: 'privacy' },
    { q: 'Can I turn off location tracking?', a: 'If you turn off location, Wavy won\'t work. The whole point is showing you what\'s nearby.', cat: 'privacy' },
    { q: 'Do you use cookies?', a: 'On the website, yes, for basic analytics. In the app, no cookies—just standard mobile analytics.', cat: 'privacy' },
    
    // Problems & Support
    { q: 'What if a business doesn\'t honor an offer?', a: 'Let us know immediately through the app. We\'ll follow up with them and make it right with you.', cat: 'support' },
    { q: 'The app is crashing. What do I do?', a: 'Try closing and reopening it. If that doesn\'t work, restart your phone. Still broken? Email us at hello@wavy.do.', cat: 'support' },
    { q: 'I\'m not getting notifications.', a: 'Check Settings → Notifications. Make sure Wavy is allowed. Also check that location is set to "always allow."', cat: 'support' },
    { q: 'An offer isn\'t showing up.', a: 'Refresh the app. If it\'s still missing, it might have expired or the business paused it. Email us if you think it\'s a bug.', cat: 'support' },
    { q: 'How do I report a bug?', a: 'Tap Settings → Help → Report a Bug, or email hello@wavy.do with details about what happened.', cat: 'support' },
    { q: 'How do I contact support?', a: 'Email hello@wavy.do or use the contact form on our website. We respond within 24 hours, usually much faster.', cat: 'support' },
    { q: 'Can I suggest a feature?', a: 'Absolutely. Email us or use the feedback option in the app. We read everything.', cat: 'support' },
    { q: 'Why is the app so slow?', a: 'Could be your connection, or we might be having issues. Try switching between WiFi and cellular. If it persists, let us know.', cat: 'support' },
    { q: 'I forgot my password.', a: 'Tap "Forgot Password" on the login screen. We\'ll send you a reset link.', cat: 'support' },
    { q: 'I never got the password reset email.', a: 'Check your spam folder. Still nothing? Email hello@wavy.do and we\'ll help you manually.', cat: 'support' },
    { q: 'How do I change my email?', a: 'Go to Settings → Account → Change Email. You\'ll need to verify the new one.', cat: 'support' },
    { q: 'How do I change my password?', a: 'Settings → Account → Change Password.', cat: 'support' },
    { q: 'Can I delete my account?', a: 'Yes. Settings → Account → Delete Account. This is permanent.', cat: 'support' },
    { q: 'I deleted my account by accident.', a: 'If it\'s been less than 30 days, email us and we might be able to restore it.', cat: 'support' },
    { q: 'The map isn\'t loading.', a: 'Check your internet connection. If it\'s fine, try closing and reopening the app.', cat: 'support' },
    
    // Availability & Coverage
    { q: 'Can I use Wavy anywhere?', a: 'We\'re starting in the Dominican Republic and expanding from there. If you\'re somewhere else and want Wavy, tell us—it helps us prioritize where to go next.', cat: 'availability' },
    { q: 'When is Wavy coming to my city?', a: 'We\'re focusing on the DR first, then expanding to other Latin American cities. Want us in your city? Let us know.', cat: 'availability' },
    { q: 'Do you work with chains or just local places?', a: 'Both. We have neighborhood spots and big chains. If they want to reach people nearby, we work with them.', cat: 'availability' },
    { q: 'How do I request a business?', a: 'In the app, go to Explore → Request a Business, or email us with the name and location.', cat: 'availability' },
    { q: 'Why isn\'t my favorite place on Wavy?', a: 'Either they don\'t know about us, or they haven\'t signed up yet. Send us their info and we\'ll reach out.', cat: 'availability' },
    { q: 'Do you work with restaurants only?', a: 'No. Restaurants, cafes, gyms, salons, retail—anywhere that wants to reach people nearby.', cat: 'availability' },
    { q: 'What types of businesses use Wavy?', a: 'Coffee shops, bars, restaurants, gyms, spas, barbershops, retail stores, entertainment venues. Pretty much anything local.', cat: 'availability' },
    { q: 'Can I use Wavy while traveling?', a: 'If you\'re traveling in a city where Wavy operates, yes. You\'ll see offers from places nearby wherever you are.', cat: 'availability' },
    { q: 'Does Wavy work in rural areas?', a: 'Only if there are businesses using Wavy there. We\'re focused on cities right now.', cat: 'availability' },
    { q: 'What languages does Wavy support?', a: 'English and Spanish right now. More languages coming as we expand.', cat: 'availability' },
    
    // For Businesses
    { q: 'How do businesses join Wavy?', a: 'They can sign up at wavy.do/business or email us. We walk them through it.', cat: 'business' },
    { q: 'How much does it cost for businesses?', a: 'It depends on the size of the business and what they want to do. Reach out and we\'ll give you a quote.', cat: 'business' },
    { q: 'Do businesses pay per customer?', a: 'No. They pay a flat monthly or campaign fee. No surprise charges.', cat: 'business' },
    { q: 'Can businesses target specific customers?', a: 'They can target people near their location at specific times. But we don\'t let them target based on demographics—everyone nearby sees the same offers.', cat: 'business' },
    { q: 'How do businesses create offers?', a: 'Through their dashboard. They write the offer, set the terms, choose when it runs, and we handle the rest.', cat: 'business' },
    { q: 'Can businesses pause offers?', a: 'Yes. They can pause, edit, or end offers anytime through their dashboard.', cat: 'business' },
    { q: 'How do businesses verify redemptions?', a: 'When a customer says they\'re using Wavy, the business confirms in their dashboard or app. It takes two seconds.', cat: 'business' },
    { q: 'Do businesses get analytics?', a: 'Yes. They see how many people saw their offer, how many redeemed it, and when.', cat: 'business' },
    { q: 'Can businesses respond to reviews?', a: 'There are no reviews on Wavy. We\'re not Yelp. It\'s just offers.', cat: 'business' },
    { q: 'Can I run Wavy at multiple locations?', a: 'Yes. Each location gets its own dashboard. You can run different offers at each one or the same offer everywhere.', cat: 'business' },
    { q: 'What kind of offers work best?', a: 'Simple ones. "20% off your order." "Free appetizer with entree." People decide in seconds, so keep it clear.', cat: 'business' },
    { q: 'Can businesses offer loyalty programs?', a: 'Not yet, but we\'re working on it.', cat: 'business' },
    { q: 'Do you integrate with POS systems?', a: 'Not yet. Right now businesses confirm redemptions manually. Integrations are coming.', cat: 'business' },
    { q: 'Can businesses export customer data?', a: 'They can see aggregate stats, but they don\'t get personal customer info unless the customer shares it directly.', cat: 'business' },
    { q: 'What if we want to cancel?', a: 'You can cancel anytime. No long-term contracts.', cat: 'business' },
    
    // Technical & Misc
    { q: 'Does Wavy drain my battery?', a: 'A little, like any app that uses location. But we optimize for battery life—it\'s not like running GPS navigation all day.', cat: 'technical' },
    { q: 'How much data does Wavy use?', a: 'Very little. Offers are small files. Unless you\'re browsing a lot of images, it\'s negligible.', cat: 'technical' },
    { q: 'Can I use Wavy offline?', a: 'No. You need a connection to see new offers.', cat: 'technical' },
    { q: 'What permissions does Wavy need?', a: 'Location (obviously) and notifications. Optionally, camera if you want to upload photos, but that\'s not required.', cat: 'technical' },
    { q: 'Why does Wavy need "always allow" location?', a: 'So you get notifications when you\'re near an offer, even if the app is closed.', cat: 'technical' },
    { q: 'Is there a web version?', a: 'Not for offers. The website is just info. Wavy is mobile-first because it\'s about where you are physically.', cat: 'technical' },
    { q: 'Can I use Wavy on my smartwatch?', a: 'Not yet. But you\'ll get notifications on your watch if it\'s connected to your phone.', cat: 'technical' },
    { q: 'Does Wavy work with VPNs?', a: 'It should, but VPNs can mess with location accuracy. If you\'re having issues, try turning it off.', cat: 'technical' },
    { q: 'Can I change the notification sound?', a: 'That\'s controlled by your phone\'s settings, not the app.', cat: 'technical' },
    { q: 'How often does Wavy update?', a: 'We push updates regularly—bug fixes, new features, performance improvements. Your phone will download them automatically if you have auto-update on.', cat: 'technical' },
    { q: 'Can I use Wavy in landscape mode?', a: 'It works, but it\'s designed for portrait. Landscape support isn\'t a priority right now.', cat: 'technical' },
    { q: 'What\'s the minimum Android version?', a: 'Android 8.0 (Oreo) or later.', cat: 'technical' },
    { q: 'What\'s the minimum iOS version?', a: 'iOS 14 or later.', cat: 'technical' },
    { q: 'Does Wavy support dark mode?', a: 'Yes. It follows your phone\'s system setting.', cat: 'technical' },
    { q: 'Can I customize the app interface?', a: 'Not really. We keep it simple on purpose.', cat: 'technical' },
    
    // About Wavy
    { q: 'Who made Wavy?', a: 'We\'re a team working out of the Dominican Republic, building something we actually wanted to use.', cat: 'about' },
    { q: 'Why did you build Wavy?', a: 'We got tired of juggling five different loyalty apps and missing deals because we didn\'t know they existed.', cat: 'about' },
    { q: 'Is Wavy a startup?', a: 'Yeah. We\'re small, we\'re fast, and we care about making this work.', cat: 'about' },
    { q: 'Are you hiring?', a: 'Check wavy.do/careers. If there\'s a role open, apply. If not, send us your info anyway.', cat: 'about' },
    { q: 'How do I invest in Wavy?', a: 'Email us at hello@wavy.do. We\'re not actively raising right now, but we\'re always open to conversations.', cat: 'about' },
    { q: 'Can I partner with Wavy?', a: 'Depends what you mean by partner. If you have an idea, email us.', cat: 'about' },
    { q: 'Where is Wavy based?', a: 'Santo Domingo, Dominican Republic.', cat: 'about' },
    { q: 'What\'s your mission?', a: 'Make it easier to discover what\'s around you and support local businesses without drowning in apps and QR codes.', cat: 'about' },
    { q: 'Do you have a blog?', a: 'Not really. If we have something to say, we\'ll post it on our site or social media.', cat: 'about' },
    { q: 'Can I write about Wavy?', a: 'Yes. Email us at hello@wavy.do if you need info, screenshots, or an interview.', cat: 'about' },
    
    // Miscellaneous
    { q: 'I have a question that\'s not here', a: 'Email us at hello@wavy.do or use the contact form. We respond to everything.', cat: 'misc' },
    { q: 'Can I share an offer with a friend?', a: 'Not directly in the app right now, but you can screenshot it and send it. They\'ll need to be nearby to redeem it though.', cat: 'misc' },
    { q: 'Do offers work for groups?', a: 'That\'s up to the business. Some offers are per person, some are per table or group. Check the details.', cat: 'misc' },
    { q: 'Can I save offers for later?', a: 'You can favorite a place to get notified about their future offers, but you can\'t "save" a specific offer. Use it or lose it.', cat: 'misc' },
    { q: 'Is there a referral program?', a: 'Not yet. But we\'re thinking about it.', cat: 'misc' },
    { q: 'Can businesses message me through Wavy?', a: 'No. They can only send offers. We\'re not a messaging platform.', cat: 'misc' },
    { q: 'What if I see an inappropriate offer?', a: 'Report it in the app or email us. We\'ll review it and take it down if it violates our terms.', cat: 'misc' },
    { q: 'Can I filter offers by category?', a: 'Not yet, but it\'s on the list.', cat: 'misc' },
    { q: 'Do you have a loyalty program for users?', a: 'No. Wavy itself doesn\'t have points or rewards. We just show you what businesses are offering.', cat: 'misc' },
    { q: 'Can I see my redemption history?', a: 'Yes. Go to Settings → History.', cat: 'misc' }
  ];

  const filteredFaqs = searchQuery.trim() === '' 
    ? allFaqs.slice(0, 20) 
    : allFaqs.filter(faq => 
        faq.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
        faq.a.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const categories = [
    {
      title: 'Getting Started',
      description: 'Everything you need to know to start using Wavy',
      link: '#getting-started'
    },
    {
      title: 'Privacy & Safety',
      description: 'How we handle your data and keep you safe',
      link: '#privacy'
    },
    {
      title: 'For Businesses',
      description: 'Information for business owners and partners',
      link: '#business'
    }
  ];

  return (
    <div ref={rootRef} style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', background: '#fff', color: '#16141f' }}>
      <style>{`
        @font-face {
          font-family: 'Modulus';
          src: url('/modulus.ttf') format('truetype');
        }
        .help-nav { position: sticky; top: 0; z-index: 40; padding: 20px 0; background: color-mix(in oklab, #f3f3f6 80%, transparent); backdrop-filter: blur(14px) saturate(1.3); box-shadow: 0 1px 0 rgba(0,0,0,0.06); }
        .help-wrap { max-width: 1920px; margin: 0 auto; padding: 0 clamp(20px, 4vw, 60px); }
        .help-navin { display: flex; justify-content: space-between; align-items: center; height: 48px; }
        .help-brand { font-size: 20px; font-weight: 800; letter-spacing: -0.02em; color: #16141f; font-family: 'Modulus', -apple-system, sans-serif; -webkit-text-stroke: 0.5px #16141f; text-decoration: none; }
        .help-links { display: flex; gap: 6px; }
        .help-link { position: relative; padding: 8px 12px; border-radius: 999px; font-size: 13px; color: #16141f; opacity: 0.82; transition: opacity .2s, background-color .25s; text-decoration: none; }
        .help-link:hover { opacity: 1; background: color-mix(in oklab, #16141f 6%, transparent); }
        .help-navend { display: flex; align-items: center; gap: 8px; }
        .help-btn { background: #16141f; color: white; padding: 10px 24px; border-radius: 100px; font-size: 14px; font-weight: 600; text-decoration: none; transition: transform 0.2s; }
        .help-btn:hover { transform: translateY(-1px); }
        @media (max-width: 860px) {
          .help-links { display: none; }
        }
      `}</style>

      {/* Navbar */}
      <header className="help-nav">
        <div className="help-wrap">
          <div className="help-navin">
            <a href="/" className="help-brand" onClick={(e) => onLink(e, "/")}>wavy</a>
            <nav className="help-links" aria-label="Primary">
              <a href="/learn-more" className="help-link" onClick={(e) => onLink(e, "/learn-more")}>Features</a>
              <a href="/about" className="help-link" onClick={(e) => onLink(e, "/about")}>About us</a>
              <a href="/contact" className="help-link" onClick={(e) => onLink(e, "/contact")}>Contact</a>
            </nav>
            <div className="help-navend">
              <a href="/auth" className="help-btn" onClick={(e) => onLink(e, "/auth")}>Get Started</a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero with Search */}
      <section style={{ background: 'linear-gradient(180deg, #f3f3f6 0%, #fff 100%)', padding: 'clamp(4rem,6vw,7rem) clamp(20px,4vw,60px)', textAlign: 'center' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h1 className="help-hero-title" style={{ fontSize: 'clamp(48px,7vw,72px)', fontWeight: 400, lineHeight: 1.1, marginBottom: '1.5rem', letterSpacing: '-0.03em' }}>
            How can we <span style={{ color: '#5e79db', fontFamily: "'Modulus', -apple-system, sans-serif", fontWeight: 800, WebkitTextStroke: '0.5px #5e79db' }}>help?</span>
          </h1>
          <p className="help-hero-subtitle" style={{ fontSize: 'clamp(18px,2.2vw,22px)', color: 'rgba(22,20,31,0.6)', lineHeight: 1.6, maxWidth: 680, margin: '0 auto 2.5rem' }}>
            Find answers to common questions, or reach out if you need more help.
          </p>
          
          {/* Search Bar */}
          <div className="help-search" style={{ maxWidth: 600, margin: '0 auto', position: 'relative' }}>
            <input
              type="text"
              placeholder="Search over 100 questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '18px 24px',
                fontSize: 16,
                border: '1px solid rgba(0,0,0,0.1)',
                borderRadius: 100,
                outline: 'none',
                transition: 'border-color 0.2s, box-shadow 0.2s',
                background: 'white'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#5e79db';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(94,121,219,0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(22,20,31,0.4)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                position: 'absolute',
                right: 24,
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none'
              }}
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="categories-section" style={{ padding: 'clamp(3rem,5vw,4rem) clamp(20px,4vw,60px)' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {categories.map((cat, i) => (
              <a
                key={i}
                href={cat.link}
                className="category-card"
                style={{
                  background: '#fafafa',
                  border: '1px solid rgba(0,0,0,0.06)',
                  borderRadius: 20,
                  padding: 'clamp(2rem,3vw,2.5rem)',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.borderColor = '#5e79db';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(94,121,219,0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(0,0,0,0.06)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <h3 style={{ fontSize: 22, fontWeight: 500, marginBottom: '0.5rem', letterSpacing: '-0.01em' }}>
                  {cat.title}
                </h3>
                <p style={{ fontSize: 15, color: 'rgba(22,20,31,0.65)', lineHeight: 1.6 }}>
                  {cat.description}
                </p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="faqs-section" style={{ padding: 'clamp(3rem,5vw,5rem) clamp(20px,4vw,60px)', background: '#f3f3f6' }}>
        <div style={{ maxWidth: 1600, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 'clamp(3rem,4vw,4rem)' }}>
            <h2 style={{ fontSize: 'clamp(36px,5vw,52px)', fontWeight: 400, marginBottom: '1rem', letterSpacing: '-0.02em' }}>
              {searchQuery ? `${filteredFaqs.length} results` : 'Frequently asked questions'}
            </h2>
            {!searchQuery && (
              <p style={{ fontSize: 16, color: 'rgba(22,20,31,0.6)' }}>
                Showing 20 of {allFaqs.length} questions. Use the search bar to find specific answers.
              </p>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {filteredFaqs.map((faq, i) => (
              <div
                key={i}
                className="faq-card"
                style={{
                  background: 'white',
                  border: '1px solid rgba(0,0,0,0.06)',
                  borderRadius: 16,
                  overflow: 'hidden',
                  transition: 'border-color 0.2s'
                }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{
                    width: '100%',
                    padding: '1.25rem',
                    border: 'none',
                    background: 'transparent',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    cursor: 'pointer',
                    textAlign: 'left',
                    gap: 12
                  }}
                >
                  <span style={{ fontSize: 16, fontWeight: 500, color: '#16141f', lineHeight: 1.4 }}>
                    {faq.q}
                  </span>
                  <ChevronDown
                    size={18}
                    style={{
                      transition: 'transform 0.3s ease',
                      transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0)',
                      flexShrink: 0,
                      marginTop: 2
                    }}
                  />
                </button>
                <div
                  style={{
                    maxHeight: openFaq === i ? '500px' : '0',
                    overflow: 'hidden',
                    transition: 'max-height 0.4s ease, padding 0.4s ease',
                    padding: openFaq === i ? '0 1.25rem 1.25rem' : '0 1.25rem',
                    fontSize: 14.5,
                    color: 'rgba(22,20,31,0.7)',
                    lineHeight: 1.65
                  }}
                >
                  {faq.a}
                </div>
              </div>
            ))}
          </div>
          
          {filteredFaqs.length === 0 && (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: 'rgba(22,20,31,0.5)' }}>
              <p style={{ fontSize: 18, marginBottom: '1rem' }}>No results found for "{searchQuery}"</p>
              <p style={{ fontSize: 15 }}>Try different keywords or <a href="/contact" onClick={(e) => onLink(e, "/contact")} style={{ color: '#5e79db', textDecoration: 'none' }}>contact us</a> directly.</p>
            </div>
          )}
        </div>
      </section>

      {/* Contact CTA */}
      <section style={{ padding: 'clamp(4rem,6vw,7rem) clamp(20px,4vw,60px)', textAlign: 'center' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(36px,5vw,52px)', fontWeight: 400, marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>
            Still need help?
          </h2>
          <p style={{ fontSize: 'clamp(16px,2vw,20px)', color: 'rgba(22,20,31,0.6)', lineHeight: 1.6, marginBottom: '2.5rem' }}>
            Can't find what you're looking for? Get in touch and we'll help you out.
          </p>
          <a
            href="/contact"
            onClick={(e) => onLink(e, "/contact")}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: '#16141f',
              color: 'white',
              padding: '16px 32px',
              borderRadius: 100,
              fontSize: 16,
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Contact Support
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: 'clamp(40px,5vw,64px) 0 28px', background: '#f3f3f6' }}>
        <div style={{ maxWidth: 1920, margin: '0 auto', padding: '0 clamp(20px,4vw,60px)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr repeat(3,minmax(0,1fr))', gap: 32 }}>
            <div>
              <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-0.02em', color: '#16141f', fontFamily: "'Modulus', -apple-system, sans-serif" }}>wavy</span>
              <p style={{ marginTop: 14, maxWidth: '30em', fontSize: 13, lineHeight: 1.55, color: 'rgba(22,20,31,0.6)' }}>
                Discover places and offers around you. Everything you need to explore your neighborhood in one place.
              </p>
              <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
                <a href="https://x.com/wavy" aria-label="X" target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: '50%', background: 'white', color: 'rgba(22,20,31,0.6)', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.06)', transition: 'all .25s', textDecoration: 'none' }}>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M17.8 3h3.1l-6.8 7.7 8 10.3h-6.3l-4.9-6.4L5.3 21H2.2l7.3-8.3L1.8 3h6.4l4.4 5.9Zm-1.1 16.2h1.7L7.4 4.7H5.6Z" />
                  </svg>
                </a>
                <a href="https://github.com/wavy" aria-label="GitHub" target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: '50%', background: 'white', color: 'rgba(22,20,31,0.6)', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.06)', transition: 'all .25s', textDecoration: 'none' }}>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M12 1.5a10.5 10.5 0 0 0-3.3 20.5c.5.1.7-.2.7-.5v-1.8c-2.9.6-3.5-1.4-3.5-1.4-.5-1.2-1.2-1.5-1.2-1.5-.9-.6.1-.6.1-.6 1 .1 1.6 1.1 1.6 1.1.9 1.6 2.5 1.1 3.1.9.1-.7.4-1.1.7-1.4-2.3-.3-4.8-1.2-4.8-5.2 0-1.1.4-2.1 1.1-2.8-.1-.3-.5-1.4.1-2.8 0 0 .9-.3 2.9 1.1a10 10 0 0 1 5.2 0c2-1.4 2.9-1.1 2.9-1.1.6 1.4.2 2.5.1 2.8.7.7 1.1 1.7 1.1 2.8 0 4-2.5 4.9-4.8 5.2.4.3.7 1 .7 1.9v2.9c0 .3.2.6.7.5A10.5 10.5 0 0 0 12 1.5Z" />
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h4 style={{ fontSize: 12, fontWeight: 500, color: 'rgba(22,20,31,0.5)', marginBottom: 14 }}>Product</h4>
              <ul style={{ display: 'grid', gap: 9, listStyle: 'none', padding: 0, margin: 0 }}>
                <li><a href="/learn-more" onClick={(e) => onLink(e, "/learn-more")} style={{ fontSize: 13.5, color: '#16141f', opacity: 0.85, textDecoration: 'none', transition: 'opacity .2s' }}>Features</a></li>
                <li><a href="/business" onClick={(e) => onLink(e, "/business")} style={{ fontSize: 13.5, color: '#16141f', opacity: 0.85, textDecoration: 'none', transition: 'opacity .2s' }}>Business</a></li>
              </ul>
            </div>
            <div>
              <h4 style={{ fontSize: 12, fontWeight: 500, color: 'rgba(22,20,31,0.5)', marginBottom: 14 }}>Company</h4>
              <ul style={{ display: 'grid', gap: 9, listStyle: 'none', padding: 0, margin: 0 }}>
                <li><a href="/about" onClick={(e) => onLink(e, "/about")} style={{ fontSize: 13.5, color: '#16141f', opacity: 0.85, textDecoration: 'none', transition: 'opacity .2s' }}>About</a></li>
                <li><a href="/careers" onClick={(e) => onLink(e, "/careers")} style={{ fontSize: 13.5, color: '#16141f', opacity: 0.85, textDecoration: 'none', transition: 'opacity .2s' }}>Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 style={{ fontSize: 12, fontWeight: 500, color: 'rgba(22,20,31,0.5)', marginBottom: 14 }}>Support</h4>
              <ul style={{ display: 'grid', gap: 9, listStyle: 'none', padding: 0, margin: 0 }}>
                <li><a href="/help" onClick={(e) => onLink(e, "/help")} style={{ fontSize: 13.5, color: '#16141f', opacity: 0.85, textDecoration: 'none', transition: 'opacity .2s' }}>Help Center</a></li>
                <li><a href="/contact" onClick={(e) => onLink(e, "/contact")} style={{ fontSize: 13.5, color: '#16141f', opacity: 0.85, textDecoration: 'none', transition: 'opacity .2s' }}>Contact</a></li>
              </ul>
            </div>
          </div>
          <div style={{ position: 'relative', marginTop: 'clamp(36px,5vw,56px)', fontSize: 'clamp(72px,17vw,232px)', fontWeight: 500, lineHeight: 0.82, letterSpacing: '-0.06em', textAlign: 'center', color: 'transparent', background: 'linear-gradient(180deg,rgba(0,0,0,0.02) 0%,transparent 92%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', userSelect: 'none', whiteSpace: 'nowrap' }}>wavy</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12, paddingTop: 18, borderTop: '1px solid rgba(0,0,0,0.08)', fontSize: 12, color: 'rgba(22,20,31,0.5)' }}>
            <span>© 2024 Wavy. All rights reserved.</span>
            <nav style={{ display: 'flex', gap: 18 }}>
              <a href="/privacy" style={{ color: 'rgba(22,20,31,0.5)', textDecoration: 'none' }}>Privacy</a>
              <a href="/terms" style={{ color: 'rgba(22,20,31,0.5)', textDecoration: 'none' }}>Terms</a>
              <a href="/cookies" style={{ color: 'rgba(22,20,31,0.5)', textDecoration: 'none' }}>Cookies</a>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
