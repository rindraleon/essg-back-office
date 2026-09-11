import type { ReactNode } from 'react';
import loginBg from '../../assets/files/images/background/login-bg.webp';
import loginBgMobile from '../../assets/files/images/background/login-bg-mobile.webp';

const styles = `
  @keyframes login-rise {
    from { opacity: 0; transform: translateY(24px) scale(0.985); }
    to   { opacity: 1; transform: none; }
  }
  @keyframes login-fade {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: none; }
  }
  @keyframes login-aurora-a {
    0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
    50%      { transform: translate3d(6%, -4%, 0) scale(1.12); }
  }
  @keyframes login-aurora-b {
    0%, 100% { transform: translate3d(0, 0, 0) scale(1.05); }
    50%      { transform: translate3d(-5%, 5%, 0) scale(1); }
  }
  @keyframes login-drift {
    from { background-position: 0 0; }
    to   { background-position: 220px 140px; }
  }
  @keyframes login-kenburns {
    0%   { transform: scale(1.04) translate3d(0, 0, 0); }
    50%  { transform: scale(1.09) translate3d(-1.2%, -0.8%, 0); }
    100% { transform: scale(1.04) translate3d(0, 0, 0); }
  }
  @keyframes login-bg-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes login-sheen {
    0%   { transform: translateX(-120%); opacity: 0; }
    18%  { opacity: 1; }
    100% { transform: translateX(220%); opacity: 0; }
  }

  .login-rise  { animation: login-rise 0.7s cubic-bezier(0.22, 1, 0.36, 1) both; }
  .login-fade  { animation: login-fade 0.55s cubic-bezier(0.22, 1, 0.36, 1) both; }
  .login-s1 { animation-delay: 0.10s; }
  .login-s2 { animation-delay: 0.18s; }
  .login-s3 { animation-delay: 0.26s; }
  .login-s4 { animation-delay: 0.34s; }
  .login-s5 { animation-delay: 0.42s; }

  .login-bg     { animation: login-bg-in 1.1s ease-out both, login-kenburns 42s ease-in-out 1.1s infinite; will-change: transform, opacity; }
  .login-aurora-a { animation: login-aurora-a 18s ease-in-out infinite; will-change: transform; }
  .login-aurora-b { animation: login-aurora-b 22s ease-in-out infinite; will-change: transform; }
  .login-topo     { animation: login-drift 40s linear infinite; }
  .login-sheen    { animation: login-sheen 1.5s ease-out 0.5s both; }

  .login-field:focus-within { transform: translateY(-1px); }

  @media (prefers-reduced-motion: reduce) {
    .login-rise, .login-fade, .login-aurora-a, .login-aurora-b,
    .login-topo, .login-sheen, .login-bg {
      animation: none !important;
      opacity: 1 !important;
      transform: none !important;
    }
    .login-field:focus-within { transform: none; }
  }
`;

const TOPO_PATTERN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='110' height='110'><path d='M0 55 Q27.5 27.5 55 55 T110 55' stroke='rgba(152,192,112,0.20)' fill='none' stroke-width='0.7'/><path d='M0 20 Q27.5 -7.5 55 20 T110 20' stroke='rgba(152,192,112,0.12)' fill='none' stroke-width='0.7'/><path d='M0 90 Q27.5 62.5 55 90 T110 90' stroke='rgba(152,192,112,0.12)' fill='none' stroke-width='0.7'/></svg>\")";

export default function AuthLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <style>{styles}</style>

      <main className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-brand-950 px-4 py-8 sm:px-6">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 overflow-hidden">
            <picture>
              <source media="(max-width: 640px)" srcSet={loginBgMobile} type="image/webp" />
              <img
                src={loginBg}
                alt=""
                aria-hidden
                fetchPriority="high"
                decoding="async"
                className="login-bg h-full w-full object-cover object-center"
              />
            </picture>
          </div>

          <div className="absolute inset-0 bg-brand-900/45" />
          <div className="absolute inset-0 bg-[radial-gradient(125%_125%_at_50%_0%,rgba(39,86,78,0.32)_0%,rgba(23,56,50,0.55)_45%,rgba(42, 129, 116, 0.8)_100%)]" />

          <div className="login-aurora-a absolute -left-32 -top-32 size-[38rem] rounded-full bg-[radial-gradient(circle,rgba(133, 226, 209, 0.32),transparent_45%)] blur-3xl" />
          <div className="login-aurora-b absolute -bottom-40 -right-24 size-[34rem] rounded-full bg-[radial-gradient(circle,rgba(183, 218, 148, 0.24),transparent_45%)] blur-3xl" />

          <div
            className="login-topo absolute inset-0 opacity-20"
            style={{ backgroundImage: TOPO_PATTERN, backgroundSize: '110px 110px' }}
          />

          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(9,20,18,0.75)_100%)]" />
        </div>

        <div className="relative w-full max-w-md">
          <div className="login-rise relative overflow-hidden rounded-3xl border border-white/20 bg-ink-950/65 p-6 shadow-[0_24px_80px_-20px_rgba(0,0,0,0.7)] backdrop-blur-2xl sm:p-8">
            <span
              aria-hidden
              className="login-sheen pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/18 to-transparent"
            />

            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"
            />

            {children}
          </div>
        </div>
      </main>
    </>
  );
}
