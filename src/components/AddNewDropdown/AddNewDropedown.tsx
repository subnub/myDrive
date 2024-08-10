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
      <ul className="rounded-sm overflow-hidden shadow-lg">
        <li>
          <div>
            <a
              className="flex items-center justify-start px-5 py-3 no-underline overflow-hidden text-sm bg-white hover:bg-white-hover"
              onClick={triggerFileUpload}
            >
              <UploadFileIcon className="w-5 h-5 mr-2.5 text-primary" />
              <p className="text-sm">Upload Files</p>
            </a>
          </div>
        </li>
        <li>
          <a
            className="flex items-center justify-start px-5 py-3 no-underline overflow-hidden text-sm bg-white hover:bg-white-hover"
            onClick={createFolder}
          >
            <CreateFolderIcon className="w-5 h-5 mr-2.5 text-primary" />
            <p className="text-sm">Create Folder</p>
          </a>
        </li>
      </ul>
    </div>
  );
};

export default AddNewDropdown;
