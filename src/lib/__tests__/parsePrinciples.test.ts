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
