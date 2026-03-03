import "./globals.css";
import { AuthProvider } from "@/context/auth-context";
import { ThemeProvider } from "@/context/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { ConnectionStatus } from "@/components/shared/connection-status";

export const metadata = {
  title: {
    default: "DocDigitize — AI Document Scanner & Summarizer",
    template: "%s | DocDigitize",
  },
  description:
    "Turn physical documents into digital text with OCR and get AI-powered summaries. Built for students. Upload, extract, summarize in seconds.",
  keywords: [
    "OCR",
    "document scanner",
    "AI summarizer",
    "text extraction",
    "student tool",
    "document digitization",
    "study notes",
    "academic assistant",
  ],
  authors: [{ name: "David Erikefe-Dickson" }],
  openGraph: {
    title: "DocDigitize — AI Document Scanner & Summarizer",
    description:
      "Turn physical documents into digital text with OCR and get AI-powered summaries in seconds.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "DocDigitize — AI Document Scanner & Summarizer",
    description:
      "Turn physical documents into digital text with OCR and get AI-powered summaries in seconds.",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased overflow-x-hidden max-w-[100vw]">
        <ThemeProvider>
          <AuthProvider>
            <ConnectionStatus />
            {children}
            <Toaster position="top-right" richColors />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}