import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAppDispatch } from "../../hooks/store";
import { useSelector } from "react-redux";
import { useSearchSuggestions } from "../../hooks/files";
import debounce from "lodash/debounce";
import { useNavigate } from "react-router-dom";
import { useClickOutOfBounds, useUtils } from "../../hooks/utils";
import SearchBarItem from "../SearchBarItem/SearchBarItem";
import { FolderInterface } from "../../types/folders";
import { FileInterface } from "../../types/file";
import classNames from "classnames";
import { closeDrawer } from "../../reducers/leftSection";
import { setPopupSelect } from "../../reducers/selected";
import CloseIcon from "../../icons/CloseIcon";
import Spinner from "../Spinner/Spinner";
import SearchIcon from "../../icons/SearchIcon";
import { semanticSearchAPI } from "../../api/semanticSearchAPI";
import { FaRobot, FaMagic } from "react-icons/fa";

const SEARCH_PLACEHOLDER_PROMPTS = [
  "Photo in Amsterdam",
  "My golden retriever",
  "My job contract",
  "My Driver's license",
  "Invoice from last month",
  "Family vacation video",
];

const SearchBar = memo(() => {
  const [searchText, setSearchText] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const dispatch = useAppDispatch();
  const [semanticResults, setSemanticResults] = useState<{fileList: FileInterface[], folderList: FolderInterface[]}>({fileList: [], folderList: []});
  const [isSemantic, setIsSemantic] = useState(false);
  const [debouncedSearchText, setDebouncedSearchText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const { data: searchSuggestions, isLoading: isLoadingSearchSuggestions } =
    useSearchSuggestions(debouncedSearchText);
  const navigate = useNavigate();
  const { isTrash, isMedia } = useUtils();
 const loggedIn = useSelector((state: any) => state.user?.loggedIn);
const reduxUserId = useSelector((state: any) => state.user?.user?._id);
const [currentUserId, setCurrentUserId] = useState<string | null>(reduxUserId || null);

useEffect(() => {
  // Update from Redux if available
  if (reduxUserId) {
    setCurrentUserId(reduxUserId);
  } else {
    // Fallback to localStorage if Redux is empty
    const cachedUserId = window.localStorage.getItem("userId");
    if (cachedUserId) setCurrentUserId(cachedUserId);
  }
}, [reduxUserId]);

  const debouncedSetSearchText = useMemo(
    () => debounce(setDebouncedSearchText, 500),
    []
  );

  useEffect(() => {
    debouncedSetSearchText(searchText);
    return () => {
      debouncedSetSearchText.cancel();
    };
  }, [searchText, debouncedSetSearchText]);

  const resetState = () => {
    setSearchText("");
    setDebouncedSearchText("");
  };
  const onSemanticSearch = async () => {
     console.log("AI search triggered with:", searchText, "userId:", currentUserId, "loggedIn:", loggedIn);
    if (!searchText || !loggedIn || !currentUserId) return; // Prevent invalid requests
    setDebouncedSearchText(searchText);
    setIsSemantic(true);
    setShowSuggestions(true);
    setAiLoading(true);
   
    try {
      const results = await semanticSearchAPI(searchText, currentUserId);
      setSemanticResults({
        fileList: results.files || [],
        folderList: results.folders || [],
      });
    } catch (e) {
      setSemanticResults({ fileList: [], folderList: [] });
    }
    setAiLoading(false);
  };

  const outOfContainerClick = useCallback(() => {
    closeDrawer();
    setShowSuggestions(false);
  }, []);

  const { wrapperRef } = useClickOutOfBounds(outOfContainerClick);

  const onSearch = (e: any) => {
    e.preventDefault();
    setShowSuggestions(false);
    if (isMedia) {
      if (searchText.length) {
        navigate(`/search-media/${searchText}`);
      } else {
        navigate("/media");
      }
    } else if (isTrash) {
      if (searchText.length) {
        navigate(`/search-trash/${searchText}`);
      } else {
        navigate("/trash");
      }
    } else {
      if (searchText.length) {
        navigate(`/search/${searchText}`);
      } else {
        navigate("/home");
      }
    }
  };

  const onChangeSearch = (e: any) => {
    setSearchText(e.target.value);
  };

  const fileClick = (file: FileInterface) => {
    dispatch(setPopupSelect({ type: "file", file }));
    resetState();
  };

  const folderClick = (folder: FolderInterface) => {
    if (!isTrash) {
      navigate(`/folder/${folder?._id}`);
    } else {
      navigate(`/folder-trash/${folder?._id}`);
    }

    resetState();
  };

  const calculatedHeight =
    47 *
      (searchSuggestions?.folderList.length +
        searchSuggestions?.fileList.length) || 56;

  const onFocus = () => {
    dispatch(closeDrawer());
    setShowSuggestions(true);
  };

  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [typedPlaceholder, setTypedPlaceholder] = useState("");
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);

  // Typist effect for placeholder (only when search bar is NOT focused and empty)
  useEffect(() => {
    if (showSuggestions || searchText.length > 0) {
      setTypedPlaceholder("");
      return;
    }
    let currentPrompt = SEARCH_PLACEHOLDER_PROMPTS[placeholderIndex];
    let charIndex = 0;
    setTypedPlaceholder("");
    function typeChar() {
      setTypedPlaceholder(currentPrompt.slice(0, charIndex));
      if (charIndex < currentPrompt.length) {
        charIndex++;
        typingTimeout.current = setTimeout(typeChar, 60);
      } else {
        typingTimeout.current = setTimeout(() => {
          setPlaceholderIndex((prev) => (prev + 1) % SEARCH_PLACEHOLDER_PROMPTS.length);
        }, 2000);
      }
    }
    typeChar();
    return () => {
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
    };
  }, [placeholderIndex, showSuggestions, searchText]);

  const searchTextPlaceholder = searchText.length > 0 || showSuggestions
    ? ""
    : typedPlaceholder || SEARCH_PLACEHOLDER_PROMPTS[placeholderIndex];

  return (
    <form
      onSubmit={onSearch}
      className="w-full max-w-[700px] relative flex items-center justify-center flex-col"
      // @ts-ignore
      ref={wrapperRef}
    >
      <div className="absolute left-1 flex items-center">
        {searchText.length !== 0 && !isLoadingSearchSuggestions && (
          <CloseIcon
            className="w-5 h-5 ml-3 cursor-pointer text-primary hover:text-primary-hover"
            onClick={resetState}
          />
        )}
        {isLoadingSearchSuggestions && <div className="spinner-small"></div>}
        {searchText.length === 0 && <SearchIcon className="w-4 h-4 ml-3" />}
      </div>
      <input
        type="text"
        onChange={onChangeSearch}
        value={searchText}
        placeholder={searchTextPlaceholder}
        className="w-full h-8 border border-gray-300 pl-11 pr-16 text-base text-black rounded-md"
        onFocus={onFocus}
        id="search-bar"
        autoComplete="off"
      />
      {/* Modern AI button with better icon and effect */}
      <div className="absolute right-1 top-0 h-8 flex items-center">
        <button
          type="button"
          className="px-2 py-1 text-xs bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded flex items-center gap-1 transition-all duration-200 hover:from-blue-600 hover:to-indigo-600 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-md"
          onClick={onSemanticSearch}
          title="Semantic AI Search"
        >
          <FaMagic className="w-5 h-5 drop-shadow" />
          <span className="font-semibold tracking-wide">AI</span>
        </button>
      </div>
      <div
        className={classNames(
          "absolute left-0 top-8 bg-white shadow-xl rounded-md w-full max-h-[400px] min-h-[235px] overflow-y-scroll animate-movement",
          {
            "border border-gray-secondary":
              showSuggestions && (debouncedSearchText.length || isSemantic || aiLoading),
            "hidden": !showSuggestions || (!debouncedSearchText.length && !isSemantic && !aiLoading),
          }
        )}
      >
        {aiLoading && (
          <div className="p-4 text-center text-primary font-semibold flex flex-col items-center gap-2">
            <span className="animate-spin">
              <FaMagic className="w-6 h-6 text-primary" />
            </span>
            <span>Thinking...</span>
            <span className="text-xs text-gray-500">AI is analyzing your query for the best matches</span>
          </div>
        )}
        {/* Show "Best matches found" after AI search */}
        {isSemantic && !aiLoading && (semanticResults.folderList.length > 0 || semanticResults.fileList.length > 0) && (
          <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-200 bg-blue-50 text-blue-700 font-semibold sticky top-0 z-10">
            <FaMagic className="w-4 h-4" />
            Best matches found
          </div>
        )}
        {isSemantic ? (
          <>
            {semanticResults.folderList.length === 0 &&
            semanticResults.fileList.length === 0 && !aiLoading ? (
              <div className="flex justify-center items-center p-4">
                <span>No AI Results</span>
              </div>
            ) : null}
            {/* Show only top 5 folders */}
            {semanticResults.folderList.slice(0, 5).map((folder: FolderInterface) => (
              <SearchBarItem
                type="folder"
                folder={folder}
                folderClick={folderClick}
                fileClick={fileClick}
                key={folder._id}
              />
            ))}
            {/* Show only top 5 files */}
            {semanticResults.fileList.slice(0, 5).map((file: FileInterface) => (
              <SearchBarItem
                type="file"
                file={file}
                folderClick={folderClick}
                fileClick={fileClick}
                key={file._id}
              />
            ))}
          </>
        ) : (
          <>
            {searchSuggestions?.folderList.length === 0 &&
            searchSuggestions?.fileList.length === 0 ? (
              <div className="flex justify-center items-center p-4">
                <span>No Results</span>
              </div>
            ) : undefined}
            {searchSuggestions?.folderList.map((folder: FolderInterface) => (
              <SearchBarItem
                type="folder"
                folder={folder}
                folderClick={folderClick}
                fileClick={fileClick}
                key={folder._id}
              />
            ))}
            {searchSuggestions?.fileList.map((file: FileInterface) => (
              <SearchBarItem
                type="file"
                file={file}
                folderClick={folderClick}
                fileClick={fileClick}
                key={file._id}
              />
            ))}
          </>
        )}
      </div>
    </form>
  );
});

export default SearchBar;
