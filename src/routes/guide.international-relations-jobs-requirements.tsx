import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { Reveal } from "@/components/reveal";
import { ScrollCompass } from "@/components/scroll-compass";

const URL_PATH = "/guide/international-relations-jobs-requirements";
const CANONICAL = `https://discoverdiplomacy.org${URL_PATH}`;
const TITLE = "International Relations Jobs: Careers & Requirements Guide";
const DESCRIPTION =
  "A complete guide to international relations jobs — career paths, education requirements, salaries, and how to break into diplomacy, policy, and global business.";

export const Route = createFileRoute("/guide/international-relations-jobs-requirements")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: CANONICAL },
      { property: "og:type", content: "article" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: CANONICAL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: TITLE,
          description: DESCRIPTION,
          author: { "@type": "Organization", name: "Discover Diplomacy" },
          publisher: {
            "@type": "Organization",
            name: "Discover Diplomacy",
            url: "https://discoverdiplomacy.org",
          },
          mainEntityOfPage: CANONICAL,
          datePublished: "2026-06-13",
          dateModified: "2026-06-13",
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "What jobs can you get with an international relations degree?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Foreign Service Officer, intelligence analyst, policy researcher at a think tank, program officer at an NGO or IGO (UN, World Bank, IMF), Foreign Commercial Service, congressional staffer, lobbyist, international development consultant, country risk analyst at a bank, and corporate roles in government affairs, ESG, supply chain, and global strategy.",
              },
            },
            {
              "@type": "Question",
              name: "Do you need a master's degree for international relations jobs?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Not always. Entry-level roles, the Foreign Service Officer Test, intelligence agencies, and most NGO program associate roles only require a bachelor's. A master's (MA in IR, MIA, MPP, MPA, MBA, or JD) is the standard credential for advancement at the State Department, multilateral institutions, top think tanks, and senior consulting roles.",
              },
            },
            {
              "@type": "Question",
              name: "How much do international relations jobs pay?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Entry-level NGO and think tank roles in DC typically pay $45,000–$60,000. Foreign Service Officers start around $58,000 (FP-04) plus housing and post differentials. UN P-2 professional roles start around $74,000 tax-exempt. Mid-career policy and consulting roles in Washington commonly reach $90,000–$150,000, and senior leadership at major firms or institutions can exceed $200,000.",
              },
            },
            {
              "@type": "Question",
              name: "What languages are most useful for international affairs careers?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Arabic, Mandarin, Russian, Korean, Farsi, and French open the most doors at the State Department and intelligence community because they are designated 'critical' or 'super-critical' languages. Spanish, French, and Portuguese are widely used at multilaterals and development banks.",
              },
            },
            {
              "@type": "Question",
              name: "Is international relations a good career?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "It can be exceptional for people who want mission-driven, intellectually demanding work with a global footprint. It is a competitive field where networks, languages, fieldwork, and graduate education materially affect outcomes. Compensation outside of the private sector and senior government tends to be lower than law, finance, or tech.",
              },
            },
          ],
        }),
      },
    ],
  }),
  component: GuidePage,
});

function GuidePage() {
  return (
    <SiteLayout>
      <ScrollCompass />
      <article>
        <Hero />
        <TableOfContents />
        <WhatItIs />
        <Sectors />
        <Roles />
        <Education />
        <Skills />
        <Pathways />
        <Salary />
        <Employers />
        <HowToStart />
        <FAQ />
        <CTA />
      </article>
    </SiteLayout>
  );
}

