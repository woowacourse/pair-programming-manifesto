# 짝 프로그래밍 선언문 웹 페이지 Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 우아한테크코스 8기 짝 프로그래밍 선언문을 `principles.md`로 관리하고 인쇄/공유 기능을 갖춘 Next.js 정적 웹 페이지를 만든다.

**Architecture:** Next.js 15 App Router + `output: 'export'`로 정적 빌드. `principles.md`를 서버 컴포넌트에서 빌드타임에 파싱해 렌더링. GitHub Actions로 GitHub Pages에 자동 배포.

**Tech Stack:** Next.js 15, TypeScript, pnpm, CSS Modules, vitest, @testing-library/react, GitHub Pages

---

## Chunk 1: 프로젝트 초기화 및 기본 설정

### Task 1: Next.js 프로젝트 생성

**Files:**
- Create: `package.json`
- Create: `next.config.ts`
- Create: `tsconfig.json`
- Create: `.gitignore`

- [ ] **Step 1: Next.js 프로젝트 생성**

```bash
cd /Users/makerjun/git/woowacourse/pair-programming-manifesto
pnpm create next-app@latest . \
  --typescript \
  --no-tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"
```

프롬프트가 나오면 모두 기본값(Enter) 선택. `--src-dir` 플래그로 `src/app/` 구조가 바로 생성된다.

- [ ] **Step 2: 불필요한 보일러플레이트 파일 삭제**

```bash
rm -f public/next.svg public/vercel.svg
```

- [ ] **Step 3: vitest 및 테스트 의존성 설치**

```bash
pnpm add -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom jsdom
```

- [ ] **Step 4: vitest 설정 파일 생성**

`vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

`src/test/setup.ts`:
```ts
import '@testing-library/jest-dom'
```

- [ ] **Step 5: package.json에 test 스크립트 추가**

`package.json`의 `scripts`에 추가:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 6: next.config.ts 설정 (GitHub Pages 배포 설정)**

```ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/pair-programming-manifesto',
  assetPrefix: '/pair-programming-manifesto',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
}

export default nextConfig
```

- [ ] **Step 7: 커밋**

```bash
git add -A
git commit -m "chore: initialize Next.js 15 project with vitest"
```

---

## Chunk 2: `parsePrinciples` 유틸 (TDD)

### Task 2: MD 파서 구현

**Files:**
- Create: `src/lib/parsePrinciples.ts`
- Create: `src/lib/__tests__/parsePrinciples.test.ts`

- [ ] **Step 1: 타입 정의 및 테스트 파일 작성**

`src/lib/__tests__/parsePrinciples.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { parsePrinciples } from '../parsePrinciples'

const sampleMd = `# 짝 프로그래밍 선언문

우리는 함께 자라기 위해 짝 프로그래밍을 하면서
다음의 원칙들을 가치있게 여긴다.

1. 한 명이 우위에 있다고 생각하지 말아라. 상대의 실력에 쫄지 말자.
2. 반대 의견을 적극적으로 표시해라. 싸움을 피하지 말자.
3. 혼자 고민하고 결정하지 말아라.

> * 원칙은 언제든 업데이트 가능! 동의되지 않는다면 바꾸자.
`

