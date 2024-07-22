import Header from "../Header";
import MainSection from "../MainSection";
import Uploader from "../Uploader";
import React from "react";
import HomepageSpinner from "../HomepageSpinner";
import MobileContextMenuContainer from "../MobileContextMenu";
import PhotoViewer from "../PhotoViewer";
import { useAppSelector } from "../../hooks/store";
import { ToastContainer } from "react-toastify";

const Homepage = () => {
  const showUploader = useAppSelector(
    (state) => state.uploader.uploads.length !== 0
  );

  return (
    <div>
      <HomepageSpinner />

      <div className="">
        <Header />
        <div className="flex space-between">
          <MainSection />
          {showUploader && <Uploader />}
        </div>
      </div>

      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default Homepage;
