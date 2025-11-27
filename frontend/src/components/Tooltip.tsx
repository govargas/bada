import { ReactNode, useState, useRef, useEffect } from "react";

interface TooltipProps {
  content: string;
  children: ReactNode;
}

export default function Tooltip({ content, children }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [styles, setStyles] = useState<{
    position: "top" | "bottom";
    offsetX: number;
  }>({ position: "bottom", offsetX: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && tooltipRef.current && containerRef.current) {
      const tooltip = tooltipRef.current;
      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();

      let position: "top" | "bottom" = "bottom";
      let offsetX = 0;

      // Check vertical space - prefer bottom to avoid cutting off at top
      const spaceAbove = containerRect.top;
      const spaceBelow = window.innerHeight - containerRect.bottom;

      if (spaceBelow >= tooltipRect.height + 8) {
        position = "bottom";
      } else if (spaceAbove >= tooltipRect.height + 8) {
        position = "top";
      } else {
        position = "bottom"; // default to bottom if neither fits
      }

      // Check horizontal bounds and adjust if needed
      const tooltipLeft =
        containerRect.left + containerRect.width / 2 - tooltipRect.width / 2;
      const tooltipRight = tooltipLeft + tooltipRect.width;

      if (tooltipLeft < 8) {
        offsetX = 8 - tooltipLeft;
      } else if (tooltipRight > window.innerWidth - 8) {
        offsetX = window.innerWidth - 8 - tooltipRight;
      }

      setStyles({ position, offsetX });
    }
  }, [isVisible, content]);

  return (
    <div
      ref={containerRef}
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          ref={tooltipRef}
          className={`absolute left-1/2 ${
            styles.position === "top" ? "bottom-full mb-2" : "top-full mt-2"
          } w-48 px-3 py-2 text-xs leading-relaxed bg-ink text-surface rounded-lg shadow-lg z-[100] pointer-events-none`}
          style={{
            transform: `translateX(calc(-50% + ${styles.offsetX}px))`,
          }}
          role="tooltip"
        >
          <div
            className={`absolute left-1/2 w-0 h-0 border-l-4 border-r-4 border-transparent ${
              styles.position === "top"
                ? "top-full -mt-1 border-t-4 border-t-ink"
                : "bottom-full -mb-1 border-b-4 border-b-ink"
            }`}
            style={{
              transform: `translateX(calc(-50% - ${styles.offsetX}px))`,
            }}
          />
          {content}
        </div>
      )}
    </div>
  );
}
