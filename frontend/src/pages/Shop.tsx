import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Package, Tag, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { apiService } from '../services/api';
import * as Types from '../types';

const Shop: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [categories, setCategories] = useState<Types.ShopCategory[]>([]);
  const [items, setItems] = useState<Types.ShopItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [i18n.language]);

  useEffect(() => {
    loadItems();
  }, [selectedCategory, i18n.language]);

  const loadData = async () => {
    setLoading(true);
    try {
      const categoriesData = await apiService.getShopCategories(i18n.language);
      setCategories((categoriesData || []).filter(c => c.enabled).sort((a, b) => a.order - b.order));
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const loadItems = async () => {
    try {
      const itemsData = await apiService.getShopItems(i18n.language, selectedCategory || undefined);
      setItems((itemsData || []).filter(i => i.enabled).sort((a, b) => a.order - b.order));
    } catch (error) {
      console.error('Error loading items:', error);
      setItems([]);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            minHeight: '60vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <ShoppingCart size={120} color="var(--primary-blue)" style={{ filter: 'drop-shadow(0 0 30px var(--glow-blue))' }} />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          marginBottom: '1rem'
        }}>
          <ShoppingCart size={48} color="var(--primary-blue)" style={{ filter: 'drop-shadow(0 0 20px var(--glow-blue))' }} />
          <h1 className="section-title" style={{ marginBottom: 0 }}>{t('nav.shop')}</h1>
        </div>

        {/* Category Filters */}
        {categories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginBottom: '3rem',
              padding: '1rem',
              background: 'rgba(15, 23, 42, 0.6)',
              borderRadius: '12px',
              border: '1px solid var(--border-color)'
            }}
          >
            <button
              onClick={() => setSelectedCategory(null)}
              style={{
                padding: '0.75rem 1.5rem',
                background: selectedCategory === null 
                  ? 'linear-gradient(135deg, var(--primary-blue), var(--accent-cyan))' 
                  : 'transparent',
                border: '1px solid var(--border-color)',
                color: selectedCategory === null ? 'var(--text-primary)' : 'var(--text-secondary)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontFamily: 'Exo 2, sans-serif',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                fontSize: '0.9rem',
                transition: 'all 0.3s ease'
              }}
            >
              All Items
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: selectedCategory === category.id 
                    ? 'linear-gradient(135deg, var(--primary-blue), var(--accent-cyan))' 
                    : 'transparent',
                  border: '1px solid var(--border-color)',
                  color: selectedCategory === category.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontFamily: 'Exo 2, sans-serif',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  fontSize: '0.9rem',
                  transition: 'all 0.3s ease'
                }}
              >
                {category.name}
              </button>
            ))}
          </motion.div>
        )}

        {/* Shop Items */}
        {items.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '2rem'
          }}>
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                className="card"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {item.discount && item.discount > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    fontFamily: 'Orbitron, sans-serif',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    zIndex: 10,
                    boxShadow: '0 0 20px rgba(239, 68, 68, 0.5)'
                  }}>
                    -{item.discount}%
                  </div>
                )}

                {item.imageUrl && (
                  <div style={{
                    width: '100%',
                    height: '200px',
                    background: `url(${item.imageUrl}) center/cover`,
                    borderRadius: '8px',
                    marginBottom: '1.5rem',
                    border: '1px solid var(--border-color)'
                  }} />
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <Package size={24} color="var(--primary-blue)" />
                  <h3 style={{
                    fontFamily: 'Orbitron, sans-serif',
                    fontSize: '1.4rem',
                    color: 'var(--text-primary)',
                    letterSpacing: '1px',
                    flex: 1
                  }}>
                    {item.name}
                  </h3>
                </div>

                <p style={{
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                  marginBottom: '1.5rem',
                  flex: 1
                }}>
                  {item.description}
                </p>

                {item.features && item.features.length > 0 && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    {item.features.map((feature, idx) => (
                      <div key={idx} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginBottom: '0.5rem',
                        color: 'var(--text-secondary)',
                        fontSize: '0.95rem'
                      }}>
                        <Check size={16} color="var(--primary-blue)" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: 'auto',
                  paddingTop: '1rem',
                  borderTop: '1px solid var(--border-color)'
                }}>
                  <div>
                    {item.discount && item.discount > 0 ? (
                      <div>
                        <div style={{
                          color: 'var(--text-muted)',
                          textDecoration: 'line-through',
                          fontSize: '0.9rem',
                          marginBottom: '0.25rem'
                        }}>
                          {item.price} {item.currency}
                        </div>
                        <div style={{
                          fontFamily: 'Orbitron, sans-serif',
                          fontSize: '1.8rem',
                          color: 'var(--primary-blue)',
                          fontWeight: 700
                        }}>
                          {(item.price * (1 - item.discount / 100)).toFixed(2)} {item.currency}
                        </div>
                      </div>
                    ) : (
                      <div style={{
                        fontFamily: 'Orbitron, sans-serif',
                        fontSize: '1.8rem',
                        color: 'var(--primary-blue)',
                        fontWeight: 700
                      }}>
                        {item.price} {item.currency}
                      </div>
                    )}
                  </div>

                  <motion.button
                    className="btn"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{ padding: '0.75rem 1.5rem' }}
                  >
                    <Tag size={18} />
                    Buy Now
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            className="card"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.1), rgba(6, 182, 212, 0.05))',
              border: '2px solid var(--border-bright)'
            }}
          >
            <Package size={64} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
            <h2 style={{
              fontFamily: 'Orbitron, sans-serif',
              fontSize: '1.5rem',
              color: 'var(--text-primary)',
              marginBottom: '1rem',
              letterSpacing: '1px'
            }}>
              No items available
            </h2>
            <p style={{
              color: 'var(--text-secondary)',
              lineHeight: 1.8,
              fontSize: '1.05rem'
            }}>
              {selectedCategory !== null 
                ? 'No items in this category yet. Check back soon!' 
                : 'Shop items coming soon!'}
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default Shop;
