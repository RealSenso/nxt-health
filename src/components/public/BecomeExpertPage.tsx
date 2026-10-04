import React from 'react';
import logo from '../../assets/nxt-health-logo.png';
import { PublicLayout } from './PublicLayout';
import { InquiryForm } from './InquiryForm';
import { Btn, Eyebrow, H1, H2, Step } from './ui';

const WHY = [
  { n: '01', title: 'Be part of NXT Health', text: "You join NXT Health's community and help build the company behind it. Your name stands beside ours, and your judgement shapes what founders are taught." },
  { n: '02', title: 'Build a community that connects anywhere', text: 'A founder in Pune, Colombo, London or Boston can reach you. Every expert who joins makes the community more useful to every founder in it.' },
  { n: '03', title: 'Work with founders inside a startup system', text: 'Meet physician-founders working on real problems stated by doctors, hospitals and pharma, some with funding already behind them. You see what is being built well before it becomes a pitch deck.' },
  { n: '04', title: "Put your experience behind someone's idea", text: 'Use your passion, experience and expertise to help another person build. An hour with the right expert can spare a founder months of guessing.' },
];

const BUILD = [
  { title: 'Shape the roadmaps', text: 'Help write the step-by-step routes founders follow to market, starting with medical devices.' },
  { title: 'Put your name on a problem', text: 'Bring a problem you know needs solving. It is listed with your name, and founders come to you to understand it.' },
  { title: 'Sit on selection panels', text: 'Help choose the founders who take on problems funded by pharma and hospitals.' },
  { title: 'Be heard on the NXT Health channel', text: 'We record a conversation with you and publish it to founders, clinicians and investors.' },
  { title: 'Join the advisory board', text: 'Experts who make an outsized difference for founders are invited to advise NXT Health directly.' },
];

