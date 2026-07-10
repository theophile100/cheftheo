import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { SoundSettingsProvider } from "@/lib/sound-settings";
import { LogoProvider } from "@/lib/logo-context";
import { TapFeedback } from "@/components/TapFeedback";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { createClient } from "@/lib/supabase/server";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Chef Théo",
  description: "Application d'apprentissage Chef Théo",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Chef Théo",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbf7f0" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

async function getLogoUrl(): Promise<string> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("app_settings")
      .select("logo_url")
      .eq("id", 1)
      .single();
    return data?.logo_url || "/logo.svg";
  } catch {
    return "/logo.svg";
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const logoUrl = await getLogoUrl();

  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Nom standardise deja couvert par metadata.appleWebApp ; celui-ci
            en plus pour les anciennes versions de Safari iOS (<16.4) qui ne
            reconnaissent que le nom prefixe "apple-". */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <LogoProvider url={logoUrl}>
            <SoundSettingsProvider>
              <TapFeedback />
              <ServiceWorkerRegister />
              {children}
            </SoundSettingsProvider>
          </LogoProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
