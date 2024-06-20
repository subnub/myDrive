import { useSelector } from "react-redux";
import QuickAccessItem from "../QuickAccessItem";
import React from "react";
import { useQuickFiles } from "../../hooks/files";

const QuickAccess = (props) => {
  const { data: quickfilesList } = useQuickFiles();
  const currentRouteType = useSelector((state) => state.main.currentRouteType);

  return (
    <div
      className="h-26 overflow-hidden"
      style={
        currentRouteType === "home" ? { display: "block" } : { display: "none" }
      }
    >
      <div className="head__access">
        <h2 className="m-0 mb-[20px] text-[#212b36] text-[22px] font-medium">
          Quick Access
        </h2>
      </div>

      <div
        className="grid gap-5 h-40"
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
