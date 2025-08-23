import { LibSQLDatabase } from "drizzle-orm/libsql";
import * as schema from "../models/schema";

declare const db: LibSQLDatabase<typeof schema>;
export { db };
