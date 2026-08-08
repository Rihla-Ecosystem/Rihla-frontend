'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { C } from '@/lib/constants/theme';
import { Geom } from '@/app/components/atoms';
import { Clock, Zap, ChevronRight, AlertCircle, RefreshCw, Compass, Award, MapPin, Flag, Download } from 'lucide-react';
import { TopBar } from '@/app/components/layout/TopBar';
import { useAuth } from '@/lib/auth';
import { userService } from '@/services/userService';
import { historyService, TripHistoryItem, UserBadgeItem, InteractionSummaryItem } from '@/services/historyService';
import { useDemoStore, demoProfile, demoTrips, demoBadges, demoSummary } from '@/lib/demoStore';
import { exportJourneyPdf } from '@/lib/exportJourneyPdf';

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
  const demo = useDemoStore();
  const isDemo = demo.mode === 'on';

  const [userProfile, setUserProfile] = useState<any>(null);
  const [trips, setTrips] = useState<TripHistoryItem[]>([]);
  const [userBadges, setUserBadges] = useState<UserBadgeItem[]>([]);
  const [summaryData, setSummaryData] = useState<InteractionSummaryItem | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const badgeColors = [C.sand, C.faience, C.copper, '#A89880', '#A89880', '#A89880'];

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    if (demo.mode === 'on') {
      const visits = demoTrips();
      setUserProfile(demoProfile());
      setTrips(visits);
      setUserBadges(demoBadges());
      setSummaryData({ id: 'demo-summary', userId: 'demo-user', summary: demoSummary(), periodStart: '', periodEnd: '', createdAt: new Date().toISOString() });
      if (visits.length > 0) setExpanded(visits[0].id);
      setLoading(false);
      return;
    }
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
  }, [authUser, demo.mode]);

  useEffect(() => {
    if (isAuthenticated || demo.mode === 'on') {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, fetchData, demo.mode]);

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

  const exportPdf = () => {
    exportJourneyPdf({
      profile: userProfile || undefined,
      visits: formattedVisits,
      badges: userBadges,
      governorateCoverage: govVisits,
      governorates: ALL_GOVERNORATES,
      summary: summaryData?.summary || undefined,
    });
  };

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

  const xpProgress = ((totalXP % 500) / 500) * 100;
  const ringR = 54;
  const ringC = 2 * Math.PI * ringR;
  const badgeIconsArr = ['🏔', '🏺', '📜', '🧭', '🌿', '🌊'];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <TopBar location="Your Journey · Egypt" />

      <div
        style={{
          background: `linear-gradient(150deg,${C.basalt} 0%,#2A1610 45%,${C.copper} 100%)`,
          padding: '36px 32px 96px',
          flexShrink: 0,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', right: -60, top: -60 }}>
          <Geom size={300} color={C.limestone} op={0.03} />
        </div>
        <div style={{ position: 'absolute', left: -80, bottom: -120, opacity: 0.04 }}>
          <Geom size={260} color={C.sand} op={1} />
        </div>
        <div
          style={{
            maxWidth: 1100,
            margin: '0 auto',
            position: 'relative',
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            alignItems: 'center',
            gap: 40,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ width: 34, height: 2, background: `linear-gradient(90deg,${C.sand},transparent)`, borderRadius: 2 }} />
              <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '10px', fontWeight: 600, color: `${C.limestone}55`, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                Your Egyptian Story
              </span>
            </div>
            <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(26px,3.4vw,40px)', fontWeight: 400, color: C.limestone, lineHeight: 1.05, letterSpacing: '-0.02em', marginBottom: 10 }}>
              Visit <span style={{ fontStyle: 'italic', color: C.sand }}>History</span>, Written by the Wind
            </h1>
            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: '13px', color: `${C.limestone}60`, lineHeight: 1.7, maxWidth: 520 }}>
              {userProfile?.displayName
                ? `${userProfile.displayName}, every step you took across Egypt is preserved here — sites, stories, and the XP that grew with you.`
                : 'Every place you have been. Every story Rafiq told. Your journey, preserved like papyrus.'}
            </p>
            <div style={{ display: 'flex', gap: 8, marginTop: 18, flexWrap: 'wrap' }}>
              {[
                { icon: <MapPin size={13} strokeWidth={2.2} />, label: `${trips.length} sites` },
                { icon: <Zap size={13} strokeWidth={2.2} />, label: `${totalXP} XP` },
                { icon: <Flag size={13} strokeWidth={2.2} />, label: `${exploredGovCount}/7 governorates` },
                { icon: <Award size={13} strokeWidth={2.2} />, label: `Level ${currentLevel}` },
              ].map((chip) => (
                <span key={chip.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: `${C.limestone}0D`, border: `1px solid ${C.limestone}1F`, borderRadius: 99, padding: '6px 13px', fontFamily: "'Inter',sans-serif", fontSize: '11px', fontWeight: 600, color: `${C.limestone}CC` }}>
                  <span style={{ color: C.sand }}>{chip.icon}</span>
                  {chip.label}
                </span>
              ))}
            </div>
          </div>

          <div style={{ position: 'relative', width: 150, height: 150, flexShrink: 0 }}>
            <svg width={150} height={150} viewBox="0 0 150 150" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx={75} cy={75} r={ringR} fill="none" stroke={`${C.limestone}12`} strokeWidth={9} />
              <circle
                cx={75}
                cy={75}
                r={ringR}
                fill="none"
                stroke={`url(#xpGrad)`}
                strokeWidth={9}
                strokeLinecap="round"
                strokeDasharray={`${(ringC * xpProgress) / 100} ${ringC}`}
              />
              <defs>
                <linearGradient id="xpGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={C.sand} />
                  <stop offset="100%" stopColor={C.faience} />
                </linearGradient>
              </defs>
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '9px', fontWeight: 700, color: `${C.limestone}55`, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 2 }}>Level</div>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '34px', fontWeight: 500, color: C.sand, lineHeight: 1 }}>{currentLevel}</div>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '10px', fontWeight: 600, color: `${C.limestone}77` }}>{totalXP % 500}/500 XP</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', width: '100%', boxSizing: 'border-box', padding: '0 32px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 14,
            marginTop: -48,
            position: 'relative',
            zIndex: 2,
          }}
        >
          {[
            { icon: <MapPin size={18} strokeWidth={2} />, label: 'Sites Visited', val: String(trips.length), grad: `linear-gradient(135deg,${C.copper},${C.bronze})`, tint: `${C.copper}12` },
            { icon: <Zap size={18} strokeWidth={2} />, label: 'Total XP Earned', val: String(totalXP), grad: `linear-gradient(135deg,${C.sand},${C.brass})`, tint: `${C.sand}12` },
            { icon: <Award size={18} strokeWidth={2} />, label: 'Current Level', val: `Lvl ${currentLevel}`, grad: `linear-gradient(135deg,${C.faience},${C.nileMid})`, tint: `${C.faience}12` },
            { icon: <Flag size={18} strokeWidth={2} />, label: 'Governorates', val: `${exploredGovCount}/7`, grad: `linear-gradient(135deg,${C.terracotta},${C.copper})`, tint: `${C.terracotta}12` },
          ].map(({ icon, label, val, grad, tint }) => (
            <div key={label} style={{ background: C.limestone, borderRadius: 16, padding: '16px 18px', boxShadow: '0 8px 24px rgba(20,16,8,0.10)', border: '1px solid rgba(27,26,23,0.05)', display: 'flex', alignItems: 'center', gap: 13 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: grad, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.limestone, flexShrink: 0, boxShadow: `0 4px 12px ${grad.split(',')[1].trim().replace(')', '')}30` }}>
                {icon}
              </div>
              <div>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '9px', color: '#A89880', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>{label}</div>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '22px', fontWeight: 600, color: C.nile, lineHeight: 1 }}>{val}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          flex: 1,
          padding: '28px 32px 40px',
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <div>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '10px', fontWeight: 700, color: C.copper, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 4 }}>The Journey Timeline</div>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '20px', color: C.nile }}>Places you stood, in order</div>
            </div>
            {uniqueGovs.length > 1 && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: 300 }}>
                {uniqueGovs.map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    style={{
                      background: filter === f ? C.nile : 'transparent',
                      border: `1.5px solid ${filter === f ? C.nile : 'rgba(27,26,23,0.13)'}`,
                      borderRadius: 99,
                      padding: '5px 13px',
                      fontFamily: "'Inter',sans-serif",
                      fontSize: '12px',
                      fontWeight: filter === f ? 600 : 400,
                      color: filter === f ? C.limestone : '#6B6354',
                      cursor: 'pointer',
                      textTransform: 'capitalize',
                      transition: 'all 0.15s',
                    }}
                  >
                    {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            )}
          </div>

          {filteredVisits.length === 0 ? (
            <div
              style={{
                background: C.limestone,
                borderRadius: 16,
                padding: '48px 24px',
                textAlign: 'center',
                border: '1px solid rgba(27,26,23,0.07)',
              }}
            >
              <Compass size={44} color={C.copper} style={{ marginBottom: 14 }} />
              <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '22px', color: C.nile, marginBottom: 8 }}>
                {isAuthenticated || isDemo ? 'No Trips Logged Yet' : 'Sign in to View Your Journey'}
              </h3>
              <p style={{ fontFamily: "'Inter',sans-serif", fontSize: '13px', color: '#8B7E6A', maxWidth: 400, margin: '0 auto 18px' }}>
                {isAuthenticated || isDemo
                  ? 'As you explore historic sites and interact with Rafiq, your journey records will appear right here.'
                  : 'Your journey history is tied to your account. Sign in to see the places you have visited and the stories Rafiq told.'}
              </p>
              <button
                onClick={exportPdf}
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
                <Download size={14} /> Export Journal PDF
              </button>
            </div>
          ) : (
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: 19, top: 20, bottom: 20, width: 2, background: `linear-gradient(180deg,${C.copper}50,${C.limestoneDark})`, zIndex: 0 }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {filteredVisits.map((v, i) => {
                  const isOpen = expanded === v.id;
                  const isFirst = i === 0 || filteredVisits[i - 1].date !== v.date;
                  const catColor = v.cat === 'Cultural' ? C.faience : v.cat === 'Natural' ? C.safeGreen : v.cat === 'Water' ? C.nileMid : C.copper;
                  return (
                    <div key={v.id}>
                      {isFirst && (
                        <div style={{ paddingLeft: 52, marginBottom: 10, marginTop: i === 0 ? 0 : 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '11px', fontWeight: 700, color: C.copper, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                            {v.date}
                          </span>
                          <span style={{ height: 1, flex: 1, maxWidth: 120, background: `linear-gradient(90deg,${C.copper}40,transparent)` }} />
                        </div>
                      )}
                      <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr', gap: 12, marginBottom: 12, position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 20 }}>
                          <div style={{ width: 13, height: 13, borderRadius: '50%', background: isOpen ? catColor : C.limestone, border: `2.5px solid ${isOpen ? catColor : '#C4B89A'}`, boxShadow: isOpen ? `0 0 0 5px ${catColor}22` : 'none', transition: 'all 0.25s', flexShrink: 0 }} />
                        </div>
                        <div
                          onClick={() => setExpanded(isOpen ? null : v.id)}
                          style={{
                            background: C.limestone,
                            borderRadius: 16,
                            border: `1.5px solid ${isOpen ? `${catColor}55` : 'rgba(27,26,23,0.06)'}`,
                            boxShadow: isOpen ? `0 8px 30px ${catColor}14` : '0 2px 10px rgba(27,26,23,0.05)',
                            cursor: 'pointer',
                            overflow: 'hidden',
                            transition: 'all 0.25s',
                            transform: isOpen ? 'translateY(-1px)' : 'none',
                          }}
                        >
                          <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr auto', gap: 0 }}>
                            <div style={{ position: 'relative', height: isOpen ? 132 : 92, overflow: 'hidden', flexShrink: 0, transition: 'height 0.3s' }}>
                              <img src={v.img} alt={v.site} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg,transparent 55%,${catColor}55 100%)` }} />
                              <span style={{ position: 'absolute', bottom: 8, left: 8, right: 8, fontFamily: "'Inter',sans-serif", fontSize: '9px', fontWeight: 700, color: C.limestone, background: 'rgba(20,16,8,0.5)', padding: '3px 8px', borderRadius: 99, backdropFilter: 'blur(2px)' }}>
                                {v.duration}
                              </span>
                            </div>
                            <div style={{ padding: '14px 16px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3, flexWrap: 'wrap' }}>
                                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '15px', fontWeight: 700, color: C.nile }}>{v.site}</span>
                                {v.badge && (
                                  <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '10px', fontWeight: 700, background: `${catColor}15`, color: catColor, padding: '2px 8px', borderRadius: 99 }}>🏅 {v.badge}</span>
                                )}
                              </div>
                              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', fontSize: '12px', color: '#A89880', marginBottom: 8 }}>
                                {v.siteAr ? `${v.siteAr} · ` : ''}{v.gov}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <Clock size={12} color="#A89880" strokeWidth={2} />
                                  <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '11px', color: '#8B7E6A' }}>{v.duration}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <Zap size={12} color={C.sand} strokeWidth={2.2} />
                                  <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '11px', fontWeight: 700, color: C.copper }}>+{v.xp} XP</span>
                                </div>
                                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '10px', fontWeight: 600, color: catColor, background: `${catColor}12`, border: `1px solid ${catColor}25`, padding: '2px 8px', borderRadius: 99 }}>{v.cat}</span>
                              </div>
                            </div>
                            <div style={{ padding: '16px 16px 0 0', display: 'flex', alignItems: 'flex-start' }}>
                              <ChevronRight size={16} color="#C4B89A" strokeWidth={2} style={{ transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.22s', marginTop: 2 }} />
                            </div>
                          </div>
                          {isOpen && (
                            <div style={{ padding: '0 16px 16px', borderTop: `1px solid ${catColor}18`, marginTop: 2 }}>
                              <div style={{ position: 'relative', background: 'linear-gradient(145deg,#FAF3E4,#F0E8D0)', borderRadius: 12, padding: '16px 18px', margin: '14px 0 10px', border: `1px solid ${C.sand}25`, overflow: 'hidden' }}>
                                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: `linear-gradient(180deg,${catColor},${C.sand})` }} />
                                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '9px', fontWeight: 700, color: C.copper, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 7 }}>◈ Rihla Story</div>
                                <p style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', fontSize: '13.5px', color: C.nile, lineHeight: 1.75, margin: 0 }}>{v.story}</p>
                              </div>
                              <div style={{ background: `${C.faience}08`, border: `1px solid ${C.faience}20`, borderRadius: 10, padding: '11px 14px', marginBottom: 12 }}>
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
          <div style={{ background: `linear-gradient(135deg,${C.nile},${C.nileMid})`, borderRadius: 18, padding: '22px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', right: -30, top: -30 }}>
              <Geom size={130} color={C.limestone} op={0.05} />
            </div>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '10px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: `${C.limestone}45`, marginBottom: 12, position: 'relative' }}>
              Journey Level
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8, position: 'relative' }}>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '24px', fontWeight: 500, color: C.limestone }}>Level {currentLevel}</div>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '15px', fontWeight: 700, color: C.sand }}>{totalXP} XP</div>
            </div>
            <div style={{ height: 7, background: `${C.limestone}15`, borderRadius: 99, marginBottom: 7, overflow: 'hidden', position: 'relative' }}>
              <div style={{ height: '100%', width: `${Math.min(100, xpProgress)}%`, background: `linear-gradient(90deg,${C.sand},${C.faience})`, borderRadius: 99, transition: 'width 0.5s ease' }} />
            </div>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '11px', color: `${C.limestone}40`, position: 'relative' }}>
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {userBadges.map((b, idx) => (
                  <div key={b.id} style={{ textAlign: 'center', padding: '12px 6px', borderRadius: 13, background: `${badgeColors[idx % badgeColors.length]}10`, border: `1.5px solid ${badgeColors[idx % badgeColors.length]}30`, transition: 'transform 0.15s' }}>
                    <div style={{ width: 40, height: 40, margin: '0 auto 7px', borderRadius: '50%', background: `radial-gradient(circle at 30% 25%,${badgeColors[idx % badgeColors.length]}33,${badgeColors[idx % badgeColors.length]}66)`, border: `2px solid ${badgeColors[idx % badgeColors.length]}88`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                      {badgeIconsArr[idx % badgeIconsArr.length]}
                    </div>
                    <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '10px', fontWeight: 700, color: C.nile, lineHeight: 1.3 }}>{b.name}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ background: C.limestone, borderRadius: 16, padding: '18px', border: '1px solid rgba(27,26,23,0.07)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '10px', fontWeight: 600, color: '#A89880', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                Egypt Coverage
              </div>
              <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '11px', fontWeight: 700, color: C.copper }}>{Math.round((exploredGovCount / 7) * 100)}%</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {ALL_GOVERNORATES.map((name) => {
                const count = govVisits[name] || 0;
                return (
                  <div key={name} style={{ display: 'grid', gridTemplateColumns: '78px 1fr 26px', gap: 10, alignItems: 'center' }}>
                    <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '12px', color: count > 0 ? C.nile : '#C4B89A', fontWeight: count > 0 ? 600 : 400 }}>{name}</span>
                    <div style={{ height: 7, background: '#EDE6D6', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: count > 0 ? `${Math.min(count * 25, 100)}%` : '0%', background: count > 0 ? `linear-gradient(90deg,${C.copper},${C.sand})` : 'transparent', borderRadius: 99, transition: 'width 0.4s ease' }} />
                    </div>
                    <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '11px', fontWeight: 700, color: count > 0 ? C.copper : '#C4B89A', textAlign: 'right' }}>{String(count)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ background: 'linear-gradient(145deg,#FAF3E4,#F0E8D0)', borderRadius: 16, padding: '20px 18px', border: `1px solid ${C.sand}25`, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', left: -14, top: -14 }}>
              <Geom size={80} color={C.sand} op={0.06} />
            </div>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', fontSize: '15px', color: C.nile, lineHeight: 1.65, marginBottom: 14, position: 'relative' }}>
              "{summaryData?.summary || 'Your Egyptian story is worth sharing.'}"
            </div>
            <button
              onClick={exportPdf}
              style={{
                background: `linear-gradient(135deg,${C.copper},${C.bronze})`,
                border: 'none',
                borderRadius: 11,
                padding: '12px 22px',
                fontFamily: "'Inter',sans-serif",
                fontSize: '13px',
                fontWeight: 700,
                color: C.limestone,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: `0 6px 18px ${C.copper}40`,
                position: 'relative',
                transition: 'transform 0.15s',
              }}
            >
              <Download size={15} strokeWidth={2.4} /> Download Journey PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}