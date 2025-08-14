import { useState, useRef } from 'react';

export default function LoginForm({ lang = 'en' }) {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const formRef = useRef(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (loading) return;
    setError('');
    setLoading(true);

    try {
      const formEl = formRef.current || e.currentTarget;
      const form = new FormData(formEl);
      form.set('lang', lang); // σιγουρεύσου ότι στέλνεται

      const headers = {
        // μόνο αν έχεις ορίσει PUBLIC_ADMIN_API_KEY στο client env
        ...(import.meta.env.PUBLIC_ADMIN_API_KEY
          ? { 'X-API-Key': import.meta.env.PUBLIC_ADMIN_API_KEY }
          : {}),
      };

      const res = await fetch('/api/login', {
        method: 'POST',
        headers,
        body: form,
        credentials: 'include', // επιτρέπει στον server να γράψει cookies
      });

      let payload = null;
      try {
        payload = await res.json();
      } catch {
        // αν δεν είναι JSON
        throw new Error('Unexpected server response');
      }

      if (!res.ok || !payload?.success) {
        // δείξε καθαρό μήνυμα σφάλματος
        setError(payload?.error || '❌ Login failed.');
        setLoading(false);
        return;
      }

      // σταθερό redirect από τον server
      window.location.href = payload.redirectTo || `/${lang}/admin/preview`;
    } catch (err) {
      setError(err?.message || '❌ Network error.');
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
          {lang === 'el' ? 'Κωδικός' : lang === 'nl' ? 'Wachtwoord' : 'Password'}
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
            aria-label={showPassword ? 'Hide password' : 'Show password'}
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
          ? (lang === 'el' ? 'Σύνδεση…' : lang === 'nl' ? 'Inloggen…' : 'Signing in…')
          : (lang === 'el' ? 'Σύνδεση' : lang === 'nl' ? 'Inloggen' : 'Sign in')}
      </button>
    </form>
  );
}
