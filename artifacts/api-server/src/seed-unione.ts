import { db, pool, programsTable, universitiesTable } from "@workspace/db";
import { logger } from "./lib/logger";

const catalogue = [
  {
    slug: "nust",
    name: "National University of Sciences & Technology",
    shortName: "NUST",
    city: "Islamabad",
    description:
      "A research-led university offering programs across engineering, computing, business, and the sciences.",
    about:
      "NUST is a multi-campus university with its main campus in Islamabad. This catalogue entry is illustrative and should be confirmed with the university before applying.",
    website: "https://nust.edu.pk",
    fields: ["Engineering", "Computing", "Business"],
    featured: true,
    programs: [
      {
        name: "BS Computer Science",
        degreeLevel: "Undergraduate",
        field: "Computing",
        durationYears: 4,
        annualFeePkr: 285000,
        applicationDeadline: "2027-01-20",
        requirements: ["Higher Secondary Certificate", "NUST entry test"],
        scholarshipAvailable: true,
      },
      {
        name: "BE Electrical Engineering",
        degreeLevel: "Undergraduate",
        field: "Engineering",
        durationYears: 4,
        annualFeePkr: 295000,
        applicationDeadline: "2027-01-20",
        requirements: ["Higher Secondary Certificate", "NUST entry test"],
        scholarshipAvailable: true,
      },
    ],
  },
  {
    slug: "lums",
    name: "Lahore University of Management Sciences",
    shortName: "LUMS",
    city: "Lahore",
    description:
      "A private university with programs in business, computing, humanities, law, and sciences.",
    about:
      "LUMS is a private university in Lahore. Program fees and dates here are sample catalogue data and are not an official admissions notice.",
    website: "https://lums.edu.pk",
    fields: ["Business", "Computing", "Social Sciences"],
    featured: true,
    programs: [
      {
        name: "BS Computer Science",
        degreeLevel: "Undergraduate",
        field: "Computing",
        durationYears: 4,
        annualFeePkr: 650000,
        applicationDeadline: "2027-02-05",
        requirements: ["Higher Secondary Certificate", "Admission test"],
        scholarshipAvailable: true,
      },
      {
        name: "BSc (Honours) Economics",
        degreeLevel: "Undergraduate",
        field: "Social Sciences",
        durationYears: 4,
        annualFeePkr: 620000,
        applicationDeadline: "2027-02-05",
        requirements: ["Higher Secondary Certificate", "Admission test"],
        scholarshipAvailable: true,
      },
    ],
  },
  {
    slug: "fast-islamabad",
    name: "National University of Computer and Emerging Sciences",
    shortName: "FAST-NUCES",
    city: "Islamabad",
    description:
      "A university known for computing, engineering, business, and applied sciences.",
    about:
      "This sample FAST-NUCES listing represents the Islamabad campus. Confirm campus-specific programs, eligibility, fees, and deadlines on the official website.",
    website: "https://www.nu.edu.pk",
    fields: ["Computing", "Engineering", "Business"],
    featured: true,
    programs: [
      {
        name: "BS Artificial Intelligence",
        degreeLevel: "Undergraduate",
        field: "Computing",
        durationYears: 4,
        annualFeePkr: 320000,
        applicationDeadline: "2027-01-15",
        requirements: ["Higher Secondary Certificate", "FAST admission test"],
        scholarshipAvailable: false,
      },
      {
        name: "BS Software Engineering",
        degreeLevel: "Undergraduate",
        field: "Computing",
        durationYears: 4,
        annualFeePkr: 320000,
        applicationDeadline: "2027-01-15",
        requirements: ["Higher Secondary Certificate", "FAST admission test"],
        scholarshipAvailable: false,
      },
    ],
  },
  {
    slug: "university-of-the-punjab",
    name: "University of the Punjab",
    shortName: "Punjab University",
    city: "Lahore",
    description:
      "A public university with a broad range of programs in sciences, arts, business, and technology.",
    about:
      "The University of the Punjab offers programs across multiple faculties. This example listing is for demonstration and is not an official admissions announcement.",
    website: "https://pu.edu.pk",
    fields: ["Sciences", "Business", "Computing"],
    featured: true,
    programs: [
      {
        name: "BS Information Technology",
        degreeLevel: "Undergraduate",
        field: "Computing",
        durationYears: 4,
        annualFeePkr: 145000,
        applicationDeadline: "2027-01-10",
        requirements: ["Higher Secondary Certificate", "Department criteria"],
        scholarshipAvailable: true,
      },
      {
        name: "BS Chemistry",
        degreeLevel: "Undergraduate",
        field: "Sciences",
        durationYears: 4,
        annualFeePkr: 135000,
        applicationDeadline: "2027-01-10",
        requirements: ["Higher Secondary Certificate", "Department criteria"],
        scholarshipAvailable: true,
      },
    ],
  },
  {
    slug: "aga-khan-university",
    name: "Aga Khan University",
    shortName: "AKU",
    city: "Karachi",
    description:
      "An international university with a strong focus on health sciences and education.",
    about:
      "Aga Khan University has its main Pakistan campus in Karachi. Sample program details are included for discovery-demo purposes only.",
    website: "https://www.aku.edu",
    fields: ["Health Sciences", "Education"],
    featured: true,
    programs: [
      {
        name: "Bachelor of Science in Nursing",
        degreeLevel: "Undergraduate",
        field: "Health Sciences",
        durationYears: 4,
        annualFeePkr: 480000,
        applicationDeadline: "2027-02-01",
        requirements: ["Higher Secondary Certificate", "Selection assessment"],
        scholarshipAvailable: true,
      },
      {
        name: "MBBS",
        degreeLevel: "Undergraduate",
        field: "Health Sciences",
        durationYears: 5,
        annualFeePkr: 1900000,
        applicationDeadline: "2027-02-01",
        requirements: ["Higher Secondary Certificate", "MDCAT", "Interview"],
        scholarshipAvailable: true,
      },
    ],
  },
  {
    slug: "iba-karachi",
    name: "Institute of Business Administration, Karachi",
    shortName: "IBA Karachi",
    city: "Karachi",
    description:
      "A university offering undergraduate and graduate programs in business, economics, and computing.",
    about:
      "IBA Karachi is a public-sector degree-awarding institution. Fees and application details in this demo listing are illustrative and must be verified.",
    website: "https://www.iba.edu.pk",
    fields: ["Business", "Economics", "Computing"],
    featured: false,
    programs: [
      {
        name: "BBA",
        degreeLevel: "Undergraduate",
        field: "Business",
        durationYears: 4,
        annualFeePkr: 520000,
        applicationDeadline: "2027-01-25",
        requirements: ["Higher Secondary Certificate", "IBA admission test"],
        scholarshipAvailable: true,
      },
      {
        name: "BS Computer Science",
        degreeLevel: "Undergraduate",
        field: "Computing",
        durationYears: 4,
        annualFeePkr: 510000,
        applicationDeadline: "2027-01-25",
        requirements: ["Higher Secondary Certificate", "IBA admission test"],
        scholarshipAvailable: true,
      },
    ],
  },
  {
    slug: "comsats-islamabad",
    name: "COMSATS University Islamabad",
    shortName: "COMSATS",
    city: "Islamabad",
    description:
      "A multi-campus public university with programs in computing, engineering, and sciences.",
    about:
      "COMSATS University has campuses across Pakistan. This sample directory item represents Islamabad and should be checked against current campus admissions.",
    website: "https://www.comsats.edu.pk",
    fields: ["Computing", "Engineering", "Sciences"],
    featured: true,
    programs: [
      {
        name: "BS Data Science",
        degreeLevel: "Undergraduate",
        field: "Computing",
        durationYears: 4,
        annualFeePkr: 230000,
        applicationDeadline: "2027-01-18",
        requirements: ["Higher Secondary Certificate", "NTS or campus test"],
        scholarshipAvailable: true,
      },
      {
        name: "BS Electrical Engineering",
        degreeLevel: "Undergraduate",
        field: "Engineering",
        durationYears: 4,
        annualFeePkr: 240000,
        applicationDeadline: "2027-01-18",
        requirements: ["Higher Secondary Certificate", "NTS or campus test"],
        scholarshipAvailable: true,
      },
    ],
  },
  {
    slug: "uet-lahore",
    name: "University of Engineering and Technology, Lahore",
    shortName: "UET Lahore",
    city: "Lahore",
    description:
      "A public engineering university with programs in engineering, architecture, and computing.",
    about:
      "UET Lahore offers engineering and technology programs. This sample listing is not a current or official admissions prospectus.",
    website: "https://uet.edu.pk",
    fields: ["Engineering", "Computing", "Architecture"],
    featured: false,
    programs: [
      {
        name: "BSc Electrical Engineering",
        degreeLevel: "Undergraduate",
        field: "Engineering",
        durationYears: 4,
        annualFeePkr: 210000,
        applicationDeadline: "2027-01-12",
        requirements: ["Higher Secondary Certificate", "ECAT"],
        scholarshipAvailable: true,
      },
      {
        name: "BSc Computer Science",
        degreeLevel: "Undergraduate",
        field: "Computing",
        durationYears: 4,
        annualFeePkr: 195000,
        applicationDeadline: "2027-01-12",
        requirements: ["Higher Secondary Certificate", "ECAT"],
        scholarshipAvailable: true,
      },
    ],
  },
  {
    slug: "university-of-karachi",
    name: "University of Karachi",
    shortName: "University of Karachi",
    city: "Karachi",
    description:
      "A public research university with faculties spanning science, business, arts, and social sciences.",
    about:
      "The University of Karachi is a large public university in Karachi. This entry uses sample program values for the UniOne first-phase catalogue.",
    website: "https://uok.edu.pk",
    fields: ["Sciences", "Business", "Social Sciences"],
    featured: false,
    programs: [
      {
        name: "BS Biotechnology",
        degreeLevel: "Undergraduate",
        field: "Sciences",
        durationYears: 4,
        annualFeePkr: 125000,
        applicationDeadline: "2027-01-08",
        requirements: ["Higher Secondary Certificate", "Department criteria"],
        scholarshipAvailable: true,
      },
      {
        name: "BS Public Administration",
        degreeLevel: "Undergraduate",
        field: "Social Sciences",
        durationYears: 4,
        annualFeePkr: 115000,
        applicationDeadline: "2027-01-08",
        requirements: ["Higher Secondary Certificate", "Department criteria"],
        scholarshipAvailable: true,
      },
    ],
  },
  {
    slug: "giki",
    name: "Ghulam Ishaq Khan Institute of Engineering Sciences and Technology",
    shortName: "GIKI",
    city: "Swabi",
    description:
      "A residential engineering and technology institute with programs in computing and engineering.",
    about:
      "GIKI is based in Topi, Swabi District. The program and fee information here is a demonstration sample, not an official prospectus.",
    website: "https://giki.edu.pk",
    fields: ["Engineering", "Computing"],
    featured: false,
    programs: [
      {
        name: "BS Computer Engineering",
        degreeLevel: "Undergraduate",
        field: "Computing",
        durationYears: 4,
        annualFeePkr: 720000,
        applicationDeadline: "2027-02-12",
        requirements: ["Higher Secondary Certificate", "GIKI admission test"],
        scholarshipAvailable: true,
      },
      {
        name: "BS Mechanical Engineering",
        degreeLevel: "Undergraduate",
        field: "Engineering",
        durationYears: 4,
        annualFeePkr: 720000,
        applicationDeadline: "2027-02-12",
        requirements: ["Higher Secondary Certificate", "GIKI admission test"],
        scholarshipAvailable: true,
      },
    ],
  },
] as const;

