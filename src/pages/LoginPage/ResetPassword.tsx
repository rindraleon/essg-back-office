import { useEffect, useState, type ComponentProps } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
  Lock,
} from 'lucide-react';
import { ApiError } from '@/api';
import { routesStatic } from '@/routes';
import { isPasswordStrong } from '@/constants/password.constants';
import { useTitle, useScrollToTop } from '@/hooks';
import { resetPassword, validateResetToken, type ResetTokenStatus } from '@/services/auth.service';
import AuthLayout from './AuthLayout';
import { loginFieldClass } from './auth-field';

type FormSubmitEvent = Parameters<NonNullable<ComponentProps<'form'>['onSubmit']>>[0];

type InvalidReason = Exclude<ResetTokenStatus, 'valid'>;

type TokenState =
  { phase: 'checking' } | { phase: 'invalid'; reason: InvalidReason } | { phase: 'valid' };

function toInvalidReason(status: ResetTokenStatus): InvalidReason {
  return status === 'valid' ? 'invalid' : status;
}

const INVALID_MESSAGES: Record<Exclude<ResetTokenStatus, 'valid'>, string> = {
  expired: 'Ce lien de réinitialisation a expiré.',
  used: 'Ce lien de réinitialisation a déjà été utilisé.',
  invalid: 'Ce lien de réinitialisation est invalide ou a été falsifié.',
};

