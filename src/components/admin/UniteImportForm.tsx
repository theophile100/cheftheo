"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  previewUniteImport,
  commitUniteImport,
  type UniteImportPreview,
  type UniteImportResult,
} from "@/app/admin/actions";
import {
  FiliereScopeFields,
  type FiliereScope,
} from "@/components/admin/FiliereScopeFields";
import { buttonClasses } from "@/lib/button-styles";

interface Filiere {
  id: string;
  slug: string;
  name: string;
}

type Step = "form" | "preview" | "result";

export function UniteImportForm({ filieres }: { filieres: Filiere[] }) {
  const router = useRouter();
  const [scope, setScope] = useState<FiliereScope | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileText, setFileText] = useState<string | null>(null);
  const [csvUniteTitle, setCsvUniteTitle] = useState("");
  const [step, setStep] = useState<Step>("form");
  const [preview, setPreview] = useState<UniteImportPreview | null>(null);
  const [result, setResult] = useState<UniteImportResult | null>(null);
  const [loading, setLoading] = useState(false);

  const isCsv = fileName?.toLowerCase().endsWith(".csv") ?? false;
  const canPreview = !!fileText && (!isCsv || csvUniteTitle.trim().length > 0);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setFileText(await file.text());
  }

  async function handlePreview() {
    if (!scope || !fileText || !fileName) return;
    setLoading(true);
    const res = await previewUniteImport(
      scope.filiereId,
      scope.isLangues ? null : scope.niveauEtude,
      scope.isLangues ? scope.langueCode : null,
      scope.parcoursNiveau,
      fileName,
      csvUniteTitle,
      fileText,
    );
    setLoading(false);
    setPreview(res);
    setStep("preview");
  }

  async function handleCommit(mode: "replace" | "create-new") {
    if (!scope || !fileText || !fileName) return;
    setLoading(true);
    const res = await commitUniteImport(
      scope.filiereId,
      scope.isLangues ? null : scope.niveauEtude,
      scope.isLangues ? scope.langueCode : null,
      scope.parcoursNiveau,
      fileName,
      csvUniteTitle,
      fileText,
      mode,
    );
    setLoading(false);
    setResult(res);
    setStep("result");
    router.refresh();
  }

  if (step === "result" && result) {
    return (
      <div className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-lg shadow-zinc-900/5 dark:bg-zinc-900">
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

  if (step === "preview" && preview) {
    if (preview.error) {
      return (
        <div className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-lg shadow-zinc-900/5 dark:bg-zinc-900">
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
            {preview.error}
          </p>
          <button type="button" onClick={() => setStep("form")} className={buttonClasses("secondary", "")}>
            Retour
          </button>
        </div>
      );
    }

    const totalQuestions = preview.lecons.reduce((s, l) => s + l.validCount, 0);
    const totalErrors = preview.lecons.reduce((s, l) => s + l.errors.length, 0);

    return (
      <div className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-lg shadow-zinc-900/5 dark:bg-zinc-900">
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
          onClick={() => setStep("form")}
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
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Fichier .json ou .csv</label>
        <input
          type="file"
          accept=".json,.csv"
          onChange={handleFileChange}
          className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none focus:border-orange-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
        />
      </div>

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
