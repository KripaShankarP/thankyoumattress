/**
 * Starting catalogue, copied from the original website data (frontend/src/data, Nov 2026).
 * Used only by prisma/seed.ts — after seeding, the database is the source of truth.
 */
export interface SeedProduct {
  slug: string;
  code?: string;
  name: string;
  category: 'mattress' | 'pillow';
  tagline: string;
  description: string[];
  variants?: { name: string; detail: string }[];
  comfortOptions?: string[];
  cover: string;
  images: string[];
  warrantyYears?: number;
  cloth?: string;
  firmness: 'Soft' | 'Medium' | 'Firm' | 'Dual Comfort';
  sizes: string[];
  priceRows: { model: string; thickness: number; prices: number[] }[];
  features: string[];
  badge?: string;
  videoIds?: string[];
  featured?: boolean;
}

export type SeedVideo = { id: string; title: string; short: boolean; product?: string };

const STD_SIZES = ["72 x 30", "72 x 36", "72 x 48", "72 x 60", "72 x 72", "75 x 35", "78 x 35"];
const img = (dir: string, files: (number | string)[], ext = "webp") =>
  files.map((f) => `/images/${dir}/${f}.${ext}`);

export const products: SeedProduct[] = [
  {
    slug: "relaxo-series",
    code: "M-001",
    name: "Relaxo Series",
    category: "mattress",
    tagline: "Smart entry-level comfort for every home",
    description: [
      "Our Relaxo Model are entry level mattresses generally for those customers who change from traditional cotton mattresses to mattresses in vogue today. These mattresses are manufactured keeping in mind economy & budget but without compromising on any Quality, Durability or Comfort. We offer three variants in this model so as to satisfy the individual liking, body need & requirements of the customer.",
    ],
    variants: [
      { name: "Ortho-Bondo", detail: "Pure HD Rebonded Foam" },
      { name: "Softy-Bondo", detail: "Layer of Softy Foam + HD Rebonded Foam" },
      { name: "Softy-Puff", detail: "Layer of Softy Foam + HD Polyurethane Foam" },
    ],
    comfortOptions: ["Ortho-Bondo", "Softy-Bondo", "Softy-Puff"],
    cover: "/images/relaxo/6.webp",
    images: [...img("relaxo", [6, 7, 1, 2, 3, 4, 5, 8, 9])],
    warrantyYears: 5,
    cloth: "Butter satin cloth",
    firmness: "Medium",
    sizes: STD_SIZES,
    priceRows: [
      { model: "Relaxo", thickness: 4, prices: [6665, 8000, 10665, 13335, 16000, 8335, 8665] },
      { model: "Relaxo", thickness: 5, prices: [7500, 9000, 12000, 15000, 18000, 9375, 9750] },
      { model: "Relaxo", thickness: 6, prices: [8335, 10000, 13335, 16660, 20000, 10415, 10835] },
    ],
    features: ["Budget friendly", "3 comfort variants", "Many colours & prints", "5 year warranty"],
    badge: "Best Value",
    videoIds: ["CPxdU0ugY80", "xR3Q3rJkWvA"],
    featured: true,
  },
  {
    slug: "royale-series",
    code: "M-002",
    name: "Royale Series",
    category: "mattress",
    tagline: "Premium fabric, higher density, longer warranty",
    description: [
      "Our Royale Model is manufactured to satisfy the demand of all types of customers.",
      "The cloth used to cover the mattresses is different and of higher quality than Relaxo Model. Considering the warranty is more in this Model, The density of the inner block is also kept higher.",
      "We offer three variants in this model also so as to satisfy the individual liking, body need & requirements of the customer.",
    ],
    variants: [
      { name: "Royale – Ortho-Bondo", detail: "High density rebonded foam core" },
      { name: "Royale – Softy-Bondo", detail: "Softy foam layer over rebonded foam" },
      { name: "Royale – Softy-Puff", detail: "Softy foam layer over PU foam" },
    ],
    comfortOptions: ["Ortho-Bondo", "Softy-Bondo", "Softy-Puff"],
    cover: "/images/royale/2.webp",
    images: img("royale", [2, 3, 4, 1]),
    warrantyYears: 7,
    cloth: "Premium quilted cloth",
    firmness: "Medium",
    sizes: ["72 x 30", "72 x 36", "72 x 48", "72 x 60", "72 x 72", "75 x 36", "75 x 72", "78 x 36", "78 x 72"],
    priceRows: [
      { model: "Royale", thickness: 4, prices: [7500, 9000, 12000, 15000, 18000, 9375, 18750, 9750, 19500] },
      { model: "Royale", thickness: 5, prices: [8335, 10000, 13335, 16665, 20000, 10415, 20835, 10835, 21665] },
      { model: "Royale", thickness: 6, prices: [9165, 11000, 14665, 18335, 22000, 11460, 22915, 11915, 23835] },
    ],
    features: ["Higher density core", "Premium cover", "3 comfort variants", "7 year warranty"],
    videoIds: ["SlCAjg72UzU"],
    featured: true,
  },
  {
    slug: "adonis-ortho-bondo",
    code: "M-003",
    name: "Adonis Ortho Bondo",
    category: "mattress",
    tagline: "Firm orthopedic support for a healthy spine",
    description: [
      "This high density Rebonded foam mattress has been specifically designed for those customers who want to sleep on a hard surface.",
      "This model would generally go well with youngsters or those having weight on the heavier side. It gives complete balance to Back Vertebrae.",
      "This model is made in just one variant with different thicknesses.",
      "Pure High Density Rebonded foam covered with Towel / Knitted Jacquard Quilted Cloth.",
    ],
    variants: [{ name: "Ortho-Bondo", detail: "Pure High Density Rebonded Foam" }],
    cover: "/images/adonis/2.webp",
    images: img("adonis", [2, 3, 7, 5, 6, 4, 1]),
    warrantyYears: 11,
    cloth: "Towel / Knitted Jacquard Quilted",
    firmness: "Firm",
    sizes: STD_SIZES,
    priceRows: [
      { model: "Adonis Ortho-Bondo", thickness: 4, prices: [8335, 10000, 13335, 16665, 20000, 10415, 10835] },
      { model: "Adonis Ortho-Bondo", thickness: 5, prices: [9165, 11000, 14665, 18335, 22000, 11460, 11915] },
      { model: "Adonis Ortho-Bondo", thickness: 6, prices: [10000, 12000, 16000, 20000, 24000, 12500, 13000] },
    ],
    features: ["Orthopedic firm feel", "Back vertebrae balance", "Quilted jacquard cover", "11 year warranty"],
    badge: "Orthopedic",
    videoIds: ["iWByjPVoehw"],
    featured: true,
  },
  {
    slug: "debonaire-softy-hardy",
    code: "M-004",
    name: "Debonaire Softy Hardy",
    category: "mattress",
    tagline: "One mattress, two comfort zones",
    description: [
      "Our DEBONAIRE Mattress as the name suggests is a model crafted as soft on one side and hard on the other side.",
      "Top side of the mattress is fixed with high density Softy Foam & the other side has high density Rebonded Foam.",
      "This mattress model has a twin benifit that two people sleeping on it can sleep on the side of their choice i.e. soft back or hard back.",
      "This preference will be possible only if two mattresses are made of the total bed size.",
      "Our this model is available in one variant with different thicknesses.",
    ],
    variants: [{ name: "Softy Hardy", detail: "HD Softy Foam (soft side) + HD Rebonded Foam (hard side)" }],
    cover: "/images/debonaire/2.webp",
    images: img("debonaire", [2, 3, 4, 1]),
    warrantyYears: 11,
    cloth: "Knitted or Towel Jacquard Quilted",
    firmness: "Dual Comfort",
    sizes: STD_SIZES,
    priceRows: [
      { model: "Debonaire Softy Hardy", thickness: 4, prices: [9165, 11000, 14665, 18335, 22000, 11460, 11915] },
      { model: "Debonaire Softy Hardy", thickness: 5, prices: [10000, 12000, 16000, 20000, 24000, 12500, 13000] },
      { model: "Debonaire Softy Hardy", thickness: 6, prices: [10835, 13000, 17335, 21665, 26000, 13540, 14085] },
    ],
    features: ["Reversible soft / hard", "Dual comfort for couples", "Quilted jacquard cover", "11 year warranty"],
    badge: "Bestseller",
    videoIds: ["uKXshKDeO2E", "VYRF-eReFTM", "m5dIyCYoLBk"],
    featured: true,
  },
  {
    slug: "spring-series",
    code: "M-005",
    name: "Spring Series",
    category: "mattress",
    tagline: "Hotel-style luxury, international standards",
    description: [
      "This collection of spring based mattresses are in tune with latest International standards. These mattresses are crafted and architectured to provide the real sleeping luxury and unmatched comfort specifically for those who are more into travelling and are used to sleeping in hotels.",
      "Its numerous high tensile steel springs give proper support to body contours. It also enhances sleeping experience with proper air circulation through air ventilators.",
      "These mattresses have a little Bouncing or Jumping effect, and are commonly used in western countries, hence best for those who want to get feel of International Sleeping Standards.",
    ],
    variants: [
      { name: "Springee Bonnel", detail: "High Tensile Bonnell Springs + HD Cotton Felt Sheet + HD Foam" },
      { name: "Springee Pocket", detail: "High Tensile Pocket Springs + HD Cotton Felt Sheet + HD Foam" },
      { name: "Springee Pocket Memory", detail: "Pocket Springs + HD Cotton Felt + HD Foam + Memory Foam top" },
    ],
    cover: "/images/spring/2.webp",
    images: img("spring", [2, 3, 4, 5, 1]),
    warrantyYears: 11,
    cloth: "Knitted / Towel Jacquard Quilted",
    firmness: "Medium",
    sizes: STD_SIZES,
    priceRows: [
      { model: "Springee Bonnel", thickness: 6, prices: [9165, 11000, 14665, 18335, 22000, 11460, 11915] },
      { model: "Springee Bonnel", thickness: 8, prices: [10835, 13000, 17335, 21665, 26000, 13540, 14085] },
      { model: "Springee Pocket", thickness: 6, prices: [10835, 13000, 17335, 21665, 26000, 13540, 14085] },
      { model: "Springee Pocket", thickness: 8, prices: [12500, 15000, 20000, 25000, 30000, 15625, 16250] },
      { model: "Springee Pocket", thickness: 10, prices: [14165, 17000, 22665, 28335, 34000, 17710, 18415] },
      { model: "Springee Pocket Memory", thickness: 7, prices: [13335, 16000, 21335, 26665, 32000, 16665, 17335] },
    ],
    features: ["Bonnell & pocket springs", "Air ventilators", "Hotel-like bounce", "11 year warranty"],
    badge: "Luxury",
    featured: true,
  },
  {
    slug: "memory-foam-series",
    code: "M-006",
    name: "Memory Foam Series",
    category: "mattress",
    tagline: "Feather-touch, sink-in, pressure relieving",
    description: [
      "Memory foam mattresses are quite ‘In thing’ in mattress parlance. Few Customers want just a feather touch on the back and want the feel of 'sink in' while lying down. The memory foam sinks in when lying firm and revives to original shape when not in use.",
      "A premium product for those who value it. We have priced it at very competitive rates.",
    ],
    variants: [
      { name: "Memory Comforto", detail: "Rebonded Foam + Softy Foam + Memory Foam on top" },
      { name: "Elegance", detail: "Rebonded Foam + High Resilience (HR) Foam + Memory Foam on top" },
      { name: "Elegance Super", detail: "Rebonded Foam + HR Foam + two layers of Memory Foam" },
      { name: "Luxury", detail: "HR Foam + Softy Foam + two layers of Memory Foam" },
    ],
    cover: "/images/memory/2.webp",
    images: img("memory", [2, 3, 4, 5, 1]),
    warrantyYears: 11,
    cloth: "Knitted or Towel Jacquard Quilted",
    firmness: "Soft",
    sizes: STD_SIZES,
    priceRows: [
      { model: "Memory Comforto", thickness: 5, prices: [10835, 13000, 17335, 21665, 26000, 13540, 14085] },
      { model: "Memory Comforto", thickness: 6, prices: [12500, 15000, 20000, 25000, 30000, 15625, 16250] },
      { model: "Elegance", thickness: 6, prices: [14165, 17000, 22665, 28335, 34000, 17710, 18415] },
      { model: "Elegance Super", thickness: 7, prices: [16665, 20000, 26665, 33335, 40000, 20835, 21665] },
      { model: "Luxury", thickness: 7, prices: [16665, 20000, 26665, 33335, 40000, 20835, 21665] },
    ],
    features: ["Body-contouring memory foam", "Pressure point relief", "HR foam support", "11 year warranty"],
    badge: "Premium",
    featured: true,
  },
  {
    slug: "coir-series",
    code: "M-007",
    name: "Coir Series",
    category: "mattress",
    tagline: "Natural rubberised coir, orthopedic support",
    description: [
      "Our Coir (Oxford) mattress line provides dependable and strong support since it is made with premium coir sheets. These mattresses are orthopedic in nature, offering the extra-natural comfort of rubberized coir sheets together with the promotion of healthy spine alignment. Customers looking for the best Coir Mattress Price will appreciate this line's perfect balance of cost, comfort, and durability.",
    ],
    variants: [
      { name: "Coir-Bondo-Coir (Sandwich)", detail: "Sturdy coir core sandwich, premium American Jacquard Quilted Cloth" },
      { name: "Softy-Bondo-Coir", detail: "Enhanced layered structure, Knitted or Towel Jacquard Quilted Cloth" },
    ],
    cover: "/images/coir/2.webp",
    images: img("coir", [2, 3, 4, 1]),
    warrantyYears: 11,
    cloth: "Jacquard Quilted",
    firmness: "Firm",
    sizes: STD_SIZES,
    priceRows: [
      { model: "Coir-Bondo-Coir (Sandwich)", thickness: 5, prices: [10835, 13000, 17335, 21665, 26000, 13540, 14085] },
      { model: "Softy-Bondo-Coir", thickness: 6, prices: [12500, 15000, 20000, 25000, 30000, 15625, 16250] },
    ],
    features: ["Natural rubberised coir", "Spine alignment", "Breathable core", "11 year warranty"],
  },
  {
    slug: "latexo-series",
    code: "M-008",
    name: "Latexo Series",
    category: "mattress",
    tagline: "Natural rubber latex, reversible feel",
    description: [
      "Our Latexo Mattresses are also crafted in combination of natural rubber latex sheets and rebonded foam.",
      "Being Reversible mattress, one side gives a soft and natural feel & the other side gives a little hard and soft feel.",
    ],
    variants: [
      { name: "Latexo Bondo-Softy 5\"", detail: "2\" Latex sheet on top + 3\" rebonded foam" },
      { name: "Latexo Bondo-Softy 6\"", detail: "2\" Latex sheet on top + 4\" rebonded foam" },
      { name: "Latexo Bondo-Softy 8\"", detail: "4\" Latex sheet on top + 4\" rebonded foam" },
    ],
    cover: "/images/latexo/2.webp",
    images: img("latexo", [2, 3, 4, 1]),
    warrantyYears: 11,
    cloth: "Knitted / Jacquard Quilted or 500 GSM Jacquard",
    firmness: "Dual Comfort",
    sizes: STD_SIZES,
    priceRows: [
      { model: "Latexo Bondo-Softy", thickness: 5, prices: [15000, 18000, 24000, 30000, 36000, 18750, 19500] },
      { model: "Latexo Bondo-Softy", thickness: 6, prices: [18335, 22000, 29335, 36665, 44000, 22915, 23835] },
      { model: "Latexo Bondo-Softy", thickness: 8, prices: [21665, 26000, 34665, 43335, 52000, 27085, 28165] },
    ],
    features: ["Natural rubber latex", "Reversible comfort", "Cool & breathable", "11 year warranty"],
    badge: "Natural",
  },
  {
    slug: "baby-mattresses",
    code: "M-009",
    name: "Baby Crib Mattress",
    category: "mattress",
    tagline: "Gentle support for baby’s growing body",
    description: [
      "Soft comfort serves as the purpose behind creating our baby crib mattresses. The foam base consists of pure softy with a jacquard cotton cover that delivers a comfortable touch. We use pure softy foam with a soft cotton jacquard cover for a cozy feel. We also offer a second option that the style combines softy foam with memory foam which receives additional support from its soft jacquard cover. Also, The Normal size of crib mattress is 47*27.",
      "You may be confident that your child will sleep safely and peacefully with ThankYou Mattresses' premium baby crib mattresses. You may be certain that you are giving your kid a meaningful present with their carefully crafted, professionally designed baby crib mattresses. These mattresses, which are made of premium, non-toxic materials, offer a very soft fit and the ideal ratio of firmness to comfort to support a healthy spine.",
      "With the permeable layers of our baby crib mattress, ventilation is promoted and temperature regulation remains on course so your baby remains cozy and cool throughout the night. Low care needs are combined with durability, and the hypoallergenic material makes it safe and ideal for skin types that are sensitive. In addition to providing parents with piece of mind, our toddler bed mattress, bassinet mattress, and baby crib mattress also keep the infant secure and cozy.",
    ],
    variants: [
      { name: "Softy", detail: "Pure softy foam with jacquard cotton cover" },
      { name: "Softy + Memory", detail: "Softy foam + memory foam with soft jacquard cover" },
    ],
    cover: "/images/baby/1.webp",
    images: img("baby", [1, 2, 3, 4]),
    warrantyYears: 5,
    cloth: "Soft cotton jacquard",
    firmness: "Medium",
    sizes: ["47 x 27"],
    priceRows: [
      { model: "Softy", thickness: 3, prices: [4000] },
      { model: "Softy", thickness: 4, prices: [5000] },
      { model: "Softy + Memory", thickness: 3, prices: [5000] },
      { model: "Softy + Memory", thickness: 4, prices: [6000] },
    ],
    features: ["Non-toxic & hypoallergenic", "Breathable layers", "Cotton jacquard cover", "5 year warranty"],
    badge: "For Kids",
  },
  // ---------------- Pillows ----------------
  {
    slug: "fibre-pillows-plain",
    name: "Fibre Pillow – Plain",
    category: "pillow",
    tagline: "Hypoallergenic fibre, everyday comfort",
    description: [
      "Get the ultimate support combined with relaxation through our fibre pillows plain pool. These pillows use hypoallergenic high-quality fibre fillings which provide comfort and correct neck alignment along with head position.These pillows look great as decor and also provide good comfort and support as a backrest. They are also a great choice for those who are looking for budget-friendly pillows without compromising on comfort.",
    ],
    cover: "/images/pillows/fibre-plain/1.webp",
    images: img("pillows/fibre-plain", [1, 2, 3]),
    firmness: "Medium",
    sizes: ["Standard"],
    priceRows: [{ model: "Fibre Plain", thickness: 0, prices: [800] }],
    features: ["Hypoallergenic fibre", "Neck alignment", "Budget friendly"],
  },
  {
    slug: "fibre-pillows-quilted",
    name: "Fibre Pillow – Quilted",
    category: "pillow",
    tagline: "Soft quilted exterior, lasting comfort",
    description: [
      "At Thank You Mattress you can find Fibre Pillows Quilted which deliver superior comfort that lasts through time. A soft quilted design exterior makes these pillows provide outstanding head and neck support with improved softness. Our quilted fibre pillows offer exceptional durability together with superior comfort which provides entire restful relaxation during quality sleep. Experience superior comfort at bedtimes through the combination of perfect soft support.",
    ],
    cover: "/images/pillows/fibre-quilted/1.webp",
    images: img("pillows/fibre-quilted", [1, 2, 3]),
    firmness: "Medium",
    sizes: ["Standard"],
    priceRows: [{ model: "Fibre Quilted", thickness: 0, prices: [1200] }],
    features: ["Quilted cover", "Soft & durable", "Head & neck support"],
  },
  {
    slug: "pure-cotton-pillow",
    name: "Pure Cotton Pillow",
    category: "pillow",
    tagline: "Natural cotton, cool & breathable",
    description: [
      "You will find unparalleled comfort and air circulation through pure cotton pillows. You can find these pillows at premium cotton prices because we utilise natural cotton material to deliver both supportive resilience and luxurious comfort for proper head and neck alignment. These pillows were built for airflow to block heat so you maintain a cool sleeping temperature during the entire night. Ideal for both domestic and hospitality use, these pillows offer exceptional durability and an extended service life. They are also a great choice for those who prefer a traditional and natural sleeping experience.",
    ],
    cover: "/images/pillows/cotton/2.webp",
    images: img("pillows/cotton", [2, 1, 3]),
    firmness: "Medium",
    sizes: ["Standard"],
    priceRows: [{ model: "Pure Cotton", thickness: 0, prices: [1000] }],
    features: ["100% natural cotton", "Breathable", "Traditional feel"],
  },
  {
    slug: "memory-foam-pillow",
    name: "Memory Foam Pillow",
    category: "pillow",
    tagline: "Hugs your head & neck precisely",
    description: [
      "Experience superb comfort with our memory foam pillow that precisely hug your head and neck in position. The memory foam material used in these products adjusts to all your sleeping positions because of its temperature sensitivity helping promote neck alignment and relieve the pressure points. With our memory foam pillow different sleepers can enjoy a firm and plush support options since this pillow eliminates all sleep-related pain. The product delivers supreme comfort together with supportive features for complete nighttime relaxation.",
      "Because of the headrest’s highly permeable design, enhanced airflow is maintained, helping prevent heat buildup during sleep and ensuring a cool, comfortable resting surface throughout the year. The soft, skin-friendly cover adds to the overall comfort and can be easily removed and washed to maintain better hygiene. Designed to suit back- side, and combination sleepers}, this memory foam pillow from ThankYou Mattresses is ideal for daily use and helps significantly improve the quality of your nighttime sleep.",
    ],
    cover: "/images/pillows/memory-pillow/1.webp",
    images: img("pillows/memory-pillow", [1, 2, 3]),
    firmness: "Soft",
    sizes: ["Standard"],
    priceRows: [{ model: "Memory Foam", thickness: 0, prices: [3000] }],
    features: ["Pressure relief", "Washable cover", "All sleep positions"],
    badge: "Popular",
  },
  {
    slug: "memory-contour-pillow",
    name: "Memory Contour Pillow",
    category: "pillow",
    tagline: "Ergonomic contour for pain-free sleep",
    description: [
      "The memory contour pillows at Thank You Mattress provides users with pain-free sleep through their design that focuses on neck alignment with pressure relief features. Memory foam absorbs high density material enabling the pillow to conform exactly to head and neck for maximum ergonomic support. Also, It has a breathable hypoallergenic structure which promotes ventilation that prevents the accumulation of body heat to ensure a cool & comfortable rest.",
    ],
    cover: "/images/pillows/contour/2.webp",
    images: img("pillows/contour", [2, 1, 3]),
    firmness: "Medium",
    sizes: ["Standard"],
    priceRows: [{ model: "Memory Contour", thickness: 0, prices: [3000] }],
    features: ["Ergonomic contour", "Cervical support", "Hypoallergenic"],
  },
  {
    slug: "rubber-latex-pillow",
    name: "Rubber Latex Pillow",
    category: "pillow",
    tagline: "Bouncy support, optimal breathability",
    description: [
      "Unrivalled support plus optimal breathability are guaranteed by our top-level rubber latex pillows. The combination of natural and synthetic materials within these products allows them to respond with bounce while moulding to your head and neck for proper neck alignment. A ventilated design in this product creates airflow to stop heat retention which lets you experience restful and cool sleep. Our high-quality rubber latex pillows offer complete restful sleep quality night after night for years.",
    ],
    cover: "/images/pillows/latex-pillow/3.webp",
    images: img("pillows/latex-pillow", [3, 1, 2]),
    firmness: "Medium",
    sizes: ["Standard"],
    priceRows: [{ model: "Rubber Latex", thickness: 0, prices: [3500] }],
    features: ["Latex bounce", "Ventilated core", "Long lasting"],
  },
];

