import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, User, Trophy, Crosshair, Skull, Clock, Calendar, Users, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { apiService } from '../services/api';
import * as Types from '../types';

type TabType = 'players' | 'clans';

const Statistics: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabType>('players');
  const [topPlayers, setTopPlayers] = useState<Types.Player[]>([]);
  const [topClans, setTopClans] = useState<Types.Clan[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<Types.Player | null>(null);
  const [selectedClan, setSelectedClan] = useState<Types.Clan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const playerSteamId = searchParams.get('player');
    const clanId = searchParams.get('clan');
    if (playerSteamId) {
      loadPlayerDetails(playerSteamId);
      setActiveTab('players');
    } else if (clanId) {
      loadClanDetails(parseInt(clanId));
      setActiveTab('clans');
    }
  }, [searchParams]);

  const loadData = async () => {
    try {
      const [players, clans] = await Promise.all([
        apiService.getPlayers(undefined, undefined, true),
        apiService.getClans(true)
      ]);
      setTopPlayers(players.sort((a, b) => (b.killedPlayers || 0) - (a.killedPlayers || 0)).slice(0, 20));
      setTopClans(clans.sort((a, b) => (b.experience || 0) - (a.experience || 0)).slice(0, 20));
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  const loadClanDetails = async (id: number) => {
    try {
      const clan = await apiService.getClan(id);
      setSelectedClan(clan);
    } catch (error) {
      console.error('Error loading clan:', error);
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
    if (!kills && kills !== 0) return '0';
    if (!deaths || deaths === 0) return kills?.toString() || '0';
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
          marginBottom: '2rem'
        }}>
          <BarChart3 size={48} color="var(--primary-blue)" style={{ filter: 'drop-shadow(0 0 20px var(--glow-blue))' }} />
          <h1 className="section-title" style={{ marginBottom: 0 }}>{t('nav.statistics')}</h1>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          justifyContent: 'center',
          marginBottom: '2rem',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => { setActiveTab('players'); setSelectedClan(null); }}
            style={{
              padding: '0.75rem 1.5rem',
              background: activeTab === 'players' ? 'linear-gradient(135deg, var(--primary-blue), var(--accent-cyan))' : 'transparent',
              border: '1px solid var(--border-color)',
              color: activeTab === 'players' ? 'var(--text-primary)' : 'var(--text-secondary)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontFamily: 'Orbitron, sans-serif',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <User size={20} /> Players
          </button>
          <button
            onClick={() => { setActiveTab('clans'); setSelectedPlayer(null); }}
            style={{
              padding: '0.75rem 1.5rem',
              background: activeTab === 'clans' ? 'linear-gradient(135deg, var(--primary-blue), var(--accent-cyan))' : 'transparent',
              border: '1px solid var(--border-color)',
              color: activeTab === 'clans' ? 'var(--text-primary)' : 'var(--text-secondary)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontFamily: 'Orbitron, sans-serif',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Users size={20} /> Clans
          </button>
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
                {(selectedPlayer.rankPosition || selectedPlayer.rank) && (
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
                      Rank #{selectedPlayer.rankPosition || selectedPlayer.rank}
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
                  {selectedPlayer.killedPlayers || 0}
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
                  {getKDRatio(selectedPlayer.killedPlayers, selectedPlayer.deaths)}
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
                  {formatPlayTime(selectedPlayer.playTime || selectedPlayer.stats?.timeMinutes || 0)}
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

            {selectedPlayer.stats && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                gap: '0.75rem',
                marginBottom: '1.5rem',
                padding: '1rem',
                background: 'rgba(15, 23, 42, 0.6)',
                borderRadius: '8px',
                border: '1px solid var(--border-color)'
              }}>
                <div><strong style={{ color: 'var(--text-muted)' }}>Wood</strong><br />{selectedPlayer.stats.wood?.toLocaleString()}</div>
                <div><strong style={{ color: 'var(--text-muted)' }}>Metal</strong><br />{selectedPlayer.stats.metal?.toLocaleString()}</div>
                <div><strong style={{ color: 'var(--text-muted)' }}>Sulfur</strong><br />{selectedPlayer.stats.sulfur?.toLocaleString()}</div>
                <div><strong style={{ color: 'var(--text-muted)' }}>Raid Obj</strong><br />{selectedPlayer.stats.raidObjects}</div>
                <div><strong style={{ color: 'var(--text-muted)' }}>Suicides</strong><br />{selectedPlayer.stats.suicides}</div>
              </div>
            )}

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
                  <div style={{ fontWeight: 600 }}>{formatDate(selectedPlayer.firstConnectDate)}</div>
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
                  <div style={{ fontWeight: 600 }}>{formatDate(selectedPlayer.lastConnectDate)}</div>
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

        {/* Clan Details Modal */}
        {selectedClan && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card"
            style={{
              background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.1), rgba(6, 182, 212, 0.05))',
              border: '2px solid var(--border-bright)',
              marginBottom: '3rem',
              maxWidth: '800px',
              margin: '0 auto 3rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div style={{
                width: 80, height: 80,
                background: 'linear-gradient(135deg, var(--primary-blue), var(--accent-cyan))',
                borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 30px var(--glow-blue)'
              }}>
                <Users size={40} color="#ffffff" />
              </div>
              <div>
                <h2 style={{ fontFamily: 'Orbitron', fontSize: '2rem', color: 'var(--text-primary)' }}>
                  {selectedClan.abbrev || selectedClan.name}
                </h2>
                <div style={{ color: 'var(--text-secondary)' }}>{selectedClan.name}</div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  <span>Level {selectedClan.level}</span>
                  <span>XP: {selectedClan.experience?.toLocaleString()}</span>
                  <span>{selectedClan.memberCount} members</span>
                  <span>Tax: {selectedClan.tax}%</span>
                </div>
              </div>
            </div>
            {selectedClan.motd && (
              <div style={{ padding: '1rem', background: 'rgba(15,23,42,0.6)', borderRadius: '8px', marginBottom: '1rem' }}>
                <strong>MOTD:</strong> {selectedClan.motd}
              </div>
            )}
            <motion.button onClick={() => setSelectedClan(null)} className="btn btn-secondary" style={{ marginTop: '1rem', width: '100%' }}>
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
            {activeTab === 'players' ? 'Top Players' : 'Top Clans'}
          </h2>

          <div style={{ display: 'grid', gap: '1rem' }}>
            {activeTab === 'players' && topPlayers.map((player, index) => (
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
                        {player.killedPlayers || 0} kills
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
                    {getKDRatio(player.killedPlayers, player.deaths)} K/D
                  </div>
                </div>
              </motion.div>
            ))}

            {activeTab === 'clans' && topClans.map((clan, index) => (
              <motion.div
                key={clan.id}
                className="card"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.03 }}
                onClick={() => loadClanDetails(clan.id)}
                style={{
                  cursor: 'pointer',
                  background: index < 3 ? 'linear-gradient(135deg, rgba(14, 165, 233, 0.15), rgba(6, 182, 212, 0.08))' : undefined
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr auto', gap: '1.5rem', alignItems: 'center' }}>
                  <div style={{
                    width: 60, height: 60,
                    background: index === 0 ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' : index === 1 ? 'linear-gradient(135deg, #d1d5db, #9ca3af)' : index === 2 ? 'linear-gradient(135deg, #fb923c, #ea580c)' : 'linear-gradient(135deg, var(--primary-blue), var(--accent-cyan))',
                    borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'Orbitron', fontSize: '1.5rem', fontWeight: 900, color: '#ffffff'
                  }}>
                    {index + 1}
                  </div>
                  <div>
                    <div style={{ fontFamily: 'Orbitron', fontSize: '1.2rem', color: 'var(--text-primary)' }}>
                      {clan.abbrev || clan.name} {clan.name}
                    </div>
                    <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      <span><Zap size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />Level {clan.level}</span>
                      <span>XP: {clan.experience?.toLocaleString()}</span>
                      <span><Users size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />{clan.memberCount} members</span>
                    </div>
                  </div>
                  <div style={{ fontFamily: 'Orbitron', fontSize: '1.2rem', color: 'var(--primary-blue)', fontWeight: 700 }}>
                    #{clan.rank || index + 1}
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
