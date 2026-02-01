import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, User, Trophy, Crosshair, Skull, Clock, Users, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import * as Types from '../types';

type TabType = 'players' | 'clans';
type PlayerSortField = 'rank' | 'username' | 'kills' | 'deaths' | 'kd' | 'playTime' | 'mutants' | 'animals' | 'wood' | 'metal' | 'sulfur' | 'firstConnect' | 'lastConnect';

const Statistics: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabType>('players');
  const [allPlayers, setAllPlayers] = useState<Types.Player[]>([]);
  const [topClans, setTopClans] = useState<Types.Clan[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<Types.Player | null>(null);
  const [selectedClan, setSelectedClan] = useState<Types.Clan | null>(null);
  const [loading, setLoading] = useState(true);
  const [playerSort, setPlayerSort] = useState<{ field: PlayerSortField; order: 'asc' | 'desc' }>({ field: 'kills', order: 'desc' });

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
      setAllPlayers(players || []);
      setTopClans((clans || []).sort((a, b) => (b.experience || 0) - (a.experience || 0)).slice(0, 20));
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  const sortedPlayers = useMemo(() => {
    const arr = [...allPlayers];
    const { field, order } = playerSort;
    const mult = order === 'asc' ? 1 : -1;
    arr.sort((a, b) => {
      let va: number | string;
      let vb: number | string;
      switch (field) {
        case 'rank': va = a.rankPosition ?? a.rank ?? 0; vb = b.rankPosition ?? b.rank ?? 0; break;
        case 'username': va = (a.username || '').toLowerCase(); vb = (b.username || '').toLowerCase(); break;
        case 'kills': va = a.killedPlayers ?? 0; vb = b.killedPlayers ?? 0; break;
        case 'deaths': va = a.deaths ?? 0; vb = b.deaths ?? 0; break;
        case 'kd': va = (a.deaths && a.killedPlayers != null) ? a.killedPlayers / a.deaths : a.killedPlayers ?? 0; vb = (b.deaths && b.killedPlayers != null) ? b.killedPlayers / b.deaths : b.killedPlayers ?? 0; break;
        case 'playTime': va = a.playTime ?? a.stats?.timeMinutes ?? 0; vb = b.playTime ?? b.stats?.timeMinutes ?? 0; break;
        case 'mutants': va = a.killedMutants ?? 0; vb = b.killedMutants ?? 0; break;
        case 'animals': va = a.killedAnimals ?? 0; vb = b.killedAnimals ?? 0; break;
        case 'wood': va = a.stats?.wood ?? 0; vb = b.stats?.wood ?? 0; break;
        case 'metal': va = a.stats?.metal ?? 0; vb = b.stats?.metal ?? 0; break;
        case 'sulfur': va = a.stats?.sulfur ?? 0; vb = b.stats?.sulfur ?? 0; break;
        case 'firstConnect': va = a.firstConnectDate || ''; vb = b.firstConnectDate || ''; break;
        case 'lastConnect': va = a.lastConnectDate || ''; vb = b.lastConnectDate || ''; break;
        default: return 0;
      }
      if (typeof va === 'string' && typeof vb === 'string') return mult * va.localeCompare(vb);
      return mult * ((va as number) - (vb as number));
    });
    return arr;
  }, [allPlayers, playerSort]);

  const toggleSort = (field: PlayerSortField) => {
    setPlayerSort(prev => ({
      field,
      order: prev.field === field ? (prev.order === 'asc' ? 'desc' : 'asc') : 'desc'
    }));
  };

  const SortIcon = ({ f }: { f: PlayerSortField }) => {
    if (playerSort.field !== f) return <ChevronsUpDown size={14} style={{ opacity: 0.5 }} />;
    return playerSort.order === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
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

  const goToPlayer = (steamId: string) => {
    setSelectedClan(null); // Close clan modal to prevent stacking
    navigate(`/statistics?player=${steamId}`);
    loadPlayerDetails(steamId);
  };

  const goToClan = (clanId: number) => {
    setSelectedPlayer(null); // Close player modal to prevent stacking
    navigate(`/statistics?clan=${clanId}`);
    loadClanDetails(clanId);
  };

  const formatPlayTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}d ${hours % 24}h`;
    return `${hours}h ${minutes % 60}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getKDRatio = (kills?: number, deaths?: number) => {
    if (!kills && kills !== 0) return '0';
    if (!deaths || deaths === 0) return kills?.toString() || '0';
    return (kills / deaths).toFixed(2);
  };

  const isPlayer = (m: Types.ClanMember | Types.Player): m is Types.Player => 'username' in m;

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
          <BarChart3 size={120} color="var(--primary-blue)" style={{ filter: 'drop-shadow(0 0 30px var(--glow-blue))' }} />
          <h2 style={{ fontFamily: 'Orbitron', fontSize: '1.5rem', color: 'var(--text-primary)', letterSpacing: '1px' }}>
            Loading statistics...
          </h2>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div className="page-header">
          <BarChart3 size={48} color="var(--primary-blue)" style={{ filter: 'drop-shadow(0 0 20px var(--glow-blue))' }} />
          <h1 className="section-title" style={{ marginBottom: 0 }}>{t('nav.statistics')}</h1>
        </div>

        <div className="centered-buttons" style={{ marginBottom: '2rem' }}>
          <button
            onClick={() => { setActiveTab('players'); setSelectedClan(null); setSelectedPlayer(null); }}
            style={{
              padding: '0.75rem 1.5rem',
              background: activeTab === 'players' ? 'linear-gradient(135deg, var(--primary-blue), var(--accent-cyan))' : 'transparent',
              border: '1px solid var(--border-color)',
              color: activeTab === 'players' ? 'var(--text-primary)' : 'var(--text-secondary)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontFamily: 'Orbitron',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            <User size={20} /> Players
          </button>
          <button
            onClick={() => { setActiveTab('clans'); setSelectedPlayer(null); setSelectedClan(null); }}
            style={{
              padding: '0.75rem 1.5rem',
              background: activeTab === 'clans' ? 'linear-gradient(135deg, var(--primary-blue), var(--accent-cyan))' : 'transparent',
              border: '1px solid var(--border-color)',
              color: activeTab === 'clans' ? 'var(--text-primary)' : 'var(--text-secondary)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontFamily: 'Orbitron',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            <Users size={20} /> Clans
          </button>
        </div>

        {/* Player Popup Modal - single modal, prevent stacking */}
        <AnimatePresence mode="wait">
          {selectedPlayer && (
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPlayer(null)}
            >
              <motion.div
                className="modal-floating"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                style={{ maxWidth: 700 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                      width: 64, height: 64,
                      background: 'linear-gradient(135deg, var(--primary-blue), var(--accent-cyan))',
                      borderRadius: '12px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 0 20px var(--glow-blue)'
                    }}>
                      <User size={32} color="#fff" />
                    </div>
                    <div>
                      <h2 style={{ fontFamily: 'Orbitron', fontSize: '1.8rem', color: 'var(--text-primary)', margin: 0 }}>
                        {selectedPlayer.username}
                      </h2>
                      {(selectedPlayer.rankPosition || selectedPlayer.rank) && (
                        <span style={{ color: 'var(--primary-blue)', fontWeight: 600 }}>Rank #{selectedPlayer.rankPosition || selectedPlayer.rank}</span>
                      )}
                    </div>
                  </div>
                  <button onClick={() => setSelectedPlayer(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
                </div>

                <div className="modal-stats-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                  {[
                    { icon: Crosshair, value: selectedPlayer.killedPlayers || 0, label: 'Kills' },
                    { icon: Skull, value: selectedPlayer.deaths || 0, label: 'Deaths' },
                    { icon: Trophy, value: getKDRatio(selectedPlayer.killedPlayers, selectedPlayer.deaths), label: 'K/D' },
                    { icon: Clock, value: formatPlayTime(selectedPlayer.playTime || selectedPlayer.stats?.timeMinutes || 0), label: 'Playtime' },
                  ].map(({ icon: Icon, value, label }) => (
                    <div key={label} style={{ textAlign: 'center', padding: '1rem', background: 'var(--bg-darker)', borderRadius: 8, border: '1px solid var(--border-color)' }}>
                      <Icon size={24} color="var(--primary-blue)" style={{ marginBottom: '0.5rem' }} />
                      <div style={{ fontFamily: 'Orbitron', fontSize: '1.2rem', fontWeight: 700 }}>{value}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{label}</div>
                    </div>
                  ))}
                </div>

                {selectedPlayer.stats && (
                  <div className="modal-stats-grid-4" style={{ padding: '1rem', background: 'var(--bg-darker)', borderRadius: 8, marginBottom: '1rem', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                    <div><strong>Wood</strong> {selectedPlayer.stats.wood?.toLocaleString()}</div>
                    <div><strong>Metal</strong> {selectedPlayer.stats.metal?.toLocaleString()}</div>
                    <div><strong>Sulfur</strong> {selectedPlayer.stats.sulfur?.toLocaleString()}</div>
                    <div><strong>Leather</strong> {selectedPlayer.stats.leather?.toLocaleString()}</div>
                    <div><strong>Cloth</strong> {selectedPlayer.stats.cloth?.toLocaleString()}</div>
                    <div><strong>Fat</strong> {selectedPlayer.stats.fat?.toLocaleString()}</div>
                    <div><strong>Raid Objects</strong> {selectedPlayer.stats.raidObjects?.toLocaleString()}</div>
                    <div><strong>Suicides</strong> {selectedPlayer.stats.suicides ?? 0}</div>
                  </div>
                )}

                <div className="modal-stats-grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}><strong>Killed Mutants:</strong> {selectedPlayer.killedMutants ?? 0}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}><strong>Killed Animals:</strong> {selectedPlayer.killedAnimals ?? 0}</div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  <span>First: {formatDate(selectedPlayer.firstConnectDate)}</span>
                  <span>Last: {formatDate(selectedPlayer.lastConnectDate)}</span>
                  <span style={{ color: selectedPlayer.isOnline ? '#22c55e' : 'var(--text-muted)' }}>
                    {selectedPlayer.isOnline ? '🟢 Online' : '⚫ Offline'}
                  </span>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Clan Popup Modal */}
        <AnimatePresence mode="wait">
          {selectedClan && (
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedClan(null)}
            >
              <motion.div
                className="modal-floating"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                style={{ maxWidth: 700 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                  <div>
                    <h2 style={{ fontFamily: 'Orbitron', fontSize: '1.8rem', color: 'var(--text-primary)', margin: 0 }}>
                      {selectedClan.abbrev || selectedClan.name}
                    </h2>
                    <div style={{ color: 'var(--text-secondary)' }}>{selectedClan.name}</div>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                      <span>Level {selectedClan.level}</span>
                      <span>XP: {selectedClan.experience?.toLocaleString()}</span>
                      <span>{selectedClan.memberCount} members</span>
                    </div>
                  </div>
                  <button onClick={() => setSelectedClan(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
                </div>

                {(selectedClan.totalKills !== undefined || selectedClan.totalFarm !== undefined) && (
                  <div className="modal-stats-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                    {selectedClan.totalKills !== undefined && (
                      <div style={{ textAlign: 'center', padding: '1rem', background: 'var(--bg-darker)', borderRadius: 8 }}>
                        <div style={{ fontFamily: 'Orbitron', fontSize: '1.2rem' }}>{selectedClan.totalKills}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Kills</div>
                      </div>
                    )}
                    {selectedClan.totalDeaths !== undefined && (
                      <div style={{ textAlign: 'center', padding: '1rem', background: 'var(--bg-darker)', borderRadius: 8 }}>
                        <div style={{ fontFamily: 'Orbitron', fontSize: '1.2rem' }}>{selectedClan.totalDeaths}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Deaths</div>
                      </div>
                    )}
                    {selectedClan.totalFarm !== undefined && (
                      <div style={{ textAlign: 'center', padding: '1rem', background: 'var(--bg-darker)', borderRadius: 8 }}>
                        <div style={{ fontFamily: 'Orbitron', fontSize: '1.2rem' }}>{(selectedClan.totalFarm / 1000).toFixed(0)}k</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Farm</div>
                      </div>
                    )}
                  </div>
                )}

                {selectedClan.motd && (
                  <div style={{ padding: '1rem', background: 'var(--bg-darker)', borderRadius: 8, marginBottom: '1rem' }}>
                    <strong>MOTD:</strong> {selectedClan.motd}
                  </div>
                )}

                <div style={{ marginTop: '1rem' }}>
                  <strong>Members:</strong>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                    {selectedClan.members?.map((m) => {
                      const p = isPlayer(m) ? m : null;
                      const steamId = p ? p.steamId : (m as Types.ClanMember).steamId;
                      return (
                        <button
                          key={steamId}
                          className={`btn btn-secondary ${p?.isOnline ? 'online-highlight' : ''}`}
                          style={{
                            padding: '0.5rem 1rem',
                            fontSize: '0.9rem',
                            background: p?.isOnline ? 'rgba(34, 197, 94, 0.2)' : undefined,
                            borderColor: p?.isOnline ? 'rgba(34, 197, 94, 0.5)' : undefined
                          }}
                          onClick={() => goToPlayer(steamId)}
                        >
                          {p?.username || steamId.slice(-8)} {p?.isOnline && '🟢'}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Players Table */}
        {activeTab === 'players' && (
          <>
            <h2 style={{ fontFamily: 'Orbitron', fontSize: '1.5rem', color: 'var(--primary-blue)', marginBottom: '1.5rem', textAlign: 'center' }}>
              Players ({sortedPlayers.length})
            </h2>
            <div className="stats-table-wrapper">
              <table className="stats-table">
                <thead>
                  <tr>
                    <th onClick={() => toggleSort('rank')}><span>#</span><SortIcon f="rank" /></th>
                    <th onClick={() => toggleSort('username')}><span>Player</span><SortIcon f="username" /></th>
                    <th onClick={() => toggleSort('kills')}><span>Kills</span><SortIcon f="kills" /></th>
                    <th onClick={() => toggleSort('deaths')}><span>Deaths</span><SortIcon f="deaths" /></th>
                    <th onClick={() => toggleSort('kd')}><span>K/D</span><SortIcon f="kd" /></th>
                    <th onClick={() => toggleSort('playTime')}><span>Playtime</span><SortIcon f="playTime" /></th>
                    <th onClick={() => toggleSort('mutants')}><span>Mutants</span><SortIcon f="mutants" /></th>
                    <th onClick={() => toggleSort('animals')}><span>Animals</span><SortIcon f="animals" /></th>
                    <th onClick={() => toggleSort('wood')}><span>Wood</span><SortIcon f="wood" /></th>
                    <th onClick={() => toggleSort('metal')}><span>Metal</span><SortIcon f="metal" /></th>
                    <th onClick={() => toggleSort('sulfur')}><span>Sulfur</span><SortIcon f="sulfur" /></th>
                    <th onClick={() => toggleSort('firstConnect')}><span>First</span><SortIcon f="firstConnect" /></th>
                    <th onClick={() => toggleSort('lastConnect')}><span>Last</span><SortIcon f="lastConnect" /></th>
                    <th>Online</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedPlayers.map((player, index) => (
                    <motion.tr
                      key={player.steamId}
                      className={`stats-table-row ${player.isOnline ? 'online-highlight' : ''}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: Math.min(index * 0.01, 0.3) }}
                      onClick={() => goToPlayer(player.steamId)}
                    >
                      <td>{(player.rankPosition ?? player.rank) || index + 1}</td>
                      <td>
                        <span style={{ fontWeight: 600 }}>{player.username}</span>
                        {player.isOnline && <span className="online-badge" style={{ marginLeft: '0.25rem', fontSize: '0.7rem' }}>🟢</span>}
                      </td>
                      <td>{player.killedPlayers ?? 0}</td>
                      <td>{player.deaths ?? 0}</td>
                      <td>{getKDRatio(player.killedPlayers, player.deaths)}</td>
                      <td>{formatPlayTime(player.playTime || player.stats?.timeMinutes || 0)}</td>
                      <td>{player.killedMutants ?? 0}</td>
                      <td>{player.killedAnimals ?? 0}</td>
                      <td>{(player.stats?.wood ?? 0).toLocaleString()}</td>
                      <td>{(player.stats?.metal ?? 0).toLocaleString()}</td>
                      <td>{(player.stats?.sulfur ?? 0).toLocaleString()}</td>
                      <td>{player.firstConnectDate ? formatDate(player.firstConnectDate) : '—'}</td>
                      <td>{player.lastConnectDate ? formatDate(player.lastConnectDate) : '—'}</td>
                      <td>{player.isOnline ? '🟢' : '⚫'}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Clans List */}
        {activeTab === 'clans' && (
          <>
        <h2 style={{ fontFamily: 'Orbitron', fontSize: '1.5rem', color: 'var(--primary-blue)', marginBottom: '1.5rem', textAlign: 'center' }}>
          Top Clans
        </h2>
        <div style={{ display: 'grid', gap: '1rem' }}>

          {topClans.map((clan, index) => (
            <motion.div
              key={clan.id}
              className="card"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
              onClick={() => goToClan(clan.id)}
              style={{ cursor: 'pointer', display: 'grid', gridTemplateColumns: '60px 1fr auto', gap: '1.5rem', alignItems: 'center' }}
            >
              <div style={{
                width: 60, height: 60,
                background: index < 3 ? ['#fbbf24', '#94a3af', '#fb923c'][index] : 'var(--primary-blue)',
                borderRadius: '12px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Orbitron', fontSize: '1.5rem', fontWeight: 900, color: '#fff'
              }}>
                {index + 1}
              </div>
              <div>
                <div style={{ fontFamily: 'Orbitron', fontSize: '1.2rem', color: 'var(--text-primary)' }}>
                  {clan.abbrev || clan.name} {clan.name}
                </div>
                <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  <span>Level {clan.level}</span>
                  <span>XP: {clan.experience?.toLocaleString()}</span>
                  <span>{clan.memberCount} members</span>
                </div>
              </div>
              <div style={{ fontFamily: 'Orbitron', fontSize: '1.2rem', color: 'var(--primary-blue)', fontWeight: 700 }}>
                #{clan.rank || index + 1}
              </div>
            </motion.div>
          ))}
        </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default Statistics;
