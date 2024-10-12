import { useEffect, useState } from "react";

const SettingsPageGeneral = () => {
  const [listViewStyle, setListViewStyle] = useState("list");
  const [sortBy, setSortBy] = useState("date");
  const [orderBy, setOrderBy] = useState("descending");

  const fileListStyleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setListViewStyle(value);
    if (value === "grid") {
      window.localStorage.setItem("grid-mode", "true");
    } else {
      window.localStorage.removeItem("grid-mode");
    }
  };

  const sortByChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSortBy(value);
    if (value === "name") {
      window.localStorage.setItem("sort-name", "true");
    } else {
      window.localStorage.removeItem("sort-name");
    }
  };

  const orderByChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setOrderBy(value);

    if (value === "ascending") {
      window.localStorage.setItem("order-asc", "true");
    } else {
      window.localStorage.removeItem("order-asc");
    }
  };

  useEffect(() => {
    const gridModeLocalStorage = window.localStorage.getItem("grid-mode");
    const gridModeEnabled = gridModeLocalStorage === "true";

    const sortByLocalStorage = window.localStorage.getItem("sort-name");
    const sortByNameEnabled = sortByLocalStorage === "true";

    const orderByLocalStorage = window.localStorage.getItem("order-asc");
    const orderByAscendingEnabled = orderByLocalStorage === "true";

    setListViewStyle(gridModeEnabled ? "grid" : "list");
    setSortBy(sortByNameEnabled ? "name" : "date");
    setOrderBy(orderByAscendingEnabled ? "ascending" : "descending");
  }, []);

  return (
    <div>
      <div className="bg-white-hover p-3 flex items-center w-full">
        <p className="text-base">General settings</p>
      </div>
      <div>
        <div className="px-3 py-4 flex flex-row justify-between items-center border-b border-gray-secondary">
          <p className="text-gray-primary">File list style</p>
          <select
            value={listViewStyle}
            onChange={fileListStyleChange}
            className="text-primary"
          >
            <option value="list">List</option>
            <option value="grid">Grid</option>
          </select>
        </div>
        <div className="px-3 py-4 flex flex-row justify-between items-center border-b border-gray-secondary">
          <p className="text-gray-primary">Sort by</p>
          <select
            value={sortBy}
            onChange={sortByChange}
            className="text-primary"
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
            className="text-primary"
          >
            <option value="descending">Descending</option>
            <option value="ascending">Ascending</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default SettingsPageGeneral;
