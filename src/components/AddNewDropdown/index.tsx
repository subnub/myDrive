import { useParams } from "react-router-dom";
import { createFolderAPI } from "../../api/foldersAPI";
import { useFoldersClient } from "../../hooks/folders";
import { useClickOutOfBounds } from "../../hooks/utils";
import { showCreateFolderPopup } from "../../popups/folder";
import { useAppDispatch } from "../../hooks/store";
import { startAddFile } from "../../actions/files";
import { useRef } from "react";

interface AddNewDropdownProps {
  closeDropdown: () => void;
}

const AddNewDropdown: React.FC<AddNewDropdownProps> = (props) => {
  const params = useParams();
  const { invalidateFoldersCache } = useFoldersClient();
  const { wrapperRef } = useClickOutOfBounds(props.closeDropdown);
  const uploadRef = useRef("");
  const dispatch = useAppDispatch();

  const createFolder = async () => {
    props.closeDropdown();
    const folderName = await showCreateFolderPopup();

    if (folderName === undefined || folderName === null) {
      return;
    }

    await createFolderAPI(folderName, params.id);
    invalidateFoldersCache();
  };

  const handleUpload = (e: any) => {
    e.preventDefault();
    props.closeDropdown();
    console.log("handle upload");

    dispatch(startAddFile(uploadRef.current, params.id));
    if (uploadRef && uploadRef.current) {
      uploadRef.current = "";
    }
  };

  return (
    <div ref={wrapperRef} className="absolute bottom-0 top-full w-full">
      <ul className="pl-0 list-none m-0 rounded-[5px] overflow-hidden bg-white shadow-[0px_2px_4px_rgba(0,0,0,0.15),_inset_0px_1px_0px_#F5F7FA]">
        <li>
          <div>
            <input
              className="w-full top-0 bg-red-500 h-[41px] mt-[3px] cursor-pointer absolute opacity-0"
              // @ts-ignore
              ref={uploadRef}
              type="file"
              multiple={true}
              onChange={handleUpload}
            />
            <a className="flex items-center bg-white justify-start p-[12px_20px] transition-all duration-400 ease-in-out no-underline rounded-[5px] overflow-hidden text-[#0E1C71] text-[15px] leading-[18px]">
              <span className="inline-flex min-w-[30px]">
                <img
                  className="max-w-full h-auto"
                  src="/assets/uploadicon.svg"
                  alt="upload"
                />
              </span>{" "}
              Upload Files
            </a>
          </div>
        </li>
        <li>
          <a
            className="flex items-center bg-white justify-start p-[12px_20px] transition-all duration-400 ease-in-out no-underline rounded-[5px] overflow-hidden text-[#0E1C71] text-[15px] leading-[18px]"
            onClick={createFolder}
          >
            <span className="inline-flex min-w-[30px]">
              <img
                className="max-w-full h-auto"
                src="/assets/foldericon.svg"
                alt="folder"
              />
            </span>{" "}
            Create Folder
          </a>
        </li>
      </ul>
    </div>
  );
};

export default AddNewDropdown;
