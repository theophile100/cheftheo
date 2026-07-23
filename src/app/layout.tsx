import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { SoundSettingsProvider } from "@/lib/sound-settings";
import { LogoProvider } from "@/lib/logo-context";
import { TapFeedback } from "@/components/TapFeedback";
import { BackForwardRefresh } from "@/components/BackForwardRefresh";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { createClient } from "@/lib/supabase/server";
import { getServerTranslation } from "@/i18n/server";
import { I18nProvider } from "@/lib/i18n-context";
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
  metadataBase: new URL("https://www.cheftheo.space"),
  title: "Chef Théo",
  description: "Application d'apprentissage Chef Théo",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Chef Théo",
  },
  openGraph: {
    title: "Chef Théo",
    description: "Apprenez les métiers de l'hôtellerie et de la restauration, leçon par leçon.",
    siteName: "Chef Théo",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Chef Théo",
    description: "Apprenez les métiers de l'hôtellerie et de la restauration, leçon par leçon.",
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
    return data?.logo_url || "/mascot.png";
  } catch {
    return "/mascot.png";
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const logoUrl = await getLogoUrl();
  const { locale, dir, dict } = await getServerTranslation();

  return (
    <html
      lang={locale}
      dir={dir}
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
        <I18nProvider locale={locale} dict={dict}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <LogoProvider url={logoUrl}>
              <SoundSettingsProvider>
                <TapFeedback />
                <BackForwardRefresh />
                <ServiceWorkerRegister />
                {children}
              </SoundSettingsProvider>
            </LogoProvider>
          </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
