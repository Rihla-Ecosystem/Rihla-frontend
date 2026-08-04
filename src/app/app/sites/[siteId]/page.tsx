'use client';

import { useRouter, usePathname, useParams } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { C } from '@/lib/constants/theme';
import { Glyph, GlyphFull, Geom } from '@/app/components/atoms';
import {
  MapPin,
  Bell,
  Navigation,
  Wind,
  Thermometer,
  Sun,
  Shield,
  Search,
  Map,
  User,
  AlertTriangle,
  Star,
  Clock,
  Camera,
  ArrowRight,
  Globe,
  Phone,
  CreditCard,
  Wifi,
  CheckCircle,
  X,
  ChevronLeft,
  ChevronRight,
  Menu,
  Home,
  Compass,
  Settings,
  BarChart2,
  Wallet,
  LogOut,
  Zap,
  Filter,
  SlidersHorizontal,
  BookOpen,
  Send,
  Mic,
  ChevronDown,
  RefreshCw,
} from 'lucide-react';
import { TopBar } from '@/app/components/layout/TopBar';
import { SiteCard } from '@/app/components/siteCard';
import { ALL_SITES, type RihlaSite } from '@/app/data/rihla-data';
import SiteHero from '@/app/components/site/SiteHero';
import SiteBodyLeft from '@/app/components/site/SiteBodyLeft';
import SiteRightSidebar from '@/app/components/site/SiteRightSidebar';
import {
  monumentsService,
  buildMonumentLookup,
  applyMonumentToSite,
  type Monument,
} from '@/services/monumentsService';

export default function SiteDetailPage() {
  const router = useRouter();
  const params = useParams();
  const siteIdParam = params?.siteId as string;
  const numericSiteId = siteIdParam ? parseInt(siteIdParam, 10) : NaN;
  const [site, setSite] = useState<RihlaSite | null>(
    ALL_SITES.find((s) => s.id === numericSiteId) ?? null
  );
  const [saved, setSaved] = useState(false);
  const [monument, setMonument] = useState<Monument | null>(null);

  useEffect(() => {
    let active = true;
    monumentsService
      .getMonuments()
      .then((monuments) => {
        if (!active || !site) return;
        const lookup = buildMonumentLookup(monuments);
        const monument = lookup.get(site.name.toLowerCase()) ?? lookup.get(site.nameAr.toLowerCase());
        if (monument) {
          setSite((current) => (current ? applyMonumentToSite(current, monument) : current));
          setMonument(monument);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!site) {
      router.push('/app');
    }
  }, [site, router]);

  if (!site) {
    return null;
  }

  const nearby = (site.nearby ?? [])
    .map((id) => ALL_SITES.find((s) => s.id === id))
    .filter(Boolean) as typeof ALL_SITES;
  const storyParagraphs = site.story.split('\n\n');

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      {/* Sticky top nav */}
      <div
        style={{
          background: 'rgba(246,241,231,0.95)',
          backdropFilter: 'blur(14px)',
          borderBottom: '1px solid rgba(27,26,23,0.08)',
          padding: '0 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 60,
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <button
          onClick={() => router.push('/app')}
          style={{
            background: 'none',
            border: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontFamily: "'Inter',sans-serif",
            fontSize: '13px',
            fontWeight: 600,
            color: C.nile,
            cursor: 'pointer',
            padding: 0,
          }}
        >
          <ChevronLeft size={17} strokeWidth={2.5} /> Back
        </button>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setSaved((v) => !v)}
            style={{
              background: saved ? `${C.terracotta}12` : '#FAF7F0',
              border: `1.5px solid ${saved ? C.terracotta : 'rgba(27,26,23,0.1)'}`,
              borderRadius: 8,
              padding: '7px 14px',
              fontFamily: "'Inter',sans-serif",
              fontSize: '12px',
              fontWeight: 600,
              color: saved ? C.terracotta : '#6B6354',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Star size={13} fill={saved ? C.terracotta : 'none'} strokeWidth={2} />{' '}
            {saved ? 'Saved' : 'Save site'}
          </button>
          <button
            onClick={() => router.push('/app/rafiq')}
            style={{
              background: C.nile,
              border: 'none',
              borderRadius: 8,
              padding: '7px 14px',
              fontFamily: "'Inter',sans-serif",
              fontSize: '12px',
              fontWeight: 600,
              color: C.limestone,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Glyph size={13} light /> Ask Rafiq
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        <SiteHero site={site} />

        {/* Body */}
        <div
          style={{
            maxWidth: 1100,
            margin: '0 auto',
            padding: '36px 40px',
            display: 'grid',
            gridTemplateColumns: '1fr 320px',
            gap: 36,
          }}
        >
          <SiteBodyLeft site={site} nearby={nearby} monument={monument} />
          <SiteRightSidebar site={site} saved={saved} setSaved={setSaved} setRafiq={() => router.push('/app/rafiq')} />
        </div>
      </div>
    </div>
  );
}
