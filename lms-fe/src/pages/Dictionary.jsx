import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import Button from "../components/Button.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SearchBar from "../components/SearchBar.jsx";
import DictionaryResultCard from "../components/Dictionary/ResultCard.jsx";
import {
  fetchMyVocabulary,
  setCurrentWord,
  clearError,
  clearCurrentWord,
} from "../redux/slice/dictionarySlice";
import { toast } from "react-toastify";

// Hàm debounce custom
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

const Dictionary = () => {
  const [searchVocabulary, setSearchVocabulary] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const dispatch = useDispatch();
  const { words, currentWord, loading, error } = useSelector(
    (state) => state.dictionary
  );
  const [showSuggestion, setShowSuggestion] = useState(false);

  useEffect(() => {
    dispatch(fetchMyVocabulary());
  }, [dispatch]);

  const filteredWords = words.filter((item) =>
    item.vocab?.toLowerCase().includes(searchVocabulary.toLowerCase())
  );

  // Tạo hàm debounce cho search
  const debouncedSearch = useCallback(
    debounce((value) => {
      if (value.trim()) {
        setShowSuggestion(true);
      } else {
        dispatch(clearCurrentWord());
        setHasSearched(false);
        setShowSuggestion(false);
      }
    }, 300),
    [dispatch]
  );

  // Handle search input change
  const handleSearchChange = (value) => {
    setSearchVocabulary(value);
    debouncedSearch(value);
  };

  // Handle selecting a word from suggestions
  const handleWordSelect = (wordObj) => {
    setSearchVocabulary(wordObj.vocab);
    setHasSearched(true);
    dispatch(
      setCurrentWord({
        word: wordObj.vocab,
        pronounce: wordObj.pronunciation,
        description: {
          mean: wordObj.mean,
          wordType: wordObj.wordType,
          example: wordObj.example,
          antonym: null,
          synonyms: null,
        },
      })
    );
    setShowSuggestion(false);
  };

  // Handle clear results
  const handleClearResults = () => {
    setSearchVocabulary("");
    setHasSearched(false);
    dispatch(clearCurrentWord());
    dispatch(clearError());
    setShowSuggestion(false);
  };

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  return (
    <main className="flex flex-col justify-center items-center px-4 sm:px-6 md:px-8">
      {/* Search */}
      <section className="container py-12 flex flex-col justify-center items-center gap-6">
        <div className="mx-auto max-w-3xl w-full flex flex-col gap-4">
          {/* Search bar + button */}
          <div className="w-full flex flex-col items-center sm:flex-row sm:items-center gap-3 relative">
            <SearchBar
              text="Nhập từ vựng bạn muốn tìm kiếm"
              value={searchVocabulary}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchVocabulary.trim()) {
                  setHasSearched(true);
                  if (filteredWords.length > 0) {
                    handleWordSelect(filteredWords[0]);
                  }
                }
              }}
            />
            <Button
              text="Tìm kiếm"
              variant="primary"
              size="sm"
              onClick={() => {
                if (searchVocabulary.trim()) {
                  setHasSearched(true);
                  if (filteredWords.length > 0) {
                    handleWordSelect(filteredWords[0]);
                  }
                }
              }}
            />
            {/* Suggestions Dropdown */}
            {showSuggestion && searchVocabulary.trim() && filteredWords.length > 0 && (
              <ul className="absolute z-20 top-1 w-full max-w-[calc(100%-100px)] sm:max-w-[calc(100%-120px)] bg-white border-2 border-gray-200 rounded-xl mt-14 sm:mt-12 shadow-lg max-h-60 overflow-auto">
                {filteredWords.map((item) => (
                  <li
                    key={item.vocabId}
                    onClick={() => handleWordSelect(item)}
                    className="px-4 py-2 hover:bg-gray-200 cursor-pointer text-sm"
                  >
                    {item.vocab}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Button Delete */}
          {hasSearched && (
            <div className="flex justify-between items-center">
              <Button
                text="Xóa kết quả"
                variant="default"
                size="sm"
                onClick={handleClearResults}
              />
            </div>
          )}
        </div>
      </section>

      {/* Content */}
      {!hasSearched ? (
        <section className="container mb-20">
          <div className="mx-auto flex max-w-3xl flex-col items-center justify-center text-center px-4 sm:px-0">
            <div className="mb-8 flex h-32 w-32 sm:h-40 sm:w-40 items-center justify-center rounded-full bg-[#E6F0FA]">
              <FontAwesomeIcon
                icon="fa-solid fa-book"
                size="4x"
                style={{ color: "#2C99E2" }}
              />
            </div>
            <h1 className="mb-4 text-2xl sm:text-3xl font-bold">
              Bắt đầu tra từ điển
            </h1>
            <p className="max-w-md text-muted-foreground text-sm sm:text-base">
              Nhập từ bạn muốn tra cứu vào ô tìm kiếm phía trên để xem định
              nghĩa, cách phát âm và các từ đồng nghĩa.
            </p>
          </div>
        </section>
      ) : (
        <section className="container mb-20 flex justify-center items-center px-4 sm:px-0">
          {loading ? (
            <p className="text-center text-gray-600 font-semibold">
              Đang tải...
            </p>
          ) : currentWord ? (
            <DictionaryResultCard
              wordData={{
                word: currentWord.word,
                pronounce: currentWord.pronounce,
                description: currentWord.description,
              }}
              query={searchVocabulary}
            />
          ) : (
            <p className="text-center text-gray-600 font-semibold">
              Không tìm thấy thông tin cho từ này.
            </p>
          )}
        </section>
      )}
    </main>
  );
};

export default Dictionary;
