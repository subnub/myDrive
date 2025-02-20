import { useParams } from "react-router-dom";
import { createFolderAPI } from "../../api/foldersAPI";
import { useClickOutOfBounds } from "../../hooks/utils";
import { showCreateFolderPopup } from "../../popups/folder";
import React, { RefObject, useEffect, useRef, useState } from "react";
import { useUploader } from "../../hooks/files";
import UploadFileIcon from "../../icons/UploadFileIcon";
import CreateFolderIcon from "../../icons/CreateFolderIcon";
import FolderUploadIcon from "../../icons/FolderUploadIcon";
import Swal from "sweetalert2";
import { useFolders } from "../../hooks/folders";
import classNames from "classnames";

interface AddNewDropdownProps {
  closeDropdown: () => void;
  isDropdownOpen: boolean;
}

const AddNewDropdown: React.FC<AddNewDropdownProps> = ({
  closeDropdown,
  isDropdownOpen,
}) => {
  const params = useParams();
  const { refetch: refetchFolders } = useFolders(false);
  const [supportsWebkitDirectory, setSupportsWebkitDirectory] = useState(false);
  const { wrapperRef } = useClickOutOfBounds(closeDropdown, true);
  const uploadRef: RefObject<HTMLInputElement> = useRef(null);
  const uploadFolderRef: RefObject<HTMLInputElement> = useRef(null);
  const { uploadFiles, uploadFolder } = useUploader();

  const createFolder = async () => {
    closeDropdown();
    const folderName = await showCreateFolderPopup();

    if (folderName === undefined || folderName === null) {
      return;
    }

    await createFolderAPI(folderName, params.id);
    refetchFolders();
  };

  const handleUpload = (e: React.FormEvent<HTMLInputElement>) => {
    e.preventDefault();
    closeDropdown();

    const files = uploadRef.current?.files;
    if (!files) return;

    uploadFiles(files);
  };

  const checkForWebkitDirectory = (items: FileList) => {
    for (let i = 0; i < items.length; i++) {
      if (!items[i].webkitRelativePath) {
        return false;
      }
    }
    return true;
  };

  const handleFolderUpload = (e: React.FormEvent<HTMLInputElement>) => {
    e.preventDefault();
    closeDropdown();

    const items = uploadFolderRef.current?.files;

    if (!items || !items.length) {
      Swal.fire({
        title: "No items selected",
        icon: "error",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "Okay",
      });
      return;
    }

    const hasWebkitDirectory = checkForWebkitDirectory(items);

    if (!hasWebkitDirectory) {
      uploadFiles(items);
    } else {
      uploadFolder(items);
    }
  };

  const triggerFileUpload = () => {
    if (uploadRef.current) {
      uploadRef.current.click();
    }
  };

  const triggerFolderUpload = () => {
    if (uploadFolderRef.current) {
      uploadFolderRef.current.click();
    }
  };

  useEffect(() => {
    if (uploadFolderRef.current) {
      setSupportsWebkitDirectory("webkitdirectory" in uploadFolderRef.current);
    }
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="absolute bottom-0 top-full w-full text-gray-500"
      id="add-new-dropdown"
    >
      <input
        className="hidden"
        ref={uploadRef}
        type="file"
        multiple={true}
        onChange={handleUpload}
      />
      <input
        className="hidden"
        ref={uploadFolderRef}
        type="file"
        // @ts-ignore
        webkitdirectory="true"
        onChange={handleFolderUpload}
      />
      <ul
        className={classNames("rounded-sm overflow-hidden shadow-lg animate", {
          "h-0": !isDropdownOpen,
          "h-[132px]": isDropdownOpen,
        })}
      >
        <li>
          <div>
            <a
              className="flex items-center justify-start px-5 py-3 no-underline overflow-hidden text-sm bg-white hover:bg-white-hover"
              onClick={triggerFileUpload}
            >
              <UploadFileIcon className="w-4 h-4 mr-2.5 text-primary" />
              <p className="text-sm">Upload Files</p>
            </a>
          </div>
        </li>
        <li>
          <a
            className="flex items-center justify-start px-5 py-3 no-underline overflow-hidden text-sm bg-white hover:bg-white-hover"
            onClick={createFolder}
          >
            <CreateFolderIcon className="w-4 h-4 mr-2.5 text-primary" />
            <p className="text-sm">Create Folder</p>
          </a>
        </li>
        {supportsWebkitDirectory && (
          <li>
            <a
              className="flex items-center justify-start px-5 py-3 no-underline overflow-hidden text-sm bg-white hover:bg-white-hover"
              onClick={triggerFolderUpload}
            >
              <FolderUploadIcon className="w-4 h-4 mr-2.5 text-primary" />
              <p className="text-sm">Upload Folder</p>
            </a>
          </li>
        )}
      </ul>
    </div>
  );
};

export default AddNewDropdown;
