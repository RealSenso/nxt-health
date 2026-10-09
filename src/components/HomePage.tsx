import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { store } from '../services/store';
import { PublicLayout } from './public/PublicLayout';
import { InquiryForm, LeadRole } from './public/InquiryForm';
import { Btn, Eyebrow, H1, H2, RuleList, Step } from './public/ui';

const JUMP_LINKS = [
  { label: 'Founders and startups', to: '#who-founders' },
  { label: 'Pharma companies and innovators', to: '#who-pharma' },
  { label: 'Hospitals', to: '#who-hospitals' },
  { label: 'Experts', to: '#who-experts' },
  { label: 'Incubators', to: '#who-incubators' },
  { label: 'Entering the US', to: '#who-us' },
];

interface Audience {
  id: string;
  who: string;
  title: string;
  intro: string;
  points: string[];
  cta: string;
  to: string;
}

const AUDIENCES: Audience[] = [
  {
    id: 'who-founders',
    who: 'Physician-founders and startups',
    title: 'Know what to do next, every week.',
    intro: 'You have the idea and the clinical know-how. What nobody gave you is the route. We give you real problems with money behind them, and a step-by-step path to market.',
    points: ['A route built for your product and your country', "The right expert for the step you're on", "Ask anything in private, including what you wouldn't ask out loud"],
    cta: 'Join free',
    to: '/signup',
  },
  {
    id: 'who-pharma',
    who: 'Pharma companies and innovators',
    title: 'Fund a problem, not a hackathon.',
    intro: 'Name one problem. We bring screened, doctor-led teams who work against deadlines and submit evidence at every step. You watch real progress and skip the cold decks.',
    points: ['Start with one small grant', 'See every team move, gate by gate', 'Grow into a pipeline, with the option to co-invest'],
    cta: 'Seed a problem',
    to: '/?as=pharma#start',
  },
  {
    id: 'who-hospitals',
    who: 'Hospitals',
    title: 'Your problems solved. Your research wing paid.',
    intro: 'List the problems your clinicians face every day. Host validation studies on the research capacity you already have, and earn new revenue from it.',
    points: ['Doctor-led teams working on your problems', 'Studies run on capacity you already have', 'A new revenue line for your research wing'],
    cta: 'List a problem',
    to: '/?as=hospital#start',
  },
  {
    id: 'who-experts',
    who: 'Experts',
    title: "Founders are stuck on something you've already done.",
    intro: 'Regulatory, clinical validation, hospital pilots, selling to pharma. If you have done it, founders will book an hour with you at the exact step where they need it.',
    points: ['Set your own rate, from free to $500 an hour', 'Get matched to founders at the step where you help most', 'Booking, video and chat are built in'],
    cta: 'Become an expert',
    to: '/experts/join',
  },
  {
    id: 'who-incubators',
    who: 'Incubators and accelerators',
    title: 'You build companies. We bring the buyer forward.',
    intro: 'Most founders meet the buyer last. Ours start with a problem that pharma or a hospital has already put money behind. We connect. You build and scale.',
    points: ['Funded problems your founders can apply for', 'Get recommended to founders at the step where you help', 'Roadmaps and evidence gates your cohort can follow'],
    cta: 'Partner with us',
    to: '/?as=incubator#start',
  },
  {
    id: 'who-us',
    who: 'Entering the US',
    title: 'Heading for the US? Follow a route, not a guess.',
    intro: 'The same model works for market entry. Pick the roadmap for your product, follow the US steps, and book people who have dealt with the FDA and sold to US hospitals and pharma.',
    points: ['US-specific steps on your roadmap', 'Experts on FDA routes and US go-to-market', 'Prove the demand before you pay for a launch'],
    cta: 'Plan your US entry',
    to: '/?as=us#start',
  },
];

