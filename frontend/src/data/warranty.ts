// Pro-rata warranty chart from the official warranty terms
export const warrantyChart = [
  {
    years: 5,
    models: "Relaxo · Baby Crib",
    bands: [
      { from: 0, to: 12, charge: 0 },
      { from: 12, to: 18, charge: 50 },
      { from: 18, to: 60, charge: 75 },
    ],
  },
  {
    years: 7,
    models: "Royale",
    bands: [
      { from: 0, to: 18, charge: 25 },
      { from: 18, to: 24, charge: 50 },
      { from: 24, to: 36, charge: 75 },
      { from: 36, to: 84, charge: 100 },
    ],
  },
  {
    years: 11,
    models: "Adonis · Debonaire · Spring · Memory · Coir · Latexo",
    bands: [
      { from: 0, to: 24, charge: 0 },
      { from: 24, to: 36, charge: 25 },
      { from: 36, to: 60, charge: 50 },
      { from: 60, to: 132, charge: 75 },
    ],
  },
];
