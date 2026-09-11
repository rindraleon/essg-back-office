import { useState, type ComponentProps } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft, LoaderCircle, Mail, MailCheck } from 'lucide-react';
import { ApiError } from '@/api';
import { routesStatic } from '@/routes';
import { VALIDATION_MESSAGES, validateEmail } from '@/constants';
import { useTitle, useScrollToTop } from '@/hooks';
import { requestPasswordReset } from '@/services/auth.service';
import AuthLayout from './AuthLayout';
import { loginFieldClass } from './auth-field';

type FormSubmitEvent = Parameters<NonNullable<ComponentProps<'form'>['onSubmit']>>[0];

const GENERIC_CONFIRMATION =
  'Si cette adresse email correspond à un compte, un lien de réinitialisation vous sera envoyé.';

function getRequestErrorMessage(error: unknown): string | null {
  if (error instanceof ApiError) {
    if (error.kind === 'network') {
      return 'Serveur inaccessible. Vérifiez votre connexion et réessayez.';
    }
    if (error.kind === 'timeout') return 'La requête a expiré. Veuillez réessayer.';
    if (error.statusCode === 429) {
      return 'Trop de demandes. Réessayez dans quelques minutes.';
    }
  }
  return null;
}

export default function ForgotPassword() {
  useScrollToTop();
  useTitle('Mot de passe oublié');

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | undefined>(undefined);
  const [globalError, setGlobalError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: FormSubmitEvent) => {
    e.preventDefault();
    setGlobalError('');

    const error = email.trim() ? validateEmail(email.trim()) : VALIDATION_MESSAGES.required;
    setEmailError(error);
    if (error) return;

    setLoading(true);
    try {
      await requestPasswordReset(email.trim());
      setSent(true);
    } catch (err) {
      const message = getRequestErrorMessage(err);
      if (message) setGlobalError(message);
      else setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <header className="login-fade login-s1 mb-7 text-center">
        <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
          Mot de passe oublié
        </h1>
        <p className="mt-1.5 text-sm text-brand-100/90">
          Indiquez votre adresse email pour recevoir un lien de réinitialisation
        </p>
      </header>

      {sent ? (
        <output className="login-fade login-s2 block space-y-5">
          <div className="flex flex-col items-center gap-3 rounded-xl border border-emerald-400/40 bg-emerald-500/15 px-4 py-6 text-center backdrop-blur-sm">
            <MailCheck className="size-8 text-emerald-300" />
            <p className="text-sm text-emerald-100">{GENERIC_CONFIRMATION}</p>
            <p className="text-xs text-emerald-100/80">
              Le lien est valable 30 minutes. Pensez à vérifier vos courriers indésirables.
            </p>
          </div>

          <Link
            to={routesStatic.login}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white text-sm font-bold text-brand-800 shadow-[0_12px_30px_-10px_rgba(0,0,0,0.55)] ring-1 ring-white/20 transition-all duration-200 hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/30"
          >
            <ArrowLeft className="size-4" />
            Retour à la connexion
          </Link>
        </output>
      ) : (
        <form onSubmit={handleSubmit} noValidate aria-busy={loading} className="space-y-4">
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
                  if (emailError) setEmailError(undefined);
                }}
                aria-invalid={Boolean(emailError)}
                aria-describedby={emailError ? 'email-error' : undefined}
                placeholder="votre adresse email"
                className={`${loginFieldClass(Boolean(emailError))} pr-4`}
              />
            </div>

            <div className="min-h-[18px] pt-1">
              {emailError && (
                <p id="email-error" className="login-fade text-xs text-red-300">
                  {emailError}
                </p>
              )}
            </div>
          </div>

          <div className="login-fade login-s3 pt-1">
            <button
              type="submit"
              disabled={loading}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white text-sm font-bold text-brand-800 shadow-[0_12px_30px_-10px_rgba(0,0,0,0.55)] ring-1 ring-white/20 transition-all duration-200 hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/30 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70 motion-reduce:transition-none"
            >
              {loading ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" />
                  Envoi en cours…
                </>
              ) : (
                <>
                  <Mail className="size-4" />
                  Envoyer le lien de réinitialisation
                </>
              )}
            </button>
          </div>
        </form>
      )}

      <footer className="login-fade login-s4 mt-6 border-t border-white/12 pt-4 text-center">
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
