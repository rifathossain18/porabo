import type React from 'react';

export type Variant = 'blue' | 'green';

export interface Theme {
  text: string;
  soft: string;
  border: string;
  cardBorder: string;
  gradient: string;
  gradientText: string;
  shadow: string;
  ring: string;
  dot: string;
  rgb: string;
  glow1: string;
  glow2: string;
  line: string;
}

export interface Pin {
  x: number;
  y: number;
  label: string;
  delay: string;
}

export interface LandingConfig {
  variant: Variant;
  eyebrow: string;
  badge: string;
  headlineTop: string;
  headlineBottom: string;
  sub: string;
  registerLabel: string;
  note: string;
  proof: string;
  bottomCta: string;
  features: Array<{ icon: React.ElementType; title: string; desc: string }>;
  steps: Array<{ icon: React.ElementType; title: string; desc: string }>;
  stepsTitle: string;
  privacyTitle: string;
  privacyBody: string;
  beforeLabel: string;
  afterLabel: string;
  pins: Pin[];
  faqs: Array<{ q: string; a: string }>;
}
