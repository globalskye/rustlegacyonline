import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Package, Tag, Check, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { apiService } from '../services/api';
import * as Types from '../types';

const CURRENCIES = ['USD', 'EUR', 'CZK', 'RUB', 'BYN'] as const;

const Shop: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [categories, setCategories] = useState<Types.ShopCategory[]>([]);
  const [items, setItems] = useState<Types.ShopItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedItem, setSelectedItem] = useState<Types.ShopItem | null>(null);
  const [currency, setCurrency] = useState<string>('USD');
  const [rates, setRates] = useState<Record<string, number>>({ USD: 1 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [i18n.language]);

  useEffect(() => {
    loadItems();
  }, [selectedCategory, i18n.language]);

  useEffect(() => {
    apiService.getCurrencyRates().then(setRates).catch(() => {});
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      let categoriesData = await apiService.getShopCategories(i18n.language);
      if (!categoriesData || categoriesData.length === 0) {
        categoriesData = await apiService.getShopCategories();
      }
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
      let itemsData = await apiService.getShopItems(i18n.language, selectedCategory || undefined);
      if (!itemsData || itemsData.length === 0) {
        itemsData = await apiService.getShopItems(undefined, selectedCategory || undefined);
      }
      setItems((itemsData || []).filter(i => i.enabled).sort((a, b) => a.order - b.order));
    } catch (error) {
      console.error('Error loading items:', error);
      setItems([]);
    }
  };

  const convertPrice = (priceUsd: number) => {
    const rate = rates[currency] || 1;
    return (priceUsd * rate).toFixed(2);
  };

  const getDisplayPrice = (item: Types.ShopItem) => {
    const base = item.discount && item.discount > 0
      ? item.price * (1 - item.discount / 100)
      : item.price;
    return base;
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
        <div className="page-header" style={{ marginBottom: '1rem' }}>
          <ShoppingCart size={48} color="var(--primary-blue)" style={{ filter: 'drop-shadow(0 0 20px var(--glow-blue))' }} />
          <h1 className="section-title" style={{ marginBottom: 0 }}>{t('nav.shop')}</h1>
        </div>

        {/* Currency selector - no stray zero */}
        <div className="centered-buttons" style={{ marginBottom: '1.5rem' }}>
          {CURRENCIES.map((c) => (
            <button
              key={c}
              onClick={() => setCurrency(c)}
              style={{
                padding: '0.5rem 1rem',
                background: currency === c ? 'var(--primary-blue)' : 'transparent',
                border: '1px solid var(--border-color)',
                color: currency === c ? 'white' : 'var(--text-secondary)',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center'
              }}
            >
              {c}
            </button>
          ))}
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
                  ? 'var(--primary-blue)'
                  : 'transparent',
                border: '1px solid var(--border-color)',
                color: selectedCategory === null ? 'var(--text-primary)' : 'var(--text-secondary)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontFamily: 'DM Sans, sans-serif',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                fontSize: '0.9rem',
                transition: 'all 0.3s ease',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center'
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
                    ? 'var(--primary-blue)'
                    : 'transparent',
                  border: '1px solid var(--border-color)',
                  color: selectedCategory === category.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  fontFamily: 'DM Sans, sans-serif',
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

        {/* Shop Items - click opens modal */}
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
                onClick={() => setSelectedItem(item)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer'
                }}
              >
                {(item.discount ?? 0) > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    fontFamily: 'Poppins, sans-serif',
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
                    fontFamily: 'Poppins, sans-serif',
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
                    {item.features.slice(0, 3).map((feature, idx) => (
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
                    {getDisplayPrice(item) <= 0 ? (
                      <div style={{
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '1.5rem',
                        color: 'var(--primary-blue)',
                        fontWeight: 700
                      }}>
                        Free
                      </div>
                    ) : (item.discount ?? 0) > 0 ? (
                      <div>
                        <div style={{
                          color: 'var(--text-muted)',
                          textDecoration: 'line-through',
                          fontSize: '0.9rem',
                          marginBottom: '0.25rem'
                        }}>
                          {convertPrice(item.price)} {currency}
                        </div>
                        <div style={{
                          fontFamily: 'Poppins, sans-serif',
                          fontSize: '1.8rem',
                          color: 'var(--primary-blue)',
                          fontWeight: 700
                        }}>
                          {convertPrice(getDisplayPrice(item))} {currency}
                        </div>
                      </div>
                    ) : (
                      <div style={{
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '1.8rem',
                        color: 'var(--primary-blue)',
                        fontWeight: 700
                      }}>
                        {convertPrice(item.price)} {currency}
                      </div>
                    )}
                  </div>

                  <motion.span
                    className="btn"
                    style={{ padding: '0.75rem 1.5rem' }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Tag size={18} /> View
                  </motion.span>
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
              background: 'rgba(56, 189, 248, 0.08)',
              border: '2px solid var(--border-bright)'
            }}
          >
            <Package size={64} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
            <h2 style={{
              fontFamily: 'Poppins, sans-serif',
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

      {/* Product Modal - floating popup */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              className="modal-floating"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <h2 style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '1.8rem',
                  color: 'var(--primary-blue)',
                  margin: 0
                }}>
                  {selectedItem.name}
                </h2>
                <button onClick={() => setSelectedItem(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' }}>
                  <X size={24} color="var(--text-secondary)" />
                </button>
              </div>
              {selectedItem.imageUrl && (
                <div style={{
                  width: '100%',
                  height: '240px',
                  background: `url(${selectedItem.imageUrl}) center/cover`,
                  borderRadius: '12px',
                  marginBottom: '1.5rem',
                  border: '1px solid var(--border-color)'
                }} />
              )}
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '1.5rem' }}>
                {selectedItem.description}
              </p>
              {selectedItem.features && selectedItem.features.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  {selectedItem.features.map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <Check size={16} color="var(--primary-blue)" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              )}
              {selectedItem.specs && (
                <div style={{ marginBottom: '1rem', padding: '1rem', background: 'var(--bg-darker)', borderRadius: 8 }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{i18n.language === 'ru' ? 'Характеристики' : 'Specifications'}</div>
                  <div style={{ color: 'var(--text-secondary)', whiteSpace: 'pre-line' }}>{selectedItem.specs}</div>
                </div>
              )}
              {selectedItem.packageContents && (
                <div style={{ marginBottom: '1rem', padding: '1rem', background: 'var(--bg-darker)', borderRadius: 8 }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{i18n.language === 'ru' ? 'Комплектация' : 'Package contents'}</div>
                  <div style={{ color: 'var(--text-secondary)', whiteSpace: 'pre-line' }}>{selectedItem.packageContents}</div>
                </div>
              )}
              {selectedItem.warranty && (
                <div style={{ marginBottom: '1rem', padding: '1rem', background: 'var(--bg-darker)', borderRadius: 8 }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{i18n.language === 'ru' ? 'Гарантийные условия' : 'Warranty'}</div>
                  <div style={{ color: 'var(--text-secondary)', whiteSpace: 'pre-line' }}>{selectedItem.warranty}</div>
                </div>
              )}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '1.5rem',
                borderTop: '1px solid var(--border-color)'
              }}>
                <div style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '2rem',
                  color: 'var(--primary-blue)',
                  fontWeight: 700
                }}>
                  {getDisplayPrice(selectedItem) <= 0 ? 'Free' : `${convertPrice(getDisplayPrice(selectedItem))} ${currency}`}
                </div>
                <button className="btn">
                  <Tag size={18} /> Buy Now
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Shop;