describe('parsePrinciples', () => {
  it('H1 헤딩을 title로 파싱한다', () => {
    const result = parsePrinciples(sampleMd)
    expect(result.title).toBe('짝 프로그래밍 선언문')
  })

  it('첫 번째 단락을 subtitle로 파싱하며 줄바꿈을 보존한다', () => {
    const result = parsePrinciples(sampleMd)
    expect(result.subtitle).toBe(
      '우리는 함께 자라기 위해 짝 프로그래밍을 하면서\n다음의 원칙들을 가치있게 여긴다.'
    )
  })

  it('ordered list 항목을 principles 배열로 파싱하며 번호 접두사를 제거한다', () => {
    const result = parsePrinciples(sampleMd)
    expect(result.principles).toEqual([
      '한 명이 우위에 있다고 생각하지 말아라. 상대의 실력에 쫄지 말자.',
      '반대 의견을 적극적으로 표시해라. 싸움을 피하지 말자.',
      '혼자 고민하고 결정하지 말아라.',
    ])
  })

  it('blockquote를 footer로 파싱하며 > 와 * 마커를 제거한다', () => {
    const result = parsePrinciples(sampleMd)
    expect(result.footer).toBe(
      '원칙은 언제든 업데이트 가능! 동의되지 않는다면 바꾸자.'
    )
  })

  it('빈 줄과 추가 heading은 무시한다', () => {
    const mdWithExtra = `# 제목\n\n소제목\n\n## 무시되는 섹션\n\n1. 원칙\n\n> * 푸터\n`
    const result = parsePrinciples(mdWithExtra)
    expect(result.title).toBe('제목')
    expect(result.subtitle).toBe('소제목')
    expect(result.principles).toEqual(['원칙'])
    expect(result.footer).toBe('푸터')
  })
})
```

- [ ] **Step 2: 테스트 실행 — FAIL 확인**

```bash
pnpm test
```

Expected: `Cannot find module '../parsePrinciples'`

- [ ] **Step 3: `parsePrinciples.ts` 구현**

`src/lib/parsePrinciples.ts`:
```ts
export interface ManifestoData {
  title: string
  subtitle: string
  principles: string[]
  footer: string
}

export function parsePrinciples(content: string): ManifestoData {
  const lines = content.split('\n')

  let title = ''
  let subtitle = ''
  const principles: string[] = []
  let footer = ''

  let subtitleLines: string[] = []
  let inSubtitle = false
  let subtitleDone = false

  for (const line of lines) {
    // H1 → title
    if (!title && line.startsWith('# ')) {
      title = line.slice(2).trim()
      inSubtitle = true
      continue
    }

    // blockquote → footer
    if (line.startsWith('>')) {
      const stripped = line.replace(/^>\s*/, '').replace(/^\*\s*/, '').trim()
      if (stripped) footer = stripped
      continue
    }

    // ordered list → principles
    if (/^\d+\.\s/.test(line)) {
      if (!subtitleDone && subtitleLines.length > 0) {
        subtitle = subtitleLines.join('\n')
        subtitleLines = []
      }
      subtitleDone = true
      inSubtitle = false
      const text = line.replace(/^\d+\.\s/, '').trim()
      if (text) principles.push(text)
      continue
    }

    // subtitle 수집 (H1 이후, ordered list 이전, 비어있지 않은 줄)
    if (inSubtitle && !subtitleDone && title) {
      if (line.trim() === '') {
        // 빈 줄: subtitle 수집이 완료된 경우 종료
        if (subtitleLines.length > 0) {
          inSubtitle = false
          subtitleDone = true
          subtitle = subtitleLines.join('\n')
          subtitleLines = []
        }
      } else if (!line.startsWith('#')) {
        subtitleLines.push(line.trim())
      }
    }
  }

  // 루프 종료 후에도 subtitleLines가 남아있으면 flush
  if (subtitleLines.length > 0 && !subtitle) {
    subtitle = subtitleLines.join('\n')
  }

  return { title, subtitle, principles, footer }
}
```

- [ ] **Step 4: 테스트 실행 — PASS 확인**

```bash
pnpm test
```

Expected: 5개 테스트 모두 PASS

- [ ] **Step 5: 커밋**

```bash
git add src/lib/parsePrinciples.ts src/lib/__tests__/parsePrinciples.test.ts
git commit -m "feat: implement parsePrinciples utility with TDD"
```

---

## Chunk 3: `principles.md` 파일 생성

### Task 3: 원칙 내용 파일 작성

**Files:**
- Create: `principles.md`

- [ ] **Step 1: `principles.md` 생성**

```markdown
# 짝 프로그래밍 선언문

우리는 함께 자라기 위해 짝 프로그래밍을 하면서
다음의 원칙들을 가치있게 여긴다.

