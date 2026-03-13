# 우아한테크코스 8기 짝 프로그래밍 선언문 웹 페이지 설계

## 개요

우아한테크코스 8기 크루들의 짝 프로그래밍 회고를 바탕으로 선언문을 웹 페이지로 만들고, 오픈소스처럼 GitHub PR 기반으로 관리할 수 있게 한다. 5기 선언문 PDF 스타일을 참고하되, 인쇄/공유 기능을 갖춘 웹 페이지로 구현한다.

---

## 기술 스택

- **프레임워크**: Next.js 15+ (TypeScript) — `output: 'export'` 정적 빌드, App Router
- **패키지 매니저**: pnpm
- **배포**: GitHub Pages (`https://woowacourse.github.io/pair-programming-manifesto/`)
- **폰트**: 배민 한나체 (BM Hanna Pro, woff2) — 셀프 호스팅
- **스타일링**: CSS Modules + `@media print`

---

## 프로젝트 구조

```
pair-programming-manifesto/
├── principles.md                  # 원칙 목록 (기여의 핵심 파일)
├── src/
│   ├── app/
│   │   ├── layout.tsx             # 폰트, 메타태그 설정
│   │   ├── page.tsx               # 메인 페이지 (async 서버 컴포넌트)
│   │   └── globals.css            # 전역 스타일 + @font-face
│   ├── components/
│   │   ├── ManifestoPage/
│   │   │   ├── ManifestoPage.tsx  # A4 레이아웃 컴포넌트
│   │   │   └── ManifestoPage.module.css
│   │   └── Toolbar/
│   │       ├── Toolbar.tsx        # 인쇄/공유 버튼 (클라이언트 컴포넌트)
│   │       └── Toolbar.module.css
│   └── lib/
│       └── parsePrinciples.ts     # MD 파일 파싱 유틸
├── public/
│   └── fonts/
│       └── BaeminHannaPro.woff2   # 배민 한나체 폰트 파일
├── next.config.ts                 # Next.js 15+ 설정
├── package.json
└── .github/
    └── workflows/
        └── deploy.yml             # GitHub Pages 자동 배포
```

---

## next.config.ts 설정

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

---

## 폰트 설정

- **파일**: `public/fonts/BaeminHannaPro.woff2`
- **출처**: 배민 한나체 공식 배포 woff2 파일
- **방식**: `next/font/local` 사용 — Next.js가 빌드타임에 경로와 basePath를 자동 처리하므로 로컬 개발(`pnpm dev`)과 프로덕션 모두에서 올바르게 동작

```ts
// src/app/layout.tsx
import localFont from 'next/font/local'

const baeminHanna = localFont({
  src: '../../public/fonts/BaeminHannaPro.woff2',
  variable: '--font-baemin-hanna',
  display: 'swap',
})
```

- `globals.css`에 `@font-face`를 직접 선언하지 않는다 (basePath 경로 불일치 문제 방지)

---

## `principles.md` 포맷 계약

파서(`parsePrinciples.ts`)가 기대하는 정확한 형식:

```markdown
# 짝 프로그래밍 선언문

우리는 함께 자라기 위해 짝 프로그래밍을 하면서
다음의 원칙들을 가치있게 여긴다.

1. 한 명이 우위에 있다고 생각하지 말아라. 상대의 실력에 쫄지 말자.
2. 반대 의견을 적극적으로 표시해라. 싸움을 피하지 말자.
...

> * 원칙은 언제든 업데이트 가능! 동의되지 않는다면 바꾸자.
```

**파싱 규칙**:
- 첫 번째 `# H1` 줄 → `title` (앞의 `# ` 제거 후 순수 텍스트)
- 첫 번째 빈 줄 이후 첫 번째 단락(ordered list 아닌 텍스트) → `subtitle`
  - 여러 줄인 경우 줄바꿈(`\n`)을 유지하여 하나의 문자열로 저장 (예: `"우리는 함께...\n다음의 원칙들을..."`)
- `1.`, `2.`, ... 로 시작하는 ordered list 항목 → `principles` 배열
  - 앞의 `숫자. ` 접두사는 제거하고 순수 텍스트만 저장
- `>` blockquote → `footer`
  - `> ` 접두사와 `* ` 마커를 모두 제거한 순수 텍스트로 저장 (예: `"원칙은 언제든 업데이트 가능! 동의되지 않는다면 바꾸자."`)
