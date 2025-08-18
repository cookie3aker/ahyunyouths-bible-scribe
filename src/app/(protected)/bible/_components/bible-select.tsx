"use client";

import { useState } from "react";
import Select, { components } from "react-select";
import type { OptionProps, GroupBase } from "react-select";
import { api } from "~/trpc/react";

type OptionType = { value: number; label: string };

const OptionWithSeparator = (
  props: OptionProps<OptionType, false, GroupBase<OptionType>>,
) => {
  const { options, data, children } = props;
  // Only count OptionType, skip GroupBase
  const flatOptions = options.filter(
    (opt): opt is OptionType => (opt as OptionType).value !== undefined,
  );
  const index = flatOptions.findIndex((opt) => opt.value === data.value);
  return (
    <>
      <components.Option {...props}>{children}</components.Option>
      {index < flatOptions.length - 1 && (
        <div
          style={{
            height: 1,
            background: "#E0E0E0",
            margin: "4px 14px",
          }}
        />
      )}
    </>
  );
};

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
  const chapters = selectedBook?.chaptersWithVerses ?? [];
  const selectedChapter =
    chapters.find((ch) => ch.chapter_id === selectedChapterId) ?? null;
  const verses = selectedChapter?.verses ?? [];

  return (
    <div>
      <div className="mb-[40px] flex h-[40px] w-full gap-2">
        <Select
          components={{ Option: OptionWithSeparator }}
          classNamePrefix="bible-select"
          className="flex-1"
          isSearchable={false}
          styles={{
            indicatorSeparator: () => ({
              display: "none",
            }),
            clearIndicator: () => ({
              display: "none",
            }),
            control: (base) => ({
              ...base,
              borderRadius: 50,
              background: "#302C27",
              minHeight: 40,
              color: "white",
              fontSize: 14,
              paddingLeft: 12,
              paddingRight: 12,
            }),
            singleValue: (base) => ({ ...base, color: "white" }),
            menu: (base) => ({
              ...base,
              borderRadius: 12,
              background: "#FFF8F2",
              color: "white",
            }),
            option: (base, state) => ({
              ...base,
              borderRadius: 12,
              background: state.isSelected
                ? "#FFF8F2"
                : state.isFocused
                  ? "#FFF8F2"
                  : "#FFF8F2",
              color: "black",
              fontSize: 15,
              padding: "10px 20px",
            }),
          }}
          placeholder="성경"
          isClearable
          value={
            bibles?.find((b) => b.book_id === selectedBookId)
              ? {
                  value: selectedBookId!,
                  label:
                    bibles.find((b) => b.book_id === selectedBookId)
                      ?.book_name ?? "",
                }
              : undefined
          }
          onChange={(option) => {
            setSelectedBookId(option ? Number(option.value) : null);
            setSelectedChapterId(null);
          }}
          options={bibles?.map((b) => ({
            value: b.book_id,
            label: b.book_name,
          }))}
        />

        <Select
          components={{ Option: OptionWithSeparator }}
          classNamePrefix="bible-select"
          className="flex-1"
          isSearchable={false}
          styles={{
            indicatorSeparator: () => ({
              display: "none",
            }),
            clearIndicator: () => ({
              display: "none",
            }),
            control: (base) => ({
              ...base,
              borderRadius: 50,
              background: "#302C27",
              minHeight: 40,
              color: "white",
              fontSize: 14,
              paddingLeft: 12,
              paddingRight: 12,
            }),
            singleValue: (base) => ({ ...base, color: "white" }),
            menu: (base) => ({
              ...base,
              borderRadius: 12,
              background: "#FFF8F2",
              color: "white",
            }),
            option: (base, state) => ({
              ...base,
              borderRadius: 12,
              background: state.isSelected
                ? "#FFF8F2"
                : state.isFocused
                  ? "#FFF8F2"
                  : "#FFF8F2",
              color: "black",
              fontSize: 15,
              padding: "10px 20px",
            }),
          }}
          placeholder="장수"
          isClearable
          isDisabled={!selectedBookId}
          value={
            chapters.find((ch) => ch.chapter_id === selectedChapterId)
              ? {
                  value: selectedChapterId!,
                  label: `${chapters.find((ch) => ch.chapter_id === selectedChapterId)?.chapter_number ?? ""}장`,
                }
              : undefined
          }
          onChange={(option) => {
            setSelectedChapterId(option ? Number(option.value) : null);
          }}
          options={chapters.map((ch) => ({
            value: ch.chapter_id,
            label: `${ch.chapter_number}장`,
          }))}
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        {selectedBookId && selectedChapterId && verses.length > 0
          ? verses.map((it) => (
              <a
                key={it.verse_id}
                href={`/scribe?book_id=${selectedBookId}&chapter_id=${selectedChapterId}&verse_id=${it.verse_id}`}
                className="flex h-[50px] w-full items-center justify-center rounded-[50px] bg-[#FFF8F2] p-2 text-[14px] text-[#302C27]"
              >
                {it.verse_number}절
              </a>
            ))
          : null}
      </div>
    </div>
  );
}