1. 한 명이 우위에 있다고 생각하지 말아라. 상대의 실력에 쫄지 말자.
2. 반대 의견을 적극적으로 표시해라. 싸움을 피하지 말자.
3. 혼자 고민하고 결정하지 말아라. 생각난 거 바로바로 말해라. 일단 뱉어.
4. 결정의 속도보다 대화의 밀도를 우선하며, 모든 의견 속에는 반드시 내가 배울 한 가지가 있음을 믿는다.
5. 모르는 것은 죄가 아니다. 심리적 안전감을 형성하고 모르는 것을 물어볼 수 있는 용기를 가지자.
6. 내가 아는 걸 남도 안다고 생각하지 말자. 개떡같이 말해도 찰떡같이 들어라.
7. 역할 교대 잘 해라. 맡은 역할(드라이버, 네비게이터)에 충실하자.
8. 혼자였으면 해보지 못했을 시도를 페어와 함께하라. 좋은 결과물보다 부딪치는 과정에서 얻는 것에 집중하라.
9. 완성이 목적이 아니다. 남는 것은 기록이다. 기록을 하자.
10. 짧게라도 자주 회고해라. 시작 전에 수다 타임을 충분히 가지자. 힘들수록 웃어라.

> * 원칙은 언제든 업데이트 가능! 동의되지 않는다면 바꾸자.
```

- [ ] **Step 2: 커밋**

```bash
git add principles.md
git commit -m "docs: add initial principles.md for 8th gen pair programming manifesto"
```

---

## Chunk 4: 폰트 설치 및 레이아웃

### Task 4: 배민 한나체 폰트 설정

**Files:**
- Create: `public/fonts/BaeminHannaPro.woff2`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: 배민 한나체 woff2 파일 다운로드**

배민 한나체 Pro 공식 다운로드 페이지에서 woff2 파일을 받아 `public/fonts/BaeminHannaPro.woff2`에 배치한다.

또는 CDN에서 직접 다운로드:
```bash
mkdir -p public/fonts
curl -L "https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2206@1.0/BaeminHanna-Pro.woff2" \
  -o public/fonts/BaeminHannaPro.woff2
```

- [ ] **Step 2: `src/app/layout.tsx` 작성**

```tsx
import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'

const baeminHanna = localFont({
  src: '../../public/fonts/BaeminHannaPro.woff2',
  variable: '--font-baemin-hanna',
  display: 'swap',
})

export const metadata: Metadata = {
  title: '우아한테크코스 8기 짝 프로그래밍 선언문',
  description:
    '우아한테크코스 8기 크루들이 함께 만든 짝 프로그래밍 선언문입니다.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={baeminHanna.variable}>{children}</body>
    </html>
  )
}
```

- [ ] **Step 3: `src/app/globals.css` 작성**

```css
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
  font-family: var(--font-baemin-hanna), 'Noto Sans KR', sans-serif;
}

body {
  background-color: #f0f0f0;
  min-height: 100vh;
}
```

- [ ] **Step 4: 개발 서버 실행하여 폰트 적용 확인**

```bash
pnpm dev
```

브라우저에서 `http://localhost:3000/pair-programming-manifesto/` 접속 후 폰트가 적용되는지 확인.

- [ ] **Step 5: 커밋**

```bash
git add public/fonts/ src/app/layout.tsx src/app/globals.css
git commit -m "feat: add BaeminHannaPro font via next/font/local"
```

---

## Chunk 5: ManifestoPage 컴포넌트

### Task 5: A4 레이아웃 컴포넌트 구현

**Files:**
- Create: `src/components/ManifestoPage/ManifestoPage.tsx`
- Create: `src/components/ManifestoPage/ManifestoPage.module.css`
- Create: `src/components/ManifestoPage/__tests__/ManifestoPage.test.tsx`

- [ ] **Step 1: 테스트 파일 작성**

