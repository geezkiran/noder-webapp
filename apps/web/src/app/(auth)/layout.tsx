import { ForceLightTheme } from "./force-light-theme";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="-m-3 flex min-h-0 flex-1 gap-1 overflow-hidden bg-black p-3">
      <ForceLightTheme />
      <div className="relative hidden min-w-0 flex-1 flex-col justify-end overflow-hidden rounded-3xl border-[0.5px] border-neutral-800 bg-neutral-950 p-10 [clip-path:inset(0_round_1.5rem)] lg:flex">
        <div className="pointer-events-none absolute -top-24 -left-24 size-72 rounded-full bg-brand-600/25 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 -bottom-24 size-72 rounded-full bg-brand-500/15 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-4">
          <img
            src="/brand/noder-mark.png"
            alt=""
            aria-hidden="true"
            draggable={false}
            className="size-9 object-contain brightness-100"
          />
          <div>
            
            <p className="mt-2 max-w-xs text-sm text-white/50">
              A focused space to write, share, and grow ideas — build your feed with the people and topics that
              matter.
            </p>
          </div>
        </div>
      </div>

      <div className="relative flex w-full min-w-0 flex-col overflow-hidden rounded-3xl bg-white lg:w-1/2 lg:max-w-2xl lg:border-[0.5px] lg:border-gray-300">
        <video
          src="/brand/bgvideo.mp4"
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 size-full object-cover"
        />
        <div className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-start overflow-y-auto px-6 pt-[10vh] pb-6 sm:px-10 lg:justify-center lg:p-10 lg:pt-10">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </div>
    </div>
  );
}
