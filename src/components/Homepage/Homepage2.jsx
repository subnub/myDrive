import Header from "../Header";
import LeftSection from "../LeftSection";
import MainSection from "../MainSection";
import Uploader from "../Uploader";
import React from "react";
import PhotoViewer from "../PhotoViewer";
import UploadOverlay from "../UploadOverlay";
import HomepageSpinner from "../HomepageSpinner";
import MobileContextMenuContainer from "../MobileContextMenu";
import ShareModelWrapper from "../ShareModelWrapper";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useInfiniteQuery, useQuery } from "react-query";
import { getFilesList } from "../../api/filesAPI";
import { getFoldersList } from "../../api/foldersAPI";
import { useFiles } from "../../hooks/files";

const Homepage2 = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const photoID = useSelector((state) => state.photoViewer.id);
  useFiles();

  const goHome = () => {
    navigate("/home");
  };

  return (
    <div>
      <HomepageSpinner />

      <div className="">
        <Header goHome={goHome} />
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
