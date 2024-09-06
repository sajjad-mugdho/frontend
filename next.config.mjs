import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import createMDX from "@next/mdx";

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["js", "jsx", "mdx", "ts", "tsx"],
  redirects: async function redirects() {
    return [
      {
        source: "/courses/:course/lesson/:lesson/chapter/:chapter",
        destination: "/courses/:course/section/:lesson/lesson/:chapter",
        permanent: true,
      },
    ];
  },
};

const withMDX = createMDX({
  options: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypeRaw, rehypeSanitize],
  },
});

export default withMDX({ ...nextConfig });
