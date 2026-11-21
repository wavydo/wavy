import { motion } from 'framer-motion';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

interface ExploreSectionProps {
  userData: any;
}

export default function ExploreSection({ userData }: ExploreSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Fetch establishments from API
  const { data: establishmentsData, isLoading } = useQuery({
    queryKey: ['establishments', searchQuery, selectedCategory],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedCategory) params.append('category', selectedCategory);
      
      const res = await fetch(`/api/explore/establishments?${params}`, { 
        credentials: 'include' 
      });
      if (!res.ok) throw new Error('Failed to fetch establishments');
      return res.json();
    },
  });

  const places = establishmentsData?.establishments || [];

  if (isLoading) {
    return (
      <div style={{ background: '#000', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
        <p>Loading places...</p>
      </div>
    );
  }

  return (
    <div style={{ background: '#000', minHeight: '100vh' }}>
      {/* Compact Header */}
      <div style={{ padding: '1.5rem 1.25rem 1.25rem' }}>
        <h1 style={{
          fontSize: '1.75rem',
          fontWeight: 700,
          margin: 0,
          letterSpacing: '-0.03em'
        }}>
          Explore
        </h1>
      </div>

      {/* Search */}
      <div style={{ padding: '0 1.25rem 1.5rem' }}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search..."
          style={{
            width: '100%',
            padding: '0.875rem 1rem',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#fff',
            fontSize: '0.9375rem',
            outline: 'none'
          }}
        />
      </div>

      {/* Places Grid with Images */}
      <div style={{ padding: '0 1.25rem 2rem' }}>
        <h2 style={{
          fontSize: '0.6875rem',
          fontWeight: 600,
          margin: '0 0 1rem 0',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.5)'
        }}>
          {searchQuery ? 'Search Results' : 'Near you'} ({places.length})
        </h2>

        {places.length === 0 ? (
          <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>
            <p>No establishments found</p>
            <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Try a different search</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gap: '1rem'
          }}>
            {places.map((place: any, i: number) => {
              const categoryImages: any = {
                'restaurante': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
                'cafeteria': 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80',
                'bar': 'https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=800&q=80',
                'supermercado': 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&q=80',
                'farmacia': 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800&q=80',
                'barberia': 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&q=80',
              };
              
              return (
                <motion.div
                  key={place.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    display: 'flex',
                    height: '120px'
                  }}
                >
                  {/* Image */}
                  <div style={{
                    width: '120px',
                    minWidth: '120px',
                    height: '100%',
                    background: place.logo 
                      ? `url(${place.logo})`
                      : `url(${categoryImages[place.category] || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80'})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative'
                  }}>
                    {/* Discount Badge */}
                    {place.discountPercentage > 0 && (
                      <div style={{
                        position: 'absolute',
                        bottom: '0.5rem',
                        right: '0.5rem',
                        background: '#fff',
                        color: '#000',
                        padding: '0.25rem 0.5rem',
                        fontSize: '0.6875rem',
                        fontWeight: 700
                      }}>
                        {place.discountPercentage}% OFF
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ 
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    flex: 1
                  }}>
                    <div>
                      <h3 style={{
                        fontSize: '1.0625rem',
                        fontWeight: 600,
                        margin: '0 0 0.25rem 0',
                        letterSpacing: '-0.01em'
                      }}>
                        {place.businessName}
                      </h3>
                      <p style={{
                        fontSize: '0.875rem',
                        color: 'rgba(255,255,255,0.5)',
                        margin: 0,
                        textTransform: 'capitalize'
                      }}>
                        {place.category}
                      </p>
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.75rem',
                      color: 'rgba(255,255,255,0.4)'
                    }}>
                      <span>{place.city}</span>
                      <span>{place.totalCustomers || 0} customers</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
