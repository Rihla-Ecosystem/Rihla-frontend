'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { C } from '@/lib/constants/theme';
import { Geom } from '@/app/components/atoms';
import { Clock, Zap, ChevronRight, BookOpen, AlertCircle, RefreshCw, Compass, Award } from 'lucide-react';
import { TopBar } from '@/app/components/layout/TopBar';
import { useAuth } from '@/lib/auth';
import { userService } from '@/services/userService';
import { historyService, TripHistoryItem, UserBadgeItem, InteractionSummaryItem } from '@/services/historyService';

const ALL_GOVERNORATES = ['Cairo', 'Giza', 'Luxor', 'Aswan', 'Alexandria', 'Red Sea', 'Sinai'];

interface FormattedVisit {
  id: string;
  date: string;
  dateISO: string;
  site: string;
  siteAr?: string;
  gov: string;
  cat: string;
  img: string;
  duration: string;
  xp: number;
  badge?: string | null;
  story: string;
  rafiqNote: string;
  tags: string[];
}

export default function HistoryPage() {
  const { user: authUser, isAuthenticated, isLoading: authLoading } = useAuth();

  const [userProfile, setUserProfile] = useState<any>(null);
  const [trips, setTrips] = useState<TripHistoryItem[]>([]);
  const [userBadges, setUserBadges] = useState<UserBadgeItem[]>([]);
  const [summaryData, setSummaryData] = useState<InteractionSummaryItem | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const badgeIcons = ['🏔', '🏺', '📜', '🧭', '🌿', '🌊'];
  const badgeColors = [C.sand, C.faience, C.copper, '#A89880', '#A89880', '#A89880'];

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [profileRes, tripsRes, summaryRes] = await Promise.allSettled([
        userService.getProfile(),
        historyService.getTrips(),
        historyService.getSummary(),
      ]);

      let userId = authUser?.id;
      if (profileRes.status === 'fulfilled' && profileRes.value) {
        setUserProfile(profileRes.value);
        userId = profileRes.value.id || userId;
      }

      if (tripsRes.status === 'fulfilled' && Array.isArray(tripsRes.value)) {
        setTrips(tripsRes.value);
        if (tripsRes.value.length > 0) {
          setExpanded(tripsRes.value[0].id);
        }
      }

      if (summaryRes.status === 'fulfilled') {
        setSummaryData(summaryRes.value);
      }

      if (userId) {
        try {
          const badges = await historyService.getBadges(userId);
          setUserBadges(badges);
        } catch (e) {
          console.warn('Failed to fetch user badges:', e);
        }
      }
    } catch (err: any) {
      console.error('Error fetching history page data:', err);
      setError(err.message || 'Failed to load journey history. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [authUser]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, fetchData]);

  if (authLoading || (loading && !userProfile && trips.length === 0)) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <TopBar location="Your Journey · Egypt" />
        <div style={{ padding: '40px 32px', maxWidth: 1100, margin: '0 auto', width: '100%' }}>
          <div style={{ height: 160, background: `${C.limestoneDark}50`, borderRadius: 16, marginBottom: 24, animation: 'pulse 1.5s infinite ease-in-out' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[1, 2, 3].map((i) => (
                <div key={i} style={{ height: 90, background: `${C.limestoneDark}40`, borderRadius: 14, animation: 'pulse 1.5s infinite ease-in-out' }} />
              ))}
            </div>
            <div style={{ height: 300, background: `${C.limestoneDark}40`, borderRadius: 16, animation: 'pulse 1.5s infinite ease-in-out' }} />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <TopBar location="Your Journey · Egypt" />
        <div style={{ padding: '60px 32px', textAlign: 'center', maxWidth: 500, margin: '0 auto' }}>
          <AlertCircle size={48} color={C.copper} style={{ marginBottom: 16 }} />
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '24px', color: C.nile, marginBottom: 8 }}>
            Unable to Load Journey History
          </h2>
          <p style={{ fontFamily: "'Inter',sans-serif", fontSize: '14px', color: '#6B6354', marginBottom: 20 }}>
            {error}
          </p>
          <button
            onClick={fetchData}
            style={{
              background: C.copper,
              color: C.limestone,
              border: 'none',
              borderRadius: 8,
              padding: '10px 20px',
              fontFamily: "'Inter',sans-serif",
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <RefreshCw size={16} /> Retry
          </button>
        </div>
      </div>
    );
  }

  const formattedVisits: FormattedVisit[] = trips.map((t) => {
    const startDateObj = new Date(t.startDate);
    const endDateObj = new Date(t.endDate);
    let durationStr = '45m';
    if (!isNaN(startDateObj.getTime()) && !isNaN(endDateObj.getTime())) {
      const diffMs = endDateObj.getTime() - startDateObj.getTime();
      const diffMins = Math.max(15, Math.floor(diffMs / (1000 * 60)));
      const hrs = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      durationStr = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
    }
    const dateISO = !isNaN(startDateObj.getTime())
      ? startDateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
      : 'Recorded';
    const isToday = !isNaN(startDateObj.getTime()) && startDateObj.toDateString() === new Date().toDateString();
    const dateLabel = isToday ? 'Today' : dateISO;
    const itineraryObj = typeof t.itinerary === 'object' && t.itinerary !== null ? t.itinerary : {};

    return {
      id: t.id,
      date: dateLabel,
      dateISO,
      site: t.title || 'Historical Exploration',
      siteAr: itineraryObj.siteAr || '',
      gov: t.destination || 'Egypt',
      cat: itineraryObj.category || 'Archeological',
      img: itineraryObj.image || 'https://images.unsplash.com/photo-1539768942893-daf53e448371?w=600&h=400&fit=crop',
      duration: durationStr,
      xp: itineraryObj.xp || 100,
      badge: itineraryObj.badge || null,
      story: t.notes || itineraryObj.story || 'A memorable historical exploration recorded in your journey log.',
      rafiqNote: itineraryObj.rafiqNote || 'Rafiq provided AI guidance and context for this destination.',
      tags: itineraryObj.tags || ['Exploration', t.destination],
    };
  });

  const totalXP = userProfile?.xp ?? 0;
  const currentLevel = userProfile?.level ?? 1;

  const govVisits: Record<string, number> = {};
  ALL_GOVERNORATES.forEach((g) => { govVisits[g] = 0; });
  trips.forEach((t) => {
    const dest = (t.destination || '').toLowerCase();
    const matched = ALL_GOVERNORATES.find((g) => dest.includes(g.toLowerCase()));
    if (matched) {
      govVisits[matched] = (govVisits[matched] || 0) + 1;
    }
  });
  const exploredGovCount = Object.values(govVisits).filter((c) => c > 0).length;

  const filteredVisits = formattedVisits.filter(
    (v) => filter === 'all' || v.gov.toLowerCase().includes(filter.toLowerCase())
  );

  const uniqueGovs = Array.from(new Set(['all', ...trips.map((t) => (t.destination || 'Egypt').toLowerCase())]));

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <TopBar location="Your Journey · Egypt" />

      <div
        style={{
          background: `linear-gradient(135deg,${C.copper} 0%,#5C3A1E 50%,${C.basalt} 100%)`,
          padding: '28px 32px',
          flexShrink: 0,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', right: -40, top: -40 }}>
          <Geom size={260} color={C.limestone} op={0.028} />
        </div>
        <div
          style={{
            maxWidth: 1100,
            margin: '0 auto',
            position: 'relative',
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            alignItems: 'center',
            gap: 32,
          }}
        >
          <div>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '10px', fontWeight: 600, color: `${C.limestone}45`, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 8 }}>
              Your Egyptian Story
            </div>
            <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(22px,3vw,34px)', fontWeight: 400, color: C.limestone, lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: 6 }}>
              Visit <span style={{ fontStyle: 'italic', color: C.sand }}>History</span>
            </h1>
            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: '13px', color: `${C.limestone}55`, lineHeight: 1.6 }}>
              {userProfile?.displayName ? `${userProfile.displayName}'s journey log.` : 'Every place you have been. Every story Rafiq told.'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {[
              { label: 'Sites visited', val: String(trips.length), col: C.sand },
              { label: 'Total XP earned', val: `${totalXP}`, col: C.faience },
              { label: 'Level', val: `Lvl ${currentLevel}`, col: C.limestone },
            ].map(({ label, val, col }) => (
              <div key={label} style={{ background: `${C.limestone}08`, border: `1px solid ${C.limestone}18`, borderRadius: 12, padding: '14px 18px', textAlign: 'center', minWidth: 110 }}>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '10px', color: `${C.limestone}45`, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 5 }}>{label}</div>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '22px', fontWeight: 500, color: col }}>{val}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          padding: '24px 32px',
          maxWidth: 1100,
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box',
          display: 'grid',
          gridTemplateColumns: '1fr 300px',
          gap: 24,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {uniqueGovs.length > 1 && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
              {uniqueGovs.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    background: filter === f ? C.nile : 'transparent',
                    border: `1.5px solid ${filter === f ? C.nile : 'rgba(27,26,23,0.13)'}`,
                    borderRadius: 99,
                    padding: '6px 16px',
                    fontFamily: "'Inter',sans-serif",
                    fontSize: '13px',
                    fontWeight: filter === f ? 600 : 400,
                    color: filter === f ? C.limestone : '#6B6354',
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                  }}
                >
                  {f === 'all' ? 'All locations' : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          )}

          {filteredVisits.length === 0 ? (
            <div
              style={{
                background: C.limestone,
                borderRadius: 16,
                padding: '40px 24px',
                textAlign: 'center',
                border: '1px solid rgba(27,26,23,0.07)',
              }}
            >
              <Compass size={40} color={C.copper} style={{ marginBottom: 12 }} />
              <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '20px', color: C.nile, marginBottom: 6 }}>
                No Trips Logged Yet
              </h3>
              <p style={{ fontFamily: "'Inter',sans-serif", fontSize: '13px', color: '#8B7E6A', maxWidth: 380, margin: '0 auto 16px' }}>
                As you explore historic sites and interact with Rafiq, your journey records will appear right here.
              </p>
            </div>
          ) : (
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: 19, top: 20, bottom: 20, width: 1.5, background: `linear-gradient(180deg,${C.copper}40,${C.limestoneDark})`, zIndex: 0 }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {filteredVisits.map((v, i) => {
                  const isOpen = expanded === v.id;
                  const isFirst = i === 0 || filteredVisits[i - 1].date !== v.date;
                  return (
                    <div key={v.id}>
                      {isFirst && (
                        <div style={{ paddingLeft: 52, marginBottom: 10, marginTop: i === 0 ? 0 : 16 }}>
                          <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '11px', fontWeight: 700, color: C.copper, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                            {v.date}
                          </span>
                        </div>
                      )}
                      <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr', gap: 12, marginBottom: 10, position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 16 }}>
                          <div style={{ width: 12, height: 12, borderRadius: '50%', background: isOpen ? C.copper : C.limestoneDark, border: `2px solid ${isOpen ? C.copper : '#C4B89A'}`, boxShadow: isOpen ? `0 0 0 4px ${C.copper}20` : 'none', transition: 'all 0.2s', flexShrink: 0 }} />
                        </div>
                        <div
                          onClick={() => setExpanded(isOpen ? null : v.id)}
                          style={{
                            background: C.limestone,
                            borderRadius: 14,
                            border: `1.5px solid ${isOpen ? C.copper : 'rgba(27,26,23,0.07)'}`,
                            boxShadow: isOpen ? `0 4px 24px ${C.copper}12` : '0 1px 6px rgba(27,26,23,0.04)',
                            cursor: 'pointer',
                            overflow: 'hidden',
                            transition: 'all 0.22s',
                          }}
                        >
                          <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr auto', gap: 0 }}>
                            <div style={{ height: isOpen ? 120 : 80, overflow: 'hidden', flexShrink: 0, transition: 'height 0.3s' }}>
                              <img src={v.img} alt={v.site} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <div style={{ padding: '12px 14px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
                                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '14px', fontWeight: 700, color: C.nile }}>{v.site}</span>
                                {v.badge && (
                                  <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '10px', fontWeight: 700, background: `${C.faience}15`, color: C.faience, padding: '2px 7px', borderRadius: 99 }}>🏅 {v.badge}</span>
                                )}
                              </div>
                              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', fontSize: '11px', color: '#A89880', marginBottom: 7 }}>
                                {v.siteAr ? `${v.siteAr} · ` : ''}{v.gov}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <Clock size={11} color="#A89880" strokeWidth={2} />
                                  <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '11px', color: '#8B7E6A' }}>{v.duration}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <Zap size={11} color={C.sand} strokeWidth={2} />
                                  <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '11px', fontWeight: 700, color: C.copper }}>+{v.xp} XP</span>
                                </div>
                                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '10px', color: '#A89880', background: C.limestoneDark, padding: '2px 7px', borderRadius: 99 }}>{v.cat}</span>
                              </div>
                            </div>
                            <div style={{ padding: '14px 14px 0 0', display: 'flex', alignItems: 'flex-start' }}>
                              <ChevronRight size={15} color="#C4B89A" strokeWidth={2} style={{ transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s', marginTop: 2 }} />
                            </div>
                          </div>
                          {isOpen && (
                            <div style={{ padding: '0 16px 16px', borderTop: `1px solid ${C.copper}12`, marginTop: 2 }}>
                              <div style={{ background: 'linear-gradient(145deg,#FAF3E4,#F0E8D0)', borderRadius: 10, padding: '14px 15px', margin: '12px 0 10px', border: `1px solid ${C.sand}20` }}>
                                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '9px', fontWeight: 700, color: C.copper, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 6 }}>◈ Rihla Story</div>
                                <p style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', fontSize: '13px', color: C.nile, lineHeight: 1.75, margin: 0 }}>{v.story}</p>
                              </div>
                              <div style={{ background: `${C.faience}08`, border: `1px solid ${C.faience}20`, borderRadius: 9, padding: '10px 12px', marginBottom: 10 }}>
                                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '9px', fontWeight: 700, color: C.faience, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4 }}>◈ Rafiq Note</div>
                                <p style={{ fontFamily: "'Inter',sans-serif", fontSize: '12px', color: '#5C5346', lineHeight: 1.65, margin: 0 }}>{v.rafiqNote}</p>
                              </div>
                              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                {v.tags.map((t) => (
                                  <span key={t} style={{ fontFamily: "'Inter',sans-serif", fontSize: '11px', fontWeight: 500, background: C.limestoneDark, color: '#8B7E6A', padding: '3px 9px', borderRadius: 99 }}>{t}</span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 24, alignSelf: 'start' }}>
          <div style={{ background: `linear-gradient(135deg,${C.nile},${C.nileMid})`, borderRadius: 16, padding: '20px' }}>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '10px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: `${C.limestone}45`, marginBottom: 10 }}>
              Journey Level
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '20px', fontWeight: 500, color: C.limestone }}>Level {currentLevel}</div>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '14px', fontWeight: 700, color: C.sand }}>{totalXP} XP</div>
            </div>
            <div style={{ height: 6, background: `${C.limestone}15`, borderRadius: 99, marginBottom: 6, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min(100, (totalXP % 500) / 5)}%`, background: `linear-gradient(90deg,${C.sand},${C.faience})`, borderRadius: 99 }} />
            </div>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '11px', color: `${C.limestone}40` }}>
              {500 - (totalXP % 500)} XP to Level {currentLevel + 1}
            </div>
          </div>

          <div style={{ background: C.limestone, borderRadius: 16, padding: '18px', border: '1px solid rgba(27,26,23,0.07)' }}>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '10px', fontWeight: 600, color: '#A89880', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 }}>
              Badges Earned ({userBadges.length})
            </div>

            {userBadges.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '16px 0', color: '#A89880', fontFamily: "'Inter',sans-serif", fontSize: '12px' }}>
                Explore sites and interact with Rafiq to earn badges.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                {userBadges.map((b, idx) => (
                  <div key={b.id} style={{ textAlign: 'center', padding: '10px 6px', borderRadius: 11, background: `${badgeColors[idx % badgeColors.length]}10`, border: `1.5px solid ${badgeColors[idx % badgeColors.length]}30` }}>
                    <div style={{ fontSize: '22px', marginBottom: 5 }}>{badgeIcons[idx % badgeIcons.length]}</div>
                    <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '10px', fontWeight: 700, color: C.nile, lineHeight: 1.3 }}>{b.name}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ background: C.limestone, borderRadius: 16, padding: '18px', border: '1px solid rgba(27,26,23,0.07)' }}>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '10px', fontWeight: 600, color: '#A89880', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 }}>
              Egypt Coverage
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {Object.entries(
                ALL_GOVERNORATES.reduce((acc, g) => ({ ...acc, [g]: (acc as any)[g] || 0 }), {} as Record<string, number>)
              ).map(([name, count]) => (
                <div key={name} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 28px', gap: 10, alignItems: 'center' }}>
                  <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '12px', color: (count as number) > 0 ? C.nile : '#C4B89A', fontWeight: (count as number) > 0 ? 600 : 400 }}>{name}</span>
                  <div style={{ height: 6, background: '#EDE6D6', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: (count as number) > 0 ? `${Math.min((count as number) * 25, 100)}%` : '0%', background: (count as number) > 0 ? `linear-gradient(90deg,${C.copper},${C.sand})` : 'transparent', borderRadius: 99, transition: 'width 0.4s ease' }} />
                  </div>
                  <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '11px', fontWeight: 700, color: (count as number) > 0 ? C.copper : '#C4B89A', textAlign: 'right' }}>{String(count)}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 14, padding: '10px 12px', background: '#FAF7F0', borderRadius: 10, border: '1px solid rgba(27,26,23,0.06)' }}>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '11px', color: '#8B7E6A', lineHeight: 1.55 }}>
                You've explored <strong style={{ color: C.nile }}>{exploredGovCount} of 7</strong> tracked governorates.
              </div>
            </div>
          </div>

          <div style={{ background: 'linear-gradient(145deg,#FAF3E4,#F0E8D0)', borderRadius: 14, padding: '16px 18px', border: `1px solid ${C.sand}22`, textAlign: 'center' }}>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', fontSize: '14px', color: C.nile, lineHeight: 1.6, marginBottom: 12 }}>
              "{summaryData?.summary || 'Your Egyptian story is worth sharing.'}"
            </div>
            <button
              onClick={() => {
                const content = trips.map((t) => `• ${t.title} (${t.destination})`).join('\n');
                navigator.clipboard.writeText(`My Rihla Egypt Journey:\n${content}`);
                alert('Journey log copied to clipboard!');
              }}
              style={{
                background: C.copper,
                border: 'none',
                borderRadius: 9,
                padding: '10px 20px',
                fontFamily: "'Inter',sans-serif",
                fontSize: '13px',
                fontWeight: 700,
                color: C.limestone,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <BookOpen size={14} strokeWidth={2} /> Export Journey Journal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}