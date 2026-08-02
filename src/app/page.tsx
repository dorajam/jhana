import { SitTimer } from "@/components/SitTimer";

// The timer is intentionally open to everyone — no login required to sit.
// Sign-in is only prompted when saving a sit (see /log).
export default function SitPage() {
  return (
    <div className="flex flex-col items-center gap-2 pt-6">
      <p className="font-serif text-2xl text-ink">Sit</p>
      <p className="max-w-sm text-center text-sm text-ink-soft">
        Set a length, settle in, and begin. When the bell fades, you&rsquo;ll
        log the sit while it&rsquo;s still fresh.
      </p>
      <SitTimer />
    </div>
  );
}
