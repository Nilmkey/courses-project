'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ru">
      <body>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8faff' }}>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '1rem' }}>Что-то пошло не так</h1>
            <p style={{ marginBottom: '2rem', color: '#64748b' }}>{error?.message || 'Неизвестная ошибка'}</p>
            <button onClick={() => reset()} style={{ padding: '0.75rem 2rem', background: '#3b5bdb', color: '#fff', border: 'none', borderRadius: '0.75rem', fontWeight: '700', cursor: 'pointer' }}>
              Попробовать снова
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
