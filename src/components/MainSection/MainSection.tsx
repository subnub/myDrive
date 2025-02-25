import DataForm from "../Dataform/Dataform";
import RightSection from "../RightSection/RightSection";
import { memo, useRef } from "react";
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
  const scrollDivRef = useRef<HTMLDivElement>(null);

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

        <div className="flex flex-row dynamic-height w-screen pt-12">
          <LeftSection scrollDivRef={scrollDivRef} />

          {!isMedia ? (
            <DataForm scrollDivRef={scrollDivRef} />
          ) : (
            <Medias scrollDivRef={scrollDivRef} />
          )}

          <RightSection />
        </div>
      </div>
    </div>
  );
});

export default MainSection;
