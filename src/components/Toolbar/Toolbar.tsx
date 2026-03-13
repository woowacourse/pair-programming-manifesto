'use client'

import styles from './Toolbar.module.css'

const SHARE_URL = 'https://woowacourse.github.io/pair-programming-manifesto/'

export default function Toolbar() {
  const handlePrint = () => {
    window.print()
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: '우아한테크코스 8기 짝 프로그래밍 선언문',
        url: SHARE_URL,
      }).catch(() => {})
    } else {
      navigator.clipboard.writeText(SHARE_URL).then(() => {
        alert('링크가 클립보드에 복사되었습니다!')
      }).catch(() => {})
    }
  }

  return (
    <div className={styles.toolbar}>
      <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handlePrint} type="button">
        인쇄하기
      </button>
      <button className={styles.btn} onClick={handleShare} type="button">
        공유하기
      </button>
      <a
        className={styles.btn}
        href="https://github.com/woowacourse/pair-programming-manifesto"
        target="_blank"
        rel="noopener noreferrer"
      >
        GitHub
      </a>
    </div>
  )
}
