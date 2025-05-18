import {
  integer,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const urlShortenerTable = pgTable("url_shortener", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  original_url: text().notNull(),
  short_code: varchar({ length: 10 }).unique(),
  created_at: timestamp().defaultNow(),
});
