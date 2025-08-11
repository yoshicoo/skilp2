import { NextResponse } from 'next/server'
import { MODEL, openai } from '@/lib/openai'
import type { CVData, ExtractResponse } from '@/types'

async function parsePdf(buffer: Buffer): Promise<string> {
  const pdfparse = await import('pdf-parse')
  const data = await pdfparse.default(buffer)
  return data.text || ''
}

async function parseDocx(buffer: Buffer): Promise<string> {
  const mammoth = await import('mammoth')
  const result = await mammoth.convertToHtml({ buffer })
  return result.value.replace(/<[^>]+>/g, ' ');
}

export async function POST(req: Request) {
  const formData = await req.formData()
  const files = formData.getAll('files') as File[]
  if (!files || files.length === 0) return NextResponse.json({ error: 'ファイルが選択されていません' }, { status: 400 })

  let mergedText = ''
  for (const file of files) {
    const ab = await file.arrayBuffer()
    const buf = Buffer.from(ab)
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      mergedText += '\n\n' + await parsePdf(buf)
    } else if (file.type.includes('word') || file.name.toLowerCase().endsWith('.docx')) {
      mergedText += '\n\n' + await parseDocx(buf)
    } else {
      mergedText += `\n\n[UNSUPPORTED:${file.name}]`
    }
  }

  const prompt = `
あなたは人材アサインのための履歴書解析AIです。以下のテキストから、候補者のスキル・プロジェクト・役割・実績を日本語で構造化してください。
JSON だけを返してください。不要な文章は書かないでください。

出力スキーマ:
{
  "summary": "100〜200字の職務要約",
  "strengths": ["強み1", "強み2", "..."],
  "recommendedAssignments": ["推奨アサイン領域1", "..."],
  "skills": [{"name": "TypeScript", "level": 1-5, "category": "language/automation/test/tool/etc"}],
  "projects": [
    {"title": "案件名", "industry": "業界", "size": "規模", "role": "役割", "period": "YYYY/MM-YYYY/MM", "description": "概要", "techStack": ["React","Jest"], "achievements": ["実績1", "実績2"]}
  ],
  "responsibilities": ["テスト設計","自動化","マネジメント","提案活動", "..."],
  "domainKnowledge": ["金融","EC","ゲーム","医療", "..."],
  "certifications": ["JSTQB","IPA 基本情報", "..."],
  "management": {"teamSize":"人数", "period":"期間", "details":"補足"},
  "others": ["その他特記事項"]
}
テキスト(先頭10万文字):
<<TEXT
${mergedText.slice(0, 100000)}
TEXT
`

  const completion = await openai.chat.completions.create({
    model: MODEL,
    temperature: 0.2,
    messages: [
      { role: 'system', content: 'You are a precise information extraction engine. Output must be valid JSON.' },
      { role: 'user', content: prompt }
    ]
  })

  const content = completion.choices[0]?.message?.content || '{}'
  let parsed: CVData
  try {
    parsed = JSON.parse(content)
  } catch {
    const m = content.match(/{[\s\S]*}/)
    parsed = m ? JSON.parse(m[0]) : {
      skills: [], projects: [], responsibilities: [], domainKnowledge: [], certifications: [], management: {}
    } as any
  }

  const missingSections: string[] = []
  const requiredKeys: (keyof CVData)[] = ['projects','skills','responsibilities','domainKnowledge','certifications','management']
  for (const key of requiredKeys) {
    const v: any = (parsed as any)[key]
    if (!v || (Array.isArray(v) && v.length === 0) || (typeof v === 'object' && Object.keys(v).length === 0)) {
      missingSections.push(String(key))
    }
  }

  const suggestions = {
    nextQuestions: [
      '直近の案件で最も成果を出した点は何ですか？',
      '自動化（例: Cypress、Playwright など）の経験詳細を教えてください。',
      'マネジメント経験（人数、期間、役割）を具体的に記載してください。',
      '得意な業界とその理由を教えてください。'
    ],
    missingSections
  }

  const result: ExtractResponse = {
    extracted: {
      summary: parsed.summary || '',
      strengths: parsed.strengths || [],
      recommendedAssignments: parsed.recommendedAssignments || [],
      skills: parsed.skills || [],
      projects: parsed.projects || [],
      responsibilities: parsed.responsibilities || [],
      domainKnowledge: parsed.domainKnowledge || [],
      certifications: parsed.certifications || [],
      management: parsed.management || {},
      others: parsed.others || []
    },
    suggestions
  }
  return NextResponse.json(result)
}
