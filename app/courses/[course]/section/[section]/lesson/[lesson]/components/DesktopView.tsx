import { Box } from "@chakra-ui/react";
import { MDXRemote } from "next-mdx-remote/rsc";

import { MDXComponents, Navbar } from "@/components";

import { getLessonPageData } from "../helpers";

import { EditorComponents } from "./EditorComponents";

const DesktopView = ({
  lessonPageData,
}: {
  lessonPageData: Awaited<ReturnType<typeof getLessonPageData>>;
}) => (
  <Box display={{ base: "none", md: "block" }}>
    <Navbar
      cta={false}
      feedbackUrl={lessonPageData.feedbackUrl}
      isLessonInterface={true}
    />
    <EditorComponents
      editorContent={lessonPageData.startingFiles}
      mdxContent={
        <MDXRemote
          components={MDXComponents}
          source={lessonPageData.lessonData.content ?? ""}
        />
      }
      readOnly={lessonPageData.readOnly}
      showHints={!lessonPageData.readOnly}
      solution={lessonPageData.solution}
    />
  </Box>
);

export { DesktopView };