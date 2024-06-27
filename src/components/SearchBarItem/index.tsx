import { FileInterface } from "../../types/file";
import { FolderInterface } from "../../types/folders";
import { useMemo } from "react";
import { getFileColor, getFileExtension } from "../../utils/files";

interface SearchBarItemProps {
  file?: FileInterface;
  folder?: FolderInterface;
  type: "file" | "folder";
  fileClick: (file: FileInterface) => void;
  folderClick: (folder: FolderInterface) => void;
}

const SearchBarItem = (props: SearchBarItemProps) => {
  const { type, folder, file, fileClick, folderClick } = props;
  const fileExtension = useMemo(
    () => getFileExtension(file?.filename || "", 3),
    [file?.filename]
  );

  const imageColor = useMemo(
    () => getFileColor(file?.filename || ""),
    [file?.filename]
  );

  if (type === "folder" && folder) {
    return (
      <div
        className="flex flex-row items-center py-2 px-4 overflow-hidden text-ellipsis hover:bg-[#f6f5fd] cursor-pointer"
        key={folder._id}
        onClick={() => folderClick(folder)}
      >
        <div>
          <svg
            className="w-[30px] h-[30px] text-[#3c85ee]"
            aria-hidden="true"
            focusable="false"
            data-prefix="fas"
            data-icon="folder"
            role="img"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
            data-fa-i2svg=""
          >
            <path
              fill="currentColor"
              d="M464 128H272l-64-64H48C21.49 64 0 85.49 0 112v288c0 26.51 21.49 48 48 48h416c26.51 0 48-21.49 48-48V176c0-26.51-21.49-48-48-48z"
            ></path>
          </svg>
        </div>
        <span className="text-sm ml-4 text-ellipsis overflow-hidden whitespace-nowrap">
          {folder.name}
        </span>
      </div>
    );
  } else if (type === "file" && file) {
    return (
      <div
        className="flex flex-row items-center py-2 px-4 overflow-hidden text-ellipsis hover:bg-[#f6f5fd] cursor-pointer"
        key={file._id}
        onClick={() => fileClick(file)}
      >
        <div>
          <span className="inline-flex items-center max-w-[27px] min-w-[27px] min-h-[27px] max-h-[27px]">
            <div
              className="h-[27px] w-[27px] bg-red-500 rounded-[3px] flex flex-row justify-center items-center"
              style={{ background: imageColor }}
            >
              <span className="font-semibold text-[9.5px] text-white">
                {fileExtension}
              </span>
            </div>
          </span>
        </div>
        <span className="text-sm ml-4 text-ellipsis overflow-hidden whitespace-nowrap">
          {file.filename}
        </span>
      </div>
    );
  }
  return <div></div>;
};

export default SearchBarItem;
