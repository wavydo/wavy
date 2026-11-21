import { useLocation } from 'wouter';
import { useEffect, useState } from 'react';

export default function UserDashboardClean() {
  const [location] = useLocation();
  const [iframeSrc, setIframeSrc] = useState('/dashboard-standalone.html');

  useEffect(() => {
    // Map React routes to actual HTML files
    const routeMap: Record<string, string> = {
      '/dashboard/user': '/dashboard-standalone.html',
      '/dashboard/user/benefits': '/dashboard/benefits.html',
      '/dashboard/user/events': '/dashboard/events.html',
      '/dashboard/user/explore': '/dashboard/explore.html',
      '/dashboard/user/cards': '/dashboard/cards.html',
    };

    const src = routeMap[location] || '/dashboard-standalone.html';
    setIframeSrc(src);
  }, [location]);

  return (
    <iframe
      key={iframeSrc} // Force reload when src changes
      src={iframeSrc}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        border: 'none',
        zIndex: 9999
      }}
      title="Dashboard"
    />
  );
}
