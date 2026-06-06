import ZeldaMap from '@/components/zelda-map';

export default function NextPage() {
  return (
    <div className="min-h-screen w-full lg:col-span-2 flex flex-col items-center justify-center gap-6 py-12">
      <h1 className="font-mono text-xl font-bold tracking-[0.3em] text-[#306230] dark:text-[#9bbc0f]">
        DALE&apos;S ISLAND
      </h1>
      <ZeldaMap />
      <p className="font-mono text-sm text-slate-500 dark:text-slate-400">
        Move with{' '}
        <kbd className="rounded bg-slate-700 px-1.5 py-0.5 text-slate-100">WASD</kbd> or the{' '}
        <kbd className="rounded bg-slate-700 px-1.5 py-0.5 text-slate-100">arrow keys</kbd>
      </p>
      <p className="font-mono text-sm text-slate-500 dark:text-slate-400">
        Press{' '}
        <kbd className="rounded bg-slate-700 px-1.5 py-0.5 text-slate-100">Enter</kbd> for the menu,{' '}
        <kbd className="rounded bg-slate-700 px-1.5 py-0.5 text-slate-100">Space</kbd> to select
      </p>
    </div>
  );
}
