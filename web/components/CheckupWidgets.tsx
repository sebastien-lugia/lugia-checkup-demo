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

/* ============================================================================
 * V1.1.9 — OptionCard retravaillée
 *   - Espacement plus généreux (px-5 py-4, gap 2.5 entre cartes)
 *   - Check-mark gauche en lieu du radio natif (état sélectionné explicite)
 *   - Descriptions secondaires extraites du label "mot-clé — détail" :
 *     la 1ère partie devient le titre (15px medium), la 2ème le détail
 *     (13px gris) sur une 2ème ligne
 *   - "Autre" : fond légèrement teinté (bg-[#f5f4ef]) avant sélection
 *   - has_entity_field : input texte conditionnel sous l'option avec
 *     séparateur fin top-border en bleu doux
 *   - Hover : bordure plus marquée, sélection : bordure bleue + halo
 *   ========================================================================== */

function splitLabel(label: string): { title: string; detail: string | null } {
  // Format établi V1.1 : "mot-clé — détail" avec un véritable em-dash.
  const idx = label.indexOf(" — ");
  if (idx === -1) return { title: label, detail: null };
  return {
    title: label.slice(0, idx).trim(),
    detail: label.slice(idx + 3).trim(),
  };
}

function OptionRadioList({ question, answer, onChange }: WidgetProps) {
  return (
    <div className="flex flex-col gap-2.5">
      {question.options.map((opt) => {
        const isSelected = answer.selected_option === opt.id;
        const isOtherOption = opt.id.endsWith("_other");
        const { title, detail } = splitLabel(opt.label);

        // Classes de la carte selon état
        const cardClasses = [
          "w-full text-left px-5 py-4 rounded-[10px] border transition-all duration-150 cursor-pointer",
          "flex items-start gap-3.5",
          isSelected
            ? "border-lugia-accent bg-lugia-accent-soft shadow-[0_0_0_3px_rgba(24,95,165,0.06)]"
            : isOtherOption
              ? "border-lugia-border bg-[#f5f4ef] hover:border-[#888780]"
              : "border-lugia-border bg-white hover:border-[#888780]",
        ].join(" ");

        return (
          <div key={opt.id}>
            <button
              type="button"
              className={cardClasses}
              onClick={() =>
                onChange({
                  selected_option: opt.id,
                  selected_option_label: opt.label,
                })
              }
              aria-pressed={isSelected}
            >
              {/* Check-mark à la place du radio natif */}
              <span
                aria-hidden="true"
                className={`mt-0.5 w-[18px] h-[18px] rounded-full border-[1.5px] flex-shrink-0 transition-colors duration-150 relative ${
                  isSelected
                    ? "border-lugia-accent bg-lugia-accent"
                    : "border-[#cfcec8] bg-white"
                }`}
              >
                {isSelected && (
                  <span
                    className="absolute block"
                    style={{
                      left: "5px",
                      top: "1px",
                      width: "5px",
                      height: "10px",
                      border: "solid #fff",
                      borderWidth: "0 2px 2px 0",
                      transform: "rotate(45deg)",
                    }}
                  />
                )}
              </span>

              <span className="flex-1 min-w-0">
                <span className="block text-[15px] font-medium text-[#111] leading-[1.4]">
                  {title}
                </span>
                {detail && (
                  <span className="block text-[13px] text-[#888780] mt-1 leading-[1.45]">
                    {detail}
                  </span>
                )}
              </span>
            </button>

            {/* Champ Autre conditionnel (inline sous l'option sélectionnée) */}
            {isOtherOption && isSelected && (
              <div className="mt-2 ml-9">
                <input
                  type="text"
                  autoFocus
                  value={answer.complement_text || ""}
                  onChange={(e) =>
                    onChange({ complement_text: e.target.value })
                  }
                  placeholder="Précisez en quelques mots…"
                  className="w-full px-3 py-2.5 bg-white border border-lugia-border rounded-md text-[14px] focus:outline-none focus:border-lugia-accent"
                />
              </div>
            )}

            {/* Champ prénom optionnel (entity_field) */}
            {opt.has_entity_field && isSelected && (
              <div className="mt-3 ml-9 pt-3 border-t border-[rgba(24,95,165,0.18)]">
                <label className="block text-[11px] uppercase tracking-[0.08em] font-semibold text-[#595959] mb-1.5">
                  {opt.entity_field_label || "Prénom (optionnel)"}
                </label>
                <input
                  type="text"
                  value={answer.entity_name || ""}
                  onChange={(e) => onChange({ entity_name: e.target.value })}
                  placeholder="Prénom"
                  className="w-full px-3 py-2 bg-white border border-lugia-border rounded-md text-[14px] focus:outline-none focus:border-lugia-accent"
                />
                <div className="mt-1.5 text-[11px] text-[#888780] leading-relaxed">
                  Donnée privée, stockée dans votre espace, jamais partagée
                  ni utilisée à d&apos;autres fins.
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
  // Si "Autre" est sélectionnée, le complément est saisi inline dans l'option.
  if (isOtherSelected) return null;
  return (
    <div className="mt-6">
      <label className="block text-[11px] uppercase tracking-[0.1em] font-semibold text-[#595959] mb-2">
        Un détail à ajouter (optionnel)
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="w-full px-3.5 py-3 border border-lugia-border rounded-lg text-[14px] resize-none focus:outline-none focus:border-lugia-accent bg-white"
        placeholder="Un exemple récent, une précision, un détail à ajouter…"
      />
    </div>
  );
}

/* ============================================================================
 * V1.1.9 — Titres de question (typographie unifiée) + split de la note
 *   La question principale en serif 26px desktop. La note ("Par exemple :"
 *   ou "Note :") en italique grise sous la question, à 13px.
 *   ========================================================================== */

function splitPrompt(prompt: string): { main: string; note: string | null; noteLabel: string } {
  const sepExample = " Par exemple :";
  const sepNote = " Note :";
  if (prompt.includes(sepExample)) {
    const [main, note] = prompt.split(sepExample, 2);
    return { main: main.trim(), note: note.trim(), noteLabel: "Par exemple" };
  }
  if (prompt.includes(sepNote)) {
    const [main, note] = prompt.split(sepNote, 2);
    return { main: main.trim(), note: note.trim(), noteLabel: "Note" };
  }
  return { main: prompt, note: null, noteLabel: "" };
}

function QuestionTitle({ prompt }: { prompt: string }) {
  const { main, note, noteLabel } = splitPrompt(prompt);
  return (
    <>
      <h1 className="font-serif text-[26px] font-medium leading-[1.3] tracking-[-0.005em] text-[#111] mb-3.5">
        {main}
      </h1>
      {note ? (
        <div className="text-[13px] leading-[1.55] text-[#888780] italic mb-8">
          <strong className="not-italic uppercase tracking-[0.08em] text-[11px] font-semibold text-[#595959] mr-1">
            {noteLabel}
          </strong>
          {note}
        </div>
      ) : (
        <div className="mb-7" />
      )}
    </>
  );
}

/* ============================================================================
 * Mode A — QCM avec complément optionnel
 *   ========================================================================== */

export function ModeAWidget(props: WidgetProps) {
  const { question, answer, onChange } = props;
  const isOther = answer.selected_option?.endsWith("_other") ?? false;
  return (
    <div className="lugia-question-anim">
      <QuestionTitle prompt={question.qcm_prompt || ""} />
      <OptionRadioList {...props} />
      <ComplementInput
        isOtherSelected={isOther}
        value={answer.complement_text || ""}
        onChange={(v) => onChange({ complement_text: v })}
      />
    </div>
  );
}

/* ============================================================================
 * Mode B — Hybride (réponse libre + QCM)
 *   ========================================================================== */

export function ModeBWidget(props: WidgetProps) {
  const { question, answer, onChange } = props;
  const isOther = answer.selected_option?.endsWith("_other") ?? false;
  return (
    <div className="lugia-question-anim">
      <QuestionTitle prompt={question.open_prompt || ""} />
      <textarea
        value={answer.free_text || ""}
        onChange={(e) => onChange({ free_text: e.target.value })}
        rows={4}
        className="w-full px-4 py-3.5 border border-lugia-border rounded-[10px] text-[15px] leading-[1.55] resize-y focus:outline-none focus:border-lugia-accent bg-white mb-7 min-h-[110px]"
        placeholder="Votre réponse en une ou deux phrases…"
      />
      <p className="text-[14px] font-medium text-[#595959] mb-3">
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

/* ============================================================================
 * Mode C — Ouvert pur
 *   ========================================================================== */

export function ModeCWidget({ question, answer, onChange }: WidgetProps) {
  return (
    <div className="lugia-question-anim">
      <QuestionTitle prompt={question.open_prompt || ""} />
      <textarea
        value={answer.free_text || ""}
        onChange={(e) => onChange({ free_text: e.target.value })}
        rows={6}
        className="w-full px-4 py-3.5 border border-lugia-border rounded-[10px] text-[15px] leading-[1.55] resize-y focus:outline-none focus:border-lugia-accent bg-white min-h-[170px]"
        placeholder="Prenez le temps de répondre librement…"
      />
    </div>
  );
}

/* ============================================================================
 * Validation par mode — inchangée par rapport à V1.1.7
 *   ========================================================================== */

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
