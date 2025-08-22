"use client";

import Link from "next/link";
import { useState } from "react";
import { challenge } from "~/policy/challenge";
import { api } from "~/trpc/react";

interface BibleSelectProps {
  groupId: string;
  bookId?: string;
  chapterId?: string;
}

export function BibleSelect({ groupId, bookId, chapterId }: BibleSelectProps) {
  const [bibles] = api.bible.getBibleStatistics.useSuspenseQuery();
  const [scribeByGroup] = api.bible.getScribeByGroup.useSuspenseQuery({
    group_id: Number(groupId),
  });

  const scribes = Object.values(scribeByGroup).flat();

  const [selectedBookId, setSelectedBookId] = useState<number | null>(
    bookId ? Number(bookId) : null,
  );
  const [selectedChapterId, setSelectedChapterId] = useState<number | null>(
    chapterId ? Number(chapterId) : null,
  );

  const myGroupBibles = bibles.filter((b) =>
    challenge[Number(groupId) as keyof typeof challenge].books?.includes(
      b.book_id || 0,
    ),
  );

  const selectedBook =
    myGroupBibles?.find((b) => b.book_id === selectedBookId) ?? null;
  const chapters = selectedBook?.chaptersWithVerses ?? [];
  const selectedChapter =
    chapters.find((ch) => ch.chapter_id === selectedChapterId) ?? null;
  const verses = selectedChapter?.verses ?? [];

  const handleClickBookBreadCrumb = () => {
    setSelectedBookId(null);
    setSelectedChapterId(null);
  };

  const handleClickChapterBreadCrumb = () => {
    setSelectedChapterId(null);
  };

  return (
    <div>
      <div className="mb-[16px] text-[17px] font-bold text-[#75B2DA]">
        <button onClick={handleClickBookBreadCrumb}>
          {selectedBook?.book_name && <span>{selectedBook?.book_name}</span>}
        </button>
        {selectedChapter?.chapter_number && (
          <span>
            {` > `}
            <button onClick={handleClickChapterBreadCrumb}>
              {selectedChapter?.chapter_number}장
            </button>
          </span>
        )}
      </div>

      {!selectedBook && (
        <div className="grid grid-cols-2 gap-3">
          {myGroupBibles.map((book) => (
            <button
              key={book.book_id}
              onClick={() => {
                setSelectedBookId(book.book_id);
                setSelectedChapterId(null);
              }}
              className={`flex h-[50px] w-full items-center justify-center rounded-[50px] ${
                bibles
                  .find((b) => b.book_id === book.book_id)
                  ?.chaptersWithVerses.every((chapter) =>
                    chapter.verses.every((verse) =>
                      scribes.some(
                        (scribe) =>
                          scribe.book_id === book.book_id &&
                          scribe.chapter_id === chapter.chapter_id &&
                          scribe.verse_id === verse.verse_id,
                      ),
                    ),
                  )
                  ? "bg-[#CFE3EF]"
                  : "bg-[#FFFBF7]"
              } p-2 text-[14px] text-[#302C27] shadow`}
            >
              {book.book_name}
            </button>
          ))}
        </div>
      )}

      {selectedBook && !selectedChapter && (
        <div className="grid grid-cols-3 gap-3">
          {chapters.map((chapter) => (
            <button
              key={chapter.chapter_id}
              onClick={() => {
                setSelectedChapterId(chapter.chapter_id);
              }}
              className={`flex h-[50px] w-full items-center justify-center rounded-[50px] ${
                chapter.verses.every((verse) =>
                  scribes.some(
                    (scribe) =>
                      scribe.book_id === selectedBook.book_id &&
                      scribe.chapter_id === chapter.chapter_id &&
                      scribe.verse_id === verse.verse_id,
                  ),
                )
                  ? "bg-[#CFE3EF]"
                  : "bg-[#FFFBF7]"
              } p-2 text-[14px] text-[#302C27] shadow`}
            >
              {chapter.chapter_number}장
            </button>
          ))}
        </div>
      )}

      {selectedBookId && selectedChapterId && verses.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {verses.map((it) => (
            <a
              key={it.verse_id}
              href={`/scribe?book_id=${selectedBookId}&chapter_id=${selectedChapterId}&verse_id=${it.verse_id}`}
              className={`flex h-[50px] w-full items-center justify-center rounded-[50px] ${
                scribes.some(
                  (scribe) =>
                    scribe.book_id === selectedBookId &&
                    scribe.chapter_id === selectedChapterId &&
                    scribe.verse_id === it.verse_id,
                )
                  ? "bg-[#CFE3EF]"
                  : "bg-[#FFFBF7]"
              } p-2 text-[14px] text-[#302C27] shadow`}
            >
              {it.verse_number}절
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
