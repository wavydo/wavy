import { useLocation } from 'wouter';

export default function Benefits() {
  const [, setLocation] = useLocation();
  
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20 }}>
      <h1>Benefits - Coming Soon</h1>
      <button onClick={() => setLocation('/dashboard/user')} style={{ padding: '12px 24px', borderRadius: 12, border: 'none', background: '#16141f', color: 'white', cursor: 'pointer' }}>
        Back to Dashboard
      </button>
    </div>
  );
}
