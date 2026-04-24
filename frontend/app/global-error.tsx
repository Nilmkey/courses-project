"use client";

import { useMounted } from "@/frontend/hooks/useMounted";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const mounted = useMounted();

  if (!mounted) {
    return null;
  }

  return (
    <html>
      <body>
        <div
          style={{
            display: "flex",
            minHeight: "100vh",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <h1>Произошла критическая ошибка</h1>
            <p>{error.message}</p>
            <button onClick={reset}>Попробовать снова</button>
          </div>
        </div>
      </body>
    </html>
  );
}
