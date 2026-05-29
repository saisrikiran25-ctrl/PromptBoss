// src/pages/Landing/index.jsx
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { FileText, ScanSearch, Sparkles, ArrowRight, ChevronDown, Zap, Workflow, Brain, Code2, Globe, Users } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import Button from '../../components/ui/Button';

// ── Live Demo Animation ──────────────────────────────────────
const DEMO_EXAMPLES = [
  {
    before: 'write me a summary of this article',
    after: 'You are a professional content analyst. Summarize the following article in 3-5 bullet points, focusing on key insights and actionable takeaways. Format as a numbered list with bold headings. Audience: busy executives. Tone: concise and direct.',
  },
  {
    before: 'help me write a cold email',
    after: 'You are an expert B2B sales copywriter. Write a cold outreach email for [COMPANY] targeting [PROSPECT_ROLE] at [TARGET_COMPANY]. The email should: (1) Open with a personalized observation about their company, (2) Present one specific pain point, (3) Offer a clear value proposition, (4) End with a low-commitment CTA. Max 150 words. Tone: confident, not pushy.',
  },
  {
    before: 'explain machine learning',
    after: 'You are a patient teacher skilled at breaking down complex topics. Explain machine learning to someone with no technical background. Use one real-world analogy, avoid jargon, and structure your response as: (1) What it is in one sentence, (2) How it works with an analogy, (3) Three concrete examples from everyday life. Keep it under 200 words.',
  },
];

