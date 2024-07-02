import Header from "../Header";
import MainSection from "../MainSection";
import Uploader from "../Uploader";
import React from "react";
import UploadOverlay from "../UploadOverlay";
import HomepageSpinner from "../HomepageSpinner";
import MobileContextMenuContainer from "../MobileContextMenu";
import ShareModelWrapper from "../ShareModelWrapper";
import PhotoViewer from "../PhotoViewer";
import { useAppSelector } from "../../hooks/store";

const Homepage = () => {
  const photoID = useAppSelector((state) => state.photoViewer.id);
  return (
    <div>
      <HomepageSpinner />

      <div className="">
        <Header />
        <div className="flex space-between">
          <MainSection />
          <Uploader />
          {photoID.length === 0 ? undefined : <PhotoViewer />}
        </div>
      </div>

      <UploadOverlay />
      <ShareModelWrapper />
    </div>
  );
};

export default Homepage;
