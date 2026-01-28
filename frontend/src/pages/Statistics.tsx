import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, User, Trophy, Crosshair, Skull, Clock, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { apiService } from '../services/api';
import * as Types from '../types';

const Statistics: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [topPlayers, setTopPlayers] = useState<Types.Player[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<Types.Player | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const playerSteamId = searchParams.get('player');
    if (playerSteamId) {
      loadPlayerDetails(playerSteamId);
    }
  }, [searchParams]);

  const loadData = async () => {
    try {
      const players = await apiService.getPlayers();
      setTopPlayers(players.sort((a, b) => (b.kills || 0) - (a.kills || 0)).slice(0, 20));
      setLoading(false);
    } catch (error) {
      console.error('Error loading players:', error);
      setLoading(false);
    }
  };

  const loadPlayerDetails = async (steamId: string) => {
    try {
      const player = await apiService.getPlayer(steamId);
      setSelectedPlayer(player);
    } catch (error) {
      console.error('Error loading player details:', error);
    }
  };

  const formatPlayTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h`;
    return `${hours}h ${minutes % 60}m`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getKDRatio = (kills?: number, deaths?: number) => {
    if (!kills || !deaths || deaths === 0) return kills || 0;
    return (kills / deaths).toFixed(2);
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
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center'
          }}
        >
          <motion.div
            animate={{
              y: [0, -20, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{
              marginBottom: '2rem'
            }}
          >
            <BarChart3 size={120} color="var(--primary-blue)" style={{ filter: 'drop-shadow(0 0 30px var(--glow-blue))' }} />
          </motion.div>
          <h2 style={{
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '1.5rem',
            color: 'var(--text-primary)',
            letterSpacing: '1px'
          }}>
            Loading statistics...
          </h2>
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
          marginBottom: '3rem'
        }}>
          <BarChart3 size={48} color="var(--primary-blue)" style={{ filter: 'drop-shadow(0 0 20px var(--glow-blue))' }} />
          <h1 className="section-title" style={{ marginBottom: 0 }}>{t('nav.statistics')}</h1>
        </div>

        {/* Player Details Modal */}
        {selectedPlayer && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="card"
            style={{
              background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.1), rgba(6, 182, 212, 0.05))',
              border: '2px solid var(--border-bright)',
              marginBottom: '3rem',
              maxWidth: '800px',
              margin: '0 auto 3rem'
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1.5rem',
              marginBottom: '2rem',
              paddingBottom: '1.5rem',
              borderBottom: '1px solid var(--border-color)'
            }}>
              <div style={{
                width: 80,
                height: 80,
                background: 'linear-gradient(135deg, var(--primary-blue), var(--accent-cyan))',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 30px var(--glow-blue)'
              }}>
                <User size={40} color="#ffffff" />
              </div>
              <div>
                <h2 style={{
                  fontFamily: 'Orbitron, sans-serif',
                  fontSize: '2rem',
                  color: 'var(--text-primary)',
                  marginBottom: '0.5rem',
                  letterSpacing: '1px'
                }}>
                  {selectedPlayer.username}
                </h2>
                {selectedPlayer.rank && (
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.25rem 0.75rem',
                    background: 'rgba(14, 165, 233, 0.2)',
                    borderRadius: '6px',
                    border: '1px solid var(--border-bright)'
                  }}>
                    <Trophy size={16} color="var(--primary-blue)" />
                    <span style={{
                      color: 'var(--primary-blue)',
                      fontWeight: 600,
                      fontSize: '0.9rem'
                    }}>
                      Rank #{selectedPlayer.rank}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '1rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{
                background: 'rgba(15, 23, 42, 0.6)',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                textAlign: 'center'
              }}>
                <Crosshair size={24} color="var(--primary-blue)" style={{ marginBottom: '0.5rem' }} />
                <div style={{
                  fontFamily: 'Orbitron, sans-serif',
                  fontSize: '1.8rem',
                  color: 'var(--text-primary)',
                  marginBottom: '0.25rem'
                }}>
                  {selectedPlayer.kills || 0}
                </div>
                <div style={{
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase'
                }}>
                  Kills
                </div>
              </div>

              <div style={{
                background: 'rgba(15, 23, 42, 0.6)',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                textAlign: 'center'
              }}>
                <Skull size={24} color="var(--primary-blue)" style={{ marginBottom: '0.5rem' }} />
                <div style={{
                  fontFamily: 'Orbitron, sans-serif',
                  fontSize: '1.8rem',
                  color: 'var(--text-primary)',
                  marginBottom: '0.25rem'
                }}>
                  {selectedPlayer.deaths || 0}
                </div>
                <div style={{
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase'
                }}>
                  Deaths
                </div>
              </div>

              <div style={{
                background: 'rgba(15, 23, 42, 0.6)',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                textAlign: 'center'
              }}>
                <Trophy size={24} color="var(--primary-blue)" style={{ marginBottom: '0.5rem' }} />
                <div style={{
                  fontFamily: 'Orbitron, sans-serif',
                  fontSize: '1.8rem',
                  color: 'var(--text-primary)',
                  marginBottom: '0.25rem'
                }}>
                  {getKDRatio(selectedPlayer.kills, selectedPlayer.deaths)}
                </div>
                <div style={{
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase'
                }}>
                  K/D Ratio
                </div>
              </div>

              <div style={{
                background: 'rgba(15, 23, 42, 0.6)',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                textAlign: 'center'
              }}>
                <Clock size={24} color="var(--primary-blue)" style={{ marginBottom: '0.5rem' }} />
                <div style={{
                  fontFamily: 'Orbitron, sans-serif',
                  fontSize: '1.8rem',
                  color: 'var(--text-primary)',
                  marginBottom: '0.25rem'
                }}>
                  {formatPlayTime(selectedPlayer.playTime)}
                </div>
                <div style={{
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase'
                }}>
                  Playtime
                </div>
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid var(--border-color)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                color: 'var(--text-secondary)'
              }}>
                <Calendar size={20} color="var(--primary-blue)" />
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>First Joined</div>
                  <div style={{ fontWeight: 600 }}>{formatDate(selectedPlayer.firstJoined)}</div>
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                color: 'var(--text-secondary)'
              }}>
                <Clock size={20} color="var(--primary-blue)" />
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Last Seen</div>
                  <div style={{ fontWeight: 600 }}>{formatDate(selectedPlayer.lastSeen)}</div>
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                color: 'var(--text-secondary)'
              }}>
                <div style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: selectedPlayer.isOnline ? '#22c55e' : '#6b7280',
                  boxShadow: selectedPlayer.isOnline ? '0 0 10px #22c55e' : 'none'
                }} />
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Status</div>
                  <div style={{ fontWeight: 600, color: selectedPlayer.isOnline ? '#22c55e' : 'var(--text-muted)' }}>
                    {selectedPlayer.isOnline ? 'Online' : 'Offline'}
                  </div>
                </div>
              </div>
            </div>

            <motion.button
              onClick={() => setSelectedPlayer(null)}
              className="btn btn-secondary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{ marginTop: '1.5rem', width: '100%' }}
            >
              Close
            </motion.button>
          </motion.div>
        )}

        {/* Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 style={{
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '2rem',
            color: 'var(--primary-blue)',
            marginBottom: '2rem',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            textAlign: 'center'
          }}>
            Top Players
          </h2>

          <div style={{
            display: 'grid',
            gap: '1rem'
          }}>
            {topPlayers.map((player, index) => (
              <motion.div
                key={player.steamId}
                className="card"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.03 }}
                onClick={() => loadPlayerDetails(player.steamId)}
                style={{
                  cursor: 'pointer',
                  background: index < 3 
                    ? 'linear-gradient(135deg, rgba(14, 165, 233, 0.15), rgba(6, 182, 212, 0.08))'
                    : undefined
                }}
              >
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '60px 1fr auto',
                  gap: '1.5rem',
                  alignItems: 'center'
                }}>
                  <div style={{
                    width: 60,
                    height: 60,
                    background: index === 0 
                      ? 'linear-gradient(135deg, #fbbf24, #f59e0b)'
                      : index === 1 
                      ? 'linear-gradient(135deg, #d1d5db, #9ca3af)'
                      : index === 2 
                      ? 'linear-gradient(135deg, #fb923c, #ea580c)'
                      : 'linear-gradient(135deg, var(--primary-blue), var(--accent-cyan))',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'Orbitron, sans-serif',
                    fontSize: '1.5rem',
                    fontWeight: 900,
                    color: '#ffffff',
                    boxShadow: index < 3 ? '0 0 20px rgba(14, 165, 233, 0.5)' : 'none'
                  }}>
                    {index + 1}
                  </div>

                  <div>
                    <div style={{
                      fontFamily: 'Orbitron, sans-serif',
                      fontSize: '1.2rem',
                      color: 'var(--text-primary)',
                      marginBottom: '0.25rem',
                      letterSpacing: '0.5px'
                    }}>
                      {player.username}
                    </div>
                    <div style={{
                      display: 'flex',
                      gap: '1.5rem',
                      color: 'var(--text-secondary)',
                      fontSize: '0.9rem'
                    }}>
                      <span>
                        <Crosshair size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                        {player.kills || 0} kills
                      </span>
                      <span>
                        <Skull size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                        {player.deaths || 0} deaths
                      </span>
                      <span>
                        <Clock size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                        {formatPlayTime(player.playTime)}
                      </span>
                    </div>
                  </div>

                  <div style={{
                    fontFamily: 'Orbitron, sans-serif',
                    fontSize: '1.5rem',
                    color: 'var(--primary-blue)',
                    fontWeight: 700
                  }}>
                    {getKDRatio(player.kills, player.deaths)} K/D
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Statistics;
