import { useState, type ComponentProps } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AlertCircle, Eye, EyeOff, LoaderCircle, Lock, LogIn, Mail } from 'lucide-react';
import { useAuth } from '@/contexts';
import { routesStatic } from '@/routes';
import loginBg from '../../assets/files/images/background/login-bg.webp';
import loginBgMobile from '../../assets/files/images/background/login-bg-mobile.webp';
import { VALIDATION_MESSAGES, validateEmail } from '@/constants';
import { useTitle, useScrollToTop } from '@/hooks';

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

type FormSubmitEvent = Parameters<NonNullable<ComponentProps<'form'>['onSubmit']>>[0];

export default function Login() {
  useScrollToTop();
  useTitle('Authentification');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state as { from?: Location } | null;
  const fromPath =
    state?.from?.pathname && state.from.pathname !== routesStatic.login
      ? state.from.pathname + state.from.search
      : routesStatic.dashboard;

  const validateForm = (): boolean => {
    const errors: { email?: string; password?: string } = {};

    // validateEmail renvoie `undefined` quand l'adresse est valide.
    const emailError = email.trim() ? validateEmail(email.trim()) : VALIDATION_MESSAGES.required;
    if (emailError) {
      errors.email = emailError;
    }

    if (!password) {
      errors.password = VALIDATION_MESSAGES.required;
    } else if (password.length < 6) {
      errors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormSubmitEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      await login(email, password);
      navigate(fromPath, { replace: true });
    } catch (err) {
      setError('Email ou mot de passe incorrect');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fieldClass = (hasError: boolean) =>
    [
      'h-12 w-full rounded-xl border bg-white/95 pl-11 text-sm text-ink-900 shadow-sm',
      'placeholder:text-ink-400',
      'transition-all duration-200 outline-none',
      'hover:bg-white',
      'focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/20',
      hasError ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : 'border-ink-200/80',
    ].join(' ');

  return (
    <>
      <style>{styles}</style>

      <div className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-brand-950 px-4 py-8 sm:px-6">
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

            <header className="login-fade login-s1 mb-7 text-center">
              <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                Bienvenue à l'Admin ESSG
              </h1>
              <p className="mt-1.5 text-sm text-brand-100/90">
                Connectez-vous pour accéder à votre tableau de bord
              </p>
            </header>

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {error && (
                <div
                  role="alert"
                  className="login-fade flex items-start gap-2.5 rounded-xl border border-red-400/40 bg-red-500/15 px-4 py-3 text-sm text-red-100 backdrop-blur-sm"
                >
                  <AlertCircle className="mt-0.5 size-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="login-fade login-s2">
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-white/90"
                >
                  Email
                </label>

                <div className="login-field relative transition-transform duration-200">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-brand-600">
                    <Mail className="size-4" />
                  </span>

                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (validationErrors.email) {
                        setValidationErrors({ ...validationErrors, email: undefined });
                      }
                    }}
                    aria-invalid={Boolean(validationErrors.email)}
                    aria-describedby={validationErrors.email ? 'email-error' : undefined}
                    placeholder="votre adresse email"
                    className={`${fieldClass(Boolean(validationErrors.email))} pr-4`}
                  />
                </div>

                <div className="min-h-[18px] pt-1">
                  {validationErrors.email && (
                    <p id="email-error" className="login-fade text-xs text-red-300">
                      {validationErrors.email}
                    </p>
                  )}
                </div>
              </div>

              <div className="login-fade login-s3">
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-white/90"
                >
                  Mot de passe
                </label>

                <div className="login-field relative transition-transform duration-200">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-brand-600">
                    <Lock className="size-4" />
                  </span>

                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (validationErrors.password) {
                        setValidationErrors({ ...validationErrors, password: undefined });
                      }
                    }}
                    aria-invalid={Boolean(validationErrors.password)}
                    aria-describedby={validationErrors.password ? 'password-error' : undefined}
                    placeholder="••••••••"
                    className={`${fieldClass(Boolean(validationErrors.password))} pr-12`}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={
                      showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'
                    }
                    className="absolute inset-y-0 right-0 flex items-center rounded-r-xl pr-4 pl-2 text-ink-400 transition-colors hover:text-brand-700 focus-visible:text-brand-700 focus-visible:outline-none"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>

                <div className="min-h-[18px] pt-1">
                  {validationErrors.password && (
                    <p id="password-error" className="login-fade text-xs text-red-300">
                      {validationErrors.password}
                    </p>
                  )}
                </div>
              </div>

              <div className="login-fade login-s4 pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-white text-sm font-bold text-brand-800 shadow-[0_12px_30px_-10px_rgba(0,0,0,0.55)] ring-1 ring-white/20 transition-all duration-200 hover:bg-brand-50 hover:text-brand-900 hover:shadow-[0_16px_36px_-10px_rgba(0,0,0,0.6)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/30 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70 motion-reduce:transition-none"
                >
                  {loading ? (
                    <>
                      <LoaderCircle className="size-4 animate-spin" />
                      Connexion…
                    </>
                  ) : (
                    <>
                      <LogIn className="size-4" />
                      Se connecter
                    </>
                  )}
                </button>
              </div>
            </form>

            <footer className="login-fade login-s5 mt-6 border-t border-white/12 pt-4 text-center">
              <p className="text-xs text-white/75">
                © {new Date().getFullYear()} ESSG — Tous droits réservés
              </p>
            </footer>
          </div>
        </div>
      </div>
    </>
  );
}
