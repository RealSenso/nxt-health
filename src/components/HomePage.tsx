import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { store } from '../services/store';
import { PublicLayout } from './public/PublicLayout';
import { InquiryForm, LeadRole } from './public/InquiryForm';
import { BlogCard } from './public/BlogPages';
import type { Startup } from '../types';
import { HowItWorks, OneInFive, Rise } from './public/HomeSections';
import { scrollToId } from './public/smoothScroll';
import { Btn, Eyebrow, H1, H2, RuleList, Step } from './public/ui';

const JUMP_LINKS = [
  { label: 'Founders & Builders', to: '#who-founders' },
  { label: 'Pharma & Innovators', to: '#who-pharma' },
  { label: 'Hospitals & Health Systems', to: '#who-hospitals' },
  { label: 'Domain Experts & Advisors', to: '#who-experts' },
  { label: 'Incubators & Accelerators', to: '#who-incubators' },
  { label: 'Entering the US Market', to: '#who-us' },
];

interface Audience {
  id: string;
  who: string;
  title: string;
  intro: string;
  points: (string | React.ReactNode)[];
  cta: string;
  to: string;
}

const AUDIENCES: Audience[] = [
  {
    id: 'who-founders',
    who: '1. Prospective Founders & Builders',
    title: 'Stop guessing market fit. Build with guaranteed demand.',
    intro: 'You bring the execution and technical vision. We give you validated, funded clinical problems and the exact execution pathway to bring them to market.',
    points: [
      <><strong>Tailored Roadmaps:</strong> A commercial pathway built specifically for your product type and target market.</>,
      <><strong>Stage-Matched Guidance:</strong> Connect with specialized experts at the exact moment your venture encounters a friction point.</>,
      <><strong>Unfiltered Platform Support:</strong> Get direct, private answers to critical strategic, operational, and structural questions.</>,
    ],
    cta: 'Join free',
    to: '/signup',
  },
  {
    id: 'who-pharma',
    who: '2. Pharma Companies & Enterprise Innovators',
    title: 'Fund a solved challenge, not an unvalidated pitch.',
    intro: 'Define the high-value clinical problem. We deploy screened, execution-focused founder teams who deliver evidence at every stage-gate.',
    points: [
      <><strong>Low-Risk Pilot Capital:</strong> Initiate engagement with targeted innovation grants.</>,
      <><strong>Full Stage-Gate Transparency:</strong> Track team progress, evidence submissions, and milestone completion in real time.</>,
      <><strong>De-Risked Dealflow:</strong> Build a scalable solution pipeline with built-in co-investment options.</>,
    ],
    cta: 'Seed a problem',
    to: '/?as=pharma#start',
  },
  {
    id: 'who-hospitals',
    who: '3. Hospitals & Health Systems',
    title: 'Turn daily clinical friction into institutional revenue.',
    intro: 'List the real-world operational and clinical challenges your physicians face. Leverage existing research infrastructure to validate solutions and open new revenue channels.',
    points: [
      <><strong>Targeted Problem Solving:</strong> Dedicated teams building solutions specifically for your frontline needs.</>,
      <><strong>Asset Optimization:</strong> Run validation studies using existing research and clinical capacity.</>,
      <><strong>Direct Commercial Revenue:</strong> Create a recurring revenue line for your research wing and clinical departments.</>,
    ],
    cta: 'List a problem',
    to: '/?as=hospital#start',
  },
  {
    id: 'who-experts',
    who: '4. Domain Experts & Advisors',
    title: 'Monetize your specialized industry experience.',
    intro: 'Founders encounter regulatory, clinical, and commercial roadblocks you’ve already solved. Connect with teams at the precise stage where your knowledge moves the needle.',
    points: [
      <><strong>Flexible Engagement:</strong> Set your custom hourly rate, from pro bono mentoring to high-value consulting.</>,
      <><strong>Precision Matching:</strong> Get routed to founders only when they reach the exact milestone you specialize in.</>,
      <><strong>Seamless Platform Delivery:</strong> Integrated booking, video conferencing, and direct communication built right in.</>,
    ],
    cta: 'Become an expert',
    to: '/experts/join',
  },
  {
    id: 'who-incubators',
    who: '5. Incubators & Accelerators',
    title: 'De-risk your cohort by introducing the buyer on Day 1.',
    intro: 'Instead of helping founders search for market fit at graduation, give them access to problems that pharma and hospitals have already funded.',
    points: [
      <><strong>Built-In Market Demand:</strong> Provide your cohort with access to pre-funded clinical needs.</>,
      <><strong>Structured Progress Tracking:</strong> Utilize standardized roadmaps and evidence gates across your entire portfolio.</>,
      <><strong>Program Integration:</strong> Get recommended to founder teams at the exact development stage where your curriculum adds value.</>,
    ],
    cta: 'Partner with us',
    to: '/?as=incubator#start',
  },
  {
    id: 'who-us',
    who: '6. Global Companies Entering the US Market',
    title: 'Execute a proven GTM route, not a high-risk guess.',
    intro: 'Navigate US healthcare expansion with a structured, regulatory-compliant roadmap backed by vetted FDA and commercialization veterans.',
    points: [
      <><strong>US-Specific Roadmaps:</strong> Step-by-step guidance covering FDA pathways, reimbursement, and health system procurement.</>,
      <><strong>Vetted GTM Experts:</strong> Book advisors who have successfully cleared FDA hurdles and sold into US hospital networks.</>,
      <><strong>De-Risked Market Entry:</strong> Validate local demand and commercial viability before committing heavy launch capital.</>,
    ],
    cta: 'Plan your US entry',
    to: '/?as=us#start',
  },
];

