"use client";

import { useRouter } from "next/navigation";
import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useLayoutEffect,
} from "react";
import toast from "react-hot-toast";
import { api } from "~/trpc/react";

interface TypingProps {
  targetText: string;
  userId: string;
  groupId: number;
  bookId: number;
  chapterId: number;
  verseId: number;
  verseList: number[];
}

export function Typing({
  targetText,
  userId,
  groupId,
  bookId,
  chapterId,
  verseId,
  verseList,
}: TypingProps) {
  const router = useRouter();

  const currentVerseIndex = verseList.findIndex((it) => it === Number(verseId));
  const nextVerseId = verseList[currentVerseIndex + 1];

  const [currentInput, setCurrentInput] = useState("");
  const [currentPosition, setCurrentPosition] = useState(0);
  const [isComposing, setIsComposing] = useState(false);
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canEdit, setCanEdit] = useState(true);
  // 조합 시작 시 이전 값 복구는 이제 필요 없으므로 스냅샷 제거

  const { data: subScribeData } = api.bible.getScribe.useQuery({
    user_id: userId,
    group_id: groupId,
    book_id: bookId,
    chapter_id: chapterId,
    verse_id: verseId,
  });

  const { mutateAsync: saveScribe } = api.bible.saveScribe.useMutation();

  const resetStates = () => {
    setCurrentInput("");
    setCurrentPosition(0);
    setIsComposing(false);
    setCanEdit(true);
  };

  const onSuccessScribe = useCallback(() => {
    if (nextVerseId) {
      toast.success(`필사 완료! 다음 절로 이동할게!`);
      setTimeout(() => {
        router.replace(
          `/scribe?book_id=${bookId}&chapter_id=${chapterId}&verse_id=${nextVerseId}`,
        );
      }, 1000);
    } else {
      toast.success(`마지막 절 필사 완료!`);
      setTimeout(() => {
        router.replace(
          `/bible?group_id=${groupId}&book_id=${bookId}&chapter_id=${chapterId}`,
        );
      }, 1000);
    }
  }, [bookId, chapterId, groupId, nextVerseId, router]);

  useEffect(() => {
    // 컴포넌트 마운트 시 숨겨진 input에 포커스
    resetStates();
    setTimeout(() => {
      if (hiddenInputRef.current) {
        hiddenInputRef.current.focus();
      }
    }, 100);
  }, [targetText]);

  useEffect(() => {
    // 모든 글자가 일치하는지 확인 (조합 중이 아닐 때만)
    if (subScribeData) {
      // 구독 데이터가 있다면 현재 입력값을 초기화
      setCurrentInput(targetText);
      setCurrentPosition(targetText.length);
      setCanEdit(false); // 필사 완료 후 수정 불가
      return;
    }

    if (
      // !isComposing &&
      currentInput.length === targetText.length &&
      currentInput === targetText
    ) {
      setCanEdit(false);
      saveScribe({
        user_id: userId,
        group_id: groupId,
        book_id: bookId,
        chapter_id: chapterId,
        verse_id: verseId,
      })
        .then(onSuccessScribe)
        .catch((error) => {
          console.error("Failed to save scribe:", error);
        });
    }
  }, [
    currentInput,
    isComposing,
    subScribeData,
    targetText,
    userId,
    groupId,
    bookId,
    chapterId,
    verseId,
    saveScribe,
    onSuccessScribe,
  ]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = normalizePunctuation(e.target.value);
    if (value.length > targetText.length) {
      value = value.slice(0, targetText.length);
    }

    // 첫 번째 불일치 지점 찾기
    let mismatchIndex = -1;
    for (let i = 0; i < value.length; i++) {
      if (value[i] !== targetText[i]) {
        mismatchIndex = i;
        break;
      }
    }

    if (mismatchIndex !== -1) {
      // 불일치 이후(뒤쪽) 부분 모두 제거하여 다시 타이핑 유도
      value = value.slice(0, mismatchIndex + 1);
    }

    setCurrentInput(value);
    setCurrentPosition(value.length);
  };

  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  const handleCompositionUpdate = () => {
    // 조합 중에는 커서 위치를 업데이트하지 않음
  };

  const handleCompositionEnd = (
    e: React.CompositionEvent<HTMLInputElement>,
  ) => {
    setIsComposing(false);
    let value = normalizePunctuation(e.currentTarget.value);
    if (value.length > targetText.length) {
      value = value.slice(0, targetText.length);
    }
    // 조합 확정 후에도 동일한 불일치 처리
    let mismatchIndex = -1;
    for (let i = 0; i < value.length; i++) {
      if (value[i] !== targetText[i]) {
        mismatchIndex = i;
        break;
      }
    }
    if (mismatchIndex !== -1) {
      value = value.slice(0, mismatchIndex + 1);
    }
    setCurrentInput(value);
    setCurrentPosition(value.length);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // 방향키, Home, End, Page Up, Page Down 등 커서 이동 키 차단
    const blockedKeys = [
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "Home",
      "End",
      "PageUp",
      "PageDown",
    ];

    if (blockedKeys.includes(e.key)) {
      e.preventDefault();
    }

    // Ctrl+A (전체 선택) 차단
    if (e.ctrlKey && e.key === "a") {
      e.preventDefault();
    }
  };

  const handleContainerClick = () => {
    // 텍스트 영역 클릭 시 숨겨진 input에 포커스
    if (hiddenInputRef.current) {
      hiddenInputRef.current.focus();
    }
  };

  const renderText = () => {
    return targetText.split("").map((char, index) => {
      let className = "font-bold text-[16px] relative inline-block ";
      let displayChar = char;
      let textColor = "#302C27"; // 기본 회색

      if (index < currentInput.length) {
        // 입력된 글자: 정답 여부에 따라 색상
        displayChar = currentInput[index] ?? "";
        if (!isComposing || index < currentPosition) {
          textColor =
            currentInput[index] === char ? "text-blue-600" : "text-red-600";
        } else {
          textColor = "text-blue-600"; // 조합 중 임시
        }
      }

      // 현재 커서 위치 표시
      if (index === currentPosition) {
        className += "border-l-2 border-blue-500 ";
      }

      className += textColor;

      return (
        <span key={index} className={className}>
          {displayChar}
          {/* 틀린 글자일 경우 원본 글자를 흐리게 배경에 보여 사용자 수정 도움 */}
          {index < currentInput.length &&
            currentInput[index] !== char &&
            !isComposing && (
              <span className="absolute top-0 left-0 -z-10 text-gray-300">
                {char}
              </span>
            )}
        </span>
      );
    });
  };

  // resetPractice 기능이 필요하면 다시 활성화 가능

  return (
    <div className="font-nanum-neo-bold w-full">
      {/* 숨겨진 입력 영역 */}
      <input
        ref={hiddenInputRef}
        type="text"
        value={currentInput}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onCompositionStart={handleCompositionStart}
        onCompositionUpdate={handleCompositionUpdate}
        onCompositionEnd={handleCompositionEnd}
        className="-left-9999px absolute opacity-0"
        autoComplete="off"
        disabled={!canEdit}
      />

      {/* 필사 텍스트 표시 영역 */}
      <div
        ref={containerRef}
        onClick={handleContainerClick}
        className="mb-6 min-h-32 cursor-text rounded-lg leading-relaxed focus-within:border-blue-500 hover:border-gray-300"
        tabIndex={0}
      >
        <div className="break-words whitespace-pre-wrap opacity-60">
          {renderText()}
        </div>
      </div>
    </div>
  );
}

