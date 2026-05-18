"use client";

import type { Question } from "@/lib/api";

export type AnswerState = {
  selected_option: string | null;
  selected_option_label: string | null;
  free_text: string | null;
  complement_text: string | null;
  // V1.1.5-i : prénom de l'entité associée à l'option choisie.
  entity_name: string | null;
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
        const isOtherOption = opt.id.endsWith("_other");
        return (
          <div
            key={opt.id}
            className={`px-4 py-3 rounded-lg border transition text-sm ${
              isSelected
                ? "border-lugia-accent bg-lugia-accent-soft"
                : "border-lugia-border bg-lugia-bg-card hover:border-lugia-text-tertiary"
            }`}
          >
            <label className="flex items-center cursor-pointer">
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
              <span className="flex-1">{opt.label}</span>
              {isOtherOption && !isSelected && (
                <span className="text-lugia-text-tertiary text-xs">
                  cliquez pour préciser
                </span>
              )}
            </label>
            {isOtherOption && isSelected && (
              <input
                type="text"
                autoFocus
                value={answer.complement_text || ""}
                onChange={(e) => onChange({ complement_text: e.target.value })}
                placeholder="Précisez en quelques mots..."
                className="mt-3 w-full px-3 py-2 bg-white border border-lugia-border rounded-md text-sm focus:outline-none focus:border-lugia-accent"
              />
            )}
            {opt.has_entity_field && isSelected && (
              <div className="mt-3">
                <label className="block text-xs text-lugia-text-tertiary mb-1.5">
                  {opt.entity_field_label || "Prénom (optionnel)"}
                </label>
                <input
                  type="text"
                  value={answer.entity_name || ""}
                  onChange={(e) => onChange({ entity_name: e.target.value })}
                  placeholder="Prénom"
                  className="w-full px-3 py-2 bg-white border border-lugia-border rounded-md text-sm focus:outline-none focus:border-lugia-accent"
                />
                <div className="mt-1.5 text-[11px] text-lugia-text-tertiary leading-relaxed">
                  Donnée privée, stockée dans votre espace, jamais partagée ni utilisée à d'autres fins.
                </div>
              </div>
            )}
          </div>
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
  // Si l'option "Autre" est sélectionnée, le complément est saisi inline
  // dans l'option elle-même (cf OptionRadioList), donc on ne propose pas
  // de zone supplémentaire ici pour éviter le doublon.
  if (isOtherSelected) return null;

  return (
    <div className="mt-4">
      <label className="block text-xs uppercase tracking-wider font-medium text-lugia-text-secondary mb-2">
        Un détail à ajouter (optionnel)
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="w-full px-3 py-2 border border-lugia-border rounded-lg text-sm resize-none focus:outline-none focus:border-lugia-accent bg-lugia-bg-card"
        placeholder="Un exemple récent, une précision, un détail à ajouter..."
      />
    </div>
  );
}

export function ModeAWidget(props: WidgetProps) {
  const { question, answer, onChange } = props;
  const isOther = answer.selected_option?.endsWith("_other") ?? false;

  const qcmPrompt = question.qcm_prompt || "";
  const noteSep = qcmPrompt.includes(" Par exemple :")
    ? " Par exemple :"
    : qcmPrompt.includes(" Note :")
      ? " Note :"
      : null;
  const noteLabel = noteSep === " Par exemple :" ? "Par exemple" : "Note";
  const hasNote = noteSep !== null;
  const [mainPrompt, notePrompt] = hasNote
    ? qcmPrompt.split(noteSep, 2)
    : [qcmPrompt, ""];

  return (
    <div>
      <p className="font-serif text-[22px] font-medium leading-snug mb-2">
        {mainPrompt.trim()}
      </p>
      {hasNote && (
        <div className="text-xs text-lugia-text-tertiary mb-6 leading-relaxed">
          {noteLabel} : {notePrompt.trim()}
        </div>
      )}
      {!hasNote && <div className="mb-4" />}
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
  const noteSep = openPrompt.includes(" Par exemple :")
    ? " Par exemple :"
    : openPrompt.includes(" Note :")
      ? " Note :"
      : null;
  const noteLabel = noteSep === " Par exemple :" ? "Par exemple" : "Note";
  const hasNote = noteSep !== null;
  const [mainPrompt, notePrompt] = hasNote
    ? openPrompt.split(noteSep, 2)
    : [openPrompt, ""];

  return (
    <div>
      <p className="font-serif text-[22px] font-medium leading-snug mb-2">
        {mainPrompt.trim()}
      </p>
      {hasNote && (
        <div className="text-xs text-lugia-text-tertiary mb-4 leading-relaxed">
          {noteLabel} : {notePrompt.trim()}
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
