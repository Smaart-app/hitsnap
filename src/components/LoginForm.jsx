import { useState, useRef } from 'react';

export default function LoginForm({ lang = 'en' }) {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const formRef = useRef(null);

  const t = (en, el, nl) => (lang === 'el' ? el : lang === 'nl' ? nl : en);

  function normalizeError(err) {
    if (!err) return t('Login failed.', 'Η σύνδεση απέτυχε.', 'Inloggen mislukt.');
    const msg = String(err).toLowerCase();

    if (msg.includes('invalid login credentials')) {
      return t('Invalid email or password.', 'Λανθασμένο email ή κωδικός.', 'Ongeldig e-mail of wachtwoord.');
    }
    if (msg.includes('email not confirmed') || msg.includes('unconfirmed')) {
      return t('Please confirm your email address.', 'Επιβεβαίωσε το email σου.', 'Bevestig je e-mail.');
    }
    if (msg.includes('rate limit') || msg.includes('too many')) {
      return t('Too many attempts. Try again later.', 'Πάρα πολλές προσπάθειες. Ξαναπροσπάθησε αργότερα.', 'Te veel pogingen. Probeer later.');
    }
    return err;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (loading) return;
    setError('');
    setLoading(true);

    try {
      const formEl = formRef.current || e.currentTarget;
      const form = new FormData(formEl);
      const email = String(form.get('email') || '').trim();
      const password = String(form.get('password') || '');
      if (!email || !password) {
        setError(t('Please fill in email and password.', 'Συμπλήρωσε email και κωδικό.', 'Vul e-mail en wachtwoord in.'));
        setLoading(false);
        return;
      }

      const headers = {
        'Content-Type': 'application/json',
        ...(import.meta.env.PUBLIC_ADMIN_API_KEY
          ? { 'X-API-Key': import.meta.env.PUBLIC_ADMIN_API_KEY }
          : {}),
      };

      const res = await fetch('/api/login', {
        method: 'POST',
        headers,
        credentials: 'include', // επιτρέπει στον server να γράψει cookies
        body: JSON.stringify({ email, password, lang }),
      });

      // προσπάθησε να διαβάσεις JSON, αλλιώς κράτα text
      let data = null;
      try {
        data = await res.json();
      } catch {
        // ίσως ο server έστειλε κενό ή text
      }

      if (!res.ok) {
        const message = normalizeError(data?.error || data?.message || `HTTP ${res.status}`);
        setError(message);
        setLoading(false);
        return;
      }

      // Υποστήριξη πολλών σχημάτων απάντησης (success/session/user)
      const success = data?.success ?? !!data?.session ?? !!data?.user;
      if (!success) {
        const message = normalizeError(data?.error || 'Login failed.');
        setError(message);
        setLoading(false);
        return;
      }

      const redirect = data?.redirectTo || `/${lang}/admin/preview`;
      window.location.href = redirect;
    } catch (err) {
      setError(normalizeError(err?.message || 'Network error.'));
      setLoading(false);
    }
  }

  return (
    <form ref={formRef} className="space-y-4" onSubmit={handleSubmit} noValidate>
      <input type="hidden" name="lang" value={lang} />

      <div>
        <label className="block font-semibold mb-1" htmlFor="emailInput">Email</label>
        <input
          type="email"
          id="emailInput"
          name="email"
          className="w-full p-2 border rounded"
          placeholder="you@example.com"
          autoComplete="username"
          required
        />
      </div>

      <div>
        <label className="block font-semibold mb-1" htmlFor="passwordInput">
          {t('Password', 'Κωδικός', 'Wachtwoord')}
        </label>
        <div className="relative">
          <input
            id="passwordInput"
            type={showPassword ? 'text' : 'password'}
            name="password"
            className="w-full p-2 border rounded pr-10"
            placeholder="••••••••••"
            autoComplete="current-password"
            required
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 px-3 text-sm text-gray-600"
            tabIndex={-1}
            onClick={() => setShowPassword(s => !s)}
            aria-label={showPassword ? t('Hide password', 'Κρύψε κωδικό', 'Wachtwoord verbergen') : t('Show password', 'Δείξε κωδικό', 'Wachtwoord tonen')}
          >
            {showPassword ? '🙈' : '👁'}
          </button>
        </div>
      </div>

      {error && (
        <div className="text-red-600 text-sm font-semibold" role="alert">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="bg-[#50c7c2] text-white px-6 py-2 rounded hover:bg-[#3db2b0] transition font-semibold w-full disabled:opacity-60"
      >
        {loading
          ? t('Signing in…', 'Σύνδεση…', 'Inloggen…')
          : t('Sign in', 'Σύνδεση', 'Inloggen')}
      </button>
    </form>
  );
}