`src/components/ManifestoPage/__tests__/ManifestoPage.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import ManifestoPage from '../ManifestoPage'

const mockData = {
  title: '짝 프로그래밍 선언문',
  subtitle: '우리는 함께 자라기 위해 짝 프로그래밍을 하면서\n다음의 원칙들을 가치있게 여긴다.',
  principles: [
    '한 명이 우위에 있다고 생각하지 말아라.',
    '반대 의견을 적극적으로 표시해라.',
  ],
  footer: '원칙은 언제든 업데이트 가능! 동의되지 않는다면 바꾸자.',
}

describe('ManifestoPage', () => {
  it('제목을 렌더링한다', () => {
    render(<ManifestoPage data={mockData} />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('짝 프로그래밍 선언문')
  })

  it('"우아한테크코스 8기" 배지를 렌더링한다', () => {
    render(<ManifestoPage data={mockData} />)
    expect(screen.getByText('우아한테크코스 8기')).toBeInTheDocument()
  })

  it('원칙 목록을 번호와 함께 렌더링한다', () => {
    render(<ManifestoPage data={mockData} />)
    expect(screen.getByText('한 명이 우위에 있다고 생각하지 말아라.')).toBeInTheDocument()
    expect(screen.getByText('반대 의견을 적극적으로 표시해라.')).toBeInTheDocument()
  })

  it('푸터를 렌더링한다', () => {
    render(<ManifestoPage data={mockData} />)
    expect(screen.getByText(/원칙은 언제든 업데이트 가능/)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: 테스트 실행 — FAIL 확인**

```bash
pnpm test
```

Expected: `Cannot find module '../ManifestoPage'`

- [ ] **Step 3: `ManifestoPage.tsx` 구현**

```tsx
import type { ManifestoData } from '@/lib/parsePrinciples'
import styles from './ManifestoPage.module.css'

interface Props {
  data: ManifestoData
}

export default function ManifestoPage({ data }: Props) {
  const subtitleLines = data.subtitle.split('\n')

  return (
    <main className={styles.page}>
      <div className={styles.badge}>우아한테크코스 8기</div>
      <h1 className={styles.title}>{data.title}</h1>
      <p className={styles.subtitle}>
        {subtitleLines.map((line, i) => (
          <span key={i}>
            {line}
            {i < subtitleLines.length - 1 && <br />}
          </span>
        ))}
      </p>
      <hr className={styles.divider} />
      <ol className={styles.principlesList}>
        {data.principles.map((principle, index) => (
          <li key={index} className={styles.principle}>
            <span className={styles.num}>{index + 1}.</span>
            <span>{principle}</span>
          </li>
        ))}
      </ol>
      <footer className={styles.footer}>
        <p>* {data.footer}</p>
      </footer>
    </main>
  )
}
```

- [ ] **Step 4: `ManifestoPage.module.css` 작성**

```css
.page {
  width: 794px; /* A4 96dpi */
  min-height: 1123px;
  background: white;
  padding: 72px 80px 56px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  font-family: var(--font-baemin-hanna), sans-serif;
}

.badge {
  font-size: 14px;
  color: #333;
  margin-bottom: 6px;
}

.title {
  font-size: 56px;
  font-weight: 900;
  line-height: 1.1;
  letter-spacing: -1px;
  margin-bottom: 24px;
}

.subtitle {
  font-size: 20px;
  font-weight: 700;
  line-height: 1.6;
  margin-bottom: 20px;
}

.divider {
  border: none;
  border-top: 3px solid #222;
  margin-bottom: 28px;
}

.principlesList {
  list-style: none;
  flex: 1;
}

.principle {
  display: flex;
  gap: 10px;
  font-size: 16px;
  line-height: 1.7;
  margin-bottom: 10px;
}

.num {
  font-weight: 900;
  min-width: 30px;
  flex-shrink: 0;
}

.footer {
  margin-top: auto;
  padding-top: 20px;
  border-top: 1px solid #ddd;
  text-align: right;
  font-size: 13px;
  color: #666;
}

