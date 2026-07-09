"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { buttonClasses } from "@/lib/button-styles";

const inputClasses =
  "rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3.5 text-base text-zinc-900 outline-none transition-colors focus:border-orange-400 focus:bg-white dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50";

export function ProfileEditForm({
  initialCountry,
  initialPhone,
  countries,
}: {
  initialCountry: string;
  initialPhone: string;
  countries: string[];
}) {
  const [country, setCountry] = useState(initialCountry);
  const [phone, setPhone] = useState(initialPhone);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSaving(false);
      setError("Vous n'êtes plus connecté.");
      return;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ country, phone })
      .eq("id", user.id);

    setSaving(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setSavedAt(Date.now());
    setTimeout(() => setSavedAt(null), 3000);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-3xl bg-white p-5 shadow-lg shadow-zinc-900/5 dark:bg-zinc-900"
    >
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          Pays
        </label>
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className={inputClasses}
        >
          <option value="" disabled>
            Sélectionnez votre pays
          </option>
          {countries.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          Numéro de téléphone
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="06 12 34 56 78"
          className={inputClasses}
        />
      </div>

      {error && (
        <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
          {error}
        </p>
      )}

      {savedAt && (
        <p className="animate-fade-up rounded-2xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-300">
          Modifications enregistrées !
        </p>
      )}

      <button type="submit" disabled={saving} className={buttonClasses("primary")}>
        {saving ? "Enregistrement..." : "Enregistrer les modifications"}
      </button>
    </form>
  );
}
