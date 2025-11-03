import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import SpatialIcon from "@/ui/icons/SpatialIcon";
import { ICONS } from "@/ui/icons/registry";
import GlassCard from "@/ui/cards/GlassCard";

interface DropdownOption {
  value: string;
  label: string;
}

interface CustomDropdownProps {
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  "aria-label"?: string;
  buttonClassName?: string;
}

const VIEWPORT_MARGIN = 8;
const MIN_MENU_HEIGHT = 120;
const ITEM_HEIGHT = 40;            // hauteur uniforme d’une option (px)
const OVERSCAN = 6;                // options supplémentaires rendues autour du viewport

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  value,
  options,
  onChange,
  placeholder = "Sélectionner...",
  className = "",
  "aria-label": ariaLabel,
  buttonClassName = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openUp, setOpenUp] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number; width: number; maxHeight: number }>({
    top: 0,
    left: 0,
    width: 0,
    maxHeight: 240,
  });

  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selectedIndex = useMemo(
    () => Math.max(0, options.findIndex((o) => o.value === value)),
    [options, value]
  );

  // --- Positionnement / flip / hauteur dispo ---
  const calcAndSetPosition = () => {
    const btn = buttonRef.current;
    if (!btn) return;

    const rect = btn.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const width = rect.width;

    const left = Math.min(
      Math.max(rect.left, VIEWPORT_MARGIN),
      Math.max(VIEWPORT_MARGIN, vw - width - VIEWPORT_MARGIN)
    );

    const spaceBelow = vh - rect.bottom - VIEWPORT_MARGIN;
    const spaceAbove = rect.top - VIEWPORT_MARGIN;

    const shouldOpenUp = spaceBelow < 160 && spaceAbove > spaceBelow;
    setOpenUp(shouldOpenUp);

    const usableSpace = Math.max(MIN_MENU_HEIGHT, Math.floor(shouldOpenUp ? spaceAbove : spaceBelow));
    const top = shouldOpenUp ? rect.top - usableSpace : rect.bottom;

    setPosition({
      top,
      left,
      width,
      maxHeight: usableSpace,          // pas de “cap” arbitraire : on utilise tout l’espace dispo
    });
  };

  const toggle = () => setIsOpen((o) => !o);

  // --- Fermeture au clic extérieur ---
  useEffect(() => {
    const onDocMouseDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!rootRef.current?.contains(t) && !listRef.current?.contains(t)) setIsOpen(false);
    };
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, []);

  // --- Repositionnement à l’ouverture / scroll / resize ---
  useLayoutEffect(() => {
    if (!isOpen) return;
    calcAndSetPosition();

    const onScroll = () => calcAndSetPosition();
    const onResize = () => calcAndSetPosition();

    const ro = new ResizeObserver(() => calcAndSetPosition());
    if (buttonRef.current) ro.observe(buttonRef.current);

    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);

    // centrer l’élément sélectionné dans la vue au premier render ouvert
    requestAnimationFrame(() => {
      if (!listRef.current) return;
      const viewport = position.maxHeight;
      const targetTop = Math.max(0, selectedIndex * ITEM_HEIGHT - Math.max(0, viewport / 2 - ITEM_HEIGHT / 2));
      listRef.current.scrollTop = targetTop;
    });

    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // --- State de scroll pour la virtualisation ---
  const [scrollTop, setScrollTop] = useState(0);
  useEffect(() => {
    if (!isOpen) return;
    const el = listRef.current;
    if (!el) return;
    const onScroll = () => setScrollTop(el.scrollTop);
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [isOpen]);

  const totalHeight = options.length * ITEM_HEIGHT;
  const visibleCount = Math.ceil(position.maxHeight / ITEM_HEIGHT) + OVERSCAN * 2;
  const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - OVERSCAN);
  const endIndex = Math.min(options.length, startIndex + visibleCount);
  const offsetY = startIndex * ITEM_HEIGHT;
  const visibleSlice = options.slice(startIndex, endIndex);

  // --- Clavier (↑/↓/Enter/Escape) avec auto-scroll virtuel ---
  useEffect(() => {
    if (!isOpen) return;
    let highlight = Math.max(0, selectedIndex);
    const ensureVisible = (idx: number) => {
      const el = listRef.current;
      if (!el) return;
      const top = idx * ITEM_HEIGHT;
      const bottom = top + ITEM_HEIGHT;
      if (top < el.scrollTop) el.scrollTop = top;
      else if (bottom > el.scrollTop + el.clientHeight) el.scrollTop = bottom - el.clientHeight;
    };

    const onKey = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") {
        e.preventDefault();
        setIsOpen(false);
        buttonRef.current?.focus();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        highlight = Math.min(options.length - 1, highlight + 1);
        ensureVisible(highlight);
        // focus visuel après virtualisation
        const btn = listRef.current?.querySelector<HTMLButtonElement>(`[data-index='${highlight}']`);
        btn?.focus();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        highlight = Math.max(0, highlight - 1);
        ensureVisible(highlight);
        const btn = listRef.current?.querySelector<HTMLButtonElement>(`[data-index='${highlight}']`);
        btn?.focus();
      } else if (e.key === "Enter") {
        const btn = document.activeElement as HTMLButtonElement | null;
        if (btn?.dataset?.value) {
          onChange(btn.dataset.value);
          setIsOpen(false);
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onChange, options.length, selectedIndex]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    buttonRef.current?.focus();
  };

  const selectedOption = options.find((o) => o.value === value);

  const dropdown = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: openUp ? 6 : -6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: openUp ? 6 : -6, scale: 0.98 }}
          transition={{ duration: 0.14, ease: "easeOut" }}
          style={{
            position: "fixed",
            top: position.top,
            left: position.left,
            width: position.width,
            zIndex: 100000,
          }}
        >
          <GlassCard
            className="py-1 px-1 overflow-y-auto rounded-2xl"
            style={{
              maxHeight: position.maxHeight,
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.12) 60%, rgba(255,255,255,0.08) 100%)",
              backdropFilter: "blur(16px) saturate(160%)",
              border:
                CSS.supports("color", "color-mix(in srgb, white 28%, transparent)")
                  ? "1px solid color-mix(in srgb, white 28%, transparent)"
                  : "1px solid rgba(255,255,255,0.28)",
              boxShadow:
                "0 12px 32px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.2)",
            }}
            ref={listRef as any}
            role="listbox"
            aria-label={ariaLabel}
            aria-activedescendant={value || undefined}
          >
            {/* Espace total pour le scroll virtuel */}
            <div style={{ height: totalHeight, position: "relative" }}>
              {/* Fenêtre rendue */}
              <div style={{ position: "absolute", insetInlineStart: 0, top: offsetY, right: 0, left: 0 }}>
                <div className="space-y-1">
                  {visibleSlice.map((option, i) => {
                    const realIndex = startIndex + i;
                    const active = value === option.value;
                    return (
                      <button
                        key={option.value}
                        id={option.value}
                        data-index={realIndex}
                        data-value={option.value}
                        type="button"
                        role="option"
                        aria-selected={active}
                        onClick={() => handleSelect(option.value)}
                        className={`w-full h-10 px-3 text-left text-sm transition-colors outline-none rounded-xl
                                    focus:ring-2 focus:ring-white/30
                                    ${active ? "bg-cyan-400/20 text-cyan-300" : "text-white/85 hover:bg-white/10"}`}
                        style={{ lineHeight: `${ITEM_HEIGHT}px` }}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggle}
        className={`btn-glass w-full justify-between text-left ${buttonClassName}`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <SpatialIcon
          Icon={ICONS.ChevronDown}
          size={16}
          className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {createPortal(dropdown, document.body)}
    </div>
  );
};

export default CustomDropdown;