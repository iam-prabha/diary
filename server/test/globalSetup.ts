import { execSync } from 'node:child_process'
import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default function setup() {
  dotenv.config({ path: path.resolve(__dirname, '../.env.test'), override: true })
  process.env.NODE_ENV = 'test'
  execSync('npx prisma migrate deploy', {
    stdio: 'inherit',
    env: { ...process.env },
  })
}
