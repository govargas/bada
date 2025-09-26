import { Link } from "react-router-dom";
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
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="card p-4 flex items-center justify-between gap-4"
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          {/* Drag handle (hidden when disabled) */}
          {!disabled && (
            <button
              aria-label="Drag to reorder"
              className="cursor-grab active:cursor-grabbing rounded p-1 border border-transparent hover:border-border"
              {...attributes}
              {...listeners}
            >
              {/* simple grip dots */}
              <span
                aria-hidden
                className="inline-block w-1.5 h-1.5 bg-ink/60 rounded-sm mr-0.5"
              />
              <span
                aria-hidden
                className="inline-block w-1.5 h-1.5 bg-ink/60 rounded-sm mr-0.5"
              />
              <span
                aria-hidden
                className="inline-block w-1.5 h-1.5 bg-ink/60 rounded-sm"
              />
            </button>
          )}
          <Link
            to={`/beach/${id}`}
            className="font-medium hover:underline block truncate"
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

      <div className="flex items-center gap-2 shrink-0">
        <Link
          to={`/beach/${id}`}
          className="px-3 py-1.5 rounded-lg border border-border hover:bg-surface-muted text-sm"
        >
          View
        </Link>
        <button
          className="px-3 py-1.5 rounded-lg border border-border hover:bg-surface-muted text-sm"
          onClick={onRemove}
          aria-label={`Remove ${name} from favorites`}
        >
          Remove
        </button>
      </div>
    </li>
  );
}