const PLATFORM = [
  {
    title: '1. Validated Problem Library',
    text: 'Explore an active index of funded clinical challenges sourced directly from pharma partners and health systems, complete with requirements, scope, and target outcomes.',
  },
  {
    title: '2. Streamlined Funding Applications',
    text: 'Submit your venture proposal for dedicated project capital. Benefit from structured screening protocols and direct, actionable feedback to refine resubmissions.',
  },
  {
    title: '3. Stage-Gate Roadmaps',
    text: 'Execute against pre-mapped development blueprints tailored to your specific product type. Featuring explicit milestones, regulatory checkpoints, and fixed deadlines.',
  },
  {
    title: '4. Precision Expert Matching',
    text: 'Instantly connect with vetted industry advisors. Book stage-matched consulting sessions with integrated scheduling, payment, and private communication tools.',
  },
  {
    title: '5. Collaborative Team Workspace',
    text: 'Centralize your startup operations. Onboard co-founders and team members while maintaining a real-time, shared execution log.',
  },
  {
    title: '6. Sponsor Progress View',
    text: 'Give funding partners and enterprise sponsors real-time visibility into your venture’s stage-gate progression and evidence verification.',
  },
];

const asRole = (value: string | null): LeadRole => {
  switch (value) {
    case 'hospital': case 'incubator': case 'us': case 'founder': case 'pharma': return value;
    default: return 'pharma';
  }
};

