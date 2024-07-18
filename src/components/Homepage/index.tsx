import Header from "../Header";
import MainSection from "../MainSection";
import Uploader from "../Uploader";
import React from "react";
import HomepageSpinner from "../HomepageSpinner";
import MobileContextMenuContainer from "../MobileContextMenu";
import PhotoViewer from "../PhotoViewer";
import { useAppSelector } from "../../hooks/store";

const Homepage = () => {
  return (
    <div>
      <HomepageSpinner />

      <div className="">
        <Header />
        <div className="flex space-between">
          <MainSection />
          <Uploader />
        </div>
      </div>
    </div>
  );
};

export default Homepage;
