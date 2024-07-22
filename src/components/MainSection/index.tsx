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
  const selectedItem = useAppSelector((state) => state.selected.popupModal);
  const shareModalItem = useAppSelector(
    (state) => state.selected.shareModal.file
  );

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

        {selectedItem?.file &&
        !selectedItem.file.metadata.isVideo &&
        !selectedItem.file.metadata.hasThumbnail ? (
          <FileInfoPopup />
        ) : undefined}

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
