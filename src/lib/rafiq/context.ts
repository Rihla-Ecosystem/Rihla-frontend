import type { RafiqContext, ExploreContext, SafetyContext, JourneyContext, ProfileContext, RafiqContextEnvelope } from './types';

export function buildExploreContext(
  site: {
    id: string | number;
    name: string;
    cat?: string;
    gov?: string;
    lat?: number;
    lon?: number;
    safetyStatus?: string;
    activeAlerts?: string[];
    description?: string;
    tips?: string[];
    nearby?: (string | number)[];
    rafiqInsight?: string;
  },
  distanceKm?: number | null
): ExploreContext {
  const nearbyPlaces = (site.nearby ?? []).map(String);
  return {
    source: 'explore',
    placeId: site.id,
    placeName: site.name,
    category: site.cat,
    location: site.gov,
    coordinates: site.lat != null && site.lon != null ? { lat: site.lat, lon: site.lon } : undefined,
    safetyStatus: site.safetyStatus,
    activeAlerts: site.activeAlerts,
    description: site.description,
    availableTips: site.tips,
    nearbyPlaces,
  };
}

export function buildSafetyContext(
  safetyData: {
    governorate?: string;
    safetyScore?: number | null;
    safetyLevel?: string | null;
    status?: 'safe' | 'caution' | 'warning' | 'critical' | null;
    activeAlertsCount?: number | null;
    activeAlerts?: Array<{
      headline: string;
      severity?: string;
      category?: string;
      city?: string;
    }>;
    scamRiskLevel?: 'high' | 'moderate' | 'low' | null;
    safetyTips?: string[];
  },
  cityLabel?: string
): SafetyContext {
  return {
    source: 'safety',
    city: cityLabel ?? safetyData.governorate ?? 'Unknown',
    currentStatus: safetyData.status ?? safetyData.safetyLevel ?? 'unknown',
    activeAlerts: safetyData.activeAlerts?.map((a) => ({
      headline: a.headline,
      severity: a.severity,
      category: a.category,
      city: a.city,
    })),
    riskCategory: safetyData.scamRiskLevel ?? undefined,
    recommendedActions: safetyData.safetyTips,
  };
}

export function buildJourneyContext(
  journey: {
    slug: string;
    title: string;
    completedSteps?: number;
    totalSteps?: number;
    steps?: Array<{ stepNumber: number; title: string; content?: string }>;
    isCompleted?: boolean;
  },
  currentStepIndex?: number
): JourneyContext {
  const steps = journey.steps ?? [];
  const currentStep = currentStepIndex ?? journey.completedSteps ?? 0;
  const learningTopic = steps[currentStep]?.title ?? steps[0]?.title;
  return {
    source: 'journey',
    journeySlug: journey.slug,
    journeyTitle: journey.title,
    currentStep: currentStep + 1,
    completedSteps: journey.completedSteps,
    learningTopic,
  };
}

export function buildProfileContext(
  user: {
    travelStyle?: string;
    interests?: string[];
    xp?: number;
    level?: number;
  },
  trips?: Array<{ destination?: string }>,
  completedJourneys?: Array<{ slug?: string; title?: string; isCompleted?: boolean }>
): ProfileContext {
  const visitedPlaces = (trips ?? [])
    .map((t) => t.destination)
    .filter(Boolean) as string[];
  const uniqueVisited = Array.from(new Set(visitedPlaces));
  return {
    source: 'profile',
    travelStyle: user.travelStyle,
    visitedPlaces: uniqueVisited,
    interests: user.interests,
    completedJourneys: (completedJourneys ?? [])
      .filter((j) => j.isCompleted)
      .map((j) => j.title ?? j.slug)
      .filter(Boolean) as string[],
    xp: user.xp,
    level: user.level,
  };
}