export const videos: SeedVideo[] = [
  { id: "l4JQdV3nbRU", title: "Types of Mattresses Explained — Find the Perfect Mattress for Your Sleep Style", short: false },
  { id: "AHHp_ce8G_s", title: "Why We Named Our Brand Thankyou Mattresses", short: true },
  { id: "uKXshKDeO2E", title: "Debonaire Softy Hardy – One Mattress, Two Comfort Zones", short: true, product: "debonaire-softy-hardy" },
  { id: "VYRF-eReFTM", title: "Healthy Sleep Starts with the Right Mattress", short: true, product: "debonaire-softy-hardy" },
  { id: "CPxdU0ugY80", title: "Back Pain? Try Relaxo Mattress", short: true, product: "relaxo-series" },
  { id: "iWByjPVoehw", title: "Upgrade Your Sleep — Orthopedic Mattresses", short: true, product: "adonis-ortho-bondo" },
  { id: "oilePoMl-rw", title: "Why You Should Upgrade Your Mattress", short: true },
  { id: "SlCAjg72UzU", title: "SLEEP Better — Sound, Luxury, Effortless, Essential, Peaceful", short: true },
  { id: "xR3Q3rJkWvA", title: "Say Goodbye to Back Pain — Relaxo Offer", short: true, product: "relaxo-series" },
  { id: "m5dIyCYoLBk", title: "Sleep Comfortably with Debonaire", short: true, product: "debonaire-softy-hardy" },
  { id: "JioiZfW-bi0", title: "Tired of Sleepless Nights?", short: true },
  { id: "bKTBQD8J8oc", title: "Designed to Support Your Body and Mind", short: true },
  { id: "yejiq3DVV_Q", title: "When Your Mattress Turns Bedtime into a Dance Party", short: true },
];

export const colours: { name: string; hex: string }[] = [
  { name: "Maroon", hex: "#7a1f2b" },
  { name: "Royal Blue", hex: "#2c4a9a" },
  { name: "Grey", hex: "#8a8f98" },
  { name: "Beige", hex: "#d9c6a5" },
  { name: "Brown", hex: "#6b4a32" },
  { name: "Off-White", hex: "#f1ece2" },
];

export const coupons = [{ code: 'WELCOME5', percent: 5 }];
