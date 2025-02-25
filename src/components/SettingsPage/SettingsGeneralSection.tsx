import { useEffect, useState } from "react";
import { usePreferenceSetter } from "../../hooks/preferenceSetter";

const SettingsPageGeneral = () => {
  const [listViewStyle, setListViewStyle] = useState("list");
  const [sortBy, setSortBy] = useState("date");
  const [orderBy, setOrderBy] = useState("descending");
  const [singleClickFolders, setSingleClickFolders] = useState("disabled");
  const [loadThumbnails, setLoadThumbnails] = useState("enabled");
  const { setPreferences } = usePreferenceSetter();

  const fileListStyleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setListViewStyle(value);
    if (value === "list") {
      window.localStorage.setItem("list-mode", "true");
    } else {
      window.localStorage.removeItem("list-mode");
    }
    setPreferences();
  };

  const sortByChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSortBy(value);
    if (value === "name") {
      window.localStorage.setItem("sort-name", "true");
    } else {
      window.localStorage.removeItem("sort-name");
    }
    setPreferences();
  };

  const orderByChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setOrderBy(value);

    if (value === "ascending") {
      window.localStorage.setItem("order-asc", "true");
    } else {
      window.localStorage.removeItem("order-asc");
    }
    setPreferences();
  };

  const singleClickFoldersChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const value = e.target.value;
    setSingleClickFolders(value);

    if (value === "enabled") {
      window.localStorage.setItem("single-click-folders", "true");
    } else {
      window.localStorage.removeItem("single-click-folders");
    }
    setPreferences();
  };

  const loadThumbnailsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setLoadThumbnails(value);

    if (value === "disabled") {
      window.localStorage.setItem("not-load-thumbnails", "true");
    } else {
      window.localStorage.removeItem("not-load-thumbnails");
    }
    setPreferences();
  };

  useEffect(() => {
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

    setListViewStyle(listModeEnabled ? "list" : "grid");
    setSortBy(sortByNameEnabled ? "name" : "date");
    setOrderBy(orderByAscendingEnabled ? "ascending" : "descending");
    setSingleClickFolders(singleClickFoldersEnabled ? "enabled" : "disabled");
    setLoadThumbnails(loadThumbnailsDisabled ? "disabled" : "enabled");
  }, []);

  return (
    <div>
      <div className="bg-white-hover p-3 flex items-center w-full rounded-md">
        <p className="text-base">General settings</p>
      </div>
      <div>
        <div className="px-3 py-4 flex flex-row justify-between items-center border-b border-gray-secondary">
          <p className="text-gray-primary">File list style</p>
          <select
            value={listViewStyle}
            onChange={fileListStyleChange}
            className="text-sm font-medium appearance-none bg-white text-primary"
          >
            <option value="grid">Grid</option>
            <option value="list">List</option>
          </select>
        </div>
        <div className="px-3 py-4 flex flex-row justify-between items-center border-b border-gray-secondary">
          <p className="text-gray-primary">Sort by</p>
          <select
            value={sortBy}
            onChange={sortByChange}
            className="text-sm font-medium appearance-none bg-white text-primary"
          >
            <option value="date">Date</option>
            <option value="name">Name</option>
          </select>
        </div>
        <div className="px-3 py-4 flex flex-row justify-between items-center border-b border-gray-secondary">
          <p className="text-gray-primary">Order by</p>
          <select
            value={orderBy}
            onChange={orderByChange}
            className="text-sm font-medium appearance-none bg-white text-primary"
          >
            <option value="descending">Descending</option>
            <option value="ascending">Ascending</option>
          </select>
        </div>
        <div className="px-3 py-4 flex flex-row justify-between items-center border-b border-gray-secondary">
          <p className="text-gray-primary">Single click to enter folders</p>
          <select
            value={singleClickFolders}
            onChange={singleClickFoldersChange}
            className="text-sm font-medium appearance-none bg-white text-primary"
          >
            <option value="disabled">Disabled</option>
            <option value="enabled">Enabled</option>
          </select>
        </div>
        <div className="px-3 py-4 flex flex-row justify-between items-center border-b border-gray-secondary">
          <p className="text-gray-primary">Load thumbnails</p>
          <select
            value={loadThumbnails}
            onChange={loadThumbnailsChange}
            className="text-sm font-medium appearance-none bg-white text-primary"
          >
            <option value="enabled">Enabled</option>
            <option value="disabled">Disabled</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default SettingsPageGeneral;
