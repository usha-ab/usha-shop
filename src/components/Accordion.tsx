"use client";

import { useState, type ReactNode } from "react";
import { ChevronIcon } from "./icons";

interface Item {
  title: string;
  content: ReactNode;
}

export function Accordion({ items, defaultOpen = 0 }: { items: Item[]; defaultOpen?: number }) {
  const [open, setOpen] = useState<number | null>(defaultOpen);

  return (
    <div className="divide-y divide-border rounded-xl2 border border-border bg-card">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.title}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between px-5 py-4 text-left"
              aria-expanded={isOpen}
            >
              <span className="font-medium">{item.title}</span>
              <ChevronIcon
                className={`h-5 w-5 text-muted transition-transform ${isOpen ? "rotate-180" : ""}`}
              />
            </button>
            {isOpen && <div className="px-5 pb-5 text-sm leading-relaxed text-muted">{item.content}</div>}
          </div>
        );
      })}
    </div>
  );
}