async function seed(): Promise<void> {
  let programCount = 0;

  for (const university of catalogue) {
    const [savedUniversity] = await db
      .insert(universitiesTable)
      .values({
        slug: university.slug,
        name: university.name,
        shortName: university.shortName,
        city: university.city,
        description: university.description,
        about: university.about,
        website: university.website,
        fields: [...university.fields],
        featured: university.featured,
        sampleData: true,
      })
      .onConflictDoUpdate({
        target: universitiesTable.slug,
        set: {
          name: university.name,
          shortName: university.shortName,
          city: university.city,
          description: university.description,
          about: university.about,
          website: university.website,
          fields: [...university.fields],
          featured: university.featured,
          sampleData: true,
        },
      })
      .returning({ id: universitiesTable.id });

    if (!savedUniversity) {
      throw new Error(`Unable to seed university "${university.slug}"`);
    }

    for (const program of university.programs) {
      await db
        .insert(programsTable)
        .values({
          ...program,
          requirements: [...program.requirements],
          universityId: savedUniversity.id,
          sampleData: true,
        })
        .onConflictDoUpdate({
          target: [programsTable.universityId, programsTable.name],
          set: {
            degreeLevel: program.degreeLevel,
            field: program.field,
            durationYears: program.durationYears,
            annualFeePkr: program.annualFeePkr,
            applicationDeadline: program.applicationDeadline,
            requirements: [...program.requirements],
            scholarshipAvailable: program.scholarshipAvailable,
            sampleData: true,
          },
        });
      programCount += 1;
    }
  }

  logger.info(
    { universityCount: catalogue.length, programCount },
    "UniOne sample catalogue seeded",
  );
}

seed()
  .catch((err: unknown) => {
    logger.error({ err }, "Unable to seed UniOne catalogue");
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
