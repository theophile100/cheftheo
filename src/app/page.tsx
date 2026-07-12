import Link from "next/link";
import { buttonClasses } from "@/lib/button-styles";
import { Mascot } from "@/components/Mascot";
import { getServerTranslation } from "@/i18n/server";

export default async function Home() {
  const { t } = await getServerTranslation();

  return (
    <div className="flex min-h-screen flex-1 flex-col items-center justify-center gap-10 bg-cream px-6 py-12 dark:bg-black">
      <div className="flex flex-col items-center gap-5 text-center">
        <Mascot mood="idle" size={104} />
        <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          {t("landing.title")}
        </h1>
        <p className="max-w-xs text-lg text-zinc-600 dark:text-zinc-400">
          {t("landing.tagline")}
        </p>
      </div>

      <div className="flex w-full max-w-xs flex-col gap-4">
        <Link href="/inscription" className={buttonClasses("primary", "w-full")}>
          {t("landing.signup")}
        </Link>
        <Link href="/connexion" className={buttonClasses("secondary", "w-full")}>
          {t("landing.login")}
        </Link>
      </div>
    </div>
  );
}
