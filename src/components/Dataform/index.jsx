import QuickAccess from "../QuickAccess";
import Folders from "../Folders";
import { useFiles } from "../../hooks/files";
import Files from "../Files";

const DataForm = (props) => {
  const { fetchNextPage: filesFetchNextPage, invalidateFilesCache } =
    useFiles();

  return (
    <div className="w-full p-[65px_40px] overflow-y-scroll">
      <QuickAccess />
      <button
        className="p-2 bg-blue-500 rounded-md text-white"
        onClick={filesFetchNextPage}
      >
        Next page
      </button>
      <button
        className="p-2 bg-blue-500 rounded-md text-white ml-4"
        onClick={invalidateFilesCache}
      >
        Refresh
      </button>

      <Folders />

      <Files />
    </div>
  );
};

export default DataForm;
