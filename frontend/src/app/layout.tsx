import type { Metadata } from "next";
import { Bricolage_Grotesque, Geist, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/cart";
import { CatalogProvider } from "@/context/catalog";
import { CustomerProvider } from "@/context/customer";
import { getCatalog } from "@/lib/api";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { OfferPopup, WhatsAppButton } from "@/components/Floating";
import { ScrollProgress, SmoothScroll } from "@/components/Motion";
import { THEME_SCRIPT } from "@/lib/theme";

const bricolage = Bricolage_Grotesque({ variable: "--font-bricolage", subsets: ["latin"], axes: ["wdth", "opsz"] });
const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });
const instrument = Instrument_Serif({ variable: "--font-instrument", subsets: ["latin"], weight: "400", style: ["normal", "italic"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.thankyoumattresses.com"),
  title: {
    default: "Thankyou Mattresses — Mattress Manufacturers in Delhi | Since 1995",
    template: "%s | Thankyou Mattresses",
  },
  description:
    "Factory-direct orthopedic, memory foam, spring, latex, coir and baby mattresses & pillows from Thankyou Mattresses, New Delhi. Up to 11 years warranty. Sleep happily, wake happily.",
  openGraph: { images: ["/images/brand/logo5.webp"], siteName: "Thankyou Mattresses", locale: "en_IN", type: "website" },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Cached (see lib/api.ts), so this is part of the prerendered shell
  const catalog = await getCatalog();
  return (
    <html
      lang="en"
      data-theme="light"
      suppressHydrationWarning
      className={`${bricolage.variable} ${geist.variable} ${instrument.variable} antialiased`}
    >
      <head>
        {/* Apply the saved theme before first paint (no flash) */}
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="flex min-h-screen flex-col">
        <SmoothScroll />
        <ScrollProgress />
        <CatalogProvider catalog={catalog}>
        <CustomerProvider>
        <CartProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <CartDrawer />
          <WhatsAppButton />
          <OfferPopup />
        </CartProvider>
        </CustomerProvider>
        </CatalogProvider>
      </body>
    </html>
  );
}