- 그 외 줄(빈 줄, 추가 heading 등)은 무시

**파서 반환 타입**:
```ts
interface ManifestoData {
  title: string        // "짝 프로그래밍 선언문"
  subtitle: string     // "우리는 함께...\n다음의 원칙들을..." (줄바꿈 보존)
  principles: string[] // ["한 명이 우위에...", "반대 의견을..."]
  footer: string       // "원칙은 언제든 업데이트 가능! 동의되지 않는다면 바꾸자."
}
```

---

## 핵심 기능

### 1. 서버 컴포넌트에서 MD 파싱

`src/app/page.tsx` (async 서버 컴포넌트):
```ts
import fs from 'fs'
import path from 'path'
import { parsePrinciples } from '@/lib/parsePrinciples'

export default async function Page() {
  const content = fs.readFileSync(
    path.join(process.cwd(), 'principles.md'),
    'utf-8'
  )
  const data = parsePrinciples(content)
  return <ManifestoPage data={data} />
}
```

### 2. 인쇄 기능

- **인쇄 버튼**: `window.print()` 호출 (클라이언트 컴포넌트)
- **`@media print` CSS**:
  - Toolbar 숨김 (`display: none`)
  - A4 크기: `@page { size: A4; margin: 20mm; }`
  - 폰트 크기/행간 조정으로 10개 원칙이 1페이지에 맞도록 설정
  - 원칙이 1페이지를 초과할 경우: 폰트 크기를 `clamp()`로 자동 조정하거나, 인쇄 시 작게 축소되는 것을 허용 (브라우저 인쇄 설정에서 "맞춤 인쇄" 활용 안내)

### 3. 공유 기능

- **공유 버튼**: `navigator.share` 지원 시 Web Share API 호출
- 미지원 시 클립보드에 URL 복사 (`navigator.clipboard.writeText`)
- 공유 URL: `https://woowacourse.github.io/pair-programming-manifesto/`

---

## GitHub Actions 배포 워크플로우

`.github/workflows/deploy.yml`:

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

---

## 디자인

### 레이아웃 (5기 PDF 스타일 참고)

- 상단: "우아한테크코스 8기" 배지 + "짝 프로그래밍 선언문" 대제목 (배민 한나체, 굵게)
- 부제목: "우리는 함께 자라기 위해..." 문장
- 구분선
- 원칙 목록: 번호 + 내용, 배민 한나체
- 하단 푸터: "* 원칙은 언제든 업데이트 가능!"
- Toolbar (인쇄/공유 버튼): 화면 상단에 표시, 인쇄 시 숨김

### 인쇄 레이아웃

10개 원칙이 A4 1페이지에 들어가도록 고정 pt 크기로 구성한다. 향후 원칙이 늘어나 1페이지를 초과할 경우, 브라우저 인쇄 다이얼로그의 "축소하여 맞춤" 옵션을 활용하도록 안내 문구를 페이지에 표시한다.

```css
@media print {
  .toolbar { display: none; }
  @page { size: A4 portrait; margin: 20mm 25mm; }
  body { font-size: 13pt; }
  .title { font-size: 36pt; }
  .subtitle { font-size: 13pt; }
  .principle { font-size: 11pt; line-height: 1.6; break-inside: avoid; }
  .principles-list { list-style: none; }
}
```

- `break-inside: avoid`: 원칙 항목이 페이지 경계에서 잘리지 않도록 보장

---

## 원칙 초안 (원문 기반 중복 제거)

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

---

## 결정 사항 요약

| 항목 | 결정 |
|---|---|
| 프레임워크 | Next.js 15+ (TypeScript, App Router, static export) |
| 패키지 매니저 | pnpm |
| 배포 | GitHub Pages (`woowacourse` org) |
| 배포 URL | `https://woowacourse.github.io/pair-programming-manifesto/` |
| 폰트 | 배민 한나체 woff2 셀프 호스팅 |
| 콘텐츠 관리 | `principles.md` PR 기반 |
| 인쇄 | `@media print` + 인쇄 버튼 (`window.print()`) |
| 공유 | Web Share API / URL 클립보드 복사 |
| 라우터 | App Router (서버 컴포넌트에서 `fs.readFileSync`) |
