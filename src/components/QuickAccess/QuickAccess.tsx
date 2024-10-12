import { useSelector } from "react-redux";
import QuickAccessItem from "../QuickAccessItem/QuickAccessItem";
import React, { memo, useMemo, useState } from "react";
import { useQuickFiles } from "../../hooks/files";
import classNames from "classnames";
import { useParams } from "react-router-dom";
import { useUtils } from "../../hooks/utils";
import ChevronOutline from "../../icons/ChevronOutline";

const QuickAccess = memo(() => {
  const { data: quickfilesList } = useQuickFiles(false);
  const [quickAccessExpanded, setQuickAccessExpanded] = useState(false);
  const { isHome } = useUtils();

  return (
    <div
      className="overflow-hidden"
      style={isHome ? { display: "block" } : { display: "none" }}
    >
      <div className="flex flex-row items-center justify-between mb-4">
        <h2 className=" text-[#212b36] text-xl font-medium">Quick Access</h2>
        <ChevronOutline
          onClick={() => setQuickAccessExpanded(!quickAccessExpanded)}
          className={classNames(
            "cursor-pointer animate-movement text-primary",
            {
              "rotate-180": quickAccessExpanded,
            }
          )}
        />
      </div>

      <div
        className={classNames(
          "grid animate-movement grid-cols-[repeat(auto-fit,minmax(47%,45%))] xs:grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-[16px]",
          quickfilesList?.length === 1
            ? "justify-normal"
            : "justify-center xs:justify-normal",
          {
            "max-h-36 sm:max-h-40": !quickAccessExpanded,
            "max-h-[720px] sm:max-h-[665px] quickAccessOne:max-h-[1000px] quickAccessTwo:max-h-[660px] quickAccessThree:max-h-[490px]":
              quickAccessExpanded,
          }
        )}
      >
        {quickfilesList?.map((file) => (
          <QuickAccessItem key={file._id} file={file} />
        ))}
      </div>
    </div>
  );
});

export default QuickAccess;