export function getWelcomeMessage(ctx: RafiqContext): string {
  switch (ctx.source) {
    case 'explore': {
      const c = ctx as ExploreContext;
      const lines = [
        `You are viewing <strong>${c.placeName}</strong>.`,
      ];
      if (c.category) lines.push(`Category: ${c.category}.`);
      if (c.location) lines.push(`Location: ${c.location}.`);
      if (c.safetyStatus) lines.push(`Current area safety status: ${c.safetyStatus}.`);
      if (c.activeAlerts?.length) lines.push(`${c.activeAlerts.length} active safety alert${c.activeAlerts.length > 1 ? 's' : ''} available.`);
      if (c.availableTips?.length) lines.push(`${c.availableTips.length} tips available.`);
      if (c.nearbyPlaces?.length) lines.push(`${c.nearbyPlaces.length} nearby places.`);
      lines.push('I can help with:');
      return lines.join(' ');
    }
    case 'safety': {
      const c = ctx as SafetyContext;
      const lines = [
        `You are in <strong>${c.city}</strong>.`,
      ];
      if (c.currentStatus) {
        const statusMap: Record<string, string> = {
          safe: 'Safe',
          caution: 'Caution',
          warning: 'Warning',
          critical: 'Critical',
        };
        lines.push(`Current status: <strong>${statusMap[c.currentStatus] ?? c.currentStatus}</strong>.`);
      }
      if (c.activeAlerts?.length) {
        lines.push(`${c.activeAlerts.length} active alert${c.activeAlerts.length > 1 ? 's' : ''}.`);
      }
      lines.push('I can help with:');
      return lines.join(' ');
    }
    case 'journey': {
      const c = ctx as JourneyContext;
      const lines = [
        `You are learning <strong>${c.journeyTitle}</strong>.`,
      ];
      if (c.currentStep) lines.push(`Step ${c.currentStep} of the journey.`);
      if (c.learningTopic) lines.push(`Topic: ${c.learningTopic}.`);
      lines.push('I can explain examples or answer questions about this topic.');
      return lines.join(' ');
    }
    case 'profile': {
      const c = ctx as ProfileContext;
      const lines = [
        `Welcome back, <strong>traveler</strong>!`,
      ];
      if (c.travelStyle) lines.push(`Your travel style: ${c.travelStyle}.`);
      if (c.visitedPlaces?.length) lines.push(`${c.visitedPlaces.length} place${c.visitedPlaces.length > 1 ? 's' : ''} visited.`);
      if (c.completedJourneys?.length) lines.push(`${c.completedJourneys.length} journey${c.completedJourneys.length > 1 ? 's' : ''} completed.`);
      if (c.xp) lines.push(`${c.xp} XP (Level ${c.level ?? 1}).`);
      lines.push('I can help plan your next visit or recommend journeys.');
      return lines.join(' ');
    }
    default:
      return 'Hello! How can I help you today?';
  }
}

export function getSuggestions(ctx: RafiqContext): string[] {
  switch (ctx.source) {
    case 'explore': {
      const c = ctx as ExploreContext;
      return [
        `Tell me the history of ${c.placeName}`,
        `Best time to visit ${c.placeName}`,
        `Nearby places to ${c.placeName}`,
        `Common tourist tips for ${c.placeName}`,
      ];
    }
    case 'safety': {
      return [
        'What should I do today to stay safe?',
        'Safe visiting times for this area',
        'Local recommendations nearby',
        'Current alerts explained',
      ];
    }
    case 'journey': {
      const c = ctx as JourneyContext;
      return [
        `Explain the ${c.learningTopic ?? 'current step'} lesson`,
        'Give me examples for this topic',
        'How does this apply in real travel?',
        'What should I remember from this step?',
      ];
    }
    case 'profile': {
      return [
        'Plan a trip based on my travel style',
        'Recommend journeys for me',
        'What places match my interests?',
        'How to level up my XP?',
      ];
    }
    default:
      return [];
  }
}

export function buildRafiqContextEnvelope(ctx: RafiqContext): RafiqContextEnvelope {
  return {
    context: ctx,
    welcome: getWelcomeMessage(ctx),
    suggestions: getSuggestions(ctx),
  };
}

export function contextualLabel(ctx: RafiqContext): string {
  switch (ctx.source) {
    case 'explore':
      return 'Ask Rafiq about this place';
    case 'safety':
      return 'Ask Rafiq how to stay safe';
    case 'journey':
      return 'Ask Rafiq to explain this lesson';
    case 'profile':
      return 'Ask Rafiq to plan my visit';
    default:
      return 'Ask Rafiq';
  }
}

export function getConversationTitle(ctx?: RafiqContext | null): string {
  if (!ctx) return '';
  switch (ctx.source) {
    case 'explore':
      return `Ask about ${ctx.placeName}`;
    case 'safety':
      return `Safety in ${ctx.city}`;
    case 'journey':
      return `${ctx.journeyTitle} journey`;
    case 'profile':
      return 'Plan my visit';
    default:
      return '';
  }
}
