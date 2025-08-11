import { NextResponse } from 'next/server'
import { MODEL, openai } from '@/lib/openai'
import type { CVData } from '@/types'

export async function POST(req: Request) {
  const body = await req.json() as { cv: CVData }
  const cv = body.cv

  const prompt = `あなたはアサイン最適化の専門家です。以下の情報から、推奨アサイン領域（最大5件）と人物ハイライト（3〜5件）を日本語で提案し、JSONで返してください。

入力:
${JSON.stringify(cv, null, 2)}

出力スキーマ:
{
  "recommendedAssignments": ["領域1","領域2","..."],
  "highlights": ["強み・売りポイント1","..."]
}`

  const completion = await openai.chat.completions.create({
    model: MODEL,
    temperature: 0.2,
    messages: [
      { role: 'system', content: 'Output JSON only.' },
      { role: 'user', content: prompt }
    ]
  })

  const text = completion.choices[0]?.message?.content || '{}'
  let parsed: any = {}
  try {
    parsed = JSON.parse(text)
  } catch {
    const m = text.match(/{[\s\S]*}/)
    parsed = m ? JSON.parse(m[0]) : {}
  }

  return NextResponse.json({
    recommendedAssignments: parsed.recommendedAssignments || [],
    highlights: parsed.highlights || []
  })
}
