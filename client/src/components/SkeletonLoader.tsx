import './SkeletonLoader.css';

interface SkeletonProps {
  type?: 'card' | 'title' | 'text' | 'button' | 'circle' | 'image';
  width?: string;
  height?: string;
  className?: string;
}

export function Skeleton({ type = 'text', width, height, className = '' }: SkeletonProps) {
  const style = {
    ...(width && { width }),
    ...(height && { height }),
  };

  const baseClass = `skeleton skeleton-${type} ${className}`;

  return <div className={baseClass} style={style}></div>;
}

// Skeleton presets for common layouts
export function CardSkeleton() {
  return (
    <div className="skeleton-card">
      <Skeleton type="title" />
      <Skeleton type="text" />
      <Skeleton type="text" className="short" />
      <Skeleton type="button" />
    </div>
  );
}

export function BenefitCardSkeleton() {
  return (
    <div className="skeleton-card" style={{ minHeight: '280px' }}>
      <Skeleton type="image" height="140px" />
      <div style={{ marginTop: '16px' }}>
        <Skeleton type="title" width="80%" height="24px" />
        <Skeleton type="text" />
        <Skeleton type="text" className="medium" />
      </div>
    </div>
  );
}

export function EventCardSkeleton() {
  return (
    <div className="skeleton-card" style={{ minHeight: '320px' }}>
      <Skeleton type="image" height="180px" />
      <div style={{ marginTop: '20px' }}>
        <Skeleton type="title" width="70%" height="28px" />
        <Skeleton type="text" width="50%" />
        <Skeleton type="text" />
      </div>
    </div>
  );
}

export function MerchantCardSkeleton() {
  return (
    <div className="skeleton-card" style={{ minHeight: '160px', minWidth: '320px' }}>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <Skeleton type="circle" width="64px" height="64px" />
        <div style={{ flex: 1 }}>
          <Skeleton type="title" width="60%" height="20px" />
          <Skeleton type="text" width="40%" />
        </div>
      </div>
      <Skeleton type="button" style={{ marginTop: '20px' }} />
    </div>
  );
}
