"use client";

import { useState } from "react";

import { api } from "~/trpc/react";

interface BibleSelectProps {
  groupId: string;
  bookId?: string;
  chapterId?: string;
}

export function BibleSelect({ groupId, bookId, chapterId }: BibleSelectProps) {
  const [bibles] = api.bible.getBibleStatistics.useSuspenseQuery();
  const [selectedBookId, setSelectedBookId] = useState<number | null>(
    bookId ? Number(bookId) : null,
  );
  const [selectedChapterId, setSelectedChapterId] = useState<number | null>(
    chapterId ? Number(chapterId) : null,
  );

  const selectedBook =
    bibles?.find((b) => b.book_id === selectedBookId) ?? null;
  const chapters = selectedBook?.chaptersWithVerseCount ?? [];
  const selectedChapter =
    chapters.find((ch) => ch.chapter_id === selectedChapterId) ?? null;
  const versesCount = selectedChapter?.verse_count ?? 0;

  return (
    <div>
      <div className="mb-[40px] flex h-[40px] w-full gap-2">
        {/* TODO - Replace with custom dropdown */}
        <select
          className="flex-1 rounded-[50px] bg-[#302C27] px-[20px] py-[4px] text-[14px] text-white"
          value={selectedBookId ?? ""}
          onChange={(e) => {
            const val = e.target.value ? Number(e.target.value) : null;
            setSelectedBookId(val);
            setSelectedChapterId(null);
          }}
        >
          <option value="">성경</option>
          {bibles?.map((b) => (
            <option key={b.book_id} value={b.book_id}>
              {b.book_name}
            </option>
          ))}
        </select>

        {/* TODO - Replace with custom dropdown */}
        <select
          className="flex-1 rounded-[50px] bg-[#302C27] px-[20px] py-[4px] text-[14px] text-white"
          value={selectedChapterId ?? ""}
          onChange={(e) =>
            setSelectedChapterId(e.target.value ? Number(e.target.value) : null)
          }
          disabled={!selectedBookId}
        >
          <option value="">장수</option>
          {chapters.map((ch) => (
            <option key={ch.chapter_number} value={ch.chapter_id}>
              {ch.chapter_number}장
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {selectedBookId && selectedChapterId && versesCount > 0
          ? Array.from({ length: versesCount }, (_, index) => (
              <a
                key={index}
                href={`/scribe?group_id=${groupId}&book_id=${selectedBookId}&chapter_id=${selectedChapterId}&verse_number=${index + 1}`}
                className="flex h-[50px] w-full items-center justify-center rounded-[50px] bg-[#FFF8F2] p-2 text-[14px] text-[#302C27]"
              >
                {index + 1}절
              </a>
            ))
          : null}
      </div>
    </div>
  );
}
