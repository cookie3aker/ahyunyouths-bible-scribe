"use client";

import { useState } from "react";

import { api } from "~/trpc/react";

export function BibleSelect() {
  const [bibles] = api.bible.getBibleStatistics.useSuspenseQuery();
  const [selectedBookId, setSelectedBookId] = useState<number | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<number | null>(
    null,
  );

  const selectedBook =
    bibles?.find((b) => b.book_id === selectedBookId) ?? null;
  const chapters = selectedBook?.chaptersWithVerseCount ?? [];
  const selectedChapter =
    chapters.find((ch) => ch.chapter_id === selectedChapterId) ?? null;
  const versesCount = selectedChapter?.verse_count ?? 0;

  return (
    <div className="mb-4 grid grid-cols-2 gap-4">
      <select
        className="rounded border px-2 py-1"
        value={selectedBookId ?? ""}
        onChange={(e) => {
          const val = e.target.value ? Number(e.target.value) : null;
          setSelectedBookId(val);
          setSelectedChapterId(null);
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
        value={selectedChapterId ?? ""}
        onChange={(e) =>
          setSelectedChapterId(e.target.value ? Number(e.target.value) : null)
        }
        disabled={!selectedBookId}
      >
        <option value="">장 선택</option>
        {chapters.map((ch) => (
          <option key={ch.chapter_number} value={ch.chapter_id}>
            {ch.chapter_number}장
          </option>
        ))}
      </select>

      <div className="col-span-2 grid grid-cols-3 gap-2">
        {selectedBookId && selectedChapterId && versesCount > 0
          ? Array.from({ length: versesCount }, (_, index) => (
              <a
                key={index}
                href={`/scribe?book_id=${selectedBookId}&chapter_id=${selectedChapterId}&verse_number=${index + 1}`}
                className="block rounded border p-2 text-center"
              >
                {index + 1}절
              </a>
            ))
          : null}
      </div>
    </div>
  );
}
