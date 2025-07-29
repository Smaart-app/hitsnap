import { useState } from 'react';

export default function LoginForm({ lang }) {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const form = new FormData(e.target);

    const response = await fetch('/api/login', {
      method: 'POST',
      body: form,
    });

    setLoading(false);

    try {
      const result = await response.json();
      if (result.success && result.redirectTo) {
        window.location.href = result.redirectTo;
      } else {
        setError(result.error || 'Αποτυχία σύνδεσης.');
      }
    } catch {
      setError('Άγνωστο σφάλμα (μη έγκυρο JSON).');
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <input type="hidden" name="lang" value={lang} />

      <div>
        <label className="block font-semibold mb-1" htmlFor="emailInput">Email</label>
        <input
          type="email"
          id="emailInput"
          name="email"
          className="w-full p-2 border rounded"
          placeholder="anna@hitsnap.com"
          autoComplete="username"
          required
        />
      </div>

      <div>
        <label className="block font-semibold mb-1" htmlFor="passwordInput">Password</label>
        <div className="relative">
          <input
            id="passwordInput"
            type={showPassword ? "text" : "password"}
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
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "🙈" : "👁"}
          </button>
        </div>
      </div>

      {error && (
        <div className="text-red-600 text-sm font-semibold">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="bg-[#50c7c2] text-white px-6 py-2 rounded hover:bg-[#3db2b0] transition font-semibold w-full"
      >
        {loading ? 'Σύνδεση...' : 'Login'}
      </button>
    </form>
  );
}