// iPhone (iOS) 스마트/전각 구두점 및 특수문자 정규화
// - 스마트 따옴표, 대시, 줄임표, 전각 마침표/쉼표 등 -> ASCII 기본형으로 변환
// - 다중 공백을 단일 공백으로 축소 (기존 로직 유지)
// - Zero-width / non-breaking space 제거
function normalizePunctuation(input: string) {
  let out = input.normalize("NFC");
  const replacements: [RegExp, string][] = [
    [/[ \u200B\u200C\u200D]/g, ""], // null & zero-width chars
    [/\u00A0/g, " "], // non-breaking space -> space
    [/[\u2018\u2019\u201A\u201B]/g, "'"], // single quotes
    [/[\u201C\u201D\u201E\u201F]/g, '"'], // double quotes
    [/[\u2013\u2014\u2212]/g, "-"], // en/em dash & minus
    [/\u2026/g, "..."], // ellipsis
    [/[\u3002]/g, "."], // full-width period
    [/[\uFF0C]/g, ","], // full-width comma
    [/[\uFF1B]/g, ";"], // full-width semicolon
    [/[\uFF1A]/g, ":"], // full-width colon
    [/[\uFF1F]/g, "?"], // full-width question
    [/[\uFF01]/g, "!"], // full-width exclamation
    [/[\uFF08]/g, "("], // full-width (
    [/[\uFF09]/g, ")"], // full-width )
    [/[\uFF0D]/g, "-"], // full-width hyphen-minus
    [/[\uFF3B]/g, "["], // full-width [
    [/[\uFF3D]/g, "]"], // full-width ]
    [/[\uFF5B]/g, "{"], // full-width {
    [/[\uFF5D]/g, "}"], // full-width }
    [/[\u3000]/g, " "], // ideographic space -> space
  ];
  for (const [pattern, rep] of replacements) {
    out = out.replace(pattern, rep);
  }
  // collapse multiple spaces
  out = out.replace(/ {2,}/g, " ");
  return out;
}
