"use client";

import { CalendarDays } from "lucide-react";
import { useMemo, useRef, useState } from "react";

type DateTimePickerFieldProps = {
  value: Date | null;
  onChangeAction: (value: Date | null) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  name?: string;
  [key: string]: unknown;
};

function formatDueText(date: Date) {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${hh}:${min} ${dd}/${mm}/${yyyy}`;
}

// Konwersja String z UI na UTC Datetime (dla bazy).
function parseDueText(input: string): Date | null {
  const match = input.trim().match(/^(\d{2}):(\d{2})\s(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;

  const [, hh, min, dd, mm, yyyy] = match;
  const date = new Date(Number(yyyy), Number(mm) - 1, Number(dd), Number(hh), Number(min));
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function toDateTimeLocalValue(date: Date | null) {
  if (!date) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${d}T${hh}:${mm}`;
}

function fromDateTimeLocalValue(value: string) {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

export default function DateTimePickerField({
  value,
  onChangeAction,
  placeholder = "Wybierz termin",
  className,
  inputClassName,
  name,
}: DateTimePickerFieldProps) {
  const [draftText, setDraftText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const pickerRef = useRef<HTMLInputElement>(null);

  const shownText = useMemo(() => {
    if (isEditing) return draftText;
    return value ? formatDueText(value) : "";
  }, [draftText, isEditing, value]);

  function openPicker() {
    const picker = pickerRef.current;
    if (!picker) return;

    if (typeof picker.showPicker === "function") {
      picker.showPicker();
      return;
    }

    picker.focus();
    picker.click();
  }

  function handleBlur() {
    setIsEditing(false);
    if (!draftText.trim()) {
      onChangeAction(null);
      setDraftText("");
      setError("");
      return;
    }

    const parsed = parseDueText(draftText);
    if (!parsed) {
      setError("Uzyj formatu HH:MM DD/MM/YYYY");
      return;
    }

    onChangeAction(parsed);
    setDraftText(formatDueText(parsed));
    setError("");
  }

  return (
    <div className={className}>
      <div className="relative">
        <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          value={shownText}
          onClick={openPicker}
          onFocus={() => {
            setIsEditing(true);
            setDraftText(value ? formatDueText(value) : "");
          }}
          onChange={(event) => setDraftText(event.target.value)}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={`w-full rounded-md border bg-white py-2 pl-9 pr-3 text-sm text-gray-700 outline-none ${inputClassName ?? "border-gray-200"}`}
        />
        <input
          ref={pickerRef}
          type="datetime-local"
          value={toDateTimeLocalValue(value)}
          onChange={(event) => {
            const parsed = fromDateTimeLocalValue(event.target.value);
            onChangeAction(parsed);
            setDraftText(parsed ? formatDueText(parsed) : "");
            setError("");
          }}
          className="pointer-events-none absolute inset-0 h-0 w-0 opacity-0"
          tabIndex={-1}
          aria-hidden="true"
        />
      </div>
      {/* Hidden input so the parent form will include the ISO datetime value */}
      {name ? <input type="hidden" name={name} value={value ? value.toISOString() : ""} /> : null}
      {error ? <p className="mt-1 text-xs text-red-500">{error}</p> : null}
    </div>
  );
}