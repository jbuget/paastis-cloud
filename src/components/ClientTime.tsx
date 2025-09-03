"use client";
import { useEffect, useState } from "react";

export default function ClientTime({ iso, className }: { iso: string; className?: string }) {
  const [text, setText] = useState<string>(iso);

  useEffect(() => {
    try {
      const d = new Date(iso);
      // Render localized time on client to avoid SSR/CSR mismatch
      setText(d.toLocaleString());
    } catch {
      setText(iso);
    }
  }, [iso]);

  return (
    <time dateTime={iso} className={className} suppressHydrationWarning>
      {text}
    </time>
  );
}

