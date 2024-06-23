import FileItem from "../FileItem";
import FolderItem from "../FolderItem";
import React from "react";
import QuickAccess from "../QuickAccess";
import Folders from "../Folders";
import ParentBar from "../ParentBar";
import Spinner from "../Spinner";
import SpinnerImage from "../SpinnerImage";
import { useParams } from "react-router-dom";
import { useInfiniteQuery, useQuery } from "react-query";
import { getFilesList } from "../../api/filesAPI";
import { getFoldersList } from "../../api/foldersAPI";
import { useFiles } from "../../hooks/files";
import { useFolders } from "../../hooks/folders";

const DataForm = (props) => {
  const {
    data: files,
    fetchNextPage: filesFetchNextPage,
    invalidateFilesCache,
  } = useFiles();
  const { data: folders } = useFolders();

  return (
    <div
      className={
        props.parent === "/"
          ? "file__control--panel"
          : "file__control--panel folder__view"
      }
    >
      {!props.loading ? <QuickAccess /> : undefined}

      {/* style={props.folders.length === 0 ? {} : props.parent === "/" ? {marginTop:"50px", display:"block"} : {display:"block"} */}
      <button
        className="p-2 bg-blue-500 rounded-md text-white"
        onClick={filesFetchNextPage}
      >
        Next page
      </button>
      <button
        className="p-2 bg-blue-500 rounded-md text-white ml-4"
        onClick={invalidateFilesCache}
      >
        Refresh
      </button>
      <Folders />

      <div className="file__view noSelect">
        <div className="recent__table--wrap">
          {props.parent === "/" ? (
            <div
              className="head__recent--files noSelect"
              style={props.loading ? { display: "none" } : {}}
            >
              <h2>{props.search !== "" ? "Files" : "Home Files"}</h2>
              <div className="view__recent">
                <ul>
                  <li onClick={props.changeListViewMode}>
                    <a
                      style={
                        props.listView
                          ? { color: "#919eab" }
                          : { color: "#3c85ee" }
                      }
                    >
                      <i className="fas fa-th-large"></i>
                    </a>
                  </li>
                  <li
                    onClick={props.changeListViewMode}
                    className="active__view"
                  >
                    <a
                      style={
                        !props.listView
                          ? { color: "#919eab" }
                          : { color: "#3c85ee" }
                      }
                    >
                      <i className="fas fa-list"></i>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <div
              className="head__recent--files noSelect"
              style={
                props.loading ? { display: "none" } : { marginTop: "20px" }
              }
            >
              <ParentBar />
              <div className="view__recent">
                <ul>
                  <li>
                    <a
                      style={
                        props.listView
                          ? { color: "#919eab" }
                          : { color: "#3c85ee" }
                      }
                      onClick={props.changeListViewMode}
                    >
                      <i className="fas fa-th-large"></i>
                    </a>
                  </li>
                  <li className="active__view">
                    <a
                      style={
                        !props.listView
                          ? { color: "#919eab" }
                          : { color: "#3c85ee" }
                      }
                      onClick={props.changeListViewMode}
                    >
                      <i className="fas fa-list"></i>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {!props.listView ? (
            <div className="main__access">
              {files?.pages.map((filePage, index) => (
                <React.Fragment key={index}>
                  {filePage.map((file) => (
                    <FileItem
                      file={file}
                      key={file._id}
                      itemSelected={file._id === props.selected}
                      downloadFile={props.downloadFile}
                      removeFile={props.removeFile}
                      fileClick={props.fileClick}
                    />
                  ))}
                </React.Fragment>
              ))}
            </div>
          ) : (
            <table
              className="w-full"
              style={props.loading ? { display: "none" } : {}}
            >
              <tr>
                <th>
                  <div className="flex flex-row items-center mb-2 ml-4">
                    <p className="text-[#212b36] text-sm font-medium">Name</p>
                    {/* <select
                      className="sorting__select"
                      onChange={props.onChangeSelect}
                      value={
                        props.sortBy === "alp_desc" ||
                        props.sortBy === "alp_asc"
                          ? "name"
                          : "date"
                      }
                    >
                      <option value="date">Modified</option>
                      <option value="name">Name</option>
                    </select> */}
                    {/* <a className="ml-2" onClick={props.switchSortBy}>
                      <img
                        className="w-3 h-3"
                        src="/assets/sortarrow.svg"
                        alt="sortarrow"
                        style={
                          props.sortBy === "date_desc" ||
                          props.sortBy === "alp_desc"
                            ? { transform: "scaleY(-1)" }
                            : {}
                        }
                      />
                    </a> */}
                  </div>
                </th>
                <th className="hidden fileListShowDetails:table-cell">
                  <p className="text-[#212b36] text-sm font-medium mb-2">
                    Size
                  </p>
                </th>
                <th className="hidden fileListShowDetails:table-cell">
                  <p className="text-[#212b36] text-sm font-medium mb-2">
                    Modified
                  </p>
                </th>
                <th>
                  <p className="text-[#212b36] text-sm font-medium mb-2">
                    Actions
                  </p>
                </th>
              </tr>

              {files?.pages.map((filePage, index) => (
                <React.Fragment key={index}>
                  {filePage.map((file) => (
                    <FileItem file={file} key={file._id} />
                  ))}
                </React.Fragment>
              ))}
            </table>
          )}

          <div
            className="dataform-loadmore-files"
            style={props.loadingMoreItems ? {} : { display: "none" }}
          >
            <SpinnerImage />
          </div>

          {/* {props.loading ? 
      <div className="dataform__spinner__wrapper">
        <Spinner />
      </div> : undefined} */}

          {/* */}
        </div>
      </div>
    </div>
  );
};

export default DataForm;
