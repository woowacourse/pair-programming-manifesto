'use client'

import styles from './Toolbar.module.css'

const SHARE_URL = 'https://woowacourse.github.io/pair-programming-manifesto/'

export default function Toolbar() {
  const handlePrint = () => {
    window.print()
  }

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: '우아한테크코스 8기 짝 프로그래밍 선언문',
          url: SHARE_URL,
        })
      } else {
        await navigator.clipboard.writeText(SHARE_URL)
        alert('링크가 클립보드에 복사되었습니다!')
      }
    } catch {
      // 사용자가 공유를 취소하거나 권한이 없는 경우 무시
    }
  }

  return (
    <div className={styles.toolbar}>
      <button className={styles.btn} onClick={handleShare} type="button">
        공유하기
      </button>
      <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handlePrint} type="button">
        인쇄하기
      </button>
    </div>
  )
}
