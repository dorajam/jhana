"use client";

import { useEffect, useState } from "react";

// Builds the absolute invite URL on the client (needs window.origin) and
// offers a one-click copy. The link points at /login carrying the invite so
// the recipient signs in and the connection is made on verify.
export function InviteLink({ token }: { token: string }) {
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setUrl(`${window.location.origin}/login?invite=${token}`);
  }, [token]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard may be blocked; the text is still selectable.
    }
  };

  return (
    <div className="mt-1 flex items-center gap-2">
      <code className="min-w-0 flex-1 truncate rounded bg-paper px-2 py-1 text-xs text-accent">
        {url || "…"}
      </code>
      <button
        type="button"
        onClick={copy}
        className="shrink-0 rounded-full border border-hairline px-3 py-1 text-xs text-ink-soft hover:border-accent hover:text-accent"
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