function Hero() {
  return (
    <section className="border-b border-border bg-paper">
      <div className="mx-auto max-w-4xl px-6 py-20 lg:px-10 lg:py-28">
        <Reveal>
          <div className="eyebrow">Career Guide</div>
          <h1 className="mt-5 font-display text-4xl text-navy-deep lg:text-5xl">
            International Relations Jobs: Careers, Education, and How to Break In
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            A complete, opinionated guide to careers in international relations — the sectors
            that hire, the degrees that matter, the salaries to expect, and the concrete steps
            that take you from interested student to working professional.
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            Written by the team at Discover Diplomacy. Last updated June 2026.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

function TableOfContents() {
  const items = [
    ["what-is", "What is international relations?"],
    ["sectors", "Where IR graduates work"],
    ["roles", "Common job titles"],
    ["education", "Education requirements"],
    ["skills", "Skills that get you hired"],
    ["pathways", "Career pathways by sector"],
    ["salary", "Salaries and compensation"],
    ["employers", "Top employers"],
    ["how-to-start", "How to actually break in"],
    ["faq", "FAQ"],
  ];
  return (
    <section className="border-b border-border bg-stone">
      <div className="mx-auto max-w-4xl px-6 py-10 lg:px-10">
        <div className="eyebrow text-emerald">On this page</div>
        <nav className="mt-4 grid gap-2 sm:grid-cols-2">
          {items.map(([id, label]) => (
            <a
              key={id}
              href={`#${id}`}
              className="text-sm text-navy-deep underline-offset-4 hover:underline"
            >
              → {label}
            </a>
          ))}
        </nav>
      </div>
    </section>
  );
}

function Section({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string;
  eyebrow?: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 border-b border-border bg-paper">
      <div className="mx-auto max-w-4xl px-6 py-16 lg:px-10 lg:py-20">
        {eyebrow && <div className="eyebrow text-emerald">{eyebrow}</div>}
        <h2 className="mt-3 font-display text-3xl text-navy-deep lg:text-4xl">{title}</h2>
        <div className="prose prose-sm mt-8 max-w-none space-y-5 text-navy-deep/90">
          {children}
        </div>
      </div>
    </section>
  );
}

function WhatItIs() {
  return (
    <Section id="what-is" eyebrow="01" title="What is international relations, as a career?">
      <p>
        International relations (IR) is the study of how states, multilateral institutions,
        companies, and non-state actors interact across borders. As a profession, it is a
        cluster of roles in government, multilateral organizations, NGOs, think tanks,
        academia, and the private sector that require fluency in foreign policy, regional
        expertise, economics, and security.
      </p>
      <p>
        The field is no longer just diplomats. Globalization, climate, supply chains, AI
        governance, sanctions enforcement, and cyber operations have made international
        expertise valuable inside banks, tech companies, consulting firms, and law firms as
        well. Almost every Fortune 500 has a government affairs or geopolitics team now.
      </p>
    </Section>
  );
}

function Sectors() {
  const sectors = [
    {
      h: "Government and diplomacy",
      d: "The U.S. Department of State (Foreign Service and Civil Service), USAID, Department of Defense, intelligence community (CIA, DIA, ODNI, NSA), Congress, the National Security Council, and analogous foreign ministries abroad.",
    },
    {
      h: "Multilateral institutions (IGOs)",
      d: "The United Nations and its agencies (UNDP, UNHCR, UNICEF, OCHA), the World Bank Group, IMF, regional development banks (ADB, AfDB, IDB), WTO, OECD, IAEA, NATO, OSCE, and the European Union institutions.",
    },
    {
      h: "NGOs and humanitarian organizations",
      d: "International Rescue Committee, Mercy Corps, Save the Children, Doctors Without Borders, Open Society Foundations, International Crisis Group, Human Rights Watch, Oxfam, and hundreds of country-specific implementers.",
    },
    {
      h: "Think tanks and research",
      d: "Brookings, CFR, Carnegie, CSIS, RAND, Atlantic Council, Wilson Center, Heritage, AEI, Cato, Peterson Institute, Chatham House, IISS, Bruegel. Roles include research assistant, program coordinator, fellow, and director.",
    },
    {
      h: "Private sector and consulting",
      d: "Global strategy at McKinsey, BCG, Bain; political risk at Eurasia Group, Control Risks, Teneo; government affairs at Microsoft, Google, Amazon; ESG and sanctions at major banks; trade compliance at law firms.",
    },
    {
      h: "Academia and journalism",
      d: "Tenure-track and research positions, plus foreign-policy journalism at outlets like Foreign Policy, Foreign Affairs, The Economist, Reuters, AP, and policy podcasts.",
    },
  ];
  return (
    <Section id="sectors" eyebrow="02" title="Where international relations graduates actually work">
      <p>
        Six sectors absorb most working IR professionals. Each rewards a different mix of
        credentials, networks, and field experience.
      </p>
      <ul className="not-prose grid gap-px border border-border bg-border md:grid-cols-2">
        {sectors.map((s) => (
          <li key={s.h} className="bg-paper p-6">
            <h3 className="font-display text-lg text-navy-deep">{s.h}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}

function Roles() {
  const roles = [
    ["Foreign Service Officer", "U.S. State Department; rotational tours in embassies and consulates as a Political, Economic, Consular, Management, or Public Diplomacy officer."],
    ["Intelligence analyst", "CIA, DIA, INR, FBI; produce all-source assessments on a country, region, or transnational issue for policymakers."],
    ["Policy research assistant / fellow", "Think tank track: writing briefs, organizing events, supporting senior fellows. Path to becoming a fellow yourself."],
    ["Program officer (NGO/IGO)", "Run grant portfolios, implementation, monitoring and evaluation, donor reporting at organizations like the World Bank or IRC."],
    ["Congressional staffer", "Legislative assistant or counsel covering foreign affairs, armed services, or appropriations on the Hill."],
    ["Political risk analyst", "Eurasia Group, Control Risks, banks: forecasts political events and prices their impact on business and markets."],
    ["Government affairs / public policy", "Manages a company's relationships with governments abroad on issues like data, trade, taxation, and AI regulation."],
    ["International development consultant", "Chemonics, DAI, Tetra Tech, Palladium: implements USAID, DFID, EU, and World Bank contracts in-country."],
    ["Trade and sanctions lawyer", "Law firms or in-house counsel handling OFAC, export controls, CFIUS, antidumping, and treaty compliance."],
    ["Country economist", "IMF, World Bank, central banks, hedge funds: covers macroeconomics and political economy of a region."],
  ];
  return (
    <Section id="roles" eyebrow="03" title="Common job titles, in plain English">
      <p>
        These are the roles people most often land out of an IR program. Each is a distinct
        track with its own conventions, employers, and credentialing path.
      </p>
      <ul className="not-prose divide-y divide-border border border-border">
        {roles.map(([t, d]) => (
          <li key={t} className="p-5">
            <div className="font-display text-base text-navy-deep">{t}</div>
            <p className="mt-1 text-sm text-muted-foreground">{d}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}

function Education() {
  return (
    <Section id="education" eyebrow="04" title="Education requirements">
      <h3 className="font-display text-xl text-navy-deep">Bachelor's degree (required for almost every entry role)</h3>
      <p>
        A bachelor's degree is the floor for U.S. federal jobs (GS-7 typically requires one
        plus relevant coursework or experience), think tank research assistant roles, and
        most NGO and corporate entry roles. Common majors: international relations, political
        science, history, economics, area studies, and increasingly STEM with a global
        affairs minor. The Foreign Service Officer Test has no major requirement at all.
      </p>
      <h3 className="font-display text-xl text-navy-deep">Master's degree (the standard mid-career credential)</h3>
      <p>
        The traditional credential for advancement is a two-year master's. The main
        flavors:
      </p>
      <ul>
        <li>
          <strong>MA in International Relations / MIA</strong> — generalist track. SAIS,
          Fletcher, Elliott School, Georgetown SFS, Columbia SIPA, Princeton SPIA, Yale
          Jackson, Sciences Po PSIA, LSE.
        </li>
        <li>
          <strong>MPP / MPA</strong> — policy analytics and management. HKS, Chicago Harris,
          Berkeley Goldman, Ford School.
        </li>
        <li>
          <strong>MBA with international focus</strong> — for private-sector and
          multilateral finance tracks.
        </li>
        <li>
          <strong>JD or JD/MA</strong> — for trade, sanctions, treaty, and human rights law.
        </li>
        <li>
          <strong>PhD</strong> — only required for tenure-track academia and a small number
          of senior research roles. Not a faster route into policy.
        </li>
      </ul>
      <h3 className="font-display text-xl text-navy-deep">Certifications and supplementary credentials</h3>
      <ul>
        <li>Defense Language Proficiency Test (DLPT) or ILR scores for State and IC roles.</li>
        <li>Project Management Professional (PMP) for development implementers.</li>
        <li>Security clearance — Secret or TS/SCI — for most federal national-security work.</li>
        <li>UN Young Professionals Programme (YPP) exam for entry-level UN roles.</li>
      </ul>
    </Section>
  );
}

function Skills() {
  return (
    <Section id="skills" eyebrow="05" title="Skills that actually get you hired">
      <ul>
        <li>
          <strong>Writing.</strong> The single most important skill in policy. You will live
          in 1–2 page memos, briefing notes, and analytical cables. Be ruthless and clear.
        </li>
        <li>
          <strong>Regional and language depth.</strong> One country or region you understand
          better than 95% of generalists, plus working proficiency in the relevant language.
          Critical languages — Arabic, Mandarin, Russian, Korean, Farsi — open the most
          federal doors.
        </li>
        <li>
          <strong>Quantitative literacy.</strong> Comfort with basic econometrics, indicator
          data (World Bank WDI, IMF WEO, COW), and increasingly Python or R. The bar at
          multilaterals and serious think tanks has risen quickly.
        </li>
        <li>
          <strong>Field experience.</strong> Time on the ground beats a second master's.
          Peace Corps, Fulbright, Boren, Critical Language Scholarship, embassy internships,
          and overseas NGO postings are decisive.
        </li>
        <li>
          <strong>Network.</strong> Most policy jobs are not posted publicly. Cold emails,
          conference attendance, alumni networks, and your professors' rolodexes matter more
          than the application portal.
        </li>
      </ul>
    </Section>
  );
}

function Pathways() {
  const paths = [
    {
      h: "Path A — Federal government",
      d: "Undergrad → Pathways internship or Presidential Management Fellowship → entry GS-7/9 role → graduate school (often funded by the agency) → mid-career. For State, take the Foreign Service Officer Test and the FSOA. For the IC, apply directly to CIA, DIA, or NSA undergraduate programs.",
    },
    {
      h: "Path B — Think tank to policy",
      d: "Undergrad → research assistant at a DC think tank (1–3 years) → master's at SAIS/Fletcher/Elliott/SIPA → fellow, congressional staffer, or political appointee. Publishing during the RA years compounds aggressively.",
    },
    {
      h: "Path C — Multilateral institutions",
      d: "Undergrad with strong economics + language → World Bank Junior Professional Associate (JPA) or UN intern → master's (often MPA or development economics) → UN YPP, Bank Young Professionals Program, or IMF Economist Program.",
    },
    {
      h: "Path D — NGO and humanitarian",
      d: "Undergrad → field internship or Peace Corps → entry program associate role → 2–3 country deployments → master's in IR or public health → country director track. Field time is non-negotiable.",
    },
    {
      h: "Path E — Private sector",
      d: "Undergrad in IR + a quantitative skill (data, finance, languages) → consulting analyst, political risk analyst, or government affairs associate → MBA or MA → manager track. The private sector pays the most and cares the least about pedigree.",
    },
  ];
  return (
    <Section id="pathways" eyebrow="06" title="Five realistic career pathways">
      <ul className="not-prose space-y-4">
        {paths.map((p) => (
          <li key={p.h} className="border border-border bg-paper p-6">
            <h3 className="font-display text-lg text-navy-deep">{p.h}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{p.d}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}

function Salary() {
  const rows = [
    ["State Department FSO (FP-04 entry)", "$58,000 + housing, post differentials"],
    ["GS-7 federal entry (DC locality)", "~$55,000"],
    ["GS-11 federal mid-career", "~$80,000–$104,000"],
    ["UN P-2 (entry professional)", "~$74,000 tax-exempt + post adjustment"],
    ["World Bank Junior Professional Associate", "~$60,000–$70,000"],
    ["Think tank research assistant (DC)", "$45,000–$58,000"],
    ["Think tank fellow / senior fellow", "$120,000–$250,000+"],
    ["Congressional foreign affairs LA", "$55,000–$80,000"],
    ["Political risk analyst", "$70,000–$110,000 (entry to mid)"],
    ["MBB consultant with global focus", "$110,000+ first year, $200,000+ post-MBA"],
    ["NGO program officer (HQ)", "$60,000–$95,000"],
    ["Big-law trade/sanctions associate", "$215,000+ first year (Cravath scale)"],
  ];
  return (
    <Section id="salary" eyebrow="07" title="Salaries: what to actually expect">
      <p>
        Compensation in international affairs varies dramatically by sector. NGOs and think
        tanks are the lowest-paid relative to credentials; the private sector and senior
        government are the highest. Numbers below are U.S.-centric in 2026 dollars; benefits,
        clearances, and post differentials shift them materially.
      </p>
      <div className="not-prose overflow-x-auto border border-border">
        <table className="w-full text-sm">
          <thead className="bg-stone text-left text-xs uppercase tracking-wider text-navy-deep">
            <tr>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Typical compensation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map(([r, s]) => (
              <tr key={r} className="bg-paper">
                <td className="px-4 py-3 text-navy-deep">{r}</td>
                <td className="px-4 py-3 text-muted-foreground">{s}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}

function Employers() {
  const groups = [
    ["Government", "U.S. Department of State, USAID, DoD, CIA, DIA, NSA, ODNI, Treasury (OFAC), Commerce (BIS), USTR, Peace Corps, U.S. Congress."],
    ["Multilateral", "United Nations Secretariat, UNDP, UNHCR, UNICEF, WHO, World Bank, IFC, IMF, IDB, ADB, AfDB, WTO, OECD, IAEA, NATO."],
    ["Think tanks", "Brookings, CFR, Carnegie, CSIS, RAND, Atlantic Council, Wilson Center, AEI, Heritage, Cato, Peterson, Chatham House, IISS."],
    ["NGOs", "International Rescue Committee, Mercy Corps, Save the Children, Doctors Without Borders, Oxfam, International Crisis Group, Human Rights Watch, Open Society."],
    ["Consulting & political risk", "McKinsey, BCG, Bain, Eurasia Group, Control Risks, Teneo, Kissinger Associates, Albright Stonebridge, Macro Advisory Partners."],
    ["Private sector global affairs", "Microsoft, Google, Amazon, Meta, Apple, Boeing, Lockheed Martin, JPMorgan, Goldman Sachs, BlackRock, ExxonMobil."],
  ];
  return (
    <Section id="employers" eyebrow="08" title="Top employers in international relations">
      <ul className="not-prose grid gap-px border border-border bg-border md:grid-cols-2">
        {groups.map(([h, d]) => (
          <li key={h} className="bg-paper p-6">
            <h3 className="font-display text-base text-navy-deep">{h}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{d}</p>
          </li>
        ))}
      </ul>
      <p className="mt-6">
        Looking for live openings and program directories?{" "}
        <Link to="/directory" className="text-emerald underline">
          Browse our opportunities directory
        </Link>{" "}
        for internships, fellowships, and programs across all of these categories.
      </p>
    </Section>
  );
}

function HowToStart() {
  return (
    <Section id="how-to-start" eyebrow="09" title="How to actually break in">
      <ol>
        <li>
          <strong>Pick a region and a function.</strong> Generalists lose to specialists.
          Pick one country or region and one functional area (security, trade, development,
          climate) and let everything else reinforce that pair.
        </li>
        <li>
          <strong>Get on the ground.</strong> A summer in-country beats two extra
          internships in DC. Peace Corps, Fulbright, Boren, CLS, and embassy internships
          all signal this.
        </li>
        <li>
          <strong>Write in public.</strong> A handful of well-argued op-eds, briefs, or
          analytic posts under your name will out-perform your resume in screening.
        </li>
        <li>
          <strong>Build the network deliberately.</strong> 30 informational coffees with
          people 3–5 years ahead of you in the exact role you want.
        </li>
        <li>
          <strong>Apply to the structured entry programs early.</strong> PMF, YPP, Bank YPP,
          Pathways, JPA, Fulbright — most have hard deadlines and 6+ month timelines.
        </li>
        <li>
          <strong>Treat the master's as a strategic decision, not a default.</strong> Go
          when you know what you want it to do for you, ideally with funding.
        </li>
      </ol>
    </Section>
  );
}

function FAQ() {
  const items = [
    ["What jobs can you get with an international relations degree?",
      "Foreign Service Officer, intelligence analyst, think tank researcher, NGO and UN program officer, congressional staffer, political risk analyst, government affairs at major companies, international development consultant, trade lawyer, and country economist."],
    ["Do you need a master's degree for international relations jobs?",
      "Not for entry roles, the FSOT, intelligence agencies, or most NGO program associate roles. A master's is the standard credential for advancement at State, multilaterals, top think tanks, and senior consulting."],
    ["How much do international relations jobs pay?",
      "Entry roles in DC NGOs and think tanks pay $45k–$60k. FSOs start near $58k plus housing. UN P-2 is ~$74k tax-exempt. Mid-career policy and consulting commonly reach $90k–$150k; senior leadership can exceed $200k."],
    ["What languages are most useful?",
      "Arabic, Mandarin, Russian, Korean, Farsi, and French at State and the IC. Spanish, French, and Portuguese at multilaterals and development banks."],
    ["Is international relations a good career?",
      "It can be, for people who want mission-driven work with a global footprint. It is competitive, networks matter, and outside the private sector and senior government, pay is lower than law, finance, or tech."],
  ];
  return (
    <Section id="faq" eyebrow="FAQ" title="Frequently asked questions">
      <div className="not-prose space-y-4">
        {items.map(([q, a]) => (
          <details key={q} className="group border border-border bg-paper p-5">
            <summary className="cursor-pointer list-none font-display text-base text-navy-deep">
              <span className="mr-2 text-emerald">+</span>
              {q}
            </summary>
            <p className="mt-3 text-sm text-muted-foreground">{a}</p>
          </details>
        ))}
      </div>
    </Section>
  );
}

function CTA() {
  return (
    <section className="bg-navy-deep">
      <div className="mx-auto max-w-4xl px-6 py-20 text-center lg:px-10 lg:py-24">
        <h2 className="font-display text-3xl text-paper lg:text-4xl">
          Serious about building this career?
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-paper/70">
          Discover Diplomacy advises students and early-career professionals one-on-one.
          Tailored resumes, target-list research, interview prep, and a weekly Substack of
          50 global opportunities.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            to="/services"
            className="bg-emerald px-8 py-4 text-xs font-medium uppercase tracking-wider text-navy-deep hover:brightness-95"
          >
            See our services
          </Link>
          <Link
            to="/directory"
            className="border border-paper/30 px-8 py-4 text-xs font-medium uppercase tracking-wider text-paper hover:bg-paper/10"
          >
            Browse opportunities
          </Link>
        </div>
      </div>
    </section>
  );
}