/* 인쇄 스타일 */
@media print {
  .page {
    width: 100%;
    min-height: auto;
    box-shadow: none;
    padding: 0;
  }

  @page {
    size: A4 portrait;
    margin: 20mm 25mm;
  }

  .badge {
    font-size: 10pt;
  }

  .title {
    font-size: 36pt;
    margin-bottom: 12pt;
  }

  .subtitle {
    font-size: 13pt;
    margin-bottom: 10pt;
  }

  .divider {
    margin-bottom: 14pt;
  }

  .principle {
    font-size: 11pt;
    line-height: 1.6;
    margin-bottom: 6pt;
    break-inside: avoid;
  }

  .footer {
    font-size: 9pt;
  }
}
```

- [ ] **Step 5: 테스트 실행 — PASS 확인**

```bash
pnpm test
```

Expected: 모든 테스트 PASS

- [ ] **Step 6: 커밋**

```bash
git add src/components/ManifestoPage/
git commit -m "feat: add ManifestoPage component with A4 layout and print styles"
```

---

## Chunk 6: Toolbar 컴포넌트

### Task 6: 인쇄/공유 버튼 구현

**Files:**
- Create: `src/components/Toolbar/Toolbar.tsx`
- Create: `src/components/Toolbar/Toolbar.module.css`
- Create: `src/components/Toolbar/__tests__/Toolbar.test.tsx`

- [ ] **Step 1: 테스트 파일 작성**

`src/components/Toolbar/__tests__/Toolbar.test.tsx`:
```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Toolbar from '../Toolbar'

describe('Toolbar', () => {
  it('인쇄 버튼을 렌더링한다', () => {
    render(<Toolbar />)
    expect(screen.getByRole('button', { name: /인쇄/ })).toBeInTheDocument()
  })

  it('공유 버튼을 렌더링한다', () => {
    render(<Toolbar />)
    expect(screen.getByRole('button', { name: /공유/ })).toBeInTheDocument()
  })

  it('인쇄 버튼 클릭 시 window.print를 호출한다', () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {})
    render(<Toolbar />)
    fireEvent.click(screen.getByRole('button', { name: /인쇄/ }))
    expect(printSpy).toHaveBeenCalledOnce()
    printSpy.mockRestore()
  })

  it('Web Share API 미지원 시 공유 버튼 클릭으로 클립보드에 URL을 복사한다', async () => {
    Object.defineProperty(navigator, 'share', { value: undefined, configurable: true })
    const writeTextSpy = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue()
    render(<Toolbar />)
    fireEvent.click(screen.getByRole('button', { name: /공유/ }))
    expect(writeTextSpy).toHaveBeenCalledWith(expect.stringContaining('pair-programming-manifesto'))
    writeTextSpy.mockRestore()
  })
})
```

- [ ] **Step 2: 테스트 실행 — FAIL 확인**

```bash
pnpm test
```

Expected: `Cannot find module '../Toolbar'`

- [ ] **Step 3: `Toolbar.tsx` 구현**

```tsx
'use client'

import styles from './Toolbar.module.css'

const SHARE_URL = 'https://woowacourse.github.io/pair-programming-manifesto/'

export default function Toolbar() {
  const handlePrint = () => {
    window.print()
  }

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: '우아한테크코스 8기 짝 프로그래밍 선언문',
        url: SHARE_URL,
      })
    } else {
      await navigator.clipboard.writeText(SHARE_URL)
      alert('링크가 클립보드에 복사되었습니다!')
    }
  }

  return (
    <div className={styles.toolbar}>
      <button className={styles.btn} onClick={handleShare} type="button">
        🔗 공유하기
      </button>
      <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handlePrint} type="button">
        🖨️ 인쇄하기
      </button>
    </div>
  )
}
```

- [ ] **Step 4: `Toolbar.module.css` 작성**

```css
.toolbar {
  display: flex;
  gap: 12px;
  padding: 12px 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.btn {
  padding: 8px 18px;
  border: 2px solid #222;
  background: white;
  font-family: var(--font-baemin-hanna), sans-serif;
  font-size: 14px;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.15s, color 0.15s;
}

.btn:hover {
  background: #f5f5f5;
}

.btnPrimary {
  background: #222;
  color: white;
}

.btnPrimary:hover {
  background: #444;
}

@media print {
  .toolbar {
    display: none;
  }
}
```

- [ ] **Step 5: 테스트 실행 — PASS 확인**

```bash
pnpm test
```

Expected: 모든 테스트 PASS

- [ ] **Step 6: 커밋**

```bash
git add src/components/Toolbar/
git commit -m "feat: add Toolbar component with print and share functionality"
```

---

## Chunk 7: 메인 페이지 조립

### Task 7: `page.tsx`에서 모든 컴포넌트 연결

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: `src/app/page.tsx` 작성**

```tsx
import fs from 'fs'
import path from 'path'
import { parsePrinciples } from '@/lib/parsePrinciples'
import ManifestoPage from '@/components/ManifestoPage/ManifestoPage'
import Toolbar from '@/components/Toolbar/Toolbar'
import styles from './page.module.css'

export default function Page() {
  const content = fs.readFileSync(
    path.join(process.cwd(), 'principles.md'),
    'utf-8'
  )
  const data = parsePrinciples(content)

  return (
    <div className={styles.container}>
      <Toolbar />
      <ManifestoPage data={data} />
    </div>
  )
}
```

- [ ] **Step 2: `src/app/page.module.css` 작성**

```css
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 20px;
  min-height: 100vh;
}