export const HomePage: React.FC = () => {
  const [params] = useSearchParams();
  const categories = store.getCategories();
  const routeCount = categories.length || 25;
  const openCount = categories.filter(c => !c.coming_soon).length;
  const initialRole = asRole(params.get('as'));
  const site = store.getSite();
  const blogs = store.getBlogs().filter(b => b.status === 'published').slice(0, 3);
  const startups = store.getStartups();

  return (
    <PublicLayout variant="home">
      {/* Hero */}
      <section className="nxt-container pt-16 sm:pt-24 pb-16 sm:pb-20 border-b border-[var(--nxt-line)]">
        <Eyebrow>NXT Health · Problem first. Funded first.</Eyebrow>
        <H1 className="mt-7">
          {site.hero_title || <>Doctors identify the real-world problems.<br className="hidden sm:block" /> You bring the solutions.</>}
        </H1>
        <p className="mt-8 max-w-[38rem] text-[clamp(1.05rem,1.5vw,1.25rem)] leading-relaxed text-[var(--nxt-ink)]/80">
          {site.hero_subtitle || 'NXT Health pairs validated, funded clinical problems with ambitious founders, providing a structured, end-to-end pathway from challenge to commercial launch.'}
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <Btn to="/#start">Seed a problem</Btn>
          <Btn variant="outline" to="/problems">Browse problem statements</Btn>
        </div>
        <p className="mt-12 text-sm text-[var(--nxt-ink-soft)]">Jump to what's in it for you</p>
        <div className="mt-3 flex flex-wrap gap-2.5">
          {JUMP_LINKS.map(link => (
            <a
              key={link.label}
              href={link.to}
              className="rounded-full border border-[var(--nxt-ink)]/70 px-4 py-2 text-[15px] hover:bg-[var(--nxt-bg-soft)] transition-colors"
              onClick={(e) => { e.preventDefault(); scrollToId(link.to.slice(1), 'center'); }}
            >
              {link.label}
            </a>
          ))}
        </div>
      </section>

      {/* The difference */}
      <section className="nxt-container py-20 sm:py-24 border-b border-[var(--nxt-line)]">
        <H2 className="max-w-[32ch]">Others launch startups in a vacuum. We connect ambitious founders with the real-world clinical challenges healthcare is waiting to solve.</H2>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <div className="rounded-[18px] border border-[var(--nxt-line)] bg-[var(--nxt-surface)] p-7 sm:p-9">
            <Eyebrow>The Traditional Route</Eyebrow>
            <h3 className="font-display font-bold text-2xl mt-5 tracking-[-0.02em]">Build first. Search for buyers later.</h3>
            <p className="mt-4 text-[17px] leading-relaxed text-[var(--nxt-ink-soft)]">
              Founders build a product, craft a pitch deck, and hunt for market fit, wasting critical time and capital on unvalidated ideas.
            </p>
          </div>
          <div className="rounded-[18px] bg-[#111] text-white p-7 sm:p-9 border border-white/10">
            <p className="text-[12px] sm:text-[13px] uppercase tracking-[0.14em] text-white/60">The NXT Route</p>
            <h3 className="font-display font-bold text-2xl mt-5 tracking-[-0.02em]"><span className="text-[#22c55e]">Start</span> with guaranteed demand.</h3>
            <p className="mt-4 text-[17px] leading-relaxed text-white/80">
              Doctors and Industry define the clinical problem and fund the solution. NXT Health matches ambitious founders with validated challenges, capital, and the end-to-end support needed to launch.
            </p>
          </div>
        </div>
      </section>

      <OneInFive />

      <HowItWorks
        subtitle="A structured, milestone-driven pathway engineered to eliminate startup risk."
        steps={[
          { title: 'Problem Selection', body: 'Start with verified, high-value clinical needs sourced from frontline healthcare.' },
          { title: 'Capital Matching', body: 'Lock in dedicated funding attached directly to the healthcare challenge.' },
          { title: 'Tailored Roadmap', body: 'Set a clear commercial route tailored to clinical, legal, and operational realities.' },
          { title: 'Stage-Gated Execution', body: 'Deliver required evidence against fixed deadlines. Clear the gate to unlock the next tranche of capital and progress.' },
          { title: 'Target Acceleration', body: 'Access specialized advisor networks, from clinical trials to hospital procurement, to drive market entry.' },
        ]}
      />

      {/* Who it's for */}
      <section id="who-its-for" className="nxt-container py-20 sm:py-24 border-b border-[var(--nxt-line)] scroll-mt-20">
        <Eyebrow>Who It's For</Eyebrow>
        <H2 className="mt-5">Aligning validated healthcare demand with the builders, experts, and capital to scale.</H2>
        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {AUDIENCES.map(a => (
            <article key={a.id} id={a.id} className="rounded-[18px] border border-[var(--nxt-line)] bg-[var(--nxt-surface)] p-7 flex flex-col scroll-mt-28 transition-colors duration-300 hover:bg-[var(--nxt-bg-soft)]">
              <p className="text-[15px] font-semibold text-[var(--nxt-ink-soft)]">{a.who}</p>
              <h3 className="font-display font-bold text-[1.65rem] leading-[1.1] mt-4 tracking-[-0.025em]">{a.title}</h3>
              <p className="mt-4 text-[15px] leading-relaxed text-[var(--nxt-ink-soft)]">{a.intro}</p>
              <RuleList items={a.points} className="mt-5" />
            </article>
          ))}
        </div>
      </section>

      {/* What's inside */}
      <section className="nxt-container py-20 sm:py-24 border-b border-[var(--nxt-line)]">
        <H2>What's inside the platform</H2>
        <div className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {PLATFORM.map((item, i) => (
            <Rise key={item.title} delay={(i % 3) * 0.08} className="border-t border-[var(--nxt-ink)] pt-4">
              <h3 className="font-bold text-lg">{item.title}</h3>
              <p className="mt-2 text-[15px] text-[var(--nxt-ink-soft)] leading-relaxed">{item.text}</p>
            </Rise>
          ))}
        </div>
      </section>

      {/* Startups */}
      {site.show_startups && startups.length > 0 && (
        <section id="startups" className="nxt-container py-20 sm:py-24 border-b border-[var(--nxt-line)] scroll-mt-20">
          <Eyebrow>Startups working with us</Eyebrow>
          <H2 className="mt-5">Companies taking problems to patients.</H2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {startups.map(s => <StartupCard key={s.id} startup={s} />)}
          </div>
        </section>
      )}

      {/* Pricing */}
      <section id="pricing" className="nxt-container py-20 sm:py-24 border-b border-[var(--nxt-line)] scroll-mt-20">
        <Eyebrow>Pricing</Eyebrow>
        <H2 className="mt-5">Free to start. At cost to build.</H2>
        <p className="mt-4 text-lg text-[var(--nxt-ink-soft)]">Founders join free and pay at cost once they are ready to build.</p>
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <PriceCard label="Community" price="Free" note="always" points={['Problem headlines', 'Community and podcasts', 'Monthly founder town hall', 'Starter templates']} cta="Join free" to="/signup" outline />
          <PriceCard label="Founder member" price="₹2,000" note="per month · about $22 · at cost" points={['Full problem statements', 'Apply for funded problems', 'Stage-gate roadmaps and resources', 'Founder and co-founder workspace']} cta="Become a member" to="/signup" featured />
          <PriceCard label="Add-ons" price="₹22,500" note="per month · about $250 · project coordinator" points={['A coordinator who keeps you on track', 'Expert sessions, priced by the mentor', 'From free to $500 an hour']} cta="Find an expert" to="/experts" outline />
        </div>
      </section>

      {/* Blog */}
      {site.show_blogs && blogs.length > 0 && (
        <section id="blog" className="nxt-container py-20 sm:py-24 border-b border-[var(--nxt-line)] scroll-mt-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <Eyebrow>From the blog</Eyebrow>
              <H2 className="mt-5">Ideas for people building health.</H2>
            </div>
            <Btn variant="outline" to="/blog">All posts</Btn>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{blogs.map(post => <BlogCard key={post.id} post={post} />)}</div>
        </section>
      )}

      {/* Pricing for pharma and hospitals */}
      <section id="pricing-pharma" className="nxt-container py-20 sm:py-24 scroll-mt-20">
        <div>
          <Eyebrow>For pharma and hospitals</Eyebrow>
          <h3 className="font-display font-bold text-[clamp(1.5rem,2.6vw,2.25rem)] tracking-[-0.03em] mt-4">Start with one problem. Grow into a pipeline.</h3>
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            <PriceCard label="Seed a problem" price="₹5–10 lakh" note="one grant · about $6–11K · plus 15% management fee" points={['One funded problem statement', 'Screened applicants', 'A gate-by-gate progress view']} cta="Seed a problem" to="/?as=pharma#start" featured />
            <PriceCard label="Sponsor" price="₹45 lakh" note="per year · about $50K" points={['Two funded problems a year', "Validation at your site or a partner's", 'Quarterly pipeline briefings', 'Speaking slot at the founder town hall']} cta="Talk to us" to="/?as=pharma#start" outline />
            <PriceCard label="Co-invest" price="₹90 lakh" note="per year · about $100K" points={['Everything in Sponsor', 'Pro-rata rights in cohort companies', 'Entry on pre-agreed terms']} cta="Talk to us" to="/?as=pharma#start" outline />
          </div>
        </div>
      </section>

      {/* Start */}
      <section id="start" className="bg-[#111] text-white scroll-mt-16">
        <div className="nxt-container py-20 sm:py-24 grid gap-12 lg:grid-cols-2 lg:gap-24 items-start">
          <div>
            <H2 className="max-w-[20ch]">Put capital behind a real clinical need or claim one to scale.</H2>
            <p className="mt-6 text-xl leading-relaxed text-white/85 max-w-xl">
              Fund a clinical challenge to deploy screened founder teams or join free to build with guaranteed demand from day one.
            </p>
          </div>
          <div className="rounded-[18px] bg-white p-6 sm:p-8">
            <InquiryForm kind="lead" initialRole={initialRole} />
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

const StartupCard: React.FC<{ startup: Startup }> = ({ startup }) => {
  const body = (
    <>
      <div className="flex items-center gap-4">
        {startup.logo_url
          ? <img src={startup.logo_url} alt="" className="w-14 h-14 rounded-xl object-contain border border-[var(--nxt-line)] bg-white p-1.5" loading="lazy" />
          : <div className="w-14 h-14 rounded-xl bg-[#111] text-white font-display font-bold text-xl flex items-center justify-center" aria-hidden="true">{startup.name.slice(0, 1).toUpperCase()}</div>}
        <div className="min-w-0">
          <h3 className="font-display font-bold text-lg tracking-[-0.02em] leading-tight">{startup.name}</h3>
          <p className="text-[13px] text-[var(--nxt-ink-soft)] mt-0.5">{[startup.sector, startup.stage, startup.location].filter(Boolean).join(' · ')}</p>
        </div>
      </div>
      {startup.tagline && <p className="mt-4 font-semibold">{startup.tagline}</p>}
      {startup.description && <p className="mt-2 text-[15px] leading-relaxed text-[var(--nxt-ink-soft)] line-clamp-4">{startup.description}</p>}
    </>
  );
  const cls = 'block rounded-[18px] border border-[var(--nxt-line)] bg-[var(--nxt-surface)] p-6';
  return startup.website
    ? <a href={startup.website} target="_blank" rel="noreferrer" className={`${cls} hover:border-[var(--nxt-ink)] transition-colors`}>{body}</a>
    : <article className={cls}>{body}</article>;
};

const PriceCard: React.FC<{
  label: string; price: string; note: string; points: string[]; cta: string; to: string; featured?: boolean; outline?: boolean;
}> = ({ label, price, note, points, cta, to, featured, outline }) => (
  <article className={`rounded-[18px] border bg-[var(--nxt-surface)] p-7 flex flex-col ${featured ? 'border-[var(--nxt-ink)]' : 'border-[var(--nxt-line)]'}`}>
    <Eyebrow>{label}</Eyebrow>
    <p className={`font-display font-bold text-[2.5rem] leading-none tracking-[-0.04em] mt-6 ${price === 'Free' ? 'text-[#16a34a]' : ''}`}>{price}</p>
    <p className="mt-2 text-sm text-[var(--nxt-ink-soft)]">{note}</p>
    <RuleList items={points} className="mt-6 mb-8" />
    {to !== '/signup' && <Btn to={to} variant={outline ? 'outline' : 'solid'} full className="mt-auto">{cta}</Btn>}
  </article>
);
