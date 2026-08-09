export type RafiqSource = 'explore' | 'safety' | 'journey' | 'profile';

export interface ExploreContext {
  source: 'explore';
  placeId?: string | number;
  placeName: string;
  category?: string;
  location?: string;
  coordinates?: { lat: number; lon: number };
  safetyStatus?: string;
  activeAlerts?: string[];
  description?: string;
  availableTips?: string[];
  nearbyPlaces?: string[];
}

export interface SafetyContext {
  source: 'safety';
  city: string;
  currentStatus?: string;
  activeAlerts?: Array<{
    headline: string;
    severity?: string;
    category?: string;
    city?: string;
  }>;
  riskCategory?: string;
  recommendedActions?: string[];
}

export interface JourneyContext {
  source: 'journey';
  journeySlug: string;
  journeyTitle: string;
  currentStep?: number;
  completedSteps?: number;
  learningTopic?: string;
}

export interface ProfileContext {
  source: 'profile';
  travelStyle?: string;
  visitedPlaces?: string[];
  interests?: string[];
  completedJourneys?: string[];
  xp?: number;
  level?: number;
}

export type RafiqContext =
  | ExploreContext
  | SafetyContext
  | JourneyContext
  | ProfileContext;

export interface RafiqContextEnvelope {
  context: RafiqContext;
  welcome?: string;
  suggestions?: string[];
}
