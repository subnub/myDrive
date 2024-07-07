import DataForm from "../Dataform";
import RightSection from "../RightSection";
import MoverMenu from "../MoverMenu";
import PopupWindow from "../PopupWindow";
import React, { memo } from "react";
import LeftSection from "../LeftSection";
import { useSelector } from "react-redux";
import { useUtils } from "../../hooks/utils";
import Medias from "../Medias";
import { useAppSelector } from "../../hooks/store";
import PhotoViewerPopup from "../PhotoViewerPopup";

const MainSection = memo(() => {
  const moverID = useAppSelector((state) => state.mover.id);
  const showPopup = useAppSelector((state) => state.popupFile.showPopup);
  const selectedItem = useAppSelector((state) => state.selected.popupModal);
  const { isMedia } = useUtils();
  return (
    <div>
      <div className="flex h-full">
        {/* {showPopup ? <PopupWindow /> : undefined} */}
        {selectedItem?.file &&
        (selectedItem.file.metadata.hasThumbnail ||
          selectedItem.file.metadata.isVideo) ? (
          <PhotoViewerPopup />
        ) : undefined}

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
