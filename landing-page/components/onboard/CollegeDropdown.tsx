"use client";

import { memo, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";

function getInitials(input: string) {
  return input
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0]?.toUpperCase())
    .join("");
}

interface CollegeDropdownProps {
  query: string;
  options: string[];
  open: boolean;
  onSelect: (value: string) => void;
  onClose: () => void;
}

function CollegeDropdown({ query, options, open, onSelect, onClose }: CollegeDropdownProps) {
  const deferredQuery = useDeferredValue(query);
  const trimmed = deferredQuery.trim();
  const normalized = trimmed.toLowerCase();
  const normalizedInitials = trimmed.replace(/\s+/g, "").toUpperCase();
  const listRef = useRef<HTMLDivElement | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const ITEM_HEIGHT = 40;
  const VIEWPORT_HEIGHT = 240;

  const indexedOptions = useMemo(
    () =>
      options.map((name) => ({
        name,
        lower: name.toLowerCase(),
        initials: getInitials(name),
      })),
    [options]
  );

  const filtered = useMemo(() => {
    if (!trimmed) return indexedOptions.map((o) => o.name);
    const tokens = normalized.split(/\s+/).filter(Boolean);
    return indexedOptions
      .filter((opt) => {
        return tokens.every((token) => {
          if (opt.lower.includes(token)) return true;
          if (token.length >= 2 && opt.initials.startsWith(token.toUpperCase())) return true;
          const words = opt.lower.split(/[\s,.-]+/).filter(Boolean);
          return words.some((w) => w.startsWith(token));
        });
      })
      .map((opt) => opt.name);
  }, [trimmed, normalized, indexedOptions]);

  if (!open) return null;

  const hasExact = !!trimmed && indexedOptions.some((opt) => opt.lower === normalized);
  const total = filtered.length;
  const visibleCount = Math.ceil(VIEWPORT_HEIGHT / ITEM_HEIGHT);
  const start = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - 4);
  const end = Math.min(total, start + visibleCount + 8);
  const visibleItems = filtered.slice(start, end);
  const padTop = start * ITEM_HEIGHT;
  const padBottom = Math.max(0, (total - end) * ITEM_HEIGHT);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = 0;
    setScrollTop(0);
  }, [trimmed]);

  return (
    <div
      className="absolute left-0 right-0 top-full mt-2 rounded-xl border border-stone-200 bg-white shadow-lg shadow-orange-100/60 overflow-hidden z-20"
      onMouseDown={(e) => e.preventDefault()}
    >
      <div
        ref={listRef}
        className="max-h-60 overflow-auto"
        style={{ maxHeight: VIEWPORT_HEIGHT }}
        onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
      >
        {trimmed && !hasExact && (
          <button
            type="button"
            onClick={() => {
              onSelect(trimmed);
              onClose();
            }}
            className="w-full text-left px-4 py-2.5 text-sm text-stone-700 hover:bg-orange-50 hover:text-stone-900 transition-colors"
          >
            Use “{trimmed}”
          </button>
        )}

        <div style={{ paddingTop: padTop, paddingBottom: padBottom }}>
          {visibleItems.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => {
                onSelect(name);
                onClose();
              }}
              className="w-full text-left px-4 py-2.5 text-sm text-stone-700 hover:bg-orange-50 hover:text-stone-900 transition-colors"
            >
              {name}
            </button>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="px-4 py-3 text-sm text-stone-400">No matches found.</div>
        )}
      </div>
    </div>
  );
}

export default memo(CollegeDropdown);
