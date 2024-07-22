import { useParams } from "react-router-dom";
import { createFolderAPI } from "../../api/foldersAPI";
import { useFoldersClient } from "../../hooks/folders";
import { useClickOutOfBounds } from "../../hooks/utils";
import { showCreateFolderPopup } from "../../popups/folder";
import { RefObject, useRef } from "react";
import { useUploader } from "../../hooks/files";
import UploadFileIcon from "../../icons/UploadFileIcon";
import CreateFolderIcon from "../../icons/CreateFolderIcon";

interface AddNewDropdownProps {
  closeDropdown: () => void;
}

const AddNewDropdown: React.FC<AddNewDropdownProps> = (props) => {
  const params = useParams();
  const { invalidateFoldersCache } = useFoldersClient();
  const { wrapperRef } = useClickOutOfBounds(props.closeDropdown);
  const uploadRef: RefObject<HTMLInputElement> = useRef(null);
  const { uploadFiles } = useUploader();

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

    const files = uploadRef.current?.files;
    if (!files) return;

    uploadFiles(files);
  };

  const triggerFileUpload = () => {
    if (uploadRef.current) {
      uploadRef.current.click();
    }
  };

  return (
    <div ref={wrapperRef} className="absolute bottom-0 top-full w-full">
      <input
        className="hidden"
        ref={uploadRef}
        type="file"
        multiple={true}
        onChange={handleUpload}
      />
      <ul className="pl-0 list-none m-0 rounded-[5px] overflow-hidden shadow-md">
        <li>
          <div>
            <a
              className="flex items-center justify-start p-[12px_20px] no-underline rounded-[5px] overflow-hidden text-[15px] leading-[18px] bg-white hover:bg-[#f6f5fd]"
              onClick={triggerFileUpload}
            >
              <UploadFileIcon className="w-[20px] h-[20px] mr-[10px] text-[#3c85ee]" />
              <p className="text-sm">Upload Files</p>
            </a>
          </div>
        </li>
        <li>
          <a
            className="flex items-center justify-start p-[12px_20px] no-underline rounded-[5px] overflow-hidden text-[15px] leading-[18px] bg-white hover:bg-[#f6f5fd]"
            onClick={createFolder}
          >
            <CreateFolderIcon className="w-[20px] h-[20px] mr-[10px] text-[#3c85ee]" />
            <p className="text-sm">Create Folder</p>
          </a>
        </li>
      </ul>
    </div>
  );
};

export default AddNewDropdown;
