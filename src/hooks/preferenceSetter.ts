import { useCallback, useEffect } from "react";
import { useAppDispatch } from "./store";
import { setSortBy } from "../reducers/filter";
import {
  setSingleClickFolders,
  setListView,
  setLoadThumbnailsDisabled,
} from "../reducers/general";

export const usePreferenceSetter = () => {
  const dispatch = useAppDispatch();

  const setPreferences = useCallback(() => {
    const listModeLocalStorage = window.localStorage.getItem("list-mode");
    const listModeEnabled = listModeLocalStorage === "true";

    const sortByLocalStorage = window.localStorage.getItem("sort-name");
    const sortByNameEnabled = sortByLocalStorage === "true";

    const orderByLocalStorage = window.localStorage.getItem("order-asc");
    const orderByAscendingEnabled = orderByLocalStorage === "true";

    const singleClickFoldersLocalStorage = window.localStorage.getItem(
      "single-click-folders"
    );
    const singleClickFoldersEnabled = singleClickFoldersLocalStorage === "true";

    const loadThumbnailsLocalStorage = window.localStorage.getItem(
      "not-load-thumbnails"
    );
    const loadThumbnailsDisabled = loadThumbnailsLocalStorage === "true";

    let sortBy = "";

    if (sortByNameEnabled) {
      sortBy = "alp_";
    } else {
      sortBy = "date_";
    }

    if (orderByAscendingEnabled) {
      sortBy += "asc";
    } else {
      sortBy += "desc";
    }

    dispatch(setListView(listModeEnabled));
    dispatch(setSortBy(sortBy));
    dispatch(setLoadThumbnailsDisabled(loadThumbnailsDisabled));
    dispatch(setSingleClickFolders(singleClickFoldersEnabled));
  }, []);

  useEffect(() => {
    setPreferences();
  }, [setPreferences]);

  return { setPreferences };
};
