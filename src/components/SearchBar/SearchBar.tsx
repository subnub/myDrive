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

const SearchBar = memo(() => {
  const [searchText, setSearchText] = useState("");
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

  const { wrapperRef } = useClickOutOfBounds(resetState);

  // TODO: Fix any
  const onSearch = (e: any) => {
    e.preventDefault();
    setSearchText("");
    setDebouncedSearchText("");
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
      <a
        href="#"
        className={classNames(
          "absolute",
          !isLoadingSearchSuggestions ? "left-[15px]" : "left-[5px]"
        )}
      >
        {isLoadingSearchSuggestions ? (
          <div className="spinner-small"></div>
        ) : (
          <img src="/assets/searchicon.svg" alt="search" />
        )}
      </a>
      <input
        type="text"
        onChange={onChangeSearch}
        value={searchText}
        placeholder={searchTextPlaceholder}
        className="w-full min-h-[42px] border border-[#BEC9D3] pl-[45px] pr-[15px] text-[16px] text-black rounded-[5px]"
        onFocus={onFocus}
        id="search-bar"
      />
      <div
        className="absolute left-0 bg-white shadow-xl rounded-[4px] w-full top-[42px] max-h-[400px] overflow-y-scroll border border-[#BEC9D3]"
        style={
          debouncedSearchText.length !== 0 && !isLoadingSearchSuggestions
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
