'use client'

import { useState } from 'react'
import ProgressBar from '@/components/ProgressBar'
import RadarSkillChart from '@/components/RadarSkillChart'
import Timeline from '@/components/Timeline'
import Stars from '@/components/Stars'
import type { CVData, ExtractResponse, SkillItem, ProjectItem } from '@/types'

type Answer = { category: CategoryKey, text: string }

const requiredCategories = [
  { key: 'projects', label: '担当したプロジェクト（業界、規模、役割等）' },
  { key: 'skills', label: '使用技術・ツール（プログラミング言語、テストツール、開発環境等）' },
  { key: 'responsibilities', label: '業務内容（テスト設計、自動化、マネジメント、提案活動等）' },
  { key: 'domainKnowledge', label: '業界知識（金融、EC、ゲーム、医療等の業界経験）' },
  { key: 'certifications', label: '資格・認定（取得済み、取得予定）' },
  { key: 'management', label: 'マネジメント経験（チーム規模、期間等）' },
  { key: 'others', label: 'その他特定の項目' },
] as const

type CategoryKey = typeof requiredCategories[number]['key']

export default function AppPage() {
  const [step, setStep] = useState<1|2|3>(1)
  const [files, setFiles] = useState<File[]>([])
  const [extract, setExtract] = useState<ExtractResponse | null>(null)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const fd = new FormData()
    for (const f of files) fd.append('files', f)
    fetch('/api/extract', { method: 'POST', body: fd })
      .then(r => r.ok ? r.json() : r.json().then(j => Promise.reject(j?.error || '解析に失敗しました')))
      .then((data: ExtractResponse) => { setExtract(data); setStep(2) })
      .catch((err) => setError(String(err)))
      .finally(()=> setLoading(false))
  }

  const finishedCategories = new Set(answers.map(a => a.category))
  const PROGRESS_GOAL = 12 // 目安の質問数（1問ごとに%が増える）
  const progress = Math.min(100, (answers.length / PROGRESS_GOAL) * 100)

  const addAnswer = (category: CategoryKey, text: string) => {
    setAnswers(prev => [...prev, { category, text }])
  }

  const canToCV = finishedCategories.size === requiredCategories.length

  const onGenerateCV = async () => {
    setLoading(true)
    setError('')
    try {
      const cv: CVData = mergeToCV(extract?.extracted, answers)
      const res = await fetch('/api/recommend', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ cv }) })
      if (res.ok) {
        const data = await res.json()
        cv.recommendedAssignments = data.recommendedAssignments || cv.recommendedAssignments
        cv.strengths = data.highlights || cv.strengths
      }
      setExtract(prev => prev ? ({ ...prev, extracted: cv }) : { extracted: cv, suggestions: { nextQuestions: [], missingSections: [] } })
      setStep(3)
    } catch (e:any) {
      setError(e?.message || 'CV生成に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="card p-5">
        <div className="flex items-center gap-4">
          <div className="text-sm px-3 py-1 rounded-full bg-primary/20 text-primary">ステップ {step}/3</div>
          <div className="flex-1"><ProgressBar value={step===1? 10 : step===2 ? 60 : 100} /></div>
        </div>
      </div>

      {step === 1 && (
        <section className="card p-6">
          <h2 className="text-xl font-semibold mb-4">ファイルアップロード</h2>
          <p className="text-slate-300 text-sm mb-4">履歴書・職務経歴書（PDF/Word）を複数アップロード可能です。AIが解析します。</p>
          <form onSubmit={handleUpload} className="space-y-4">
            <input className="input" type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" multiple
              onChange={(e)=> setFiles(Array.from(e.target.files || []))} />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button className="btn" disabled={loading || files.length===0}>{loading? '解析中…' : 'アップロードして解析'}</button>
          </form>
          {extract?.extracted && (
            <div className="mt-6">
              <h3 className="font-semibold mb-2">プレビュー</h3>
              <pre className="text-xs bg-slate-800/60 rounded-xl p-3 overflow-auto max-h-64">{JSON.stringify(extract.extracted, null, 2)}</pre>
            </div>
          )}
        </section>
      )}

      {step === 2 && (
        <section className="space-y-6">
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-2">質問</h2>
            <p className="text-slate-300 text-sm mb-4">大分類を選び、詳細を1問ずつ入力してください（全7項目が必須）。1件登録ごとに進捗が進みます（目安:12問）。</p>
            <QuestionForm onAdd={addAnswer} />
            <div className="mt-6 space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-32 text-sm text-slate-300">進捗</div>
                <div className="flex-1"><ProgressBar value={progress} /></div>
                <div className="text-sm text-slate-300 w-16 text-right">{Math.round(progress)}%</div>
              </div>
              <p className="text-slate-400 text-xs">回答数: {answers.length} / 目安: {PROGRESS_GOAL}問 ・ 必須カテゴリ達成: {finishedCategories.size} / {requiredCategories.length}</p>
            </div>
            <div className="mt-6">
              <h3 className="font-medium mb-2">これまでの回答</h3>
              <ul className="space-y-2">
                {answers.map((a, i) => (
                  <li key={i} className="p-3 rounded-xl bg-slate-800/50 text-sm">
                    <span className="text-slate-400">[{requiredCategories.find(c=>c.key===a.category)?.label}]</span><br/>
                    {a.text}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-6 flex gap-3">
              <button className="btn" disabled={!canToCV} onClick={onGenerateCV}>
                {loading ? '生成中…' : 'CVを生成する'}
              </button>
              {!canToCV && <span className="text-slate-400 text-sm">全ての必須カテゴリについて、少なくとも1件回答してください。</span>}
            </div>
          </div>

          {extract?.suggestions?.nextQuestions?.length ? (
            <div className="card p-6">
              <h3 className="font-semibold mb-2">AIからの追加質問候補</h3>
              <ul className="list-disc list-inside text-slate-200">
                {extract.suggestions.nextQuestions.map((q, i)=>(<li key={i}>{q}</li>))}
              </ul>
            </div>
          ) : null}
        </section>
      )}

      {step === 3 && extract?.extracted && (
        <section className="space-y-6">
          <div className="card p-6">
            <h2 className="text-xl font-semibold">CV（サマリー）</h2>
            {extract.extracted.summary && <p className="mt-2 text-slate-200">{extract.extracted.summary}</p>}
            {(extract.extracted.strengths?.length ?? 0) > 0 && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">得意分野・強み</h3>
                <ul className="list-disc list-inside text-slate-200">
                  {extract.extracted.strengths?.map((s,i)=>(<li key={i}>{s}</li>))}
                </ul>
              </div>
            )}
            {(extract.extracted.recommendedAssignments?.length ?? 0) > 0 && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">推奨アサイン領域</h3>
                <div className="flex flex-wrap gap-2">
                  {extract.extracted.recommendedAssignments?.map((r,i)=>(
                    <span key={i} className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm">{r}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="font-semibold mb-3">スキルレベル</h3>
              <div className="space-y-3">
                {extract.extracted.skills?.slice(0,10).map((s: SkillItem, i:number)=>(
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-slate-200">{s.name}</span>
                    <Stars level={s.level} />
                  </div>
                ))}
              </div>
            </div>
            <div className="card p-6">
              <h3 className="font-semibold mb-3">レーダーチャート</h3>
              <RadarSkillChart skills={extract.extracted.skills || []} />
            </div>
          </div>

          <div className="card p-6">
            <h3 className="font-semibold mb-3">プロジェクト経歴（タイムライン）</h3>
            <Timeline projects={extract.extracted.projects as ProjectItem[]} />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="font-semibold mb-2">業務内容</h3>
              <ul className="list-disc list-inside text-slate-200">
                {extract.extracted.responsibilities?.map((s,i)=>(<li key={i}>{s}</li>))}
              </ul>
            </div>
            <div className="card p-6">
              <h3 className="font-semibold mb-2">業界知識</h3>
              <div className="flex flex-wrap gap-2">
                {extract.extracted.domainKnowledge?.map((d,i)=>(<span key={i} className="px-3 py-1 rounded-full bg-slate-800/70 border border-slate-700">{d}</span>))}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="font-semibold mb-2">資格・認定</h3>
              <ul className="list-disc list-inside text-slate-200">
                {extract.extracted.certifications?.map((c,i)=>(<li key={i}>{c}</li>))}
              </ul>
            </div>
            <div className="card p-6">
              <h3 className="font-semibold mb-2">マネジメント経験</h3>
              <div className="text-slate-200 text-sm">
                <div>チーム規模: {extract.extracted.management?.teamSize || '-'}</div>
                <div>期間: {extract.extracted.management?.period || '-'}</div>
                <div className="mt-1">{extract.extracted.management?.details}</div>
              </div>
            </div>
          </div>

          {(extract.extracted.others?.length ?? 0) > 0 && (
            <div className="card p-6">
              <h3 className="font-semibold mb-2">その他</h3>
              <ul className="list-disc list-inside text-slate-200">
                {extract.extracted.others?.map((o,i)=>(<li key={i}>{o}</li>))}
              </ul>
            </div>
          )}
        </section>
      )}
    </div>
  )
}

// ----------------- SUB COMPONENTS -----------------

function QuestionForm({ onAdd }: { onAdd: (category: CategoryKey, text: string) => void }) {
  const [cat, setCat] = useState<CategoryKey>('projects')
  const [text, setText] = useState('')
  const [count, setCount] = useState(0)
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    onAdd(cat, text.trim())
    setText('')
    setCount(c => c+1)
  }
  return (
    <form onSubmit={submit} className="grid md:grid-cols-4 gap-3 items-start">
      <div className="md:col-span-1">
        <label className="label">大分類</label>
        <select className="select" value={cat} onChange={e=> setCat(e.target.value as CategoryKey)}>
          {requiredCategories.map(c => (<option key={c.key} value={c.key}>{c.label}</option>))}
        </select>
      </div>
      <div className="md:col-span-3">
        <label className="label">詳細（自由記述）</label>
        <textarea className="textarea h-28" value={text} onChange={e=> setText(e.target.value)} placeholder="具体的な内容を記載してください。例：EC業界で月間PV 2,000万規模、テストリードとして10名のチームを率いて…" />
      </div>
      <div className="md:col-span-4 flex items-center justify-between">
        <div className="text-slate-400 text-sm">登録済み: {count} 件</div>
        <button className="btn" type="submit">この内容を登録</button>
      </div>
    </form>
  )
}

function mergeToCV(extracted: CVData | undefined, answers: { category: CategoryKey, text: string }[]): CVData {
  const cv: CVData = extracted ? JSON.parse(JSON.stringify(extracted)) : {
    skills: [], projects: [], responsibilities: [], domainKnowledge: [], certifications: [], management: {}, strengths: [], recommendedAssignments: [], others: []
  }
  for (const ans of answers) {
    switch(ans.category) {
      case 'projects':
        cv.projects.push({ title: 'ユーザー入力', industry: '', role: '', description: ans.text })
        break
      case 'skills':
        const names = ans.text.split(/[、,\s]+/).filter(Boolean).slice(0,10)
        for (const n of names) cv.skills.push({ name: n, level: 3 })
        break
      case 'responsibilities':
        cv.responsibilities.push(ans.text); break
      case 'domainKnowledge':
        cv.domainKnowledge.push(...ans.text.split(/[、,\s]+/).filter(Boolean)); break
      case 'certifications':
        cv.certifications.push(...ans.text.split(/[、,\s]+/).filter(Boolean)); break
      case 'management':
        cv.management.details = (cv.management.details ? cv.management.details + ' ' : '') + ans.text; break
      case 'others':
        (cv.others ||= []).push(ans.text); break
    }
  }
  const seen = new Set<string>()
  cv.skills = cv.skills.filter(s => { const k = s.name.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true }).slice(0,50)
  return cv
}
