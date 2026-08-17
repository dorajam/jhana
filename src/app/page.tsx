import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Jhana — a space for your practice",
  description:
    "Jhana is a concentration practice that leads to a sequence of absorbed states. What it is, how it's practised, and what you can reach.",
};

// The landing page. Deliberately reachable without an account: it answers
// "what is this and should I try it?" before any sign-in friction. The timer
// itself lives at /practice.
export default function HomePage() {
  return (
    <div className="flex flex-col gap-12 pb-20 pt-8">
      <Hero />
      <WhatIsJhana />
      <TheMechanism />
      <HowToPractise />
      <TheStates />
      <Collaborative />
      <ClosingCta />
    </div>
  );
}

function Hero() {
  return (
    <section className="flex flex-col items-center gap-5 text-center">
      <h1 className="max-w-2xl font-serif text-4xl leading-tight text-ink sm:text-5xl">
        A practice of radical allowing
      </h1>
      <p className="max-w-xl text-base text-ink-soft">
        The Jhana practice is a form of meditation to cultivate a felt sense of
        peace, calm and joy in the body. Over time, these sensations are readily
        accessible regardless of external conditions.
      </p>
      <PrimaryCta />
    </section>
  );
}

function WhatIsJhana() {
  return (
    <Section title="What is Jhana meditation?">
      <p>
        The jhanas are specific mental states that meditators access through a
        specific kind of attention training. There are eight jhana states, and
        over time, practitioners train their attention to access deeper states.
      </p>
      <p>
        The reason to do this isn&rsquo;t the states themselves. States
        practised repeatedly become traits: the gap between something happening
        and your reaction to it widens.
      </p>
      <p>
        People report stress that stops accumulating the way it used to, habits
        that had resisted willpower for years becoming workable, and more
        capacity for the people around them &mdash; because less of it is going
        into managing themselves.
      </p>
    </Section>
  );
}

function TheMechanism() {
  return (
    <Section title="The core mechanism">
      <p>
        The mechanism is a feedback loop between attention and pleasure. You
        rest attention on something pleasant; the attention steadies it; the
        pleasure deepens; and deeper pleasure holds attention more easily still.
      </p>
      <p>
        It begins with an <strong className="font-semibold text-ink">anchor</strong>{" "}
        &mdash; a mantra, the memory of someone you love, or a pleasant
        sensation in the body. Anything that reliably produces a warm feeling.
      </p>
      <p>
        The anchor isn&rsquo;t the object of meditation. The{" "}
        <em>felt sensation it produces</em> in the body is &mdash; the warmth in
        the chest, the subtle expansion. You attend to that, not to the thought
        that caused it.
      </p>
      <p>
        This is why jhana isn&rsquo;t about concentrating harder. Effort creates
        tension, and tension is exactly what prevents the loop from building.
        The skill is relaxing into stability &mdash; learning to stop
        interfering.
      </p>
    </Section>
  );
}

