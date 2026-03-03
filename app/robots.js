export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://docdigitize.vercel.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard",
          "/upload",
          "/documents",
          "/document/",
          "/api/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}