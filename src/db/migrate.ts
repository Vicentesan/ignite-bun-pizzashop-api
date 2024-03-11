import postgres from 'postgres'
import chalk from 'chalk'

import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'

import { env } from '../env'

const pool = postgres(env.DATABASE_URL, { max: 1 })
const db = drizzle(pool)

await migrate(db, { migrationsFolder: 'drizzle' })

console.log(chalk.green('Migrations applied successfully.'))

await pool.end()

process.exit()
