export default function Loading() {
  return (
    <div role="status" className="flex flex-col items-center gap-10 py-24">
      <div aria-hidden className="relative h-40 w-64">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="stock ruled absolute inset-0 animate-riffle [--margin:2.6rem]"
            style={{ rotate: `${(i - 1) * 4}deg`, animationDelay: `${i * 160}ms` }}
          />
        ))}
      </div>
      <p className="font-display text-2xl font-bold tracking-[0.1em] text-on-cloth uppercase">
        Pulling your record from GitHub…
      </p>
    </div>
  );
}
