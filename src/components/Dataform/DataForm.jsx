import FileItem from "../FileItem";
import FolderItem from "../FolderItem";
import React from "react";
import QuickAccess from "../QuickAccess";
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
      {!props.loading ? (
        <QuickAccess
          fileClick={props.fileClick}
          downloadFile={props.downloadFile}
        />
      ) : undefined}

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
      <div
        className={
          props.parent === "/"
            ? "folders__panel"
            : "folders__panel folders__panel__folder"
        }
        style={props.loading ? { display: "none" } : { display: "block" }}
      >
        <div class="head__folders">
          <h2 className="noSelect">
            {folders?.length === 0 ? "No Folders" : "Folders"}
          </h2>
        </div>

        <div className="inner__folders">
          {folders?.map((folder) => (
            <FolderItem
              folder={folder}
              key={folder._id}
              folderClick={props.folderClick}
            />
          ))}
        </div>
      </div>

      <div className="file__view noSelect">
        <div class="recent__table--wrap">
          {props.parent === "/" ? (
            <div
              class="head__recent--files noSelect"
              style={props.loading ? { display: "none" } : {}}
            >
              <h2>{props.search !== "" ? "Files" : "Home Files"}</h2>
              <div class="view__recent">
                <ul>
                  <li onClick={props.changeListViewMode}>
                    <a
                      style={
                        props.listView
                          ? { color: "#919eab" }
                          : { color: "#3c85ee" }
                      }
                    >
                      <i class="fas fa-th-large"></i>
                    </a>
                  </li>
                  <li onClick={props.changeListViewMode} class="active__view">
                    <a
                      style={
                        !props.listView
                          ? { color: "#919eab" }
                          : { color: "#3c85ee" }
                      }
                    >
                      <i class="fas fa-list"></i>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <div
              class="head__recent--files noSelect"
              style={
                props.loading ? { display: "none" } : { marginTop: "20px" }
              }
            >
              <ParentBar />
              <div class="view__recent">
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
                      <i class="fas fa-th-large"></i>
                    </a>
                  </li>
                  <li class="active__view">
                    <a
                      style={
                        !props.listView
                          ? { color: "#919eab" }
                          : { color: "#3c85ee" }
                      }
                      onClick={props.changeListViewMode}
                    >
                      <i class="fas fa-list"></i>
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
              class="recent__table noSelect"
              style={props.loading ? { display: "none" } : {}}
            >
              <tr>
                <th class="name__row">
                  <select
                    className="sorting__select"
                    onChange={props.onChangeSelect}
                    value={
                      props.sortBy === "alp_desc" || props.sortBy === "alp_asc"
                        ? "name"
                        : "date"
                    }
                  >
                    <option value="date">Modified</option>
                    <option value="name">Name</option>
                  </select>
                  <a onClick={props.switchSortBy}>
                    <img
                      src="/assets/sortarrow.svg"
                      alt="sortarrow"
                      style={
                        props.sortBy === "date_desc" ||
                        props.sortBy === "alp_desc"
                          ? { transform: "scaleY(-1)" }
                          : {}
                      }
                    />
                  </a>
                </th>
                <th class="location__row">Location</th>
                <th class="modified__row">Modified</th>
                <th class="settings__row"></th>
              </tr>

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
