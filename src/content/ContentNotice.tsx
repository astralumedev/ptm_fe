import { useBundle } from './block';

/** Shown only when the content service could not be reached, instead of silently empty pages. */
export function ContentNotice() {
  const bundle = useBundle();
  if (!bundle?.unavailable) return null;
  return (
    <div role="status" className="fixed bottom-4 inset-x-4 sm:left-auto sm:right-4 sm:max-w-sm z-[100] rounded-xl bg-gray-900 text-white text-sm px-4 py-3 shadow-2xl flex items-center gap-3" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      <span className="flex-1">We couldn’t load the latest mall information. Please check your connection.</span>
      <button onClick={() => window.location.reload()} className="shrink-0 font-semibold text-rose-200 hover:text-white cursor-pointer">Retry</button>
    </div>
  );
}
