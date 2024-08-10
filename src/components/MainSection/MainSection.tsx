import DataForm from "../Dataform/Dataform";
import RightSection from "../RightSection/RightSection";
import { memo } from "react";
import LeftSection from "../LeftSection/LeftSection";
import { useUtils } from "../../hooks/utils";
import Medias from "../Medias/Medias";
import { useAppSelector } from "../../hooks/store";
import PhotoViewerPopup from "../PhotoViewerPopup/PhotoViewerPopup";
import FileInfoPopup from "../FileInfoPopup/FileInfoPopup";
import SharePopup from "../SharePopup/SharePopup";
import MoverPopup from "../MoverPopup/MoverPopup";

const MainSection = memo(() => {
  const popupModalItem = useAppSelector(
    (state) => state.selected.popupModal.file
  );
  const shareModalItem = useAppSelector(
    (state) => state.selected.shareModal.file
  );
  const moveModalItemType = useAppSelector(
    (state) => state.selected.moveModal.type
  );

  const isMediaSelected =
    popupModalItem?.metadata.isVideo || popupModalItem?.metadata.hasThumbnail;
  const isFileInfoSelected = !isMediaSelected && popupModalItem;

  const { isMedia } = useUtils();
  return (
    <div>
      <div className="flex h-full">
        {isMediaSelected && (
          <PhotoViewerPopup file={popupModalItem} key={popupModalItem._id} />
        )}

        {isFileInfoSelected && <FileInfoPopup />}

        {shareModalItem && <SharePopup />}

        {moveModalItemType && <MoverPopup />}

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
