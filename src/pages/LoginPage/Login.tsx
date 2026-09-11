import { useState, type ComponentProps } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  LoaderCircle,
  Lock,
  LogIn,
  Mail,
} from 'lucide-react';
import { useAuth } from '@/contexts';
import { ApiError } from '@/api';
import { routesStatic } from '@/routes';
import { VALIDATION_MESSAGES, validateEmail } from '@/constants';
import { useTitle, useScrollToTop } from '@/hooks';
import AuthLayout from './AuthLayout';
import { loginFieldClass } from './auth-field';

type FormSubmitEvent = Parameters<NonNullable<ComponentProps<'form'>['onSubmit']>>[0];

function getLoginErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.kind === 'unauthorized') return 'Email ou mot de passe incorrect';
    if (error.kind === 'network') {
      return 'Serveur inaccessible. Vérifiez votre connexion et réessayez.';
    }
    if (error.kind === 'timeout') return 'La requête a expiré. Veuillez réessayer.';
    if (error.statusCode === 429) return 'Trop de tentatives. Réessayez dans quelques minutes.';
    if (error.kind === 'server') {
      return 'Service temporairement indisponible. Réessayez plus tard.';
    }
  }
  return 'Une erreur inattendue est survenue. Réessayez.';
}

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

  const state = location.state as { from?: Location; resetSuccess?: boolean } | null;
  const resetSuccess = Boolean(state?.resetSuccess);
  const fromPath =
    state?.from?.pathname && state.from.pathname !== routesStatic.login
      ? state.from.pathname + state.from.search
      : routesStatic.dashboard;

  const validateForm = (): boolean => {
    const errors: { email?: string; password?: string } = {};

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
      setError(getLoginErrorMessage(err));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <header className="login-fade login-s1 mb-7 text-center">
        <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
          Bienvenue à l'Admin ESSG
        </h1>
        <p className="mt-1.5 text-sm text-brand-100/90">
          Connectez-vous pour accéder à votre tableau de bord
        </p>
      </header>

      <form onSubmit={handleSubmit} noValidate aria-busy={loading} className="space-y-4">
        {resetSuccess && (
          <output
            className="login-fade flex items-start gap-2.5 rounded-xl border border-emerald-400/40 bg-emerald-500/15 px-4 py-3 text-sm text-emerald-100 backdrop-blur-sm"
          >
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
            <span>
              Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous
              connecter avec votre nouveau mot de passe.
            </span>
          </output>
        )}

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
              required
              aria-required="true"
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
              className={`${loginFieldClass(Boolean(validationErrors.email))} pr-4`}
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
          <div className="mb-1.5 flex items-center justify-between">
            <label
              htmlFor="password"
              className="block text-xs font-semibold uppercase tracking-wide text-white/90"
            >
              Mot de passe
            </label>
            <Link
              to={routesStatic.forgotPassword}
              className="text-xs font-medium text-brand-200 transition-colors hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/60 rounded-sm"
            >
              Mot de passe oublié ?
            </Link>
          </div>

          <div className="login-field relative transition-transform duration-200">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-brand-600">
              <Lock className="size-4" />
            </span>

            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              aria-required="true"
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
              className={`${loginFieldClass(Boolean(validationErrors.password))} pr-12`}
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              className="absolute inset-y-0 right-0 flex items-center rounded-r-xl pr-4 pl-2 text-ink-400 transition-colors hover:text-brand-700 focus-visible:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50 focus-visible:ring-inset"
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
    </AuthLayout>
  );
}
