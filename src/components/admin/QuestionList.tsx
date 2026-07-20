"use client";

import Link from "next/link";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { ReorderButtons } from "@/components/admin/ReorderButtons";
import { BulkDeleteBar } from "@/components/admin/BulkDeleteBar";
import { useBulkSelection } from "@/lib/use-bulk-selection";
import { deleteQuestion, deleteQuestions, swapQuestionPosition } from "@/app/admin/actions";

const TYPE_LABELS: Record<string, string> = {
  qcm: "QCM",
  associer: "Associer",
  ordonner: "Ordonner",
};

interface Question {
  id: string;
  type: string;
  prompt: string;
  position: number;
}

export function QuestionList({ leconId, questions }: { leconId: string; questions: Question[] }) {
  const ids = questions.map((q) => q.id);
  const { selected, toggle, toggleAll, clear } = useBulkSelection();

  if (questions.length === 0) {
    return <p className="text-sm text-zinc-400">Aucune question pour l&apos;instant.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-2">
        <label className="flex items-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
          <input
            type="checkbox"
            checked={ids.length > 0 && ids.every((id) => selected.has(id))}
            onChange={() => toggleAll(ids)}
            className="h-3.5 w-3.5 accent-orange-500"
          />
          Tout sélectionner
        </label>
        <BulkDeleteBar
          count={selected.size}
          itemLabel="question"
          onDelete={async () => {
            await deleteQuestions(Array.from(selected), leconId);
            clear();
          }}
        />
      </div>

      {questions.map((q, index) => (
        <div
          key={q.id}
          className="flex items-center justify-between rounded-3xl bg-white p-4 shadow-lg shadow-zinc-900/5 dark:bg-zinc-900"
        >
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={selected.has(q.id)}
              onChange={() => toggle(q.id)}
              className="mt-1 h-3.5 w-3.5 accent-orange-500"
            />
            <div>
              <span className="rounded-full bg-orange-50 px-2 py-0.5 text-xs font-semibold text-orange-600 dark:bg-orange-900/30 dark:text-orange-300">
                {TYPE_LABELS[q.type]}
              </span>
              <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
                {q.position}. {q.prompt}
              </p>
            </div>
          </label>
          <div className="flex items-center gap-3">
            <ReorderButtons
              onUp={
                index > 0
                  ? swapQuestionPosition.bind(
                      null,
                      leconId,
                      q.id,
                      q.position,
                      questions[index - 1].id,
                      questions[index - 1].position,
                    )
                  : undefined
              }
              onDown={
                index < questions.length - 1
                  ? swapQuestionPosition.bind(
                      null,
                      leconId,
                      q.id,
                      q.position,
                      questions[index + 1].id,
                      questions[index + 1].position,
                    )
                  : undefined
              }
            />
            <Link
              href={`/admin/questions/${q.id}`}
              className="text-sm font-medium text-orange-500 hover:text-orange-600"
            >
              Modifier
            </Link>
            <DeleteButton
              onDelete={deleteQuestion.bind(null, q.id, leconId)}
              confirmMessage="Supprimer cette question ?"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
