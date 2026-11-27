import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { Mail, MapPin, Phone } from "lucide-react";
import { site } from "@/data/site";
import { Reveal } from "@/components/Reveal";
import { BrandIcon } from "@/components/SocialIcons";
import { EnquiryForm } from "@/components/EnquiryForm";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Call, WhatsApp or visit the Thankyou Mattresses factory in Najafgarh, New Delhi. Bulk & custom size orders welcome.",
};

export default function ContactPage() {
  const cards = [
    { icon: Phone, title: "Call us", lines: site.phones, hrefs: site.phoneLinks },
    { icon: Mail, title: "Email", lines: [site.email], hrefs: [`mailto:${site.email}`] },
    { icon: MapPin, title: "Factory", lines: [site.address], hrefs: [site.mapsUrl] },
  ];
  return (
    <>
      <PageHero eyebrow="Contact" title={<>Let’s find your <em className="text-gradient">perfect sleep.</em></>}>
        <p className="mt-6 max-w-xl text-lg text-cream/60">Call, WhatsApp or visit our factory in Najafgarh — bulk and custom-size orders welcome.</p>
      </PageHero>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-4">
          {cards.map((c, i) => (
            <Reveal key={c.title} delay={i * 0.06}>
              <div className="flex gap-4 rounded-[2rem] bg-white p-6 ring-1 ring-ink/[0.06] transition duration-500 hover:-translate-y-0.5 hover:shadow-[0_20px_50px_-25px_rgba(12,12,16,0.3)]">
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand to-ember text-white">
                  <c.icon className="size-5" />
                </span>
                <div>
                  <h2 className="font-semibold">{c.title}</h2>
                  {c.lines.map((l, j) =>
                    c.hrefs[j] ? (
                      <a key={l} href={c.hrefs[j]} target={c.hrefs[j].startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="block text-ink-soft hover:text-brand">
                        {l}
                      </a>
                    ) : (
                      <p key={l} className="text-ink-soft">{l}</p>
                    ),
                  )}
                </div>
              </div>
            </Reveal>
          ))}
          <a
            href={site.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 rounded-3xl bg-[#25D366] p-5 font-semibold text-white transition hover:brightness-95"
          >
            <BrandIcon name="whatsapp" className="size-6" /> Chat with us on WhatsApp
          </a>
        </div>

        <Reveal delay={0.1}>
          <div className="rounded-[2rem] bg-white p-6 ring-1 ring-ink/5 sm:p-10">
            <h2 className="font-display text-3xl">Send us a message</h2>
            <p className="mt-1 text-ink-soft">Bulk order, custom size or just a question — we’ll call you back.</p>
            <EnquiryForm />
          </div>
        </Reveal>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <div className="overflow-hidden rounded-[2rem] ring-1 ring-ink/10">
          <iframe
            title="Thankyou Mattresses factory location"
            src="https://www.google.com/maps?q=Nangli+Sakravati+Industrial+Area,+Najafgarh,+New+Delhi+110043&output=embed"
            className="h-[420px] w-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>
    </>
  );
}
