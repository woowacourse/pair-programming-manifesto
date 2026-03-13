import type { ManifestoData } from '@/lib/parsePrinciples'
import Toolbar from '@/components/Toolbar/Toolbar'
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
      <Toolbar />
      <footer className={styles.footer}>
        <p>* {data.footer}</p>
        {data.credits.length > 0 && (
          <p className={styles.credits}>Made by {data.credits.join('  ')}</p>
        )}
      </footer>
    </main>
  )
}