function LiveDemo() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [phase, setPhase] = useState('typing-before'); // typing-before | pause | typing-after | done
  const [displayBefore, setDisplayBefore] = useState('');
  const [displayAfter, setDisplayAfter] = useState('');
  const timerRef = useRef(null);

  useEffect(() => {
    let i = 0;
    let cancelled = false;
    const example = DEMO_EXAMPLES[currentIdx];

    const resetAndType = async () => {
      setDisplayBefore('');
      setDisplayAfter('');
      setPhase('typing-before');

      // Type the "before" text
      for (let c = 0; c < example.before.length; c++) {
        if (cancelled) return;
        await new Promise((r) => { timerRef.current = setTimeout(r, 40); });
        setDisplayBefore(example.before.slice(0, c + 1));
      }

      if (cancelled) return;
      setPhase('pause');
      await new Promise((r) => { timerRef.current = setTimeout(r, 800); });

      if (cancelled) return;
      setPhase('typing-after');

      // Type the "after" text faster
      for (let c = 0; c < example.after.length; c++) {
        if (cancelled) return;
        await new Promise((r) => { timerRef.current = setTimeout(r, 12); });
        setDisplayAfter(example.after.slice(0, c + 1));
      }

      if (cancelled) return;
      setPhase('done');
      await new Promise((r) => { timerRef.current = setTimeout(r, 3000); });

      if (cancelled) return;
      setCurrentIdx((prev) => (prev + 1) % DEMO_EXAMPLES.length);
    };

    resetAndType();
    return () => {
      cancelled = true;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentIdx]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="card rounded-2xl overflow-hidden border border-border-subtle shadow-card">
        {/* Before */}
        <div className="p-4 border-b border-border-subtle">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-text-muted font-body uppercase tracking-wider">Your rough prompt</span>
          </div>
          <div className="font-mono text-sm text-text-secondary min-h-[24px]">
            {displayBefore}
            {phase === 'typing-before' && (
              <span className="inline-block w-0.5 h-4 bg-text-secondary ml-0.5 animate-pulse" />
            )}
          </div>
        </div>

        {/* Arrow + processing */}
        <div className="px-4 py-2 flex items-center gap-2 bg-accent-cyan/5 border-b border-border-subtle">
          {phase === 'pause' || phase === 'typing-after' || phase === 'done' ? (
            <>
              <Sparkles size={12} className="text-accent-cyan" />
              <span className="text-xs text-accent-cyan font-body">
                {phase === 'pause' ? 'Analyzing...' : 'Improved prompt'}
              </span>
            </>
          ) : (
            <span className="text-xs text-text-muted font-body">Paste your prompt above →</span>
          )}
        </div>

        {/* After */}
        <div
          className="p-4 relative"
          style={{
            borderLeft: (phase === 'typing-after' || phase === 'done') ? '3px solid #00D4FF' : '3px solid transparent',
            transition: 'border-color 0.3s ease',
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-text-muted font-body uppercase tracking-wider">PromptBoss output</span>
            {phase === 'done' && (
              <span className="text-[10px] text-accent-cyan bg-accent-cyan/10 px-2 py-0.5 rounded-full font-body">Ready to use</span>
            )}
          </div>
          <div className="font-mono text-[13px] text-text-primary leading-relaxed min-h-[48px]">
            {displayAfter}
            {phase === 'typing-after' && (
              <span className="inline-block w-0.5 h-4 bg-accent-cyan ml-0.5 animate-pulse" />
            )}
          </div>
        </div>

        {/* Progress dots */}
        <div className="px-4 py-2 flex items-center gap-1.5 justify-end border-t border-border-subtle">
          {DEMO_EXAMPLES.map((_, i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full transition-colors duration-300"
              style={{ backgroundColor: i === currentIdx ? '#00D4FF' : 'rgba(255,255,255,0.15)' }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── How It Works ─────────────────────────────────────────────
const STEPS = [
  { num: '01', icon: FileText, title: 'Paste your rough prompt', desc: 'Drop in whatever you have — messy, vague, or half-formed. No judgment.' },
  { num: '02', icon: ScanSearch, title: 'AI diagnoses weaknesses', desc: 'PromptBoss identifies missing role, context, format, constraints, and more.' },
  { num: '03', icon: Sparkles, title: 'Get a task-ready result', desc: 'Receive a structured, clear, production-ready prompt instantly.' },
];

// ── Features ─────────────────────────────────────────────────
const FEATURES = [
  { icon: Brain, title: 'Intent-First Refinement', desc: 'Starts with your underlying goal, not just the words you wrote. Identifies what you actually need.' },
  { icon: ScanSearch, title: 'Prompt Diagnosis Engine', desc: 'Identifies every structural weakness: missing role, context gaps, format ambiguity, unclear constraints.' },
  { icon: FileText, title: 'Task-Aware Improvement', desc: 'Different logic for writing, coding, research, data analysis, and more. Context matters.' },
  { icon: Zap, title: 'Model-Aware Optimization', desc: 'Tuned for chat, reasoning, and structured output models. Works with GPT-4o, Claude, Gemini, and Llama.' },
  { icon: Workflow, title: 'Workflow-Ready Export', desc: 'Outputs system prompts, parameterized templates with {{variables}}, and JSON schemas for automations.' },
  { icon: Code2, title: 'Power User Mode', desc: 'Full prompt architecture for agents, n8n pipelines, Make automations, and LangChain workflows.' },
];

// ── User Types ────────────────────────────────────────────────
const USER_TYPES = [
  'Founders', 'Marketers', 'Researchers', 'Freelancers',
  'n8n Builders', 'AI Power Users', 'Automation Engineers', 'Analysts',
  'Product Managers', 'Developers', 'Content Creators', 'Data Scientists',
];

function FadeSection({ children, className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function Landing() {
  return (
    <PageWrapper>
      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="max-w-3xl mx-auto"
        >
          {/* Tagline pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent-cyan/20 bg-accent-cyan/5 mb-6">
            <Zap size={12} className="text-accent-cyan" />
            <span className="text-xs font-body font-medium text-accent-cyan">AI-powered prompt engineering</span>
          </div>

          {/* Headline */}
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-[1.05]">
            <motion.span
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="block"
            >
              Turn intent
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.4 }}
              className="block text-gradient-hero"
            >
              into execution.
            </motion.span>
          </h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="text-lg md:text-xl text-text-secondary leading-relaxed max-w-2xl mx-auto mb-8 font-body"
          >
            Stop guessing what the AI wants. PromptBoss diagnoses your prompt,
            identifies what&apos;s missing, and rebuilds it — fast.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="flex flex-col sm:flex-row items-center gap-3 justify-center mb-12"
          >
            <Link to="/improve">
              <Button size="lg" icon={ArrowRight} iconPosition="right" className="px-8 shadow-glow-cyan">
                Improve a Prompt
              </Button>
            </Link>
            <Link to="/workflow">
              <Button variant="ghost" size="lg" icon={Workflow} className="px-8">
                Build a Workflow Prompt
              </Button>
            </Link>
          </motion.div>

          {/* Live Demo */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.5 }}
          >
            <LiveDemo />
          </motion.div>
        </motion.div>


      </section>

      {/* ── How It Works ──────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="content-max">
          <FadeSection className="text-center mb-16">
            <h2 className="section-heading mb-4">Three steps. Zero guesswork.</h2>
            <p className="section-subheading max-w-lg mx-auto">
              From rough idea to production-ready prompt in seconds.
            </p>
          </FadeSection>

          <div className="relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-8 left-[16.67%] right-[16.67%] h-px bg-gradient-to-r from-transparent via-border-default to-transparent" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {STEPS.map(({ num, icon: Icon, title, desc }, i) => (
                <FadeSection key={num}>
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.12, duration: 0.35 }}
                    className="flex flex-col items-center text-center"
                  >
                    <div className="relative mb-5">
                      <div className="w-16 h-16 rounded-2xl bg-bg-elevated border border-border-subtle flex items-center justify-center">
                        <Icon size={24} className="text-accent-cyan" />
                      </div>
                      <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-accent-cyan text-bg-base text-xs font-bold font-display flex items-center justify-center">
                        {i + 1}
                      </span>
                    </div>
                    <h3 className="font-display text-lg font-bold text-text-primary mb-2">{title}</h3>
                    <p className="text-text-secondary text-sm leading-relaxed font-body">{desc}</p>
                  </motion.div>
                </FadeSection>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature Highlights ────────────────────────────── */}
      <section className="py-24 px-6 bg-bg-surface/50">
        <div className="content-max">
          <FadeSection className="text-center mb-16">
            <h2 className="section-heading mb-4">Built different.</h2>
            <p className="section-subheading max-w-lg mx-auto">
              Every feature is designed around how AI actually works — not how people wish it did.
            </p>
          </FadeSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ icon: Icon, title, desc }, i) => (
              <FadeSection key={title}>
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.35 }}
                  className="card card-hover p-6 group cursor-default"
                  style={{ borderTop: '2px solid rgba(0,212,255,0.25)' }}
                >
                  <div className="w-10 h-10 rounded-xl bg-accent-cyan/10 flex items-center justify-center mb-4 group-hover:bg-accent-cyan/20 transition-colors duration-120">
                    <Icon size={18} className="text-accent-cyan" />
                  </div>
                  <h3 className="font-display text-base font-bold text-text-primary mb-2">{title}</h3>
                  <p className="text-text-secondary text-sm leading-relaxed font-body">{desc}</p>
                </motion.div>
              </FadeSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── Who It's For ──────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="content-max">
          <FadeSection className="text-center mb-10">
            <h2 className="section-heading mb-4">For everyone who uses AI seriously.</h2>
          </FadeSection>

          <FadeSection>
            <div className="flex flex-wrap gap-2.5 justify-center">
              {USER_TYPES.map((type, i) => (
                <motion.span
                  key={type}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04, duration: 0.25 }}
                  className="px-4 py-2 rounded-full border border-border-subtle bg-bg-elevated text-text-secondary text-sm font-body hover:border-border-accent hover:text-accent-cyan transition-all duration-120 cursor-default"
                >
                  {type}
                </motion.span>
              ))}
            </div>
          </FadeSection>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="content-max">
          <FadeSection>
            <div className="card rounded-2xl p-12 text-center border border-border-subtle relative overflow-hidden">
              {/* Subtle glow */}
              <div className="absolute inset-0 bg-radial-glow opacity-50 pointer-events-none" />
              <div className="relative">
                <h2 className="section-heading mb-4">Your prompts deserve better.</h2>
                <p className="section-subheading mb-8 max-w-md mx-auto">
                  Join engineers, founders, and creators who use PromptBoss to get more from every AI interaction.
                </p>
                <Link to="/improve">
                  <Button size="lg" icon={ArrowRight} iconPosition="right" className="px-10 shadow-glow-cyan">
                    Start Improving →
                  </Button>
                </Link>
              </div>
            </div>
          </FadeSection>
        </div>
      </section>
    </PageWrapper>
  );
}
