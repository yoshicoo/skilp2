'use client'
import { useState } from 'react'
export default function LoginPage() {
  const [id, setId] = useState('')
  const [pw, setPw] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      const res = await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, password: pw }) })
      if (res.ok) {
        const next = new URLSearchParams(window.location.search).get('next') || '/app'
        window.location.href = next
      } else {
        const data = await res.json().catch(()=>({}))
        setError(data?.error || 'ログインに失敗しました')
      }
    } finally { setLoading(false) }
  }
  return (
    <div className="max-w-md mx-auto card p-6 mt-10">
      <h1 className="text-2xl font-semibold mb-6">ログイン</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div><label className="label">メールアドレス</label>
          <input className="input" type="email" value={id} onChange={e=>setId(e.target.value)} placeholder="test@shiftinc.jp" required /></div>
        <div><label className="label">パスワード</label>
          <input className="input" type="password" value={pw} onChange={e=>setPw(e.target.value)} placeholder="p@ssword" required /></div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button className="btn w-full" disabled={loading}>{loading ? '認証中…' : 'ログイン'}</button>
      </form>
      <p className="text-slate-400 text-xs mt-4">アクセス権限: 本人のみ閲覧可能（テスト用固定認証）。</p>
    </div>
  )
}
