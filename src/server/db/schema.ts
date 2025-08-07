import { relations, sql } from "drizzle-orm";
import {
  index,
  pgTableCreator,
  primaryKey,
  pgMaterializedView,
} from "drizzle-orm/pg-core";
import { type AdapterAccount } from "next-auth/adapters";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `${name}`);

export const posts = createTable(
  "post",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    content: d.text().notNull(),
    likes: d.integer().notNull().default(0),
    createdById: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [index("created_by_idx").on(t.createdById)],
);

export const users = createTable("user", (d) => ({
  id: d
    .varchar({ length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: d.varchar({ length: 255 }),
  email: d.varchar({ length: 255 }).notNull(),
  emailVerified: d
    .timestamp({
      mode: "date",
      withTimezone: true,
    })
    .default(sql`CURRENT_TIMESTAMP`),
  image: d.varchar({ length: 255 }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
}));

export const accounts = createTable(
  "account",
  (d) => ({
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id),
    type: d.varchar({ length: 255 }).$type<AdapterAccount["type"]>().notNull(),
    provider: d.varchar({ length: 255 }).notNull(),
    providerAccountId: d.varchar({ length: 255 }).notNull(),
    refresh_token: d.text(),
    access_token: d.text(),
    expires_at: d.integer(),
    token_type: d.varchar({ length: 255 }),
    scope: d.varchar({ length: 255 }),
    id_token: d.text(),
    session_state: d.varchar({ length: 255 }),
  }),
  (t) => [
    primaryKey({ columns: [t.provider, t.providerAccountId] }),
    index("account_user_id_idx").on(t.userId),
  ],
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = createTable(
  "session",
  (d) => ({
    sessionToken: d.varchar({ length: 255 }).notNull().primaryKey(),
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id),
    expires: d.timestamp({ mode: "date", withTimezone: true }).notNull(),
  }),
  (t) => [index("t_user_id_idx").on(t.userId)],
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = createTable(
  "verification_token",
  (d) => ({
    identifier: d.varchar({ length: 255 }).notNull(),
    token: d.varchar({ length: 255 }).notNull(),
    expires: d.timestamp({ mode: "date", withTimezone: true }).notNull(),
  }),
  (t) => [primaryKey({ columns: [t.identifier, t.token] })],
);

export const bibleBook = createTable("bible_book", (d) => ({
  book_id: d.serial().primaryKey().notNull(),
  book_name: d.text().notNull().unique(),
  book_order: d.integer().notNull().default(0),
  testament: d.text().notNull(),
}));

export const bibleChapter = createTable(
  "bible_chapter",
  (d) => ({
    chapter_id: d.serial().primaryKey().notNull(),
    book_id: d
      .integer()
      .notNull()
      .references(() => bibleBook.book_id),
    chapter_number: d.integer().notNull(),
  }),
  (t) => [index("bible_chapter_book_chap_idx").on(t.book_id, t.chapter_number)],
);

export const bibleVerse = createTable(
  "bible_verse",
  (d) => ({
    verse_id: d.serial().primaryKey().notNull(),
    chapter_id: d
      .integer()
      .notNull()
      .references(() => bibleChapter.chapter_id),
    verse_number: d.integer().notNull(),
    verse_text: d.text().notNull(),
  }),
  (t) => [index("bible_verse_chap_verse_idx").on(t.chapter_id, t.verse_number)],
);

export const group = createTable("group", (d) => ({
  group_id: d.serial().primaryKey().notNull(),
  group_name: d.text().notNull().unique(),
}));

// Materialized View: Book별 Chapter 수를 계산
export const bookChapterCount = pgMaterializedView("book_chapter_count").as(
  (qb) =>
    qb
      .select({
        book_id: bibleBook.book_id,
        book_name: bibleBook.book_name,
        book_order: bibleBook.book_order,
        testament: bibleBook.testament,
        chapter_count: sql<number>`COUNT(${bibleChapter.chapter_id})`.as(
          "chapter_count",
        ),
      })
      .from(bibleBook)
      .leftJoin(
        bibleChapter,
        sql`${bibleBook.book_id} = ${bibleChapter.book_id}`,
      )
      .groupBy(bibleBook.book_id, bibleBook.book_name),
);

// Materialized View: Chapter별 Verse 수를 계산
export const chapterVerseCount = pgMaterializedView("chapter_verse_count").as(
  (qb) =>
    qb
      .select({
        chapter_id: bibleChapter.chapter_id,
        book_id: bibleChapter.book_id,
        chapter_number: bibleChapter.chapter_number,
        verse_count: sql<number>`COUNT(${bibleVerse.verse_id})`.as(
          "verse_count",
        ),
      })
      .from(bibleChapter)
      .leftJoin(
        bibleVerse,
        sql`${bibleChapter.chapter_id} = ${bibleVerse.chapter_id}`,
      )
      .groupBy(
        bibleChapter.chapter_id,
        bibleChapter.book_id,
        bibleChapter.chapter_number,
      ),
);
