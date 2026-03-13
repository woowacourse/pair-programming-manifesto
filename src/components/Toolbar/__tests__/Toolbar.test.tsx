import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Toolbar from '../Toolbar'

describe('Toolbar', () => {
  beforeEach(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn() },
      configurable: true,
    })
  })

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
    const writeTextSpy = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined)
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
    render(<Toolbar />)
    fireEvent.click(screen.getByRole('button', { name: /공유/ }))
    await vi.waitFor(() => {
      expect(writeTextSpy).toHaveBeenCalledWith(expect.stringContaining('pair-programming-manifesto'))
    })
    writeTextSpy.mockRestore()
    alertSpy.mockRestore()
  })
})
