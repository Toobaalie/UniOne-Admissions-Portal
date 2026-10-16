import { getAuth } from "@clerk/express";
import { and, desc, eq } from "drizzle-orm";
import { Router, type IRouter, type Request, type Response } from "express";
import {
  db,
  educationRecordsTable,
  programsTable,
  shortlistsTable,
  studentProfilesTable,
  testScoresTable,
  universitiesTable,
} from "@workspace/db";
import {
  AddProgramToShortlistParams,
  AddProgramToShortlistResponse,
  GetStudentProfileResponse,
  ListShortlistResponse,
  RemoveProgramFromShortlistParams,
  SaveStudentProfileBody,
  SaveStudentProfileResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

function toCalendarDate(
  value: Date | string | null | undefined,
): string | null | undefined {
  if (value == null) return value;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return value;
}

function signedInUserId(req: Request, res: Response): string | null {
  const userId = getAuth(req).userId;
  if (!userId) {
    res.status(401).json({ error: "Sign in to access your student account." });
    return null;
  }
  return userId;
}

async function ensureStudentProfile(clerkUserId: string) {
  const [created] = await db
    .insert(studentProfilesTable)
    .values({ clerkUserId })
    .onConflictDoNothing({ target: studentProfilesTable.clerkUserId })
    .returning();

  if (created) {
    return created;
  }

  const [existing] = await db
    .select()
    .from(studentProfilesTable)
    .where(eq(studentProfilesTable.clerkUserId, clerkUserId));

  if (!existing) {
    throw new Error("Unable to load the signed-in student's profile.");
  }
  return existing;
}

async function getProfileResponse(clerkUserId: string) {
  const profile = await ensureStudentProfile(clerkUserId);
  const [education, testScores] = await Promise.all([
    db
      .select()
      .from(educationRecordsTable)
      .where(eq(educationRecordsTable.studentProfileId, profile.id))
      .orderBy(educationRecordsTable.id),
    db
      .select()
      .from(testScoresTable)
      .where(eq(testScoresTable.studentProfileId, profile.id))
      .orderBy(testScoresTable.id),
  ]);
  const completionFields = [
    profile.legalName.trim(),
    profile.dateOfBirth,
    profile.gender,
    profile.nationality.trim(),
    profile.phone,
    profile.city,
    profile.province,
    profile.guardianName,
    profile.guardianPhone,
    education.length ? "education" : "",
    testScores.length ? "test-scores" : "",
  ];

  return GetStudentProfileResponse.parse({
    legalName: profile.legalName,
    dateOfBirth: profile.dateOfBirth,
    gender: profile.gender,
    nationality: profile.nationality,
    phone: profile.phone,
    city: profile.city,
    province: profile.province,
    guardianName: profile.guardianName,
    guardianPhone: profile.guardianPhone,
    education: education.map((record) => ({
      level: record.level,
      qualification: record.qualification,
      institution: record.institution,
      board: record.board,
      completionYear: record.completionYear,
      marksObtained: record.marksObtained,
      marksTotal: record.marksTotal,
    })),
    testScores: testScores.map((record) => ({
      testName: record.testName,
      score: record.score,
      testDate: record.testDate,
    })),
    completionPercent: Math.round(
      (completionFields.filter(Boolean).length / completionFields.length) * 100,
    ),
    updatedAt: profile.updatedAt.toISOString(),
  });
}

router.get("/student/profile", async (req, res): Promise<void> => {
  const clerkUserId = signedInUserId(req, res);
  if (!clerkUserId) return;

  const profile = await getProfileResponse(clerkUserId);
  res.json(profile);
});

router.put("/student/profile", async (req, res): Promise<void> => {
  const clerkUserId = signedInUserId(req, res);
  if (!clerkUserId) return;

  const parsed = SaveStudentProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const existing = await ensureStudentProfile(clerkUserId);
  await db.transaction(async (tx) => {
    await tx
      .update(studentProfilesTable)
      .set({
        legalName: parsed.data.legalName,
        dateOfBirth: toCalendarDate(parsed.data.dateOfBirth),
        gender: parsed.data.gender,
        nationality: parsed.data.nationality,
        phone: parsed.data.phone,
        city: parsed.data.city,
        province: parsed.data.province,
        guardianName: parsed.data.guardianName,
        guardianPhone: parsed.data.guardianPhone,
        updatedAt: new Date(),
      })
      .where(eq(studentProfilesTable.id, existing.id));

    await tx
      .delete(educationRecordsTable)
      .where(eq(educationRecordsTable.studentProfileId, existing.id));
    if (parsed.data.education.length) {
      await tx.insert(educationRecordsTable).values(
        parsed.data.education.map((record) => ({
          ...record,
          studentProfileId: existing.id,
        })),
      );
    }

    await tx
      .delete(testScoresTable)
      .where(eq(testScoresTable.studentProfileId, existing.id));
    if (parsed.data.testScores.length) {
      await tx.insert(testScoresTable).values(
        parsed.data.testScores.map((record) => ({
          ...record,
          testDate: toCalendarDate(record.testDate),
          studentProfileId: existing.id,
        })),
      );
    }
  });

  const profile = await getProfileResponse(clerkUserId);
  res.json(SaveStudentProfileResponse.parse(profile));
});

router.get("/student/shortlist", async (req, res): Promise<void> => {
  const clerkUserId = signedInUserId(req, res);
  if (!clerkUserId) return;

  const profile = await ensureStudentProfile(clerkUserId);
  const rows = await db
    .select({
      programId: programsTable.id,
      programName: programsTable.name,
      universitySlug: universitiesTable.slug,
      universityName: universitiesTable.name,
      city: universitiesTable.city,
      degreeLevel: programsTable.degreeLevel,
      field: programsTable.field,
      annualFeePkr: programsTable.annualFeePkr,
      applicationDeadline: programsTable.applicationDeadline,
      scholarshipAvailable: programsTable.scholarshipAvailable,
      sampleData: programsTable.sampleData,
      savedAt: shortlistsTable.savedAt,
    })
    .from(shortlistsTable)
    .innerJoin(programsTable, eq(shortlistsTable.programId, programsTable.id))
    .innerJoin(
      universitiesTable,
      eq(programsTable.universityId, universitiesTable.id),
    )
    .where(eq(shortlistsTable.studentProfileId, profile.id))
    .orderBy(desc(shortlistsTable.savedAt));

  res.json(
    ListShortlistResponse.parse(
      rows.map((row) => ({ ...row, savedAt: row.savedAt.toISOString() })),
    ),
  );
});

router.put("/student/shortlist/:programId", async (req, res): Promise<void> => {
  const clerkUserId = signedInUserId(req, res);
  if (!clerkUserId) return;

  const params = AddProgramToShortlistParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [program] = await db
    .select({ id: programsTable.id })
    .from(programsTable)
    .where(eq(programsTable.id, params.data.programId));
  if (!program) {
    res.status(404).json({ error: "Program not found" });
    return;
  }

  const profile = await ensureStudentProfile(clerkUserId);
  await db
    .insert(shortlistsTable)
    .values({ studentProfileId: profile.id, programId: program.id })
    .onConflictDoNothing({
      target: [shortlistsTable.studentProfileId, shortlistsTable.programId],
    });

  const [item] = await db
    .select({
      programId: programsTable.id,
      programName: programsTable.name,
      universitySlug: universitiesTable.slug,
      universityName: universitiesTable.name,
      city: universitiesTable.city,
      degreeLevel: programsTable.degreeLevel,
      field: programsTable.field,
      annualFeePkr: programsTable.annualFeePkr,
      applicationDeadline: programsTable.applicationDeadline,
      scholarshipAvailable: programsTable.scholarshipAvailable,
      sampleData: programsTable.sampleData,
      savedAt: shortlistsTable.savedAt,
    })
    .from(shortlistsTable)
    .innerJoin(programsTable, eq(shortlistsTable.programId, programsTable.id))
    .innerJoin(
      universitiesTable,
      eq(programsTable.universityId, universitiesTable.id),
    )
    .where(
      and(
        eq(shortlistsTable.studentProfileId, profile.id),
        eq(shortlistsTable.programId, program.id),
      ),
    );

  if (!item) {
    res.status(500).json({ error: "Unable to save this program." });
    return;
  }

  res.json(
    AddProgramToShortlistResponse.parse({
      ...item,
      savedAt: item.savedAt.toISOString(),
    }),
  );
});

router.delete(
  "/student/shortlist/:programId",
  async (req, res): Promise<void> => {
    const clerkUserId = signedInUserId(req, res);
    if (!clerkUserId) return;

    const params = RemoveProgramFromShortlistParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }

    const [program] = await db
      .select({ id: programsTable.id })
      .from(programsTable)
      .where(eq(programsTable.id, params.data.programId));
    if (!program) {
      res.status(404).json({ error: "Program not found" });
      return;
    }

    const profile = await ensureStudentProfile(clerkUserId);
    await db
      .delete(shortlistsTable)
      .where(
        and(
          eq(shortlistsTable.studentProfileId, profile.id),
          eq(shortlistsTable.programId, program.id),
        ),
      );
    res.sendStatus(204);
  },
);

export default router;
