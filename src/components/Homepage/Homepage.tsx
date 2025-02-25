import Header from "../Header/Header";
import MainSection from "../MainSection/MainSection";
import Uploader from "../Uploader/Uploader";
import { useAppSelector } from "../../hooks/store";
import { ToastContainer } from "react-toastify";

const Homepage = () => {
  const showUploader = useAppSelector(
    (state) => state.uploader.uploads.length !== 0
  );

  return (
    <div>
      <div className="">
        <Header />
        <div className="flex space-between">
          <MainSection />
          {showUploader && <Uploader />}
        </div>
      </div>

      <ToastContainer position="bottom-left" pauseOnFocusLoss={false} />
    </div>
  );
};

export default Homepage;