const PLATFORM = [
  { title: 'Problem library', text: 'Funded and open problems, each with its own page.' },
  { title: 'Funding applications', text: 'Apply, get screened, and get feedback if you need to resubmit.' },
  { title: 'Stage-gate roadmaps', text: 'Steps, deadlines and resources for each type of product.' },
  { title: 'Expert matching', text: 'Recommended experts, paid bookings and built-in chat.' },
  { title: 'Team workspace', text: 'Invite co-founders and share a live progress log.' },
  { title: 'Progress view', text: 'Sponsors see each team move, gate by gate.' },
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

  return (
    <PublicLayout variant="home">
      {/* Hero */}
      <section className="nxt-container pt-16 sm:pt-24 pb-16 sm:pb-20 border-b border-[var(--nxt-line)]">
        <Eyebrow>NXT Health · Problem first. Funded first.</Eyebrow>
        <H1 className="mt-7">
          Pharma has the problem.<br className="hidden sm:block" /> Doctors have the answer.
        </H1>
        <p className="mt-8 max-w-[34rem] text-[clamp(1.05rem,1.5vw,1.25rem)] leading-relaxed text-[var(--nxt-ink)]/80">
          NXT Health connects funded clinical problems with the physician-founders who can solve them, then walks each one step by step to market.
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <Btn to="/#start">Seed a problem</Btn>
          <Btn variant="outline" to="/signup">Join free as a founder</Btn>
        </div>
        <p className="mt-12 text-sm text-[var(--nxt-ink-soft)]">Jump to what's in it for you</p>
        <div className="mt-3 flex flex-wrap gap-2.5">
          {JUMP_LINKS.map(link => (
            <a
              key={link.label}
              href={link.to}
              className="rounded-full border border-[var(--nxt-ink)]/70 px-4 py-2 text-[15px] hover:bg-[var(--nxt-bg-soft)] transition-colors"
              onClick={(e) => { e.preventDefault(); document.getElementById(link.to.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }}
            >
              {link.label}
            </a>
          ))}
        </div>
      </section>

      {/* The difference */}
      <section className="nxt-container py-20 sm:py-24 border-b border-[var(--nxt-line)]">
        <H2 className="max-w-[24ch]">Others build companies. We connect the pieces a doctor can't reach.</H2>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <div className="rounded-[18px] border border-[var(--nxt-line)] bg-[var(--nxt-surface)] p-7 sm:p-9">
            <Eyebrow>The usual route</Eyebrow>
            <h3 className="font-display font-bold text-2xl mt-5 tracking-[-0.02em]">Build first. Find the buyer last.</h3>
            <p className="mt-4 text-[17px] leading-relaxed text-[var(--nxt-ink-soft)]">
              A founder builds the product, writes the pitch deck, finds an advisor, and only then goes looking for someone to pay for it. By then the time and money are spent.
            </p>
          </div>
          <div className="rounded-[18px] bg-[#111] text-white p-7 sm:p-9 border border-white/10">
            <p className="text-[12px] sm:text-[13px] uppercase tracking-[0.14em] text-white/60">The NXT route</p>
            <h3 className="font-display font-bold text-2xl mt-5 tracking-[-0.02em]">Start with a problem someone will pay to solve.</h3>
            <p className="mt-4 text-[17px] leading-relaxed text-white/80">
              Pharma companies and hospitals name the problem and put money behind it. Then we connect a physician-founder to the capital, hospitals and commercial help needed to solve it.
            </p>
          </div>
        </div>
        <p className="mt-10 font-semibold text-lg">Problem first. Funded first. Then we build it with the doctor.</p>
      </section>

      {/* 1 in 5 */}
      <section className="nxt-container py-16 sm:py-20 border-b border-[var(--nxt-line)]">
        <div className="grid gap-6 md:grid-cols-[auto_1fr] md:gap-14 items-center">
          <p className="font-display font-bold text-[clamp(4rem,10vw,8rem)] leading-none tracking-[-0.05em]">1 in 5</p>
          <div className="max-w-3xl">
            <p className="text-[clamp(1.15rem,1.9vw,1.6rem)] leading-snug">
              physicians we speak with has an idea they want to build. Most never start, because they don't know where to begin.
            </p>
            <p className="mt-3 text-[var(--nxt-ink-soft)]">We help them check the idea against what the market wants, before they spend the time and the money.</p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="nxt-container py-20 sm:py-24 border-b border-[var(--nxt-line)] scroll-mt-20">
        <Eyebrow>How it works</Eyebrow>
        <H2 className="mt-5">From problem to market, one gate at a time.</H2>
        <div className="mt-12 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-5">
          <Step n="01" title="Find a problem">Problems come from doctors, hospitals and pharma. Some already have money behind them. Some are open.</Step>
          <Step n="02" title="Apply for funding">Each fund screens in its own way. You get a yes, a no, or a clear ask for more.</Step>
          <Step n="03" title="Pick a roadmap">{routeCount} routes to market, from marketplaces to devices to AI, each with the steps for your country{openCount > 0 && openCount < routeCount ? ` — ${openCount} open now` : ''}.</Step>
          <Step n="04" title="Clear each gate">Every step has a deadline and needs evidence. Clear it, and the next one opens.</Step>
          <Step n="05" title="Get matched help">Experts, hospitals, lawyers and incubators, recommended for the step you're on.</Step>
        </div>
      </section>

      {/* Who it's for */}
      <section id="who-its-for" className="nxt-container py-20 sm:py-24 border-b border-[var(--nxt-line)] scroll-mt-20">
        <Eyebrow>Who it's for</Eyebrow>
        <H2 className="mt-5">Each side gets something different.</H2>
        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {AUDIENCES.map(a => (
            <article key={a.id} id={a.id} className="rounded-[18px] border border-[var(--nxt-line)] bg-[var(--nxt-surface)] p-7 flex flex-col scroll-mt-28">
              <p className="text-[15px] text-[var(--nxt-ink-soft)]">{a.who}</p>
              <h3 className="font-display font-bold text-[1.65rem] leading-[1.1] mt-4 tracking-[-0.025em]">{a.title}</h3>
              <p className="mt-4 text-[15px] leading-relaxed text-[var(--nxt-ink-soft)]">{a.intro}</p>
              <RuleList items={a.points} className="mt-5 mb-7" />
              <Btn to={a.to} full className="mt-auto">{a.cta}</Btn>
            </article>
          ))}
        </div>
      </section>

      {/* What's inside */}
      <section className="nxt-container py-20 sm:py-24 border-b border-[var(--nxt-line)]">
        <H2>What's inside the platform</H2>
        <div className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {PLATFORM.map(item => (
            <div key={item.title} className="border-t border-[var(--nxt-ink)] pt-4">
              <h3 className="font-bold text-lg">{item.title}</h3>
              <p className="mt-2 text-[15px] text-[var(--nxt-ink-soft)] leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="nxt-container py-20 sm:py-24 scroll-mt-20">
        <Eyebrow>Pricing</Eyebrow>
        <H2 className="mt-5">Free to start. At cost to build.</H2>
        <p className="mt-4 text-lg text-[var(--nxt-ink-soft)]">Founders join free and pay at cost once they are ready to build.</p>
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <PriceCard label="Community" price="Free" note="always" points={['Problem headlines', 'Community and podcasts', 'Monthly founder town hall', 'Starter templates']} cta="Join free" to="/signup" outline />
          <PriceCard label="Founder member" price="₹2,000" note="per month · about $22 · at cost" points={['Full problem statements', 'Apply for funded problems', 'Stage-gate roadmaps and resources', 'Founder and co-founder workspace']} cta="Become a member" to="/signup" featured />
          <PriceCard label="Add-ons" price="₹22,500" note="per month · about $250 · project coordinator" points={['A coordinator who keeps you on track', 'Expert sessions, priced by the mentor', 'From free to $500 an hour']} cta="Find an expert" to="/experts" outline />
        </div>

        <div className="mt-20">
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
            <H2 className="max-w-[14ch]">Name the problem. We'll bring the doctor.</H2>
            <p className="mt-6 text-xl leading-relaxed text-white/85 max-w-xl">
              Seed one funded problem and watch physician-founders take it through each gate. Or join free and find a problem worth solving.
            </p>
            <p className="mt-6 text-white/60">
              Already a founder? <Link to="/signup" className="underline underline-offset-2 text-white">Create a free account</Link>.
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

const PriceCard: React.FC<{
  label: string; price: string; note: string; points: string[]; cta: string; to: string; featured?: boolean; outline?: boolean;
}> = ({ label, price, note, points, cta, to, featured, outline }) => (
  <article className={`rounded-[18px] border bg-[var(--nxt-surface)] p-7 flex flex-col ${featured ? 'border-[var(--nxt-ink)]' : 'border-[var(--nxt-line)]'}`}>
    <Eyebrow>{label}</Eyebrow>
    <p className="font-display font-bold text-[2.5rem] leading-none tracking-[-0.04em] mt-6">{price}</p>
    <p className="mt-2 text-sm text-[var(--nxt-ink-soft)]">{note}</p>
    <RuleList items={points} className="mt-6 mb-8" />
    <Btn to={to} variant={outline ? 'outline' : 'solid'} full className="mt-auto">{cta}</Btn>
  </article>
);
