import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type Props = {
  id: string; // beachId
  name: string;
  muni: string;
  classificationText: string;
  classificationClass: string; // Tailwind badge class
  onRemove: () => void;
  disabled?: boolean;
};

export default function SortableFavorite({
  id,
  name,
  muni,
  classificationText,
  classificationClass,
  onRemove,
  disabled,
}: Props) {
  const { t } = useTranslation();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.85 : 1,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="w-full card p-4 flex items-start justify-between gap-4"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {/* Drag handle */}
          {!disabled && (
            <button
              aria-label={t("favorites.dragToReorder")}
              className="shrink-0 w-6 h-6 grid place-items-center cursor-grab active:cursor-grabbing rounded hover:bg-surface-muted"
              {...attributes}
              {...listeners}
            >
              {/* 2x2 grip dots */}
              <span className="grid grid-cols-2 gap-0.5" aria-hidden>
                <span className="w-1.5 h-1.5 bg-ink/60 rounded-sm" />
                <span className="w-1.5 h-1.5 bg-ink/60 rounded-sm" />
                <span className="w-1.5 h-1.5 bg-ink/60 rounded-sm" />
                <span className="w-1.5 h-1.5 bg-ink/60 rounded-sm" />
              </span>
            </button>
          )}

          <Link
            to={`/beach/${id}`}
            className="font-medium hover:underline block truncate max-w-[200px] sm:max-w-none"
            title={name}
          >
            {name}
          </Link>
        </div>

        <div className="text-sm text-ink-muted truncate">{muni || "—"}</div>

        <div className="mt-1">
          <span className={`badge ${classificationClass}`}>
            {classificationText}
          </span>
        </div>
      </div>

      {/* Actions - allow wrapping on narrow screens */}
      <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
        <Link
          to={`/beach/${id}`}
          className="px-3 py-1.5 rounded-lg border border-border hover:bg-surface-muted text-sm"
        >
          {t("favorites.view")}
        </Link>
        <button
          className="px-3 py-1.5 rounded-lg border border-border hover:bg-surface-muted text-sm"
          onClick={onRemove}
          aria-label={`${t("favorites.remove")} ${name}`}
        >
          {t("favorites.remove")}
        </button>
      </div>
    </li>
  );
}
