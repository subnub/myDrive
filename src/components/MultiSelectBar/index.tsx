import { useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/store";
import { resetMultiSelect } from "../../reducers/selected";
import Swal from "sweetalert2";
import { trashMultiAPI } from "../../api/filesAPI";
import { useFilesClient, useQuickFilesClient } from "../../hooks/files";
import { useFoldersClient } from "../../hooks/folders";

const MultiSelectBar = () => {
  const dispatch = useAppDispatch();
  const multiSelectMode = useAppSelector(
    (state) => state.selected.multiSelectMode
  );
  const multiSelectMap = useAppSelector(
    (state) => state.selected.multiSelectMap
  );
  const multiSelectCount = useAppSelector(
    (state) => state.selected.multiSelectCount
  );
  const { invalidateFilesCache } = useFilesClient();
  const { invalidateFoldersCache } = useFoldersClient();
  const { invalidateQuickFilesCache } = useQuickFilesClient();

  const closeMultiSelect = () => {
    dispatch(resetMultiSelect());
  };

  const deleteItems = async () => {
    const result = await Swal.fire({
      title: "Move to trash?",
      text: "Items in the trash will eventually be deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes",
    });

    if (result.value) {
      const itemsToTrash = Object.values(multiSelectMap);
      await trashMultiAPI(itemsToTrash);
      invalidateFilesCache();
      invalidateFoldersCache();
      invalidateQuickFilesCache();
      closeMultiSelect();
    }
  };

  if (!multiSelectMode) return <div></div>;

  return (
    <div className="flex justify-center items-center">
      <div className="border border-[#ebe9f9] bg-[#ebe9f9] rounded-full p-2 px-5 text-black text-sm mb-4 max-w-[600px] w-full mt-4">
        <div className="flex flex-row items-center justify-between">
          <div className="flex flex-row items-center">
            <img
              className="w-[22px] h-[22px] cursor-pointer"
              src="/images/close_icon.png"
              onClick={closeMultiSelect}
            />
            <p className="ml-4">{multiSelectCount} selected</p>
          </div>

          <div className="flex flex-row items-center">
            <svg
              width="17"
              height="18"
              viewBox="0 0 17 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="ml-4 cursor-pointer"
              onClick={deleteItems}
            >
              <g id="trash">
                <path
                  id="Shape"
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M16.0694 2.57072H11.5707V1.92803C11.5707 0.863209 10.7075 0 9.64265 0H7.07192C6.0071 0 5.14389 0.863209 5.14389 1.92803V2.57072H0.645132C0.290178 2.57072 0.00244141 2.85846 0.00244141 3.21341C0.00244141 3.56837 0.290215 3.85607 0.645132 3.85607H1.34371L2.57317 17.4108C2.60348 17.7427 2.88255 17.9963 3.21586 17.995H13.4987C13.832 17.9964 14.1111 17.7427 14.1414 17.4108L15.3708 3.85607H16.0694C16.4244 3.85607 16.7121 3.56833 16.7121 3.21338C16.7121 2.85842 16.4244 2.57072 16.0694 2.57072ZM6.42923 1.92803C6.42923 1.57308 6.71697 1.28534 7.07192 1.28534H9.64265C9.9976 1.28534 10.2853 1.57308 10.2853 1.92803V2.57072H6.42927V1.92803H6.42923ZM3.80263 16.7096H12.9119L14.0803 3.85607H5.78658H2.63745L3.80263 16.7096Z"
                  fill="currentColor"
                />
                <path
                  id="Path"
                  d="M6.42938 14.7385C6.4293 14.7376 6.42926 14.7367 6.42919 14.7358L5.7865 5.73834C5.76131 5.38339 5.45312 5.1161 5.09821 5.14129C4.74325 5.16649 4.47596 5.47467 4.50116 5.82959L5.14385 14.8271C5.16783 15.1641 5.44868 15.425 5.78654 15.4241H5.83282C6.1869 15.3995 6.45401 15.0925 6.42938 14.7385Z"
                  fill="currentColor"
                />
                <path
                  id="Path_2"
                  d="M8.35729 5.1416C8.00234 5.1416 7.7146 5.42934 7.7146 5.78429V14.7818C7.7146 15.1367 8.00234 15.4245 8.35729 15.4245C8.71224 15.4245 8.99998 15.1367 8.99998 14.7818V5.78429C8.99998 5.42934 8.71224 5.1416 8.35729 5.1416Z"
                  fill="currentColor"
                />
                <path
                  id="Path_3"
                  d="M11.6164 5.14129C11.2615 5.1161 10.9533 5.38339 10.9281 5.73834L10.2854 14.7358C10.2594 15.0898 10.5253 15.3979 10.8793 15.4239C10.8804 15.424 10.8814 15.424 10.8825 15.4241H10.9281C11.266 15.425 11.5468 15.1641 11.5708 14.8271L12.2135 5.82959C12.2387 5.47467 11.9714 5.16652 11.6164 5.14129Z"
                  fill="currentColor"
                />
              </g>
            </svg>
            <svg
              width="19"
              height="16"
              viewBox="0 0 19 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="ml-4 cursor-pointer"
            >
              <path
                id="Combined Shape"
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M7.63107 0C7.83994 0 8.03661 0.0983374 8.16193 0.265429L9.95357 2.65429H17.9164C18.2829 2.65429 18.58 2.95138 18.58 3.31786V15.2621C18.58 15.6286 18.2829 15.9257 17.9164 15.9257H0.663571C0.297091 15.9257 0 15.6286 0 15.2621V0.663571C0 0.297091 0.297091 0 0.663571 0H7.63107ZM7.212 1.5H1.5V14.425H17.08V4.154L9.20357 4.15429L7.212 1.5ZM9.96369 9.51348C10.0439 9.43969 10.0892 9.33783 10.0892 9.23078C10.0892 9.12373 10.0439 9.02188 9.96369 8.9486L7.2712 6.4802C7.15381 6.37263 6.98149 6.34301 6.8334 6.40433C6.68532 6.46565 6.58893 6.60648 6.58893 6.76238V7.93162H4.30032C3.92929 7.93162 3.62719 8.22315 3.62719 8.5812V9.88036C3.62719 10.2384 3.92929 10.5299 4.30032 10.5299H6.58893V11.6992C6.58893 11.8551 6.68478 11.9964 6.8334 12.0577C6.98203 12.1191 7.15435 12.0889 7.2712 11.9819L9.96369 9.51348Z"
                fill="currentColor"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiSelectBar;
