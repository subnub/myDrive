import DataForm from "../Dataform";
import RightSection from "../RightSection";
import MoverMenu from "../MoverMenu";
import PopupWindow from "../PopupWindow";
import React, { memo } from "react";
import LeftSection from "../LeftSection";
import { useSelector } from "react-redux";
import { useUtils } from "../../hooks/utils";
import Medias from "../Medias";

const MainSection = memo(() => {
  const moverID = useSelector((state) => state.mover.id);
  const showPopup = useSelector((state) => state.popupFile.showPopup);
  const { isMedia } = useUtils();
  return (
    <div>
      <div className="flex h-full">
        {showPopup ? <PopupWindow /> : undefined}

        {moverID.length === 0 ? undefined : <MoverMenu />}

        <div className="flex flex-row h-screen w-screen pt-16">
          <LeftSection />

          {!isMedia ? <DataForm /> : <Medias />}

          <RightSection />
        </div>
      </div>
    </div>
  );
});

export default MainSection;
