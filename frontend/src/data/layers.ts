// Layer constructions shown in the 3D mattress visuals

export type Layer = {
  name: string;
  note: string;
  /** Top-face texture */
  bg: string;
  /** Edge / piping colour */
  edge: string;
  /** Visual thickness in px for the 3D stack */
  h: number;
};

const quilt: Layer = {
  name: "Jacquard quilted cover",
  note: "Knitted / towel jacquard, soft-touch & breathable",
  bg: "repeating-linear-gradient(45deg,#fff 0 14px,#f1ece4 14px 15px),repeating-linear-gradient(-45deg,#fff 0 14px,#f1ece4 14px 15px)",
  edge: "#d8d0c4",
  h: 16,
};
const memory: Layer = {
  name: "Memory foam",
  note: "Sinks in, contours to your body, revives when not in use",
  bg: "radial-gradient(circle at 30% 30%,#e7f0ff,#bcd2f7)",
  edge: "#8eaee6",
  h: 22,
};
const softy: Layer = { name: "HD softy foam", note: "Plush high-density comfort layer", bg: "linear-gradient(135deg,#fff6d6,#ffe49a)", edge: "#e8c25a", h: 26 };
const hr: Layer = { name: "High resilience (HR) foam", note: "Bouncy, durable support that breathes", bg: "linear-gradient(135deg,#ffe2d6,#ffbfa6)", edge: "#e89a7c", h: 34 };
const bondo: Layer = {
  name: "HD rebonded foam",
  note: "Firm orthopedic core that balances your spine",
  bg: "radial-gradient(circle at 20% 30%,#7a8a6a 0 3px,transparent 4px),radial-gradient(circle at 70% 60%,#c06a4b 0 3px,transparent 4px),radial-gradient(circle at 45% 80%,#e0b040 0 2px,transparent 3px),linear-gradient(#8c7b6b,#6f6052)",
  edge: "#4e4237",
  h: 46,
};
const latex: Layer = {
  name: "Natural rubber latex",
  note: "Cool, springy & naturally ventilated",
  bg: "radial-gradient(circle,#e9dcb8 0 3px,transparent 4px) 0 0/16px 16px,#fbf3dc",
  edge: "#d9c79a",
  h: 36,
};
const springs: Layer = {
  name: "Pocket springs",
  note: "Individually pocketed high-tensile steel springs",
  bg: "radial-gradient(circle,transparent 0 6px,#9aa3ad 6px 8px,transparent 9px) 0 0/22px 22px,#e7eaee",
  edge: "#7d8590",
  h: 58,
};
const felt: Layer = { name: "HD cotton felt sheet", note: "Insulates springs & adds stability", bg: "linear-gradient(135deg,#f4f1ea,#ddd6c8)", edge: "#bdb4a3", h: 8 };
const coir: Layer = {
  name: "Rubberised coir sheet",
  note: "Natural coconut fibre, orthopedic & airy",
  bg: "repeating-linear-gradient(20deg,#8a5a2b 0 2px,#a8743c 2px 5px,#7a4e24 5px 7px)",
  edge: "#5b3a1a",
  h: 24,
};

export const builds = [
  { key: "memory", label: "Memory Luxury", slug: "memory-foam-series", layers: [quilt, memory, memory, softy, hr] },
  { key: "spring", label: "Springee Pocket Memory", slug: "spring-series", layers: [quilt, memory, bondo, felt, springs] },
  { key: "debonaire", label: "Debonaire Softy Hardy", slug: "debonaire-softy-hardy", layers: [quilt, softy, bondo, quilt] },
  { key: "latexo", label: "Latexo", slug: "latexo-series", layers: [quilt, latex, bondo] },
  { key: "coir", label: "Coir Sandwich", slug: "coir-series", layers: [quilt, coir, bondo, coir] },
];