export const BecomeExpertPage: React.FC = () => (
  <PublicLayout variant="join">
    {/* Hero */}
    <section className="nxt-container pt-16 sm:pt-24 pb-16 sm:pb-20 border-b border-[var(--nxt-line)]">
      <Eyebrow>For seasoned experts</Eyebrow>
      <H1 className="mt-7 max-w-[20ch]">Help build the largest health innovation community in the world.</H1>
      <p className="mt-8 max-w-[40rem] text-[clamp(1.05rem,1.5vw,1.25rem)] leading-relaxed text-[var(--nxt-ink)]/80">
        You have already taken ideas to market and to patients. NXT Health invites you to build with us, so that a founder anywhere in the world can reach someone who has done it before.
      </p>
      <div className="mt-9 flex flex-wrap gap-3">
        <Btn to="/experts/join#apply">Build with us</Btn>
        <Btn variant="outline" to="/experts/join#why">Why experts join</Btn>
      </div>
    </section>

    {/* A call to all experts */}
    <section className="bg-[#111] text-white">
      <div className="nxt-container py-16 sm:py-20 grid gap-10 lg:grid-cols-[22rem_1fr] lg:gap-20 items-center">
        <div className="hidden lg:flex aspect-[4/5] rounded-[18px] bg-[#1b1b1b] border border-white/10 items-center justify-center p-12">
          <img src={logo} alt="NXT Health" className="w-full max-w-[14rem] opacity-90" />
        </div>
        <div>
          <p className="text-[12px] sm:text-[13px] uppercase tracking-[0.14em] text-white/60">A call to all experts</p>
          <h2 className="font-display font-bold text-[clamp(2.25rem,4.5vw,3.5rem)] leading-[1.05] tracking-[-0.035em] mt-4">Dr. Smita Karpate</h2>
          <p className="mt-2 text-xl text-white/80">Co-Founder, Visionary</p>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            <div className="border-t border-white/25 pt-4 text-[15px] leading-relaxed text-white/70"><strong className="text-white">Physician, MD Pharmacology.</strong> She reads the clinical evidence herself.</div>
            <div className="border-t border-white/25 pt-4 text-[15px] leading-relaxed text-white/70"><strong className="text-white">Eighteen years in healthcare strategy.</strong> Pharma insight, medical affairs and market access.</div>
            <div className="border-t border-white/25 pt-4 text-[15px] leading-relaxed text-white/70"><strong className="text-white">CEO, InScience Health.</strong> The KOL and clinical-expert bench already exists.</div>
          </div>
        </div>
      </div>
    </section>

    {/* Why we exist */}
    <section className="bg-[#111] text-white border-t border-white/10">
      <div className="nxt-container py-16 sm:py-20">
        <p className="text-[12px] sm:text-[13px] uppercase tracking-[0.14em] text-white/60">Why we exist</p>
        <H2 className="mt-5 max-w-[22ch] !text-[clamp(2rem,4.4vw,3.75rem)]">The bridge between innovation and patients.</H2>
        <div className="mt-8 max-w-2xl space-y-6 text-xl leading-relaxed text-white/85">
          <p>About 1 in 5 physicians we speak with has an idea they want to build. Most never start, because they do not know where to begin. The knowledge that would get them moving already exists. It sits with people like you.</p>
          <p>NXT Health intends to be the world's largest platform connecting clinical problems, physician-founders, capital, hospitals and commercial help. A company cannot build that alone. The people who have done the work build it together.</p>
        </div>
      </div>
    </section>

    {/* Why experts join */}
    <section id="why" className="nxt-container py-20 sm:py-24 scroll-mt-20">
      <H2>Why seasoned experts join</H2>
      <div className="mt-10 grid gap-x-16 gap-y-10 md:grid-cols-2">
        {WHY.map(item => <Step key={item.n} n={item.n} title={item.title}>{item.text}</Step>)}
      </div>
    </section>

    {/* How you build with us */}
    <section id="build" className="nxt-container py-20 sm:py-24 border-t border-[var(--nxt-line)] scroll-mt-20">
      <div className="grid gap-10 lg:grid-cols-[22rem_1fr] lg:gap-20">
        <div>
          <H2 className="max-w-[12ch]">How you build NXT Health with us</H2>
          <p className="mt-5 text-lg text-[var(--nxt-ink-soft)]">Sessions with founders are where it starts. Experts also shape the platform itself.</p>
        </div>
        <ul className="border-t border-[var(--nxt-line)]">
          {BUILD.map(item => (
            <li key={item.title} className="py-5 border-b border-[var(--nxt-line)]">
              <h3 className="font-bold text-lg">{item.title}</h3>
              <p className="mt-1.5 text-[15px] text-[var(--nxt-ink-soft)] leading-relaxed">{item.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>

    {/* Your time is valued */}
    <section className="bg-[var(--nxt-bg-soft)] border-y border-[var(--nxt-line)]">
      <div className="nxt-container py-16 sm:py-20">
        <H2 className="text-[clamp(1.75rem,3vw,2.5rem)]">Your time is valued</H2>
        <p className="mt-4 max-w-2xl text-lg text-[var(--nxt-ink-soft)]">You are paid for every session through a revenue share that follows your experience and the demand for your time.</p>
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          <div className="border-t border-[var(--nxt-ink)] pt-4"><h3 className="font-bold text-lg">You set your rate</h3><p className="mt-2 text-[15px] text-[var(--nxt-ink-soft)]">Anywhere from free to $500 an hour.</p></div>
          <div className="border-t border-[var(--nxt-ink)] pt-4"><h3 className="font-bold text-lg">You keep 80%</h3><p className="mt-2 text-[15px] text-[var(--nxt-ink-soft)] leading-relaxed">NXT keeps 20% of each session and uses it to fund more support for our community: matching, booking and payments.</p></div>
          <div className="border-t border-[var(--nxt-ink)] pt-4"><h3 className="font-bold text-lg">Demand moves you up</h3><p className="mt-2 text-[15px] text-[var(--nxt-ink-soft)] leading-relaxed">Founders are recommended experts for the gate they are on. As demand for you grows, so can your rate.</p></div>
        </div>
      </div>
    </section>

    {/* How joining works */}
    <section className="nxt-container py-20 sm:py-24">
      <H2>How joining works</H2>
      <div className="mt-10 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-5">
        <Step n="01" title="Introduce yourself">Tell us what you have done and where you want to help.</Step>
        <Step n="02" title="Meet the founders of NXT">We talk it through and map your experience to the gates of the founder roadmap where it counts most.</Step>
        <Step n="03" title="Agree how we work">A short expert agreement and an NDA.</Step>
        <Step n="04" title="Join the community">Your profile goes live with your topics and your rate, and you meet the other experts.</Step>
        <Step n="05" title="Start building">Founders book you, and you take part in the roadmaps, panels and conversations that suit you.</Step>
      </div>
    </section>

    {/* Apply */}
    <section id="apply" className="bg-[#111] text-white scroll-mt-16">
      <div className="nxt-container py-20 sm:py-24 grid gap-12 lg:grid-cols-2 lg:gap-24 items-start">
        <div>
          <H2>Build with us</H2>
          <p className="mt-5 text-xl leading-relaxed text-white/85 max-w-md">Tell us what you have taken to market or to patients, and where you want to help.</p>
        </div>
        <InquiryForm kind="expert" tone="dark" />
      </div>
    </section>
  </PublicLayout>
);
