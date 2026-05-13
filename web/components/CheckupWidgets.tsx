"use client";

import type { Question } from "@/lib/api";

export type AnswerState = {
  selected_option: string | null;
  selected_option_label: string | null;
  free_text: string | null;
  complement_text: string | null;
};

type WidgetProps = {
  question: Question;
  answer: AnswerState;
  onChange: (partial: Partial<AnswerState>) => void;
};

function OptionRadioList({ question, answer, onChange }: WidgetProps) {
  return (
    <div className="space-y-2">
      {question.options.map((opt) => {
        const isSelected = answer.selected_option === opt.id;
        return (
          <label
            key={opt.id}
            className={`block px-4 py-3 rounded-lg border cursor-pointer transition text-sm ${
              isSelected
                ? "border-lugia-accent bg-lugia-accent-soft"
                : "border-lugia-border bg-lugia-bg-card hover:border-lugia-text-tertiary"
            }`}
          >
            <input
              type="radio"
              name={`q_${question.id}`}
              value={opt.id}
              checked={isSelected}
              onChange={() =>
                onChange({
                  selected_option: opt.id,
                  selected_option_label: opt.label,
                })
              }
              className="mr-3 accent-lugia-accent"
            />
            <span>{opt.label}</span>
          </label>
        );
      })}
    </div>
  );
}

function ComplementInput({
  isOtherSelected,
  value,
  onChange,
}: {
  isOtherSelected: boolean;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="mt-4">
      <label className="block text-xs uppercase tracking-wider font-medium text-lugia-text-secondary mb-2">
        {isOtherSelected
          ? "Précisez votre réponse"
          : "Un détail à ajouter (optionnel)"}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="w-full px-3 py-2 border border-lugia-border rounded-lg text-sm resize-none focus:outline-none focus:border-lugia-accent bg-lugia-bg-card"
        placeholder={
          isOtherSelected
            ? "Précisez en quelques mots..."
            : "Un exemple récent, une précision, un détail à ajouter..."
        }
      />
    </div>
  );
}

export function ModeAWidget(props: WidgetProps) {
  const { question, answer, onChange } = props;
  const isOther = answer.selected_option?.endsWith("_other") ?? false;

  return (
    <div>
      <p className="font-serif text-[22px] font-medium leading-snug mb-6">
        {question.qcm_prompt}
      </p>
      <OptionRadioList {...props} />
      <ComplementInput
        isOtherSelected={isOther}
        value={answer.complement_text || ""}
        onChange={(v) => onChange({ complement_text: v })}
      />
    </div>
  );
}

export function ModeBWidget(props: WidgetProps) {
  const { question, answer, onChange } = props;
  const isOther = answer.selected_option?.endsWith("_other") ?? false;

  const openPrompt = question.open_prompt || "";
  const hasNote = openPrompt.includes(" Note :");
  const [mainPrompt, notePrompt] = hasNote
    ? openPrompt.split(" Note :", 2)
    : [openPrompt, ""];

  return (
    <div>
      <p className="font-serif text-[22px] font-medium leading-snug mb-2">
        {mainPrompt.trim()}
      </p>
      {hasNote && (
        <div className="text-xs text-lugia-text-tertiary mb-4 leading-relaxed">
          Note : {notePrompt.trim()}
        </div>
      )}
      <textarea
        value={answer.free_text || ""}
        onChange={(e) => onChange({ free_text: e.target.value })}
        rows={3}
        className="w-full px-3 py-2 border border-lugia-border rounded-lg text-sm resize-none focus:outline-none focus:border-lugia-accent bg-lugia-bg-card mb-6"
        placeholder="Votre réponse en une ou deux phrases..."
      />

      <p className="text-base font-medium leading-snug mb-3">
        {question.qcm_prompt}
      </p>
      <OptionRadioList {...props} />
      <ComplementInput
        isOtherSelected={isOther}
        value={answer.complement_text || ""}
        onChange={(v) => onChange({ complement_text: v })}
      />
    </div>
  );
}

export function ModeCWidget({ question, answer, onChange }: WidgetProps) {
  return (
    <div>
      <p className="font-serif text-[22px] font-medium leading-snug mb-6">
        {question.open_prompt}
      </p>
      <textarea
        value={answer.free_text || ""}
        onChange={(e) => onChange({ free_text: e.target.value })}
        rows={6}
        className="w-full px-3 py-2 border border-lugia-border rounded-lg text-sm resize-none focus:outline-none focus:border-lugia-accent bg-lugia-bg-card"
        placeholder="Prenez le temps de répondre librement..."
      />
    </div>
  );
}

export function isAnswerComplete(
  mode: "A" | "B" | "C",
  answer: AnswerState
): boolean {
  const trimmedFree = (answer.free_text || "").trim();
  const trimmedComplement = (answer.complement_text || "").trim();
  const isOther = answer.selected_option?.endsWith("_other") ?? false;

  if (mode === "A") {
    if (!answer.selected_option) return false;
    if (isOther && !trimmedComplement) return false;
    return true;
  }
  if (mode === "B") {
    if (!trimmedFree) return false;
    if (!answer.selected_option) return false;
    if (isOther && !trimmedComplement) return false;
    return true;
  }
  if (mode === "C") {
    return trimmedFree.length > 0;
  }
  return false;
}
