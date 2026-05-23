import type { Metadata } from "next";
import { MapPin, Phone, Mail, Clock, ArrowUpRight } from "lucide-react";
import ContactForm from "@/components/forms/ContactForm";

export const metadata: Metadata = {
  title: "Contact · Sparsh World School",
  description:
    "Get in touch with Sparsh World School — admissions, visits, and general inquiries.",
};

// Campus location: 29°19'20.6"N 73°55'39.1"E
const CAMPUS_LAT_LNG = "29.322389,73.927528";
const CAMPUS_COORDS_DMS = `29°19'20.6"N  73°55'39.1"E`;
const MAP_EMBED_URL = `https://www.google.com/maps?q=${CAMPUS_LAT_LNG}&z=17&output=embed`;
const MAP_DEEP_LINK = `https://www.google.com/maps/search/?api=1&query=${CAMPUS_LAT_LNG}`;

export default function ContactPage() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 pb-24 pt-28 md:px-8 md:pb-32 md:pt-36">
      <header className="mb-12 max-w-2xl md:mb-16">
        <span className="font-crest text-xs text-white/70 md:text-sm">
          Sparsh · Reach Out
        </span>
        <h1 className="font-crest mt-3 text-4xl leading-[1.05] text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.5)] md:text-6xl lg:text-7xl">
          Get in Touch
        </h1>
        <p className="mt-5 text-base text-white/80 md:text-lg">
          Have a question about admissions, a visit, or something else? Send us
          a note and a member of our team will reply within 24 hours.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <ContactForm />
        </div>

        <aside className="space-y-6 lg:col-span-2">
          <div className="glass-panel rounded-3xl p-6 md:p-8">
            <h2 className="font-crest text-xl text-white md:text-2xl">
              Reach Us Directly
            </h2>
            <ul className="mt-6 space-y-5">
              <InfoRow
                icon={<MapPin size={18} />}
                label="Address"
                lines={["Sparsh World School", CAMPUS_COORDS_DMS]}
                href={MAP_DEEP_LINK}
              />
              <InfoRow
                icon={<Phone size={18} />}
                label="Phone"
                lines={["+91 90010 69318"]}
                href="tel:+919001069318"
              />
              <InfoRow
                icon={<Mail size={18} />}
                label="Email"
                lines={["info@sparshworld.in"]}
                href="mailto:info@sparshworld.in"
              />
              <InfoRow
                icon={<Clock size={18} />}
                label="Hours"
                lines={["Mon–Sat · 8 AM – 4 PM", "Sun · Closed"]}
              />
            </ul>
          </div>

          <a
            href={MAP_DEEP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="glass-panel group relative block h-64 overflow-hidden rounded-3xl"
            aria-label="Open Sparsh World School in Google Maps"
          >
            <iframe
              title="Map to Sparsh World School"
              src={MAP_EMBED_URL}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-full w-full grayscale-[0.4] [filter:contrast(0.95)_brightness(0.85)]"
            />
            <div className="pointer-events-none absolute inset-x-4 bottom-4 flex items-center justify-between rounded-2xl bg-black/60 px-4 py-3 backdrop-blur-md">
              <div>
                <p className="text-[0.6rem] uppercase tracking-[0.3em] text-white/70">
                  Find Us
                </p>
                <p className="font-crest text-sm text-white">
                  Open in Google Maps
                </p>
              </div>
              <ArrowUpRight
                size={16}
                className="text-white transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </div>
          </a>
        </aside>
      </div>
    </section>
  );
}

function InfoRow({
  icon,
  label,
  lines,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  lines: readonly string[];
  href?: string;
}) {
  const content = (
    <>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white">
        {icon}
      </div>
      <div>
        <p className="text-[0.6rem] uppercase tracking-[0.3em] text-white/55">
          {label}
        </p>
        <div className="mt-1.5 space-y-0.5 text-sm text-white/85">
          {lines.map((l, i) => (
            <p key={i}>{l}</p>
          ))}
        </div>
      </div>
    </>
  );

  return (
    <li>
      {href ? (
        <a
          href={href}
          className="flex items-start gap-4 transition hover:text-white"
        >
          {content}
        </a>
      ) : (
        <div className="flex items-start gap-4">{content}</div>
      )}
    </li>
  );
}
