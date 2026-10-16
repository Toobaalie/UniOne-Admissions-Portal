import { asc, eq } from "drizzle-orm";
import { Router, type IRouter } from "express";
import {
  db,
  programsTable,
  universitiesTable,
} from "@workspace/db";
import {
  GetDiscoveryHighlightsResponse,
  GetUniversityParams,
  GetUniversityResponse,
  ListUniversitiesQueryParams,
  ListUniversitiesResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

function toUniversitySummary(
  university: typeof universitiesTable.$inferSelect,
  programs: (typeof programsTable.$inferSelect)[],
) {
  const fees = programs
    .map((program) => program.annualFeePkr)
    .filter((fee): fee is number => fee !== null);
  const deadlines = programs
    .map((program) => program.applicationDeadline)
    .filter((date): date is string => date !== null)
    .sort();

  return {
    id: university.id,
    slug: university.slug,
    name: university.name,
    shortName: university.shortName,
    city: university.city,
    description: university.description,
    website: university.website,
    fields: university.fields,
    programCount: programs.length,
    minAnnualFeePkr: fees.length ? Math.min(...fees) : null,
    deadlineDate: deadlines[0] ?? null,
    scholarshipAvailable: programs.some((program) => program.scholarshipAvailable),
    sampleData: university.sampleData,
  };
}

router.get("/discovery/highlights", async (_req, res): Promise<void> => {
  const universities = await db
    .select()
    .from(universitiesTable)
    .where(eq(universitiesTable.featured, true))
    .orderBy(asc(universitiesTable.name))
    .limit(6);
  const programs = await db.select().from(programsTable);
  const allUniversities = await db.select({ id: universitiesTable.id }).from(universitiesTable);

  const response = {
    featuredUniversities: universities.map((university) =>
      toUniversitySummary(
        university,
        programs.filter((program) => program.universityId === university.id),
      ),
    ),
    totalUniversities: allUniversities.length,
    sampleData: true,
  };

  res.json(GetDiscoveryHighlightsResponse.parse(response));
});

router.get("/universities", async (req, res): Promise<void> => {
  const parsed = ListUniversitiesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const {
    q,
    city,
    degreeLevel,
    field,
    feeMin,
    feeMax,
    deadlineBefore,
    scholarshipOnly,
    page,
    pageSize,
  } = parsed.data;
  const universities = await db
    .select()
    .from(universitiesTable)
    .orderBy(asc(universitiesTable.name));
  const programs = await db.select().from(programsTable);
  const term = q?.trim().toLocaleLowerCase() ?? "";
  const normalizedCity = city?.trim().toLocaleLowerCase() ?? "";
  const normalizedDegree = degreeLevel?.trim().toLocaleLowerCase() ?? "";
  const normalizedField = field?.trim().toLocaleLowerCase() ?? "";
  const hasProgramFilter =
    Boolean(normalizedDegree) ||
    Boolean(normalizedField) ||
    feeMin !== undefined ||
    feeMax !== undefined ||
    Boolean(deadlineBefore) ||
    scholarshipOnly === true;

  const matches = universities.flatMap((university) => {
    const universityPrograms = programs.filter(
      (program) => program.universityId === university.id,
    );
    const matchingPrograms = universityPrograms.filter((program) => {
      if (
        normalizedDegree &&
        program.degreeLevel.toLocaleLowerCase() !== normalizedDegree
      ) {
        return false;
      }
      if (
        normalizedField &&
        !program.field.toLocaleLowerCase().includes(normalizedField)
      ) {
        return false;
      }
      if (
        feeMin !== undefined &&
        (program.annualFeePkr === null || program.annualFeePkr < feeMin)
      ) {
        return false;
      }
      if (
        feeMax !== undefined &&
        (program.annualFeePkr === null || program.annualFeePkr > feeMax)
      ) {
        return false;
      }
      if (
        deadlineBefore &&
        (!program.applicationDeadline ||
          program.applicationDeadline > deadlineBefore)
      ) {
        return false;
      }
      if (scholarshipOnly && !program.scholarshipAvailable) {
        return false;
      }
      return true;
    });

    if (normalizedCity && !university.city.toLocaleLowerCase().includes(normalizedCity)) {
      return [];
    }
    if (hasProgramFilter && matchingPrograms.length === 0) {
      return [];
    }
    if (term) {
      const universityMatches = [
        university.name,
        university.shortName,
        university.city,
        university.description,
        ...university.fields,
      ]
        .join(" ")
        .toLocaleLowerCase()
        .includes(term);
      const programMatches = matchingPrograms.some((program) =>
        `${program.name} ${program.field}`.toLocaleLowerCase().includes(term),
      );
      if (!universityMatches && !programMatches) {
        return [];
      }
    }

    const visiblePrograms = hasProgramFilter ? matchingPrograms : universityPrograms;
    return [toUniversitySummary(university, visiblePrograms)];
  });

  const offset = (page - 1) * pageSize;
  const response = {
    items: matches.slice(offset, offset + pageSize),
    total: matches.length,
    page,
    pageSize,
  };

  res.json(ListUniversitiesResponse.parse(response));
});

router.get("/universities/:slug", async (req, res): Promise<void> => {
  const params = GetUniversityParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [university] = await db
    .select()
    .from(universitiesTable)
    .where(eq(universitiesTable.slug, params.data.slug));
  if (!university) {
    res.status(404).json({ error: "University not found" });
    return;
  }

  const programs = await db
    .select()
    .from(programsTable)
    .where(eq(programsTable.universityId, university.id))
    .orderBy(asc(programsTable.name));
  const response = {
    ...toUniversitySummary(university, programs),
    about: university.about,
    programs: programs.map((program) => ({
      id: program.id,
      universityId: program.universityId,
      universitySlug: university.slug,
      universityName: university.name,
      name: program.name,
      degreeLevel: program.degreeLevel,
      field: program.field,
      durationYears: program.durationYears,
      annualFeePkr: program.annualFeePkr,
      applicationDeadline: program.applicationDeadline,
      requirements: program.requirements,
      scholarshipAvailable: program.scholarshipAvailable,
      sampleData: program.sampleData,
    })),
  };

  res.json(GetUniversityResponse.parse(response));
});

export default router;
