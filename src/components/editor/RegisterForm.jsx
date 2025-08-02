import { useState } from 'react';

export default function RegisterForm({ lang }) {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const form = new FormData(e.target);

    const response = await fetch('/api/register', {
      method: 'POST',
      body: form,
    });

    setLoading(false);

    try {
      const result = await response.json();
      if (result.success) {
        setSuccess('✅ Ελέγξτε το email σας για επιβεβαίωση.');
      } else {
        setError(result.error || 'Αποτυχία εγγραφής.');
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
          placeholder="you@example.com"
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
            autoComplete="new-password"
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
        <div className="text-red-600 text-sm font-semibold">{error}</div>
      )}

      {success && (
        <div className="text-green-600 text-sm font-semibold">{success}</div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="bg-[#50c7c2] text-white px-6 py-2 rounded hover:bg-[#3db2b0] transition font-semibold w-full"
      >
        {loading ? 'Εγγραφή...' : 'Register'}
      </button>
    </form>
  );
}
