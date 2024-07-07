import { useDispatch, useSelector } from "react-redux";
import { disableListView, enableListView } from "../../actions/filter";
import { useFiles } from "../../hooks/files";
import { useUtils } from "../../hooks/utils";
import SpinnerImage from "../SpinnerImage";
import React, { memo, useMemo } from "react";
import FileItem from "../FileItem";
import ParentBar from "../ParentBar";
import { useParams } from "react-router-dom";
import classNames from "classnames";

const Files = memo(() => {
  const { data: files } = useFiles(false);
  const listView = useSelector((state) => state.filter.listView);
  const search = useSelector((state) => state.filter.search);
  const { isHome } = useUtils();

  const dispatch = useDispatch();

  const changeListViewMode = () => {
    if (!listView) {
      dispatch(enableListView());
    } else {
      dispatch(disableListView());
    }
  };
  return (
    <div className="mt-8">
      <div>
        <div className="flex justify-between items-center mb-[20px]">
          {isHome && (
            <h2 className="m-0 text-[22px] font-medium">
              {search !== "" ? "Files" : "Home Files"}
            </h2>
          )}
          {!isHome && (
            <React.Fragment>
              <div className="block">
                <ParentBar />
              </div>
            </React.Fragment>
          )}

          <div>
            <ul className="flex items-center list-none m-0 p-0">
              <li className="mr-4" onClick={changeListViewMode}>
                <a
                  style={listView ? { color: "#919eab" } : { color: "#3c85ee" }}
                >
                  <svg
                    className="w-4 h-4 cursor-pointer"
                    aria-hidden="true"
                    focusable="false"
                    data-prefix="fas"
                    data-icon="th-large"
                    role="img"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 512 512"
                    data-fa-i2svg=""
                  >
                    <path
                      fill="currentColor"
                      d="M296 32h192c13.255 0 24 10.745 24 24v160c0 13.255-10.745 24-24 24H296c-13.255 0-24-10.745-24-24V56c0-13.255 10.745-24 24-24zm-80 0H24C10.745 32 0 42.745 0 56v160c0 13.255 10.745 24 24 24h192c13.255 0 24-10.745 24-24V56c0-13.255-10.745-24-24-24zM0 296v160c0 13.255 10.745 24 24 24h192c13.255 0 24-10.745 24-24V296c0-13.255-10.745-24-24-24H24c-13.255 0-24 10.745-24 24zm296 184h192c13.255 0 24-10.745 24-24V296c0-13.255-10.745-24-24-24H296c-13.255 0-24 10.745-24 24v160c0 13.255 10.745 24 24 24z"
                    ></path>
                  </svg>
                </a>
              </li>
              <li className="mr-2" onClick={changeListViewMode}>
                <a
                  style={
                    !listView ? { color: "#919eab" } : { color: "#3c85ee" }
                  }
                >
                  <svg
                    className="w-4 h-4 cursor-pointer"
                    aria-hidden="true"
                    focusable="false"
                    data-prefix="fas"
                    data-icon="list"
                    role="img"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 512 512"
                    data-fa-i2svg=""
                  >
                    <path
                      fill="currentColor"
                      d="M80 368H16a16 16 0 0 0-16 16v64a16 16 0 0 0 16 16h64a16 16 0 0 0 16-16v-64a16 16 0 0 0-16-16zm0-320H16A16 16 0 0 0 0 64v64a16 16 0 0 0 16 16h64a16 16 0 0 0 16-16V64a16 16 0 0 0-16-16zm0 160H16a16 16 0 0 0-16 16v64a16 16 0 0 0 16 16h64a16 16 0 0 0 16-16v-64a16 16 0 0 0-16-16zm416 176H176a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h320a16 16 0 0 0 16-16v-32a16 16 0 0 0-16-16zm0-320H176a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h320a16 16 0 0 0 16-16V80a16 16 0 0 0-16-16zm0 160H176a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h320a16 16 0 0 0 16-16v-32a16 16 0 0 0-16-16z"
                    ></path>
                  </svg>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {!listView ? (
          <div
            className={classNames(
              "grid grid-cols-[repeat(auto-fit,minmax(40%,45%))] xs:grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-[16px]",
              files?.pages[0]?.length > 1
                ? "justify-center xs:justify-normal"
                : "justify-normal"
            )}
          >
            {files?.pages.map((filePage, index) => (
              <React.Fragment key={index}>
                {filePage.map((file) => (
                  <FileItem file={file} key={file._id} />
                ))}
              </React.Fragment>
            ))}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr>
                <th>
                  <div className="flex flex-row items-center mb-2">
                    <p className="text-[#212b36] text-sm font-medium">Name</p>
                  </div>
                </th>
                <th className="hidden fileListShowDetails:table-cell">
                  <p className="text-[#212b36] text-sm font-medium mb-2">
                    Size
                  </p>
                </th>
                <th className="hidden fileListShowDetails:table-cell">
                  <p className="text-[#212b36] text-sm font-medium mb-2">
                    Created
                  </p>
                </th>
                <th>
                  <p className="text-[#212b36] text-sm font-medium mb-2">
                    Actions
                  </p>
                </th>
              </tr>
            </thead>
            <tbody>
              {files?.pages.map((filePage, index) => (
                <React.Fragment key={index}>
                  {filePage.map((file) => (
                    <FileItem file={file} key={file._id} />
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}

        {/* <div
          className="dataform-loadmore-files"
          style={loadingMore ? {} : { display: "none" }}
        >
          <SpinnerImage />
        </div> */}
      </div>
    </div>
  );
});

export default Files;
