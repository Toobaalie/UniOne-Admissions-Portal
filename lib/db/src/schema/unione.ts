import { relations, sql } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
  pgTable,
  real,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const universitiesTable = pgTable(
  "universities",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    shortName: text("short_name").notNull(),
    city: text("city").notNull(),
    description: text("description").notNull(),
    about: text("about").notNull(),
    website: text("website"),
    fields: text("fields")
      .array()
      .notNull()
      .default(sql`ARRAY[]::text[]`),
    featured: boolean("featured").notNull().default(false),
    sampleData: boolean("sample_data").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [index("universities_city_idx").on(table.city)],
);

export const programsTable = pgTable(
  "programs",
  {
    id: serial("id").primaryKey(),
    universityId: integer("university_id")
      .notNull()
      .references(() => universitiesTable.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    degreeLevel: text("degree_level").notNull(),
    field: text("field").notNull(),
    durationYears: real("duration_years").notNull(),
    annualFeePkr: integer("annual_fee_pkr"),
    applicationDeadline: date("application_deadline", { mode: "string" }),
    requirements: text("requirements")
      .array()
      .notNull()
      .default(sql`ARRAY[]::text[]`),
    scholarshipAvailable: boolean("scholarship_available")
      .notNull()
      .default(false),
    sampleData: boolean("sample_data").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("programs_university_id_idx").on(table.universityId),
    index("programs_degree_level_idx").on(table.degreeLevel),
    index("programs_field_idx").on(table.field),
    uniqueIndex("programs_university_name_unique").on(
      table.universityId,
      table.name,
    ),
  ],
);

export const studentProfilesTable = pgTable(
  "student_profiles",
  {
    id: serial("id").primaryKey(),
    clerkUserId: text("clerk_user_id").notNull().unique(),
    legalName: text("legal_name").notNull().default(""),
    dateOfBirth: date("date_of_birth", { mode: "string" }),
    gender: text("gender"),
    nationality: text("nationality").notNull().default("Pakistani"),
    phone: text("phone"),
    city: text("city"),
    province: text("province"),
    guardianName: text("guardian_name"),
    guardianPhone: text("guardian_phone"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
);

export const educationRecordsTable = pgTable(
  "education_records",
  {
    id: serial("id").primaryKey(),
    studentProfileId: integer("student_profile_id")
      .notNull()
      .references(() => studentProfilesTable.id, { onDelete: "cascade" }),
    level: text("level").notNull(),
    qualification: text("qualification").notNull(),
    institution: text("institution"),
    board: text("board"),
    completionYear: integer("completion_year"),
    marksObtained: real("marks_obtained"),
    marksTotal: real("marks_total"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("education_records_profile_id_idx").on(table.studentProfileId),
  ],
);

export const testScoresTable = pgTable(
  "test_scores",
  {
    id: serial("id").primaryKey(),
    studentProfileId: integer("student_profile_id")
      .notNull()
      .references(() => studentProfilesTable.id, { onDelete: "cascade" }),
    testName: text("test_name").notNull(),
    score: text("score"),
    testDate: date("test_date", { mode: "string" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("test_scores_profile_id_idx").on(table.studentProfileId)],
);

export const shortlistsTable = pgTable(
  "shortlists",
  {
    id: serial("id").primaryKey(),
    studentProfileId: integer("student_profile_id")
      .notNull()
      .references(() => studentProfilesTable.id, { onDelete: "cascade" }),
    programId: integer("program_id")
      .notNull()
      .references(() => programsTable.id, { onDelete: "cascade" }),
    savedAt: timestamp("saved_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("shortlists_profile_program_unique").on(
      table.studentProfileId,
      table.programId,
    ),
    index("shortlists_profile_saved_at_idx").on(
      table.studentProfileId,
      table.savedAt,
    ),
  ],
);

export const universitiesRelations = relations(
  universitiesTable,
  ({ many }) => ({ programs: many(programsTable) }),
);

export const programsRelations = relations(programsTable, ({ one, many }) => ({
  university: one(universitiesTable, {
    fields: [programsTable.universityId],
    references: [universitiesTable.id],
  }),
  shortlists: many(shortlistsTable),
}));

export const studentProfilesRelations = relations(
  studentProfilesTable,
  ({ many }) => ({
    education: many(educationRecordsTable),
    testScores: many(testScoresTable),
    shortlist: many(shortlistsTable),
  }),
);

export const educationRecordsRelations = relations(
  educationRecordsTable,
  ({ one }) => ({
    studentProfile: one(studentProfilesTable, {
      fields: [educationRecordsTable.studentProfileId],
      references: [studentProfilesTable.id],
    }),
  }),
);

export const testScoresRelations = relations(testScoresTable, ({ one }) => ({
  studentProfile: one(studentProfilesTable, {
    fields: [testScoresTable.studentProfileId],
    references: [studentProfilesTable.id],
  }),
}));

export const shortlistsRelations = relations(shortlistsTable, ({ one }) => ({
  studentProfile: one(studentProfilesTable, {
    fields: [shortlistsTable.studentProfileId],
    references: [studentProfilesTable.id],
  }),
  program: one(programsTable, {
    fields: [shortlistsTable.programId],
    references: [programsTable.id],
  }),
}));

export const insertUniversitySchema = createInsertSchema(
  universitiesTable,
).omit({ id: true, createdAt: true, updatedAt: true });
export const insertProgramSchema = createInsertSchema(programsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertStudentProfileSchema = createInsertSchema(
  studentProfilesTable,
).omit({ id: true, createdAt: true, updatedAt: true });
export const insertEducationRecordSchema = createInsertSchema(
  educationRecordsTable,
).omit({ id: true, createdAt: true });
export const insertTestScoreSchema = createInsertSchema(testScoresTable).omit({
  id: true,
  createdAt: true,
});
export const insertShortlistSchema = createInsertSchema(shortlistsTable).omit({
  id: true,
  savedAt: true,
});

export type University = typeof universitiesTable.$inferSelect;
export type Program = typeof programsTable.$inferSelect;
export type StudentProfile = typeof studentProfilesTable.$inferSelect;
export type EducationRecord = typeof educationRecordsTable.$inferSelect;
export type TestScore = typeof testScoresTable.$inferSelect;
export type Shortlist = typeof shortlistsTable.$inferSelect;
export type InsertUniversity = z.infer<typeof insertUniversitySchema>;
export type InsertProgram = z.infer<typeof insertProgramSchema>;
export type InsertStudentProfile = z.infer<typeof insertStudentProfileSchema>;
export type InsertEducationRecord = z.infer<typeof insertEducationRecordSchema>;
export type InsertTestScore = z.infer<typeof insertTestScoreSchema>;
export type InsertShortlist = z.infer<typeof insertShortlistSchema>;
