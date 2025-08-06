"use client";

import { useState, useEffect, useRef } from "react";

interface TypingProps {
  targetText: string;
}

export function Typing({ targetText }: TypingProps) {
  const [currentInput, setCurrentInput] = useState("");
  const [currentPosition, setCurrentPosition] = useState(0);
  const [isComposing, setIsComposing] = useState(false);
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 컴포넌트 마운트 시 숨겨진 input에 포커스
    if (hiddenInputRef.current) {
      hiddenInputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    // 모든 글자가 일치하는지 확인 (조합 중이 아닐 때만)
    if (
      !isComposing &&
      currentInput.length === targetText.length &&
      currentInput === targetText
    ) {
      alert("필사 완료! 수고하셨습니다.");
    }
  }, [currentInput, isComposing]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // 샘플 텍스트 길이를 초과하지 않도록 제한
    if (value.length <= targetText.length) {
      setCurrentInput(value);
      setCurrentPosition(value.length);
    }
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
    // 모바일 환경 대응: 조합이 끝난 후 실제 입력값을 동기화
    const value = e.currentTarget.value;
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
      let className = "text-2xl relative inline-block ";
      let displayChar = char;
      let textColor = "text-gray-400"; // 기본 회색

      if (index < currentInput.length) {
        // 입력된 글자로 덮어쓰기
        displayChar = currentInput[index] ?? "";

        // 조합 중이 아닐 때만 색상 검증
        if (!isComposing || index < currentPosition) {
          if (currentInput[index] === char) {
            textColor = "text-black"; // 일치하는 경우 검은색
          } else {
            textColor = "text-red-500"; // 불일치하는 경우 빨간색
            className += "bg-red-200 "; // 빨간색 배경
          }
        } else {
          // 조합 중인 글자는 중성 색상으로 표시
          textColor = "text-blue-600";
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
          {/* 원본 글자를 배경으로 표시 (참고용) */}
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

  const resetPractice = () => {
    setCurrentInput("");
    setCurrentPosition(0);
    setIsComposing(false);
    if (hiddenInputRef.current) {
      hiddenInputRef.current.focus();
    }
  };

  return (
    <div className="mx-auto max-w-4xl bg-white p-8">
      <div className="mb-8">
        <p className="text-center text-gray-600">
          아래 텍스트를 클릭하고 정확히 따라 입력해보세요
        </p>
      </div>

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
      />

      {/* 필사 텍스트 표시 영역 */}
      <div
        ref={containerRef}
        onClick={handleContainerClick}
        className="mb-6 min-h-32 cursor-text rounded-lg border-2 border-gray-200 bg-gray-50 p-6 leading-relaxed focus-within:border-blue-500 hover:border-gray-300"
        tabIndex={0}
      >
        <div className="break-words whitespace-pre-wrap">{renderText()}</div>
      </div>

      {/* 조합 상태 표시 (디버깅용) */}
      {isComposing && (
        <div className="mb-4 text-center text-sm text-blue-600">
          한글 입력 중...
        </div>
      )}

      {/* 진행률 표시 */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm text-gray-600">진행률</span>
          <span className="text-sm text-gray-600">
            {currentPosition} / {targetText.length}
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-200">
          <div
            className="h-2 rounded-full bg-blue-500 transition-all duration-300"
            style={{ width: `${(currentPosition / targetText.length) * 100}%` }}
          />
        </div>
      </div>

      {/* 통계 정보 */}
      <div className="mb-6 grid grid-cols-2 gap-4">
        <div className="rounded-lg bg-green-50 p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {
              currentInput
                .split("")
                .slice(0, currentPosition)
                .filter((char, index) => char === targetText[index]).length
            }
          </div>
          <div className="text-sm text-green-600">정확한 글자</div>
        </div>
        <div className="rounded-lg bg-red-50 p-4 text-center">
          <div className="text-2xl font-bold text-red-600">
            {
              currentInput
                .split("")
                .slice(0, currentPosition)
                .filter((char, index) => char !== targetText[index]).length
            }
          </div>
          <div className="text-sm text-red-600">틀린 글자</div>
        </div>
      </div>

      {/* 리셋 버튼 */}
      <div className="text-center">
        <button
          onClick={resetPractice}
          className="rounded-lg bg-blue-500 px-6 py-3 text-white transition-colors hover:bg-blue-600"
        >
          다시 시작
        </button>
      </div>
    </div>
  );
}
