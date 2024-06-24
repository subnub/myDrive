import Header from "../Header";
import MainSection from "../MainSection";
import Uploader from "../Uploader";
import React from "react";
import UploadOverlay from "../UploadOverlay";
import HomepageSpinner from "../HomepageSpinner";
import MobileContextMenuContainer from "../MobileContextMenu";
import ShareModelWrapper from "../ShareModelWrapper";

const Homepage2 = () => {
  return (
    <div>
      <HomepageSpinner />

      <div className="">
        <Header />
        <div className="flex space-between">
          <MainSection />
          <Uploader />
          {/* {photoID.length === 0 ? undefined : <PhotoViewer />} */}
        </div>
      </div>

      <UploadOverlay />
      <ShareModelWrapper />
      <MobileContextMenuContainer />
    </div>
  );
};

export default Homepage2;
