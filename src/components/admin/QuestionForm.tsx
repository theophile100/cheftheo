"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AssocierData, OrdonnerData, QcmData, Question } from "@/lib/types";
import type { QuestionInput } from "@/app/admin/actions";

function newId() {
  return Math.random().toString(36).slice(2, 10);
}

export function QuestionForm({
  leconId,
  initialQuestion,
  defaultPosition,
  onSubmit,
}: {
  leconId: string;
  initialQuestion?: Question & { position: number };
  defaultPosition?: number;
  onSubmit: (input: QuestionInput) => Promise<{ error?: string }>;
}) {
  const router = useRouter();
  const [type, setType] = useState<"qcm" | "associer" | "ordonner">(
    initialQuestion?.type ?? "qcm",
  );
  const [prompt, setPrompt] = useState(initialQuestion?.prompt ?? "");
  const [explanation, setExplanation] = useState(
    initialQuestion?.explanation ?? "",
  );
  const [position, setPosition] = useState(
    initialQuestion?.position ?? defaultPosition ?? 1,
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initialQcm =
    initialQuestion?.type === "qcm" ? (initialQuestion.data as QcmData) : null;
  const [qcmOptions, setQcmOptions] = useState(
    initialQcm?.options.map((o) => ({ id: o.id, text: o.text })) ?? [
      { id: newId(), text: "" },
      { id: newId(), text: "" },
    ],
  );
  const [correctOptionId, setCorrectOptionId] = useState(
    initialQcm?.correct_option_id ?? "",
  );

  const initialAssocier =
    initialQuestion?.type === "associer"
      ? (initialQuestion.data as AssocierData)
      : null;
  const [pairs, setPairs] = useState(
    initialAssocier?.pairs.map((p) => ({
      id: newId(),
      leftText: p.left.text,
      rightText: p.right.text,
    })) ?? [
      { id: newId(), leftText: "", rightText: "" },
      { id: newId(), leftText: "", rightText: "" },
    ],
  );

  const initialOrdonner =
    initialQuestion?.type === "ordonner"
      ? (initialQuestion.data as OrdonnerData)
      : null;
  const [steps, setSteps] = useState(
    initialOrdonner?.steps.map((s) => ({ id: newId(), text: s.text })) ?? [
      { id: newId(), text: "" },
      { id: newId(), text: "" },
    ],
  );

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSaving(true);

    let data: QcmData | AssocierData | OrdonnerData;
    if (type === "qcm") {
      data = { options: qcmOptions, correct_option_id: correctOptionId };
    } else if (type === "associer") {
      data = {
        pairs: pairs.map((p) => ({
          left: { id: `${p.id}-l`, text: p.leftText },
          right: { id: `${p.id}-r`, text: p.rightText },
        })),
      };
    } else {
      data = { steps: steps.map((s) => ({ id: s.id, text: s.text })) };
    }

    const result = await onSubmit({
      leconId,
      type,
      prompt,
      explanation,
      position,
      data,
    });

    setSaving(false);

    if (result?.error) {
      setError(result.error);
      return;
    }

    router.push(`/admin/lecons/${leconId}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm dark:bg-zinc-900"
    >
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Type d&apos;exercice
        </label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as typeof type)}
          className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-zinc-900 outline-none focus:border-orange-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
        >
          <option value="qcm">QCM (choix multiple)</option>
          <option value="associer">Associer des paires</option>
          <option value="ordonner">Remettre dans l&apos;ordre</option>
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Énoncé
        </label>
        <textarea
          required
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={2}
          className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-zinc-900 outline-none focus:border-orange-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Explication (affichée après la réponse)
        </label>
        <textarea
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          rows={2}
          className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-zinc-900 outline-none focus:border-orange-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Position dans la leçon
        </label>
        <input
          type="number"
          min={1}
          required
          value={position}
          onChange={(e) => setPosition(Number(e.target.value))}
          className="w-32 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-zinc-900 outline-none focus:border-orange-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
        />
      </div>

      {type === "qcm" && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Réponses (cochez la bonne)
          </label>
          {qcmOptions.map((option, index) => (
            <div key={option.id} className="flex items-center gap-2">
              <input
                type="radio"
                name="correct"
                checked={correctOptionId === option.id}
                onChange={() => setCorrectOptionId(option.id)}
                className="h-4 w-4 accent-orange-500"
              />
              <input
                value={option.text}
                onChange={(e) =>
                  setQcmOptions((prev) =>
                    prev.map((o, i) =>
                      i === index ? { ...o, text: e.target.value } : o,
                    ),
                  )
                }
                placeholder={`Réponse ${index + 1}`}
                className="flex-1 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-zinc-900 outline-none focus:border-orange-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
              />
              {qcmOptions.length > 2 && (
                <button
                  type="button"
                  onClick={() =>
                    setQcmOptions((prev) => prev.filter((_, i) => i !== index))
                  }
                  className="text-sm text-red-500 hover:text-red-600"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setQcmOptions((prev) => [...prev, { id: newId(), text: "" }])
            }
            className="self-start text-sm font-medium text-orange-500 hover:text-orange-600"
          >
            + Ajouter une réponse
          </button>
        </div>
      )}

      {type === "associer" && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Paires à associer
          </label>
          {pairs.map((pair, index) => (
            <div key={pair.id} className="flex items-center gap-2">
              <input
                value={pair.leftText}
                onChange={(e) =>
                  setPairs((prev) =>
                    prev.map((p, i) =>
                      i === index ? { ...p, leftText: e.target.value } : p,
                    ),
                  )
                }
                placeholder="Élément (ex: Couteau de table)"
                className="flex-1 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-zinc-900 outline-none focus:border-orange-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
              />
              <input
                value={pair.rightText}
                onChange={(e) =>
                  setPairs((prev) =>
                    prev.map((p, i) =>
                      i === index ? { ...p, rightText: e.target.value } : p,
                    ),
                  )
                }
                placeholder="Correspond à (ex: à droite de l'assiette)"
                className="flex-1 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-zinc-900 outline-none focus:border-orange-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
              />
              {pairs.length > 2 && (
                <button
                  type="button"
                  onClick={() =>
                    setPairs((prev) => prev.filter((_, i) => i !== index))
                  }
                  className="text-sm text-red-500 hover:text-red-600"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setPairs((prev) => [
                ...prev,
                { id: newId(), leftText: "", rightText: "" },
              ])
            }
            className="self-start text-sm font-medium text-orange-500 hover:text-orange-600"
          >
            + Ajouter une paire
          </button>
        </div>
      )}

      {type === "ordonner" && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Étapes, dans le bon ordre
          </label>
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center gap-2">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-bold text-zinc-500 dark:bg-zinc-800">
                {index + 1}
              </span>
              <input
                value={step.text}
                onChange={(e) =>
                  setSteps((prev) =>
                    prev.map((s, i) =>
                      i === index ? { ...s, text: e.target.value } : s,
                    ),
                  )
                }
                placeholder={`Étape ${index + 1}`}
                className="flex-1 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-zinc-900 outline-none focus:border-orange-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
              />
              <button
                type="button"
                disabled={index === 0}
                onClick={() =>
                  setSteps((prev) => {
                    const next = [...prev];
                    [next[index - 1], next[index]] = [next[index], next[index - 1]];
                    return next;
                  })
                }
                className="text-sm text-zinc-500 hover:text-zinc-700 disabled:opacity-30 dark:text-zinc-400"
              >
                ▲
              </button>
              <button
                type="button"
                disabled={index === steps.length - 1}
                onClick={() =>
                  setSteps((prev) => {
                    const next = [...prev];
                    [next[index], next[index + 1]] = [next[index + 1], next[index]];
                    return next;
                  })
                }
                className="text-sm text-zinc-500 hover:text-zinc-700 disabled:opacity-30 dark:text-zinc-400"
              >
                ▼
              </button>
              {steps.length > 2 && (
                <button
                  type="button"
                  onClick={() =>
                    setSteps((prev) => prev.filter((_, i) => i !== index))
                  }
                  className="text-sm text-red-500 hover:text-red-600"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setSteps((prev) => [...prev, { id: newId(), text: "" }])
            }
            className="self-start text-sm font-medium text-orange-500 hover:text-orange-600"
          >
            + Ajouter une étape
          </button>
        </div>
      )}

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="mt-2 rounded-xl bg-orange-500 px-4 py-3 text-base font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
      >
        {saving ? "Enregistrement..." : "Enregistrer"}
      </button>
    </form>
  );
}
