import LilacMeadowLanding from '../components/LilacMeadowLanding';
import HorizontalFeatures from '../components/HorizontalFeatures';

export default function PerfectHome() {
  return (
    <>
      <LilacMeadowLanding
      brand="wavy"
      tokenName="Wavy"
      ticker="WAVY"
      nav={[
        { label: 'Features', href: '/learn-more' },
        { label: 'About us', href: '/about' },
        { label: 'Contact', href: '/contact' }
      ]}
      cta={{ label: 'Get Started', href: '/auth' }}
      hero={{
        title: 'Discover places and\noffers around you',
        subtitle: 'Everything you need to explore your neighborhood. Find deals, earn rewards, attend events, and connect with local spots—all in one place.',
        action: { label: 'Get Started', href: '/business' }
      }}
      intro={{
        title: 'What is Wavy?',
        body: 'Wavy connects you with amazing places nearby through smart technology. Discover exclusive offers, earn loyalty rewards, attend exciting events, and build relationships with your favorite local spots—all while getting personalized benefits designed just for you.',
        action: { label: 'Learn more', href: '/learn-more' }
      }}
      features={[
        {
          title: 'Find nearby offers',
          body: 'Discover restaurants, cafes, shops and experiences around you. Get notified when you\'re close to something special.',
          visual: 'flower'
        },
        {
          title: 'Earn rewards',
          body: 'Collect points and unlock exclusive perks automatically. The more you visit, the more you save and earn.',
          visual: 'peg'
        },
        {
          title: 'Exclusive experiences',
          body: 'Access member-only events, early ticket sales, and VIP experiences at your favorite spots.',
          visual: 'autopilot'
        }
      ]}
      backersLabel="Trusted by"
      backers={[
        { name: 'Company A', glyph: 'ring' },
        { name: 'Company B', glyph: 'bars' },
        { name: 'Company C', glyph: 'wave' },
        { name: 'Company D', glyph: 'leaf' },
        { name: 'Company E', glyph: 'hex' }
      ]}
      useCasesCopy={{
        kicker: 'Use Cases',
        title: 'Built for every lifestyle',
        body: 'Whether you explore daily or occasionally, Wavy helps you discover what matters to you.'
      }}
      useCases={[
        {
          id: 'rewards',
          title: 'Rewards & Offers',
          body: 'Discover exclusive offers and cashback rewards at nearby places. Get notified when you are close to businesses with active promotions just for you.',
          action: { label: 'Learn more', href: '#rewards' },
          art: 'temple'
        },
        {
          id: 'events',
          title: 'Events',
          body: 'Never miss local experiences. Get personalized event recommendations, early access to tickets, and group benefits for activities you love.',
          action: { label: 'Explore events', href: '#events' },
          art: 'blocks'
        },
        {
          id: 'customers',
          title: 'For Customers',
          body: 'Build lasting relationships with your favorite places. Earn loyalty rewards, share feedback, and unlock special experiences as you explore.',
          action: { label: 'Join now', href: '#customers' },
          art: 'vault'
        }
      ]}
      afterUseCases={
        <HorizontalFeatures
          title="Why Wavy is Different"
          subtitle="Not just another rewards app. A new way to experience your neighborhood."
          textColor="#16141f"
          accentColor="#5e79db"
          bgColor="#f3f3f6"
        />
      }
      calculator={false}
      faqCopy={{
        kicker: 'FAQ',
        title: 'Frequently asked questions',
        body: 'Everything you need to know about Wavy'
      }}
      faqs={[
        {
          q: 'What is Wavy?',
          a: 'Wavy is a proximity platform that connects you with amazing places nearby. Discover exclusive offers, earn loyalty rewards, attend local events, and build relationships with your favorite spots—all through smart location technology.'
        },
        {
          q: 'How do I get started?',
          a: 'Getting started is simple. Download the app, create your account, and enable location services. You\'ll start seeing nearby offers and rewards immediately. No credit card required.'
        },
        {
          q: 'Is Wavy free to use?',
          a: 'Yes! Wavy is completely free for users. You earn rewards and access exclusive offers at no cost. We partner with local businesses to bring you the best deals and experiences.'
        },
        {
          q: 'How do rewards work?',
          a: 'Earn points automatically when you visit participating places. The more you explore, the more you earn. Redeem your points for cashback, discounts, or exclusive perks at your favorite spots.'
        },
        {
          q: 'Is my location data private?',
          a: 'Absolutely. Your privacy is our priority. Location data is only used to show you nearby offers and is never shared with third parties. You can control your privacy settings anytime in the app.'
        },
        {
          q: 'What types of places can I discover?',
          a: 'From restaurants and cafes to shops, gyms, entertainment venues, and cultural spaces. Wavy works with all kinds of local businesses to bring you personalized experiences and exclusive benefits.'
        }
      ]}
      join={{
        title: 'Ready to explore?',
        body: 'Join thousands of people discovering amazing places nearby.',
        placeholder: 'Enter your email',
        action: 'Get Started',
        success: 'Thanks! We will be in touch soon.'
      }}
      tagline="Discover places and offers around you. Everything you need to explore your neighborhood in one place."
      columns={[
        {
          title: 'Product',
          links: [
            { label: 'Features', href: '/learn-more#features' },
            { label: 'Business', href: '/business' }
          ]
        },
        {
          title: 'Company',
          links: [
            { label: 'About', href: '/about' },
            { label: 'Careers', href: '/careers' }
          ]
        },
        {
          title: 'Support',
          links: [
            { label: 'Help Center', href: '/help' },
            { label: 'Contact', href: '/contact' }
          ]
        }
      ]}
      socials={[
        { kind: 'x', href: 'https://x.com/wavy' },
        { kind: 'instagram', href: 'https://instagram.com/wavy.do' }
      ]}
      legal={[
        { label: 'Privacy', href: '/privacy' },
        { label: 'Terms', href: '/terms' }
      ]}
      copyright="© 2027 Wavy. All rights reserved."
      palette="pastelblue"
      theme="light"
      animateIn={true}
    />
    </>
  );
}
