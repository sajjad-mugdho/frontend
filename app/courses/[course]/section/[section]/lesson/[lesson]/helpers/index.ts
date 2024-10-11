import {
  QUERY_ALL_SECTIONS,
  QUERY_COURSE_INFORMATION,
  QUERY_LESSON_INFORMATION,
  QUERY_SECTION_INFORMATION,
} from "@/app/courses/[course]/queries";
import { CourseDetails } from "@/app/courses/[course]/types";
import { getContentfulData } from "@/lib/api/contentful";
import { Section, TypeFile, Lesson } from "@/lib/types";

const getCourseData = async (courseSlug: string) =>
  await getContentfulData<"courseModuleCollection", CourseDetails>(
    QUERY_COURSE_INFORMATION,
    "courseModuleCollection",
    { courseSlug },
    "items.0",
  );

const getSectionData = async (courseSlug: string, sectionIndex: number) => {
  const result: Section[] = await getContentfulData<
    "courseModuleCollection",
    Section[]
  >(
    QUERY_SECTION_INFORMATION,
    "courseModuleCollection",
    {
      courseSlug,
      sectionIndex,
    },
    "items.0.sectionsCollection",
  );

  return result[0];
};

const getAllSections = async (courseSlug: string) => {
  const result = await getContentfulData<"courseModuleCollection", Section[]>(
    QUERY_ALL_SECTIONS,
    "courseModuleCollection",
    { courseSlug },
    "items.0.sectionsCollection.items",
  );

  return result;
};

const getLessonData = async (
  courseSlug: string,
  sectionIndex: number,
  lessonIndex: number,
) => {
  const result: Lesson[] = await getContentfulData<
    "courseModuleCollection",
    Lesson[]
  >(
    QUERY_LESSON_INFORMATION,
    "courseModuleCollection",
    {
      courseSlug,
      sectionIndex,
      lessonIndex,
    },
    "items.0.sectionsCollection.items.0.lessonsCollection",
  );

  return result[0];
};

const constructFeedbackUrl = (
  githubUrl: string,
  course: string,
  section: string,
  lesson: string,
  lessonTitle: string,
) => {
  const encodedTitle = encodeURIComponent(`
    Dot Code School Suggestion: Feedback for Section ${section} - Lesson ${lesson}: ${lessonTitle}`);

  return `${githubUrl}/issues/new?assignees=&labels=feedback&template=feedback.md&title=${encodedTitle}`;
};

const getStartingFiles = (lesson: Lesson) => {
  const startingFiles: TypeFile[] = lesson.files?.sourceCollection
    ? lesson.files.sourceCollection.items.map((file) => {
        startingFiles.push({
          fileName: file?.title ?? "",
          code: "TODO",
          language: file?.fileName?.split(".").pop() ?? "rust",
        });
      })
    : lesson.files?.templateCollection?.items.map((file) => {
        startingFiles.push({
          fileName: file?.title ?? "",
          code: "TODO",
          language: file?.fileName?.split(".").pop() ?? "rust",
        });
      });

  return startingFiles;
};

const getSolutionFiles = (lesson: Lesson) => {
  const collection = lesson.files?.solutionCollection;
  const solutionFiles: TypeFile[] =
    collection && collection.items.length > 0
      ? collection.items.map((file) => ({
          fileName: file?.title ?? "",
          code: "TODO",
          language: file?.fileName?.split(".").pop() ?? "rust",
        }))
      : [];

  return solutionFiles;
};

const getNavigation = async (
  course: string,
  sectionIndex: number,
  lessonIndex: number,
  sectionData: Pick<Section, "lessonsCollection">,
  courseData: CourseDetails,
) => {
  const previousSectionData = await getSectionData(course, sectionIndex - 1);
  const prev = getPreviousNavigation(
    course,
    sectionIndex,
    lessonIndex,
    sectionData,
    previousSectionData,
  );
  const next = getNextNavigation(
    course,
    sectionIndex,
    lessonIndex,
    sectionData,
    courseData,
  );

  return { prev, next };
};

const getPreviousNavigation = (
  course: string,
  sectionIndex: number,
  lessonIndex: number,
  sectionData: Pick<Section, "lessonsCollection">,
  previousSectionData?: Pick<Section, "lessonsCollection">,
) => {
  const total = sectionData.lessonsCollection?.total;

  if (!total) {
    return undefined;
  }

  if (lessonIndex > 0) {
    return `${course}/section/${sectionIndex + 1}/lesson/${lessonIndex}`;
  } else if (sectionIndex > 0) {
    const prevTotal = previousSectionData?.lessonsCollection?.total;
    const previousSectionTotal = prevTotal ?? 0;

    return `${course}/section/${sectionIndex}/lesson/${previousSectionTotal}`;
  }

  return undefined;
};

const getNextNavigation = (
  course: string,
  sectionIndex: number,
  lessonIndex: number,
  sectionData: Pick<Section, "lessonsCollection">,
  courseData: CourseDetails,
) => {
  const total = sectionData.lessonsCollection?.total;
  if (!total) {
    return undefined;
  }

  if (lessonIndex < total - 1) {
    return `${course}/section/${sectionIndex + 1}/lesson/${lessonIndex + 2}`;
  } else if (sectionIndex < (courseData.sectionsCollection?.total ?? 0) - 1) {
    return `${course}/section/${sectionIndex + 2}/lesson/1`;
  }

  return undefined;
};

const getLessonPageData = async (params: {
  course: string;
  section: string;
  lesson: string;
}) => {
  const { course, section, lesson } = params;
  const sectionIndex = parseInt(section) - 1;
  const lessonIndex = parseInt(lesson) - 1;

  const courseData = await getCourseData(course);
  const sectionData = await getSectionData(course, sectionIndex);
  const lessonData = await getLessonData(course, sectionIndex, lessonIndex);

  const startingFiles = getStartingFiles(lessonData);
  const solution = getSolutionFiles(lessonData);
  const readOnly = solution.length === 0;

  const feedbackUrl = constructFeedbackUrl(
    courseData.githubUrl ?? "https://github.com/dotcodeschool/frontend",
    course,
    section,
    lesson,
    lessonData.title ?? "",
  );

  const { prev, next } = await getNavigation(
    course,
    sectionIndex,
    lessonIndex,
    sectionData,
    courseData,
  );

  const allSections = await getAllSections(course);

  return {
    lessonData,
    startingFiles,
    solution,
    readOnly,
    feedbackUrl,
    prev,
    next,
    sections: allSections,
  };
};

export { getCourseData, getLessonData, getLessonPageData, getSectionData };