export default function ResetPassword() {
  useScrollToTop();
  useTitle('Réinitialisation du mot de passe');

  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const navigate = useNavigate();

  const [tokenState, setTokenState] = useState<TokenState>({ phase: 'checking' });
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ password?: string; confirm?: string }>({});
  const [globalError, setGlobalError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      setTokenState({ phase: 'invalid', reason: 'invalid' });
      return;
    }
    let cancelled = false;
    validateResetToken(token)
      .then((result) => {
        if (cancelled) return;
        setTokenState(
          result.valid
            ? { phase: 'valid' }
            : { phase: 'invalid', reason: toInvalidReason(result.status) }
        );
      })
      .catch((error) => {
        if (cancelled) return;
        console.warn(
          'Échec dans validateResetToken — lien considéré comme invalide',
          error instanceof Error ? error.message : error
        );
        setTokenState({ phase: 'invalid', reason: 'invalid' });
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const validateForm = (): boolean => {
    const errors: { password?: string; confirm?: string } = {};
    if (!isPasswordStrong(password)) {
      errors.password = 'Le mot de passe ne respecte pas toutes les règles de sécurité.';
    }
    if (!confirmPassword) {
      errors.confirm = 'Veuillez confirmer le mot de passe.';
    } else if (confirmPassword !== password) {
      errors.confirm = 'Les deux mots de passe ne correspondent pas.';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormSubmitEvent) => {
    e.preventDefault();
    setGlobalError('');
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      await resetPassword(token, password, confirmPassword);
      navigate(routesStatic.login, { replace: true, state: { resetSuccess: true } });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.statusCode === 429) {
          setGlobalError('Trop de tentatives. Demandez un nouveau lien dans quelques minutes.');
        } else if (err.message) {
          setGlobalError(err.message);
        } else {
          setGlobalError('La réinitialisation a échoué. Réessayez.');
        }
      } else {
        setGlobalError('Une erreur inattendue est survenue. Réessayez.');
      }
      if (err instanceof ApiError && err.statusCode === 400) {
        validateResetToken(token)
          .then((result) => {
            if (!result.valid) {
              setTokenState({ phase: 'invalid', reason: toInvalidReason(result.status) });
            }
          })
          .catch(() => undefined);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (tokenState.phase === 'checking') {
    return (
      <AuthLayout>
        <div className="flex flex-col items-center gap-4 py-10" role="status" aria-live="polite">
          <LoaderCircle className="size-8 animate-spin text-brand-300" />
          <p className="text-sm text-brand-100/90">Vérification du lien de réinitialisation…</p>
        </div>
      </AuthLayout>
    );
  }

  if (tokenState.phase === 'invalid') {
    return (
      <AuthLayout>
        <header className="login-fade login-s1 mb-7 text-center">
          <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
            Lien non valide
          </h1>
          <p className="mt-1.5 text-sm text-brand-100/90">{INVALID_MESSAGES[tokenState.reason]}</p>
        </header>

        <div className="login-fade login-s2 space-y-4">
          <div className="flex items-start gap-2.5 rounded-xl border border-amber-400/40 bg-amber-500/15 px-4 py-3 text-sm text-amber-100 backdrop-blur-sm">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>
              Pour des raisons de sécurité, chaque lien est à usage unique et valable 30 minutes.
            </span>
          </div>

          <Link
            to={routesStatic.forgotPassword}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white text-sm font-bold text-brand-800 shadow-[0_12px_30px_-10px_rgba(0,0,0,0.55)] ring-1 ring-white/20 transition-all duration-200 hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/30"
          >
            <KeyRound className="size-4" />
            Demander un nouveau lien de réinitialisation
          </Link>
        </div>

        <footer className="login-fade login-s3 mt-6 border-t border-white/12 pt-4 text-center">
          <Link
            to={routesStatic.login}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-white/75 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/60 rounded-sm"
          >
            <ArrowLeft className="size-3.5" />
            Retour à la connexion
          </Link>
        </footer>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <header className="login-fade login-s1 mb-7 text-center">
        <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
          Nouveau mot de passe
        </h1>
        <p className="mt-1.5 text-sm text-brand-100/90">
          Choisissez un mot de passe fort pour votre compte ESSG Admin
        </p>
      </header>

      <form onSubmit={handleSubmit} noValidate aria-busy={submitting} className="space-y-4">
        {globalError && (
          <div
            role="alert"
            className="login-fade flex items-start gap-2.5 rounded-xl border border-red-400/40 bg-red-500/15 px-4 py-3 text-sm text-red-100 backdrop-blur-sm"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{globalError}</span>
          </div>
        )}

        <div className="login-fade login-s2">
          <label
            htmlFor="password"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-white/90"
          >
            Nouveau mot de passe
          </label>

          <div className="login-field relative transition-transform duration-200">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-brand-600">
              <Lock className="size-4" />
            </span>

            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              aria-required="true"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password)
                  setFieldErrors((prev) => ({ ...prev, password: undefined }));
              }}
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby={fieldErrors.password ? 'password-error' : 'password-rules'}
              placeholder="••••••••"
              className={`${loginFieldClass(Boolean(fieldErrors.password))} pr-12`}
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
            {fieldErrors.password && (
              <p id="password-error" className="login-fade text-xs text-red-300">
                {fieldErrors.password}
              </p>
            )}
          </div>
        </div>

        <div className="login-fade login-s3">
          <label
            htmlFor="confirmPassword"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-white/90"
          >
            Confirmer le nouveau mot de passe
          </label>

          <div className="login-field relative transition-transform duration-200">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-brand-600">
              <CheckCircle2 className="size-4" />
            </span>

            <input
              id="confirmPassword"
              type={showConfirm ? 'text' : 'password'}
              autoComplete="new-password"
              required
              aria-required="true"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (fieldErrors.confirm)
                  setFieldErrors((prev) => ({ ...prev, confirm: undefined }));
              }}
              aria-invalid={Boolean(fieldErrors.confirm)}
              aria-describedby={fieldErrors.confirm ? 'confirm-error' : undefined}
              placeholder="••••••••"
              className={`${loginFieldClass(Boolean(fieldErrors.confirm))} pr-12`}
            />

            <button
              type="button"
              onClick={() => setShowConfirm((prev) => !prev)}
              aria-label={showConfirm ? 'Masquer la confirmation' : 'Afficher la confirmation'}
              className="absolute inset-y-0 right-0 flex items-center rounded-r-xl pr-4 pl-2 text-ink-400 transition-colors hover:text-brand-700 focus-visible:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50 focus-visible:ring-inset"
            >
              {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>

          <div className="min-h-[18px] pt-1">
            {fieldErrors.confirm && (
              <p id="confirm-error" className="login-fade text-xs text-red-300">
                {fieldErrors.confirm}
              </p>
            )}
          </div>
        </div>

        <div className="login-fade login-s4 pt-1">
          <button
            type="submit"
            disabled={submitting}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white text-sm font-bold text-brand-800 shadow-[0_12px_30px_-10px_rgba(0,0,0,0.55)] ring-1 ring-white/20 transition-all duration-200 hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/30 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70 motion-reduce:transition-none"
          >
            {submitting ? (
              <>
                <LoaderCircle className="size-4 animate-spin" />
                Réinitialisation…
              </>
            ) : (
              <>
                <KeyRound className="size-4" />
                Réinitialiser le mot de passe
              </>
            )}
          </button>
        </div>
      </form>

      <footer className="login-fade login-s5 mt-6 border-t border-white/12 pt-4 text-center">
        <Link
          to={routesStatic.login}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-white/75 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/60 rounded-sm"
        >
          <ArrowLeft className="size-3.5" />
          Retour à la connexion
        </Link>
      </footer>
    </AuthLayout>
  );
}
