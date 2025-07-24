import { useState } from 'react';

export default function LoginForm({ lang }) {
  // Χρησιμοποιούμε state μόνο για το error που περνάει ως query param (αν θες)
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form
      method="POST"
      action="/api/login"
      className="space-y-4"
    >
      <input type="hidden" name="lang" value={lang} />
      <div>
        <label className="block font-semibold mb-1" htmlFor="emailInput">Email</label>
        <input
          type="email"
          id="emailInput"
          name="email"
          className="w-full p-2 border rounded"
          placeholder="anna@realstarter.example.com"
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
      <button
        type="submit"
        className="bg-[#50c7c2] text-white px-6 py-2 rounded hover:bg-[#3db2b0] transition font-semibold w-full"
      >
        Login
      </button>
      {/* 
        Αν θέλεις να εμφανίζεις error μετά από αποτυχημένο login,
        μπορείς να ελέγχεις το window.location.search (π.χ. ?error=1) και να δείχνεις ένα μήνυμα.
        Αυτό το φτιάχνουμε μετά αν το χρειαστείς!
      */}
    </form>
  );
}