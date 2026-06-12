import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Compass, Globe2, GraduationCap, Briefcase, Languages, Sparkles, Check } from "lucide-react";
import logoAsset from "@/assets/compass-logo.png.asset.json";
import heroImage from "@/assets/hero-professional.jpg";
import worldMap from "@/assets/world-map.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Discover Diplomacy — Career Coaching for Globally Minded Professionals" },
      { name: "description", content: "Career coaching for students and young professionals pursuing international careers in diplomacy, policy, and global affairs." },
      { property: "og:title", content: "Discover Diplomacy — Career Coaching for Globally Minded Professionals" },
      { property: "og:description", content: "Career coaching for students and young professionals pursuing international careers in diplomacy, policy, and global affairs." },
      { property: "og:type", content: "website" },
      { property: "og:image", content: logoAsset.url },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap" },
    ],
  }),
  component: Landing,
});

function Nav() {
  return (
    <header className="absolute top-0 left-0 right-0 z-20">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
        <a href="#top" className="flex items-center gap-3 text-cream">
          <img src={logoAsset.url} alt="Discover Diplomacy" className="h-10 w-10" />
          <span className="font-display text-lg font-semibold tracking-tight text-cream">
            Discover Diplomacy
          </span>
        </a>
        <nav className="hidden items-center gap-8 text-sm text-cream/80 md:flex">
          <a href="#services" className="hover:text-cream transition-colors">Services</a>
          <a href="#approach" className="hover:text-cream transition-colors">Approach</a>
          <a href="#about" className="hover:text-cream transition-colors">About</a>
          <a href="#testimonials" className="hover:text-cream transition-colors">Stories</a>
        </nav>
        <a
          href="#contact"
          className="inline-flex items-center gap-2 rounded-full bg-cream px-5 py-2.5 text-sm font-medium text-navy-deep transition-all hover:bg-emerald hover:text-cream"
        >
          Book a call
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section id="top" className="relative isolate overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
      <div
        className="absolute inset-0 opacity-25 mix-blend-screen"
        style={{ backgroundImage: `url(${worldMap})`, backgroundSize: "cover", backgroundPosition: "center" }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-navy-deep/60" aria-hidden />
      <Nav />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-6 pb-24 pt-36 lg:grid-cols-12 lg:gap-16 lg:px-10 lg:pb-32 lg:pt-44">
        <div className="lg:col-span-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-cream/20 bg-cream/5 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-cream/80 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-emerald" />
            Career coaching · est. globally
          </div>
          <h1 className="mt-6 font-display text-5xl font-medium leading-[1.05] text-cream sm:text-6xl lg:text-7xl">
            Your compass for a <em className="italic text-emerald">global</em> career.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-cream/80">
            Coaching for students and young professionals charting careers in diplomacy,
            international policy, development, and global affairs — wherever in the world that takes you.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-full bg-emerald px-6 py-3.5 text-sm font-medium text-cream shadow-[0_10px_30px_-10px_oklch(0.52_0.16_152/0.6)] transition-all hover:translate-y-[-1px] hover:bg-emerald/90"
            >
              Start your journey
              <ArrowRight className="h-4 w-4" />
            </a>
            <a href="#services" className="text-sm text-cream/80 underline-offset-4 hover:text-cream hover:underline">
              Explore coaching options →
            </a>
          </div>
          <dl className="mt-14 grid max-w-lg grid-cols-3 gap-6 border-t border-cream/15 pt-8">
            {[
              { k: "30+", v: "Countries reached" },
              { k: "92%", v: "Land role in 6mo" },
              { k: "1:1", v: "Personalized always" },
            ].map((s) => (
              <div key={s.v}>
                <dt className="font-display text-3xl text-cream">{s.k}</dt>
                <dd className="mt-1 text-xs uppercase tracking-wider text-cream/60">{s.v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="relative lg:col-span-5">
          <div className="relative overflow-hidden rounded-2xl shadow-elegant" style={{ boxShadow: "var(--shadow-elegant)" }}>
            <img src={heroImage} alt="Young professional working with global skyline view" width={1080} height={1600} className="h-[560px] w-full object-cover" />
            <div className="absolute bottom-4 left-4 right-4 rounded-xl bg-cream/95 p-4 backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald/10">
                  <Compass className="h-5 w-5 text-emerald" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">Latest cohort</div>
                  <div className="text-sm font-medium text-navy-deep">Placed at UN, State Dept, OECD & GIZ</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const services = [
  { icon: GraduationCap, title: "Student Coaching", desc: "Major decisions, study-abroad, internships, and grad school strategy for IR & policy paths.", bullets: ["Fulbright & Rhodes prep", "Internship targeting", "Grad school applications"] },
  { icon: Briefcase, title: "Early-Career Strategy", desc: "Navigate the foreign service, multilaterals, NGOs, and global corporate roles with clarity.", bullets: ["Foreign Service Officer Test", "UN/NGO job market map", "Salary & offer negotiation"] },
  { icon: Languages, title: "Personal Brand & Voice", desc: "Resume, LinkedIn, and interview coaching tuned for cross-cultural recruiters and panels.", bullets: ["Diplomatic CV review", "Mock panel interviews", "Cross-cultural fluency"] },
];

function Services() {
  return (
    <section id="services" className="relative bg-background py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <span className="text-xs uppercase tracking-[0.25em] text-emerald">Services</span>
            <h2 className="mt-4 font-display text-4xl text-navy-deep lg:text-5xl">
              Coaching meets <em className="italic text-emerald">diplomacy</em>.
            </h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground">
              Programs built for every step of an international career — from your first internship
              application to your first ambassadorship.
            </p>
          </div>
          <div className="grid gap-6 lg:col-span-8 lg:grid-cols-1">
            {services.map((s) => (
              <article
                key={s.title}
                className="group grid gap-6 rounded-2xl border border-border bg-card p-8 transition-all hover:border-emerald/40 hover:shadow-[var(--shadow-soft)] md:grid-cols-[auto_1fr_auto] md:items-start"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-navy-deep text-cream">
                  <s.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-display text-2xl text-navy-deep">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
                  <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-navy-deep/70">
                    {s.bullets.map((b) => (
                      <li key={b} className="inline-flex items-center gap-1.5">
                        <Check className="h-3.5 w-3.5 text-emerald" /> {b}
                      </li>
                    ))}
                  </ul>
                </div>
                <ArrowRight className="hidden h-5 w-5 self-center text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-emerald md:block" />
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const steps = [
  { n: "01", t: "Discovery", d: "A 30-minute call to map where you are, where you want to go, and what's standing in the way." },
  { n: "02", t: "Direction", d: "We build a personalized roadmap — schools, programs, fellowships, or roles aligned with your goals." },
  { n: "03", t: "Departure", d: "Weekly 1:1 coaching, application reviews, mock interviews, and accountability until you land it." },
];

function Approach() {
  return (
    <section id="approach" className="relative overflow-hidden py-24 lg:py-32" style={{ background: "var(--gradient-hero)" }}>
      <div
        className="absolute inset-0 opacity-15"
        style={{ backgroundImage: `url(${worldMap})`, backgroundSize: "cover", backgroundPosition: "center" }}
        aria-hidden
      />
      <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
        <div className="max-w-2xl">
          <span className="text-xs uppercase tracking-[0.25em] text-emerald">The Approach</span>
          <h2 className="mt-4 font-display text-4xl text-cream lg:text-5xl">
            Three steps. One coherent path forward.
          </h2>
        </div>
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="relative rounded-2xl border border-cream/15 bg-cream/5 p-8 backdrop-blur">
              <div className="font-display text-5xl text-emerald">{s.n}</div>
              <h3 className="mt-6 font-display text-2xl text-cream">{s.t}</h3>
              <p className="mt-3 text-sm leading-relaxed text-cream/75">{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function About() {
  return (
    <section id="about" className="bg-background py-24 lg:py-32">
      <div className="mx-auto grid max-w-7xl gap-16 px-6 lg:grid-cols-12 lg:px-10">
        <div className="lg:col-span-5">
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl" style={{ background: "var(--gradient-accent)" }}>
            <div className="absolute inset-0 flex items-center justify-center">
              <img src={logoAsset.url} alt="" className="h-3/5 w-3/5 opacity-90 drop-shadow-2xl" />
            </div>
            <div className="absolute bottom-6 left-6 right-6 rounded-xl bg-navy-deep/90 p-5 text-cream backdrop-blur">
              <Globe2 className="h-5 w-5 text-emerald" />
              <p className="mt-3 font-display text-lg leading-snug">
                "Diplomacy isn't a job title. It's a way of moving through the world."
              </p>
            </div>
          </div>
        </div>
        <div className="lg:col-span-7">
          <span className="text-xs uppercase tracking-[0.25em] text-emerald">About</span>
          <h2 className="mt-4 font-display text-4xl text-navy-deep lg:text-5xl">
            Built by someone who's walked the path.
          </h2>
          <p className="mt-6 text-base leading-relaxed text-muted-foreground">
            Discover Diplomacy was founded to give globally minded students and young professionals
            the kind of personalized, strategic career guidance that usually only comes from a
            mentor you happen to know. We bring lived experience in foreign service, international
            development, and multilateral institutions — translated into a coaching practice that
            meets you exactly where you are.
          </p>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Whether you're applying to your first fellowship or pivoting from the private sector
            to public service, we help you build the clarity, credentials, and confidence to belong
            in the rooms where global decisions get made.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-6 border-t border-border pt-8 sm:grid-cols-4">
            {["State Dept", "United Nations", "OECD", "World Bank"].map((p) => (
              <div key={p} className="text-xs uppercase tracking-wider text-muted-foreground">{p}</div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const quotes = [
  { q: "I went from feeling stuck in a generic job to landing a role at a UN agency in Geneva. The coaching was honest, sharp, and exactly what I needed.", a: "Amara N.", r: "Program Officer, UN" },
  { q: "Discover Diplomacy didn't just review my essays — they helped me articulate why I belonged in international affairs in the first place.", a: "Daniel K.", r: "Rhodes Scholar '24" },
  { q: "The clearest, most strategic career advice I've received. Worth it before every major application.", a: "Priya S.", r: "Foreign Service Officer" },
];

function Testimonials() {
  return (
    <section id="testimonials" className="bg-secondary py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <span className="text-xs uppercase tracking-[0.25em] text-emerald">Stories</span>
            <h2 className="mt-4 font-display text-4xl text-navy-deep lg:text-5xl">
              From discovery to <em className="italic text-emerald">departure</em>.
            </h2>
          </div>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {quotes.map((t, i) => (
            <figure key={i} className="flex h-full flex-col rounded-2xl border border-border bg-card p-8">
              <blockquote className="font-display text-lg leading-snug text-navy-deep">
                "{t.q}"
              </blockquote>
              <figcaption className="mt-auto pt-8">
                <div className="text-sm font-medium text-navy-deep">{t.a}</div>
                <div className="text-xs text-muted-foreground">{t.r}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section id="contact" className="bg-background py-24 lg:py-32">
      <div className="mx-auto max-w-5xl px-6 lg:px-10">
        <div className="relative overflow-hidden rounded-3xl px-8 py-16 text-center lg:px-16 lg:py-24" style={{ background: "var(--gradient-hero)" }}>
          <div
            className="absolute inset-0 opacity-20"
            style={{ backgroundImage: `url(${worldMap})`, backgroundSize: "cover" }}
            aria-hidden
          />
          <div className="relative">
            <img src={logoAsset.url} alt="" className="mx-auto h-16 w-16" />
            <h2 className="mt-6 font-display text-4xl text-cream lg:text-5xl">
              Ready to find your <em className="italic text-emerald">true north</em>?
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-cream/80">
              Book a free 30-minute discovery call. We'll talk through where you are,
              where you want to go, and whether we're the right coach for the journey.
            </p>
            <a
              href="mailto:hello@discoverdiplomacy.com"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-emerald px-7 py-3.5 text-sm font-medium text-cream transition-all hover:translate-y-[-1px] hover:bg-emerald/90"
            >
              Book your discovery call
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-background py-10">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 lg:px-10">
        <div className="flex items-center gap-3">
          <img src={logoAsset.url} alt="" className="h-7 w-7" />
          <span className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Discover Diplomacy. All rights reserved.
          </span>
        </div>
        <div className="flex gap-6 text-sm text-muted-foreground">
          <a href="#services" className="hover:text-navy-deep">Services</a>
          <a href="#about" className="hover:text-navy-deep">About</a>
          <a href="#contact" className="hover:text-navy-deep">Contact</a>
        </div>
      </div>
    </footer>
  );
}

function Landing() {
  return (
    <main>
      <Hero />
      <Services />
      <Approach />
      <About />
      <Testimonials />
      <CTA />
      <Footer />
    </main>
  );
}
