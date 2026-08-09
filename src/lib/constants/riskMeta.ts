import { C } from './theme';

/** Every risk key shared across safety (event severity / city overall risk). */
export type RiskSeverity = 'info' | 'advisory' | 'warning' | 'critical';

export type RiskStatus = 'safe' | 'caution' | 'warning' | 'critical';
export type ScamRisk = 'low' | 'moderate' | 'high';

/**
 * Single source of truth for Rihla risk scoring.
 *
 * Convention: SCORE is a SAFETY index — HIGHER is SAFER:
 *   info 92 · advisory 78 · warning 58 · critical 42
 *
 * The Core-Server safety routes normalize to this same scale/labels.
 */
export const RISK_SCORE: Record<RiskSeverity, number> = {
  info: 92,
  advisory: 78,
  warning: 58,
  critical: 42,
};

/** Display-level for a city/area derived from its overall risk. */
export const RISK_STATUS: Record<RiskSeverity, RiskStatus> = {
  info: 'safe',
  advisory: 'caution',
  warning: 'warning',
  critical: 'critical',
};

/** Human level label rendered to the traveler. */
export const RISK_LEVEL_LABEL: Record<RiskSeverity, string> = {
  info: 'Low Risk',
  advisory: 'Moderate Risk',
  warning: 'High Risk',
  critical: 'Critical Risk',
};

/** Accent color per display status. */
export const RISK_COLOR: Record<RiskStatus, string> = {
  safe: C.safeGreen,
  caution: C.alertAmber,
  warning: C.terracotta,
  critical: C.signalRed,
};

/** Severity rank (0=lowest) used for sorting strongest-first. */
export const SEVERITY_RANK: Record<RiskSeverity, number> = {
  info: 0,
  advisory: 1,
  warning: 2,
  critical: 3,
};

/** Display-status escalation order (safe < caution < warning < critical). */
export const STATUS_RANK: Record<RiskStatus, number> = {
  safe: 0,
  caution: 1,
  warning: 2,
  critical: 3,
};

/** Smart default for a severity we haven't seen. */
export const DEFAULT_RISK: RiskSeverity = 'info';

export function toRiskSeverity(value: unknown): RiskSeverity {
  const v = String(value ?? '').toLowerCase() as RiskSeverity;
  return v === 'info' || v === 'advisory' || v === 'warning' || v === 'critical' ? v : DEFAULT_RISK;
}

export function riskColor(value: unknown): string {
  return RISK_COLOR[RISK_STATUS[toRiskSeverity(value)]];
}

export function riskScore(value: unknown): number {
  return RISK_SCORE[toRiskSeverity(value)];
}

export function riskLabel(value: unknown): string {
  return RISK_LEVEL_LABEL[toRiskSeverity(value)];
}

export type { ScamRisk as RiskScamLevel };
export type { RiskSeverity as RiskKey };