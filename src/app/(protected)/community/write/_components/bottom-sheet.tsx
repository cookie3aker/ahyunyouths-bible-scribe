"use client";

import { use, useEffect, useRef, useState } from "react";
import { api } from "~/trpc/react";

export interface BibleSelection {
  bookId?: number;
  bookName?: string;
  chapterId?: number;
  chapterNumber?: number;
  verseId?: number;
  verseNumber?: number;
}

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (selection: BibleSelection) => void;
}

export default function BottomSheet({
  isOpen,
  onClose,
  onSelect,
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const selectRef = useRef<HTMLDivElement>(null);

  const [step, setStep] = useState<"book" | "chapter" | "verse">("book");
  const [selection, setSelection] = useState<BibleSelection>({});

  useEffect(() => {
    if (isOpen) {
      setSelection({});
      setStep("book");
    }
  }, [isOpen]);

  const { data: bibles } = api.bible.getBibleStatistics.useQuery();
  const selectedBook =
    bibles?.find((b) => b.book_id === selection.bookId) ?? null;
  const chapters = selectedBook?.chaptersWithVerses ?? [];
  const selectedChapter =
    chapters.find((ch) => ch.chapter_id === selection.chapterId) ?? null;
  const verses = selectedChapter?.verses ?? [];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sheetRef.current &&
        !sheetRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/25 backdrop-blur-lg">
      <div
        ref={sheetRef}
        className="fixed right-0 bottom-0 left-0 max-h-[80vh] rounded-t-[20px] bg-white/95 px-[20px] pt-[24px] pb-[44px] shadow-lg"
      >
        <div className="mb-4 flex justify-center">
          <div className="h-1 w-[40px] rounded-full bg-gray-300" />
        </div>

        <div className="space-y-4">
          <h3 className="text-[18px] font-bold">
            {step === "book" && "성경을 선택해줘"}
            {step === "chapter" &&
              `${selection.bookName}의 어떤 장이 흥미로웠어?`}
            {step === "verse" &&
              `${selection.bookName} ${selection.chapterNumber}장의 어떤 절이 흥미로웠어?`}
          </h3>

          <div ref={selectRef} className="max-h-[60vh] overflow-y-auto">
            {step === "book" && bibles && (
              <div className="grid grid-cols-1 gap-2">
                {Object.values(bibles).map((book) => (
                  <button
                    key={book.book_id}
                    className="rounded-lg bg-gray-50 px-4 py-3 text-left text-[15px] font-bold hover:bg-gray-100"
                    onClick={() => {
                      setSelection({
                        bookId: book.book_id,
                        bookName: book.book_name,
                      });
                      setStep("chapter");
                      selectRef.current?.scrollTo(0, 0);
                    }}
                  >
                    {book.book_name}
                  </button>
                ))}
              </div>
            )}

            {step === "chapter" && bibles && selection.bookId && (
              <div className="grid grid-cols-1 gap-2">
                {chapters.map((chapter) => (
                  <button
                    key={chapter.chapter_id}
                    className="rounded-lg bg-gray-50 px-4 py-3 text-left text-[15px] font-bold hover:bg-gray-100"
                    onClick={() => {
                      setSelection({
                        ...selection,
                        chapterId: chapter.chapter_id,
                        chapterNumber: chapter.chapter_number,
                      });
                      setStep("verse");
                      selectRef.current?.scrollTo(0, 0);
                    }}
                  >
                    {chapter.chapter_number}장
                  </button>
                ))}
              </div>
            )}

            {step === "verse" &&
              bibles &&
              selection.bookId &&
              selection.chapterId && (
                <div className="grid grid-cols-1 gap-2">
                  {verses.map((verse) => (
                    <button
                      key={verse.verse_id}
                      className="rounded-lg bg-gray-50 px-4 py-3 text-left text-[15px] font-bold hover:bg-gray-100"
                      onClick={() => {
                        const finalSelection: BibleSelection = {
                          ...selection,
                          verseId: verse.verse_id,
                          verseNumber: verse.verse_number,
                        };
                        onSelect(finalSelection);
                        onClose();
                      }}
                    >
                      {verse.verse_number}절
                    </button>
                  ))}
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
