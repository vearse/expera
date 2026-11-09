import type { Metadata, Viewport } from "next";
import { Hanken_Grotesk, Sora } from "next/font/google";
import { loadTeacherMessages } from "@/lib/content/teacherMessages";
import { TeacherVoiceProvider } from "@/lib/teacherVoice/TeacherVoiceProvider";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
});

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Expera | Interactive STEM virtual laboratories",
  description:
    "Explore, experiment, practise and prepare with virtual science labs aligned to Nigerian curriculum science — WAEC, NECO, JAMB and BECE contexts.",
  icons: {
    icon: [{ url: "/brand/icon.png", type: "image/png" }],
    apple: "/brand/icon.png",
  },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const teacherVoice = loadTeacherMessages();

  return (
    <html lang="en-GB" className={`${sora.variable} ${hanken.variable}`}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen antialiased">
        <TeacherVoiceProvider catalog={teacherVoice}>{children}</TeacherVoiceProvider>
      </body>
    </html>
  );
}