@media print {
  .container {
    padding: 0;
    background: none;
  }
}
```

- [ ] **Step 3: 개발 서버에서 전체 동작 확인**

```bash
pnpm dev
```

`http://localhost:3000/pair-programming-manifesto/` 에서:
- 배민 한나체 폰트 적용 확인
- 10개 원칙 목록 표시 확인
- 인쇄 버튼 클릭 → 인쇄 다이얼로그 열림 확인
- 공유 버튼 클릭 → URL 복사 또는 Share API 동작 확인

- [ ] **Step 4: 정적 빌드 확인**

```bash
pnpm build
```

Expected: `out/` 디렉토리 생성, 에러 없음

- [ ] **Step 5: 커밋**

```bash
git add src/app/page.tsx src/app/page.module.css src/app/globals.css
git commit -m "feat: assemble main page with ManifestoPage and Toolbar"
```

---

## Chunk 8: GitHub Actions 배포 설정

### Task 8: GitHub Pages 자동 배포 워크플로우

**Files:**
- Create: `.github/workflows/deploy.yml`
- Create: `CONTRIBUTING.md`

- [ ] **Step 1: `.github/workflows/deploy.yml` 작성**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: latest

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm

      - run: pnpm install --frozen-lockfile

      - run: pnpm build

      - uses: actions/configure-pages@v5

      - uses: actions/upload-pages-artifact@v3
        with:
          path: out/

      - uses: actions/deploy-pages@v4
        id: deployment
```

- [ ] **Step 2: `CONTRIBUTING.md` 작성**

```markdown
# 기여 가이드

## 원칙 수정/추가하기

1. `principles.md` 파일을 열어 원칙을 수정하거나 추가합니다.
2. Pull Request를 올립니다.
3. 크루들의 동의를 얻으면 머지됩니다.

GitHub 웹 에디터에서도 바로 수정할 수 있어요 → `principles.md` 파일 열기 → 연필 아이콘 클릭

## 원칙 파일 형식

\`\`\`markdown
# 제목 (H1)

부제목
여러 줄도 됩니다.

1. 원칙은 이렇게
2. 번호 목록으로

> * 푸터 문장
\`\`\`

## 디자인/기능 개선

이슈를 먼저 등록하고 PR을 올려주세요.
```

- [ ] **Step 3: GitHub 레포지토리에서 Pages 설정**

GitHub 레포 → Settings → Pages → Source: **GitHub Actions** 로 변경

- [ ] **Step 4: 커밋 후 배포 확인**

```bash
git add .github/ CONTRIBUTING.md
git commit -m "chore: add GitHub Actions deploy workflow and contributing guide"
git push origin main
```

GitHub Actions 탭에서 워크플로우 성공 확인 후 `https://woowacourse.github.io/pair-programming-manifesto/` 접속.

---

## 최종 확인 체크리스트

- [ ] `pnpm test` — 모든 테스트 통과
- [ ] `pnpm build` — 빌드 에러 없음
- [ ] 배포 URL에서 페이지 정상 표시
- [ ] 배민 한나체 폰트 적용 확인
- [ ] 인쇄 버튼 → 인쇄 미리보기에서 A4 1페이지 확인
- [ ] 공유 버튼 → URL 복사 또는 Share API 동작 확인
- [ ] `principles.md` 수정 후 PR → 머지 → 자동 배포 확인
