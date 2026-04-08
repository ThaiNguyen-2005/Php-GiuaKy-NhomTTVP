export default function PageLoader() {
  return (
    <div className="min-h-screen bg-surface px-6 py-10 text-on-surface">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <div className="h-10 w-48 animate-pulse rounded-2xl bg-surface-container" />
        <div className="grid gap-6 md:grid-cols-[240px_minmax(0,1fr)]">
          <div className="h-[70vh] animate-pulse rounded-3xl bg-surface-container-low" />
          <div className="space-y-6">
            <div className="h-40 animate-pulse rounded-3xl bg-surface-bright shadow-sm" />
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              <div className="h-56 animate-pulse rounded-3xl bg-surface-bright shadow-sm" />
              <div className="h-56 animate-pulse rounded-3xl bg-surface-bright shadow-sm" />
              <div className="h-56 animate-pulse rounded-3xl bg-surface-bright shadow-sm" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
