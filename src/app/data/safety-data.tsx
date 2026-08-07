import React from 'react';
import { Shield, Phone, AlertTriangle, Thermometer, MapPin } from 'lucide-react';
import { Glyph } from '@/app/components/atoms';

export const EMERGENCY_NUMBERS = [
  {
    label: 'Tourist Police',
    num: '126',
    sub: '24/7 · English spoken',
    color: '#1976d2',
    icon: <Shield size={20} strokeWidth={2} />,
  },
  {
    label: 'Ambulance',
    num: '123',
    sub: 'Medical emergency',
    color: '#d32f2f',
    icon: <Phone size={20} strokeWidth={2} />,
  },
  {
    label: 'Police',
    num: '122',
    sub: 'National emergency line',
    color: '#ff9800',
    icon: <Shield size={20} strokeWidth={2} />,
  },
  {
    label: 'Fire Brigade',
    num: '180',
    sub: 'Fire & rescue',
    color: '#f57c00',
    icon: <AlertTriangle size={20} strokeWidth={2} />,
  },
  {
    label: 'Rihla Support',
    num: 'Chat',
    sub: 'AI + human, always on',
    color: '#8e24aa',
    icon: <Glyph size={20} />,
  },
];

export const FIRST_AID = [
  {
    id: 'heat',
    title: 'Heat Exhaustion',
    icon: <Thermometer size={18} strokeWidth={2} />,
    color: '#ff9800',
    steps: [
      'Move to shade or an air-conditioned space immediately',
      'Remove excess clothing and loosen tight garments',
      'Apply cool (not cold) water to skin — neck, wrists, armpits',
      'Drink water slowly — small sips every few minutes',
      'Do NOT give aspirin or ibuprofen',
      'If symptoms worsen or consciousness changes: call 123',
    ],
  },
  {
    id: 'scam',
    title: 'Confrontational Scam',
    icon: <AlertTriangle size={18} strokeWidth={2} />,
    color: '#ff9800',
    steps: [
      'Stay calm — do not raise your voice or make sudden gestures',
      "Say 'la shukran' (no thank you) clearly and walk away",
      'Move toward other tourists or an official booth',
      'Do NOT hand over any money or documents',
      'If followed or threatened: call Tourist Police (126)',
      'Take a photo if safe — useful for reporting',
    ],
  },
  {
    id: 'lost',
    title: 'Lost or Disoriented',
    icon: <MapPin size={18} strokeWidth={2} />,
    color: '#8e24aa',
    steps: [
      'Stop moving — find a fixed landmark or building entrance',
      'Show your phone to a shopkeeper and ask for the nearest landmark',
      'Open Google Maps — your location works offline if downloaded',
      'Find a tourist police officer (white uniform, blue beret)',
      'Your hotel name in Arabic: show it to any taxi driver',
      'Call Rihla Support — we can locate you via GPS and guide you',
    ],
  },
];

export default {};
