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
