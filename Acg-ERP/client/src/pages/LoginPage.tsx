import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { LanguageSwitcher } from '../components/LanguageSwitcher';

export function LoginPage() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@acg.com');
  const [password, setPassword] = useState('Admin@123');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/');
    } catch {
      setError(t('auth.invalidCredentials'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-800 to-brand-950 p-4">
      <div className="absolute top-4 end-4">
        <LanguageSwitcher />
      </div>
      <div className="w-full max-w-md">
        <div className="text-center mb-6 text-white">
          <div className="text-3xl font-bold">{t('app.name')}</div>
          <div className="text-brand-200 text-sm mt-1">{t('app.tagline')}</div>
        </div>
        <form onSubmit={handleSubmit} className="card space-y-4">
          <h2 className="text-lg font-semibold text-slate-800">{t('auth.loginTitle')}</h2>
          {error && (
            <div className="rounded-lg bg-red-50 text-red-700 text-sm px-3 py-2">
              {error}
            </div>
          )}
          <div>
            <label className="label">{t('auth.email')}</label>
            <input
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label">{t('auth.password')}</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={submitting}>
            {submitting ? t('common.loading') : t('auth.signIn')}
          </button>
        </form>
      </div>
    </div>
  );
}
