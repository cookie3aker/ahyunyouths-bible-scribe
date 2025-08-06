"use client";

import { useState } from "react";

import { api } from "~/trpc/react";

export function BibleSelect() {
  const [bibles] = api.bible.getBibleStatistics.useSuspenseQuery();
  const [selectedBookId, setSelectedBookId] = useState<number | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);

  const selectedBook =
    bibles?.find((b) => b.book_id === selectedBookId) ?? null;
  const chapters = selectedBook?.chaptersWithVerseCount ?? [];

  return (
    <div className="mb-4 grid grid-cols-2 gap-4">
      <select
        className="rounded border px-2 py-1"
        value={selectedBookId ?? ""}
        onChange={(e) => {
          const val = e.target.value ? Number(e.target.value) : null;
          setSelectedBookId(val);
          setSelectedChapter(null);
        }}
      >
        <option value="">성경을 선택하세요</option>
        {bibles?.map((b) => (
          <option key={b.book_id} value={b.book_id}>
            {b.book_name}
          </option>
        ))}
      </select>
      <select
        className="rounded border px-2 py-1"
        value={selectedChapter ?? ""}
        onChange={(e) =>
          setSelectedChapter(e.target.value ? Number(e.target.value) : null)
        }
        disabled={!selectedBookId}
      >
        <option value="">장 선택</option>
        {chapters.map((ch) => (
          <option key={ch.chapter_number} value={ch.chapter_number}>
            {ch.chapter_number}장
          </option>
        ))}
      </select>
    </div>
  );
}