function HowToPractise() {
  const steps = [
    {
      title: "Settle",
      body: "Sit somewhere you can stay comfortably. Let the body arrive before asking anything of attention.",
    },
    {
      title: "Choose an anchor",
      body: "A mantra, a memory of someone you love, a pleasant sensation in the body. Whatever reliably produces warmth for you.",
    },
    {
      title: "Find the feeling in the body",
      body: "Notice what the anchor does physically — warmth in the chest, a subtle expansion. That sensation is your object, not the thought.",
    },
    {
      title: "Pulse and glide",
      body: "Pulse: re-invoke the anchor for five to thirty seconds. Glide: let the feeling resonate on its own. Don't stack pulses anxiously — the glide is where it happens.",
    },
    {
      title: "Ask, don't push",
      body: "When it stabilises: Can I relax more? Can I enjoy this more? Can I bring more wonder to this? If you're straining, try half as hard. Then half again.",
    },
    {
      title: "When you drift",
      body: "Acknowledge what pulled you away, release whatever tension has crept in, and return to the feeling. No commentary needed.",
    },
  ];

  return (
    <Section title={<>How it&rsquo;s practised</>}>
      <p>
        Though consistency matters more than length, sits are typically fifteen
        to forty-five minutes. Each sit follows these steps:
      </p>
      <ol className="flex flex-col gap-5">
        {steps.map((step, i) => (
          <li key={step.title} className="flex gap-4">
            <span
              aria-hidden="true"
              className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-saffron font-semibold text-sm text-basalt"
            >
              {i + 1}
            </span>
            <div className="flex flex-col gap-1">
              <p className="text-lg font-bold text-ink">{step.title}</p>
              <p className="text-ink-soft">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}

const FORM_JHANAS = [
  {
    n: 1,
    name: "Rapture",
    body: "Attention stabilises on the object and a strong, energised pleasure arises. Thinking continues, but it circles the experience itself rather than wandering off.",
  },
  {
    n: 2,
    name: "Joy",
    body: "Effort drops away. The sharp pleasure of the first jhana softens into something warmer and more emotional. Thinking quiets considerably.",
  },
  {
    n: 3,
    name: "Contentment",
    body: "The warmth settles into a broader, calmer contentment. Mental chatter becomes infrequent. The feeling is less personal — closer to general acceptance than to excitement.",
  },
  {
    n: 4,
    name: "Stillness",
    body: "Deep stillness with very few thoughts. Practitioners describe a sense of completion — that nothing needs to be different than it is.",
  },
];

const FORMLESS_JHANAS = [
  {
    n: 5,
    name: "Infinite space",
    body: "Attention releases the sense of a bounded body and rests in the perception of space without edges.",
  },
  {
    n: 6,
    name: "Infinite consciousness",
    body: "Attention turns from space to the awareness perceiving it, which is likewise experienced as without limit.",
  },
  {
    n: 7,
    name: "Nothingness",
    body: "Attention settles on the absence of any particular content — no object at all to rest upon.",
  },
  {
    n: 8,
    name: "Neither perception nor non-perception",
    body: "Perception becomes so subtle it can no longer be clearly said to be present or absent.",
  },
];

function TheStates() {
  return (
    <Section title="The eight Jhana states">
      <p>
        They divide traditionally into two groups of four, and they&rsquo;re
        progressive: each is reached from the one before, and each is more
        settled than the last.
      </p>

      <div className="flex flex-col gap-8">
        <StateGroup
          label="Form jhanas"
          caption="The first four. Attention still rests on a felt object, and each state is characterised by its emotional tone — moving from energised pleasure toward deep calm."
          states={FORM_JHANAS}
          accent="bg-saffron"
        />
        <StateGroup
          label="Formless jhanas"
          caption="The last four. The felt object falls away and what changes is the sense of space and of self. They are described as more disembodied, and stiller again than the fourth."
          states={FORMLESS_JHANAS}
          accent="bg-jade"
        />
      </div>
    </Section>
  );
}

function StateGroup({
  label,
  caption,
  states,
  accent,
}: {
  label: string;
  caption: string;
  states: { n: number; name: string; body: string }[];
  accent: string;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className={`h-2.5 w-2.5 rounded-full ${accent}`}
          />
          <h3 className="font-serif text-xl text-ink">{label}</h3>
        </div>
        <p className="text-sm text-ink-soft">{caption}</p>
      </div>

      <ul className="flex flex-col border-l border-hairline">
        {states.map((s) => (
          <li key={s.n} className="flex gap-4 py-3 pl-5">
            <span className="mt-0.5 w-4 shrink-0 font-serif text-sm text-ink-faint">
              {s.n}
            </span>
            <div className="flex flex-col gap-1">
              <p className="font-medium text-ink">{s.name}</p>
              <p className="text-sm text-ink-soft">{s.body}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Collaborative() {
  return (
    <section className="flex flex-col gap-4 rounded-xl bg-cobalt px-7 py-8 text-limestone">
      <p className="text-xs font-semibold uppercase tracking-widest text-saffron">
        What makes this different
      </p>
      <h2 className="font-serif text-2xl">Practise with a facilitator</h2>
      <div className="flex flex-col gap-4 text-limestone/90">
        <p>
          Jhana is easier to learn with someone reading along. This app lets you
          invite a facilitator &mdash; a teacher, a guide, or an experienced
          friend &mdash; who can see the sits you log and the notes you write
          after them.
        </p>
        <p>
          They follow your practice as it actually unfolds, session by session,
          rather than as a summary recalled weeks later. You choose who to
          invite, and you can disconnect at any time.
        </p>
      </div>
    </section>
  );
}

function ClosingCta() {
  return (
    <section className="flex flex-col items-center gap-5 border-t border-hairline pt-12 text-center">
      <h2 className="font-serif text-2xl text-ink">Ready to begin?</h2>
      <p className="max-w-md text-ink-soft">
        Set a length and sit. You don&rsquo;t need an account to start &mdash;
        only to save what you log.
      </p>
      <PrimaryCta />
    </section>
  );
}

function PrimaryCta() {
  return (
    <Link
      href="/practice"
      className="breath breath-saffron rounded-lg bg-saffron px-7 py-3.5 font-bold text-basalt hover:bg-saffron-hover active:bg-[#c8910e]"
    >
      Try it for yourself
    </Link>
  );
}

function Section({
  title,
  children,
}: {
  title: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-serif text-2xl text-ink">{title}</h2>
      <div className="flex flex-col gap-4 text-ink-soft">{children}</div>
    </section>
  );
}
