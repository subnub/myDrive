import classNames from "classnames";
import React from "react";
import Swal from "sweetalert2";
import { deleteFile, renameFile } from "../../api/filesAPI";
import { useFiles, useQuickFiles } from "../../hooks/files";

const NewContextMenu = (props) => {
  const { invalidateFilesCache } = useFiles();
  const { invalidateQuickFilesCache } = useQuickFiles();
  const liClassname =
    "flex w-full px-[20px] py-[12px] items-center font-normal justify-start no-underline transition-all duration-400 ease-in-out hover:bg-[#f6f5fd] hover:text-[#3c85ee] hover:font-medium";
  const spanClassname = "inline-flex mr-[18px]";

  const renameItem = async () => {
    if (!props.folderMode) {
      const { value: filename } = await Swal.fire({
        title: "Enter A File Name",
        input: "text",
        inputValue: props.file.filename,
        showCancelButton: true,
        inputValidator: (value) => {
          if (!value) {
            return "Please Enter a Name";
          }
        },
      });
      await renameFile(props.file._id, filename);
      invalidateFilesCache();
      invalidateQuickFilesCache();
    }
  };

  const deleteItem = async () => {
    if (!props.folderMode) {
      const result = await Swal.fire({
        title: "Confirm Deletion",
        text: "You cannot undo this action",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete",
      });

      if (result.value) {
        await deleteFile(props.file._id);
        invalidateFilesCache();
        invalidateQuickFilesCache();
      }
    }
  };

  return (
    <div
      onClick={props.stopPropagation}
      ref={props.wrapperRef}
      className={classNames(
        "fixed min-w-[215px] bg-white shadow-[0px_2px_4px_rgba(0,0,0,0.15),_inset_0px_1px_0px_#f5f7fa] rounded-[4px] mt-[-5px] z-[2] animate-very-long",
        props.contextSelected.selected ? "opacity-100" : "opacity-0"
      )}
      style={
        props.contextSelected.selected
          ? {
              display: "block",
              left: `${props.contextSelected.X}px`,
              top: `${props.contextSelected.Y}px`,
            }
          : { display: "none" }
      }
    >
      <ul className="p-0 list-none m-0 ">
        <li onClick={renameItem} className={liClassname}>
          <a className="flex">
            <span className={spanClassname}>
              <img src="/assets/filesetting1.svg" alt="setting" />
            </span>
            Rename
          </a>
        </li>
        {!props.folderMode ? (
          <li onClick={props.startShareFile} className={liClassname}>
            <a className="flex" data-modal="share__modal">
              <span
                className="inline-flex mr-[18px]
"
              >
                <img src="/assets/filesetting2.svg" alt="setting" />
              </span>
              Share
            </a>
          </li>
        ) : undefined}
        {!props.folderMode ? (
          <li onClick={props.startFileDownload} className={liClassname}>
            <a className="flex">
              <span className={spanClassname}>
                <img src="/assets/filesetting3.svg" alt="setting" />
              </span>
              Download
            </a>
          </li>
        ) : undefined}
        <li onClick={props.startMovingFile} className={liClassname}>
          <a className="flex" data-modal="destination__modal">
            <span className={spanClassname}>
              <img src="/assets/filesetting4.svg" alt="setting" />
            </span>{" "}
            Move
          </a>
        </li>
        <li onClick={deleteItem} className={liClassname}>
          <a className="flex">
            <span className={spanClassname}>
              <img src="/assets/filesetting5.svg" alt="setting" />
            </span>
            Delete
          </a>
        </li>
      </ul>
    </div>
  );
};

export default NewContextMenu;
