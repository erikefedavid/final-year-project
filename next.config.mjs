/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["tesseract.js", "sharp", "unpdf", "mammoth"],
};

export default nextConfig;