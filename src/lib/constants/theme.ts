// Design tokens for Rihla
export const C = {
  // Surfaces — warm papyrus/linen
  limestone:     "#F5EFE0",
  limestoneDark: "#EDE4CC",
  bg:            "#E8E0CC",
  // Dark — obsidian pyramid shadow
  basalt:        "#141008",
  // Teal — trust / depth
  nile:          "#0F3D3E",
  nileMid:       "#1A5253",
  // Solar action system — keyhole glow (logo DNA)
  solar:         "#C8831A",
  solarBright:   "#E8A820",
  solarGlow:     "#F5C040",
  // Egyptian material palette
  terracotta:    "#C4623A",
  sand:          "#D4A84E",
  faience:       "#2E9C93",
  copper:        "#8A5A34",
  bronze:        "#7A5530",
  brass:         "#B8883A",
  // Status
  safeGreen:     "#2E7A54",
  alertAmber:    "#D98E2C",
  signalRed:     "#B23A2E",
};

const hour = new Date().getHours();
export const isEve = hour >= 17 || hour < 6;
export const isMorn = hour >= 6 && hour < 12;

export const greeting = isEve ? "Good evening" : isMorn ? "Good morning" : "Good afternoon";
export const isEvening = isEve;
export const isMorning = isMorn;

