import { useState } from 'react'
import { createBrowserClient } from '../lib/createBrowserClient.js'

export default function LoginForm({ lang }) {
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = createBrowserClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      setError('Λάθος email ή password.')
      return
    }
    window.location.href = `/${lang}/admin/preview`
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input type="hidden" name="lang" value={lang} />
      <div>
        <label className="block font-semibold mb-1" htmlFor="emailInput">Email</label>
        <input
          type="email"
          id="emailInput"
          name="email"
          className="w-full p-2 border rounded"
          placeholder="anna@hitlift.com"
          autoComplete="username"
          value={email}
          onChange={e => setEmail(e.target.value)}
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
            value={password}
            onChange={e => setPassword(e.target.value)}
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
        disabled={loading}
        className="bg-[#50c7c2] text-white px-6 py-2 rounded hover:bg-[#3db2b0] transition font-semibold w-full"
      >
        {loading ? "Logging in..." : "Login"}
      </button>
      {error && <div className="text-red-600 mt-2">{error}</div>}
    </form>
  )
}