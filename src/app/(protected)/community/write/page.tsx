"use client";

import { useState } from "react";
import type { ChangeEvent } from "react";
import BottomSheet, { type BibleSelection } from "./_components/bottom-sheet";
import { api } from "~/trpc/react";
import { SuccessModal } from "./_components/success-modal";

export default function WritePage() {
  const [content, setContent] = useState("");
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [selectedBible, setSelectedBible] = useState<BibleSelection | null>(
    null,
  );

  const utils = api.useUtils();
  const { mutateAsync: createPost, isSuccess } = api.post.create.useMutation();

  const handleTextAreaChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= 500) {
      setContent(newValue);
      e.target.style.height = "auto";
      e.target.style.height = `${Math.max(120, e.target.scrollHeight)}px`;
    }
  };

  const handleClickSelectBible = () => {
    setSelectedBible(null);
    setIsBottomSheetOpen(true);
  };

  const handleClickSave = async () => {
    if (
      !selectedBible?.bookId ||
      !selectedBible?.chapterId ||
      !selectedBible?.verseId
    )
      return;

    try {
      await createPost({
        content,
        bookId: selectedBible.bookId,
        chapterId: selectedBible.chapterId,
        verseId: selectedBible.verseId,
      });
      await utils.post.getPostsInfinite.invalidate();
    } catch (error) {
      console.error("Failed to create post:", error);
    }
  };

  return (
    <>
      <main className="flex-grow px-[20px] pb-[130px]">
        <div className="mb-[30px] w-full">
          <p className="text-[18px] leading-[34px] font-bold">
            필사를 하며 은혜를 받았던
            <br />
            본문을 고르고 나눔을 써줘!
          </p>
        </div>

        <div>
          <button
            onClick={handleClickSelectBible}
            className="flex h-[74px] w-full justify-between rounded-t-[20px] bg-[#CFE3EF]/60 px-[20px] py-[16px]"
          >
            <span className="text-[12px] font-bold text-[#4B90BB]">
              {selectedBible
                ? `${selectedBible.bookName} ${selectedBible.chapterNumber}:${selectedBible.verseNumber}`
                : "은혜 받았던 본문을 선택해줘"}
            </span>
            <svg
              width="19"
              height="11"
              viewBox="0 0 19 11"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1.5 1L9.5 9L17.5 1"
                stroke="#72A8CB"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>

          <BottomSheet
            isOpen={isBottomSheetOpen}
            onClose={() => setIsBottomSheetOpen(false)}
            onSelect={(selection) => {
              setSelectedBible(selection);
              setIsBottomSheetOpen(false);
            }}
          />

          <div className="relative mb-[36px]">
            <textarea
              onChange={handleTextAreaChange}
              rows={1}
              value={content}
              maxLength={500}
              spellCheck={false}
              placeholder="너의 은혜를 나눠줘!"
              className="h-auto min-h-[120px] w-full -translate-y-[30px] resize-none rounded-[20px] bg-[#FFFFFF] px-[24px] py-[30px] outline-none"
            />
            <div className="absolute right-1 bottom-2 text-sm text-[15px] font-bold">
              {content.length}/500
            </div>
          </div>

          <button
            onClick={handleClickSave}
            disabled={
              !selectedBible?.bookId ||
              !selectedBible?.chapterId ||
              !selectedBible?.verseId ||
              !content
            }
            className={`h-[44px] w-full rounded-[20px] bg-[#8CBEDE] text-[14px] font-bold text-[#FFFFFF] ${
              !selectedBible?.bookId ||
              !selectedBible?.chapterId ||
              !selectedBible?.verseId ||
              !content
                ? "bg-[#E5EEF3] text-[#9FBFD1]"
                : "bg-[#8CBEDE] text-[#FFFFFF]"
            }"`}
          >
            저장하기
          </button>
        </div>
      </main>

      {isSuccess && <SuccessModal />}
    </>
  );
}
