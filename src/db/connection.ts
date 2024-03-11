import postgres from 'postgres'

import * as schema from './schema'
import { drizzle } from 'drizzle-orm/postgres-js'
import { env } from '../env/'

const pool = postgres(env.DATABASE_URL)

export const db = drizzle(pool, {
  schema,
})