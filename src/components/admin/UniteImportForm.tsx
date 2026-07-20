"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  previewUniteImport,
  commitUniteImport,
  previewZipUniteImport,
  commitZipUniteImport,
  type UniteImportPreview,
  type UniteImportResult,
  type ZipUniteImportPreview,
  type ZipUniteImportResult,
} from "@/app/admin/actions";
import {
  FiliereScopeFields,
  type FiliereScope,
} from "@/components/admin/FiliereScopeFields";
import { ImportSourceInput } from "@/components/admin/ImportSourceInput";
import { buttonClasses } from "@/lib/button-styles";
import { courseLanguageLabel } from "@/lib/course-languages";

function looksLikeJson(text: string): boolean {
  const trimmed = text.trim();
  return trimmed.startsWith("{") || trimmed.startsWith("[");
}

const NIVEAU_DIFFICULTE_LABELS: Record<string, string> = {
  debutant: "Débutant",
  intermediaire: "Intermédiaire",
  avance: "Avancé",
};

interface Filiere {
  id: string;
  slug: string;
  name: string;
}

type Step = "form" | "preview" | "result";

export function UniteImportForm({ filieres }: { filieres: Filiere[] }) {
  const router = useRouter();
  const [scope, setScope] = useState<FiliereScope | null>(null);
  const [fileText, setFileText] = useState<string | null>(null);
  const [zipBase64, setZipBase64] = useState<string | null>(null);
  const [zipFilename, setZipFilename] = useState<string | null>(null);
  const [csvUniteTitle, setCsvUniteTitle] = useState("");
  const [step, setStep] = useState<Step>("form");
  const [preview, setPreview] = useState<UniteImportPreview | null>(null);
  const [zipPreview, setZipPreview] = useState<ZipUniteImportPreview | null>(null);
  const [result, setResult] = useState<UniteImportResult | null>(null);
  const [zipResult, setZipResult] = useState<ZipUniteImportResult | null>(null);
  const [loading, setLoading] = useState(false);

  const isZip = !!zipBase64;
  // Un ZIP ne contient que du JSON (chaque fichier porte deja son titre) :
  // le champ "Titre de l'unite" ne concerne donc que le CSV, hors ZIP.
  const isCsv = !isZip && !!fileText && !looksLikeJson(fileText);

  // Recap affiché sur l'écran de résultat : la destination choisie, en
  // toutes lettres, pour confirmer où le contenu vient d'atterrir.
  const scopeLabel = scope
    ? [
        filieres.find((f) => f.id === scope.filiereId)?.name ?? "",
        scope.isLangues ? courseLanguageLabel(scope.langueCode) : scope.niveauEtude.toUpperCase(),
        `Niveau ${scope.parcoursNiveau}`,
        scope.niveauDifficulte ? NIVEAU_DIFFICULTE_LABELS[scope.niveauDifficulte] : "Tous niveaux",
      ]
        .filter(Boolean)
        .join(" · ")
    : "";
  const canPreview = isZip || (!!fileText && (!isCsv || csvUniteTitle.trim().length > 0));

  function handleTextChange(text: string | null) {
    setFileText(text);
    setZipBase64(null);
    setZipFilename(null);
  }

  function handleZipFile(base64: string, filename: string) {
    setZipBase64(base64);
    setZipFilename(filename);
    setFileText(null);
  }

  function scopeArgs() {
    if (!scope) return null;
    return [
      scope.filiereId,
      scope.isLangues ? null : scope.niveauEtude,
      scope.isLangues ? scope.langueCode : null,
      scope.parcoursNiveau,
      scope.niveauDifficulte || null,
    ] as const;
  }

  async function handlePreview() {
    const args = scopeArgs();
    if (!args) return;
    setLoading(true);
    if (isZip && zipBase64) {
      const res = await previewZipUniteImport(...args, zipBase64);
      setZipPreview(res);
    } else if (fileText) {
      const res = await previewUniteImport(...args, csvUniteTitle, fileText);
      setPreview(res);
    }
    setLoading(false);
    setStep("preview");
  }

  async function handleCommit(mode: "replace" | "create-new") {
    const args = scopeArgs();
    if (!args) return;
    setLoading(true);
    if (isZip && zipBase64) {
      const res = await commitZipUniteImport(...args, zipBase64, mode);
      setZipResult(res);
    } else if (fileText) {
      const res = await commitUniteImport(...args, csvUniteTitle, fileText, mode);
      setResult(res);
    }
    setLoading(false);
    setStep("result");
    router.refresh();
  }

  function reset() {
    setStep("form");
    setPreview(null);
    setZipPreview(null);
  }

  // ---------- Résultat (ZIP) ----------
  if (step === "result" && zipResult) {
    return (
      <div className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-lg shadow-zinc-900/5 dark:bg-zinc-900">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">{scopeLabel}</p>
        {zipResult.error ? (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
            {zipResult.error}
          </p>
        ) : (
          <>
            <h2 className="font-bold text-zinc-900 dark:text-zinc-50">
              {zipResult.results.length} unité{zipResult.results.length > 1 ? "s" : ""} traitée
              {zipResult.results.length > 1 ? "s" : ""}
            </h2>
            <ul className="flex flex-col gap-2">
              {zipResult.results.map(({ filename, result: r }, i) => (
                <li
                  key={i}
                  className="rounded-xl bg-zinc-50 px-4 py-3 text-sm dark:bg-zinc-800"
                >
                  <p className="font-medium text-zinc-800 dark:text-zinc-100">{filename}</p>
                  {r.error ? (
                    <p className="text-red-600 dark:text-red-400">{r.error}</p>
                  ) : (
                    <p className="text-zinc-600 dark:text-zinc-400">
                      {r.leconsCreated} leçon{r.leconsCreated > 1 ? "s" : ""}, {r.questionsImported}{" "}
                      question{r.questionsImported > 1 ? "s" : ""}
                      {r.uniteId && (
                        <>
                          {" — "}
                          <a href={`/admin/unites/${r.uniteId}`} className="text-orange-500 hover:text-orange-600">
                            Voir
                          </a>
                        </>
                      )}
                    </p>
                  )}
                </li>
              ))}
            </ul>
            <a href="/admin" className={buttonClasses("primary", "w-full text-center")}>
              Retour à l&apos;admin
            </a>
          </>
        )}
      </div>
    );
  }

  // ---------- Résultat (fichier unique) ----------
  if (step === "result" && result) {
    return (
      <div className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-lg shadow-zinc-900/5 dark:bg-zinc-900">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">{scopeLabel}</p>
        {result.error ? (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
            {result.error}
          </p>
        ) : (
          <>
            <p className="rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
              {result.leconsCreated} leçon{result.leconsCreated > 1 ? "s" : ""} et{" "}
              {result.questionsImported} question{result.questionsImported > 1 ? "s" : ""} importée
              {result.questionsImported > 1 ? "s" : ""}.
            </p>
            {result.questionErrors.length > 0 && (
              <div className="rounded-xl bg-orange-50 px-4 py-3 text-sm text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
                <p className="font-medium">Avertissements :</p>
                <ul className="mt-1 list-inside list-disc">
                  {result.questionErrors.map((e, i) => (
                    <li key={i}>
                      {e.leconTitre}
                      {e.index > 0 ? ` (ligne ${e.index})` : ""} : {e.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <a
              href={`/admin/unites/${result.uniteId}`}
              className={buttonClasses("primary", "w-full text-center")}
            >
              Voir l&apos;unité
            </a>
          </>
        )}
      </div>
    );
  }

  // ---------- Aperçu (ZIP) ----------
  if (step === "preview" && zipPreview) {
    if (zipPreview.error) {
      return (
        <div className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-lg shadow-zinc-900/5 dark:bg-zinc-900">
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
            {zipPreview.error}
          </p>
          <button type="button" onClick={reset} className={buttonClasses("secondary", "")}>
            Retour
          </button>
        </div>
      );
    }

    const conflicting = zipPreview.entries.filter((e) => e.preview.existingUniteId);

    return (
      <div className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-lg shadow-zinc-900/5 dark:bg-zinc-900">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">{scopeLabel}</p>
        <h2 className="font-bold text-zinc-900 dark:text-zinc-50">
          {zipPreview.entries.length} unité{zipPreview.entries.length > 1 ? "s" : ""} détectée
          {zipPreview.entries.length > 1 ? "s" : ""} dans le ZIP
        </h2>

        <ul className="flex flex-col gap-2">
          {zipPreview.entries.map((entry, i) => {
            const p = entry.preview;
            const totalQuestions = p.lecons.reduce((s, l) => s + l.validCount, 0);
            return (
              <li key={i} className="rounded-xl bg-zinc-50 px-4 py-3 text-sm dark:bg-zinc-800">
                <p className="font-medium text-zinc-800 dark:text-zinc-100">{entry.filename}</p>
                {p.error ? (
                  <p className="text-red-600 dark:text-red-400">{p.error}</p>
                ) : (
                  <p className="text-zinc-600 dark:text-zinc-400">
                    « {p.uniteTitle} » — {p.lecons.length} leçon{p.lecons.length > 1 ? "s" : ""},{" "}
                    {totalQuestions} question{totalQuestions > 1 ? "s" : ""}
                    {p.existingUniteId && (
                      <span className="text-red-600 dark:text-red-400"> — existe déjà</span>
                    )}
                  </p>
                )}
              </li>
            );
          })}
        </ul>

        {conflicting.length > 0 ? (
          <div className="flex flex-col gap-3 rounded-xl bg-red-50 p-4 dark:bg-red-900/20">
            <p className="text-sm text-red-700 dark:text-red-300">
              {conflicting.length} unité{conflicting.length > 1 ? "s" : ""} du ZIP porte
              {conflicting.length > 1 ? "nt" : ""} un nom déjà utilisé ({conflicting
                .map((e) => e.preview.uniteTitle)
                .join(", ")}
              ). Ce choix s&apos;applique à toutes les unités en conflit ; les autres se créent
              normalement.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                disabled={loading}
                onClick={() => handleCommit("replace")}
                className={buttonClasses("danger", "flex-1")}
              >
                {loading ? "..." : "Remplacer les unités existantes"}
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleCommit("create-new")}
                className={buttonClasses("secondary", "flex-1")}
              >
                {loading ? "..." : "Créer des unités séparées"}
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            disabled={loading}
            onClick={() => handleCommit("create-new")}
            className={buttonClasses("primary", "")}
          >
            {loading ? "Import en cours..." : "Confirmer l'import du ZIP"}
          </button>
        )}

        <button
          type="button"
          onClick={reset}
          className="text-sm font-medium text-zinc-500 hover:text-zinc-700 dark:text-zinc-400"
        >
          Annuler
        </button>
      </div>
    );
  }

  // ---------- Aperçu (fichier unique) ----------
  if (step === "preview" && preview) {
    if (preview.error) {
      return (
        <div className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-lg shadow-zinc-900/5 dark:bg-zinc-900">
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
            {preview.error}
          </p>
          <button type="button" onClick={reset} className={buttonClasses("secondary", "")}>
            Retour
          </button>
        </div>
      );
    }

    const totalQuestions = preview.lecons.reduce((s, l) => s + l.validCount, 0);
    const totalErrors = preview.lecons.reduce((s, l) => s + l.errors.length, 0);

    return (
      <div className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-lg shadow-zinc-900/5 dark:bg-zinc-900">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">{scopeLabel}</p>
        <h2 className="font-bold text-zinc-900 dark:text-zinc-50">
          « {preview.uniteTitle} » — {preview.lecons.length} leçon{preview.lecons.length > 1 ? "s" : ""},{" "}
          {totalQuestions} question{totalQuestions > 1 ? "s" : ""}
        </h2>

        <ul className="flex flex-col gap-1 text-sm text-zinc-600 dark:text-zinc-400">
          {preview.lecons.map((l, i) => (
            <li key={i}>
              {l.titre} — {l.validCount} question{l.validCount > 1 ? "s" : ""}
              {l.errors.length > 0 && (
                <span className="text-red-600 dark:text-red-400"> ({l.errors.length} ignorée(s))</span>
              )}
            </li>
          ))}
        </ul>

        {totalErrors > 0 && (
          <div className="rounded-xl bg-orange-50 px-4 py-3 text-sm text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
            <p className="font-medium">{totalErrors} question(s) invalide(s), seront ignorées :</p>
            <ul className="mt-1 list-inside list-disc">
              {preview.lecons.flatMap((l) =>
                l.errors.map((e, i) => (
                  <li key={`${l.titre}-${i}`}>
                    {l.titre} (ligne {e.index}) : {e.message}
                  </li>
                )),
              )}
            </ul>
          </div>
        )}

        {preview.nameCollisions.length > 0 && (
          <p className="rounded-xl bg-zinc-50 px-4 py-3 text-xs text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
            Info : {preview.nameCollisions.join(", ")} porte{preview.nameCollisions.length > 1 ? "nt" : ""} le même
            nom qu&apos;une leçon déjà existante ailleurs — ce sera importé quand même, sans lien entre les deux.
          </p>
        )}

        {preview.existingUniteId ? (
          <div className="flex flex-col gap-3 rounded-xl bg-red-50 p-4 dark:bg-red-900/20">
            <p className="text-sm text-red-700 dark:text-red-300">
              Une unité nommée « {preview.uniteTitle} » existe déjà, avec{" "}
              {preview.existingUniteLeconTitles.length} leçon
              {preview.existingUniteLeconTitles.length > 1 ? "s" : ""} :{" "}
              {preview.existingUniteLeconTitles.join(", ")}.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                disabled={loading}
                onClick={() => handleCommit("replace")}
                className={buttonClasses("danger", "flex-1")}
              >
                {loading ? "..." : "Remplacer l'unité existante"}
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleCommit("create-new")}
                className={buttonClasses("secondary", "flex-1")}
              >
                {loading ? "..." : "Créer une unité séparée"}
              </button>
            </div>
            <p className="text-xs text-red-600 dark:text-red-400">
              « Remplacer » supprime les leçons et questions actuelles de cette unité pour les remplacer par
              celles du fichier.
            </p>
          </div>
        ) : (
          <button
            type="button"
            disabled={loading}
            onClick={() => handleCommit("create-new")}
            className={buttonClasses("primary", "")}
          >
            {loading ? "Import en cours..." : "Confirmer l'import"}
          </button>
        )}

        <button
          type="button"
          onClick={reset}
          className="text-sm font-medium text-zinc-500 hover:text-zinc-700 dark:text-zinc-400"
        >
          Annuler
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-lg shadow-zinc-900/5 dark:bg-zinc-900">
      <FiliereScopeFields filieres={filieres} onScopeChange={setScope} />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Contenu JSON ou CSV pour une unité, ou fichier ZIP pour en importer plusieurs d&apos;un coup
          (n&apos;importe quel type de fichier — le format est détecté automatiquement)
        </label>
        <ImportSourceInput onChange={handleTextChange} onZipFile={handleZipFile} />
      </div>

      {zipFilename && (
        <p className="rounded-xl bg-orange-50 px-4 py-3 text-sm text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
          ZIP sélectionné : {zipFilename}
        </p>
      )}

      {isCsv && (
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Titre de l&apos;unité
          </label>
          <input
            value={csvUniteTitle}
            onChange={(e) => setCsvUniteTitle(e.target.value)}
            placeholder="Un fichier CSV n'a pas de titre d'unité intégré"
            className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-zinc-900 outline-none focus:border-orange-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
          />
        </div>
      )}

      <button
        type="button"
        disabled={!canPreview || loading}
        onClick={handlePreview}
        className={buttonClasses("primary", "disabled:opacity-50")}
      >
        {loading ? "Analyse en cours..." : "Prévisualiser l'import"}
      </button>
    </div>
  );
}
