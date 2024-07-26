import DataForm from "../Dataform";
import RightSection from "../RightSection";
import { memo } from "react";
import LeftSection from "../LeftSection";
import { useUtils } from "../../hooks/utils";
import Medias from "../Medias";
import { useAppSelector } from "../../hooks/store";
import PhotoViewerPopup from "../PhotoViewerPopup";
import FileInfoPopup from "../FileInfoPopup";
import SharePopup from "../SharePopup";

const MainSection = memo(() => {
  const popupModalItem = useAppSelector(
    (state) => state.selected.popupModal.file
  );
  const shareModalItem = useAppSelector(
    (state) => state.selected.shareModal.file
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
