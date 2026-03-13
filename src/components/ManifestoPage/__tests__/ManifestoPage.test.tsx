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
  credits: ['콘티', '루멘', '라바'],
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

  it('원칙 목록을 렌더링한다', () => {
    render(<ManifestoPage data={mockData} />)
    expect(screen.getByText('한 명이 우위에 있다고 생각하지 말아라.')).toBeInTheDocument()
    expect(screen.getByText('반대 의견을 적극적으로 표시해라.')).toBeInTheDocument()
  })

  it('푸터를 렌더링한다', () => {
    render(<ManifestoPage data={mockData} />)
    expect(screen.getByText(/원칙은 언제든 업데이트 가능/)).toBeInTheDocument()
  })
})
