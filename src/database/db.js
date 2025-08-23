import 'dotenv/config'

import { drizzle } from 'drizzle-orm/libsql/node';

const db = drizzle({ connection: {
  url: process.env.DATABASE_URL, 
  authToken: process.env.DATABASE_AUTH_TOKEN 
}});

export default db;