import { useSelector } from "react-redux";
import QuickAccessItem from "../QuickAccessItem";
import React, { useState } from "react";
import { useQuickFiles } from "../../hooks/files";
import classNames from "classnames";

const QuickAccess = (props) => {
  const { data: quickfilesList } = useQuickFiles();
  const currentRouteType = useSelector((state) => state.main.currentRouteType);
  const [quickAccessExpanded, setQuickAccessExpanded] = useState(false);

  return (
    <div
      className="overflow-hidden"
      style={
        currentRouteType === "home" ? { display: "block" } : { display: "none" }
      }
    >
      <div className="flex flex-row items-center justify-between mb-4">
        <h2 className=" text-[#212b36] text-[22px] font-medium">
          Quick Access
        </h2>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="35"
          height="35"
          onClick={() => setQuickAccessExpanded(!quickAccessExpanded)}
          className={classNames("cursor-pointer animate-movement", {
            "rotate-180": quickAccessExpanded,
          })}
        >
          <path
            d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"
            fill="#3c85ee"
          />
        </svg>
      </div>

      <div
        className={classNames("grid gap-5 animate-movement", {
          "max-h-40": !quickAccessExpanded,
          "max-h-[665px] quickAccessOne:max-h-[1000px] quickAccessTwo:max-h-[660px] quickAccessThree:max-h-[490px]":
            quickAccessExpanded,
        })}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(185px, 185px))",
          gap: "20px",
        }}
      >
        {quickfilesList?.map((file) => (
          <QuickAccessItem
            key={file._id}
            downloadFile={props.downloadFile}
            fileClick={props.fileClick}
            {...file}
          />
        ))}
      </div>
    </div>
  );
};

export default QuickAccess;
