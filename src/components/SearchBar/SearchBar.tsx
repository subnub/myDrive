import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useAppDispatch } from "../../hooks/store";
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

const SearchBar = memo(() => {
  const [searchText, setSearchText] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const dispatch = useAppDispatch();
  const [debouncedSearchText, setDebouncedSearchText] = useState("");
  const { data: searchSuggestions, isLoading: isLoadingSearchSuggestions } =
    useSearchSuggestions(debouncedSearchText);
  const navigate = useNavigate();
  const { isTrash, isMedia } = useUtils();

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

  const resetState = useCallback(() => {
    setSearchText("");
    setDebouncedSearchText("");
  }, []);

  const outOfContainerClick = useCallback(() => {
    closeDrawer();
    setShowSuggestions(false);
  }, []);

  const { wrapperRef } = useClickOutOfBounds(outOfContainerClick);

  const onSearch = (e: any) => {
    e.preventDefault();
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

  const onFocus = () => {
    dispatch(closeDrawer());
    setShowSuggestions(true);
  };

  const searchTextPlaceholder = useMemo(() => {
    if (isMedia) {
      return "Search Media";
    } else if (isTrash) {
      return "Search Trash";
    } else {
      return "Search";
    }
  }, [isMedia, isTrash]);

  return (
    <form
      onSubmit={onSearch}
      className="w-full max-w-[700px] relative flex items-center justify-center flex-col"
      // @ts-ignore
      ref={wrapperRef}
    >
      <div className="absolute left-1">
        {searchText.length !== 0 && !isLoadingSearchSuggestions && (
          <CloseIcon
            className="w-5 h-5 ml-3 cursor-pointer text-primary hover:text-primary-hover"
            onClick={resetState}
          />
        )}
        {isLoadingSearchSuggestions && <div className="spinner-small"></div>}
        {searchText.length === 0 && <SearchIcon className="w-5 h-5 ml-3" />}
      </div>
      <input
        type="text"
        onChange={onChangeSearch}
        value={searchText}
        placeholder={searchTextPlaceholder}
        className="w-full h-10 border border-gray-300 pl-11 pr-4 text-base text-black rounded-md"
        onFocus={onFocus}
        id="search-bar"
        autoComplete="off"
      />
      <div
        className="absolute left-0 top-10 bg-white shadow-xl rounded-md w-full max-h-[400px] overflow-y-scroll border border-gray-secondary"
        style={
          debouncedSearchText.length !== 0 && showSuggestions
            ? { display: "block" }
            : { display: "none" }
        }
      >
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
      </div>
    </form>
  );
});

export default SearchBar;
