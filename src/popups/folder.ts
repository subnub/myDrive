import Swal from "sweetalert2";

export const showCreateFolderPopup = async (defaultName = "") => {
  const { value: folderName } = await Swal.fire({
    title: "Enter Folder Name",
    input: "text",
    inputValue: defaultName,
    showCancelButton: true,
    inputValidator: (value) => {
      if (!value) {
        return "Please Enter a Name";
      }
    },
  });
  return folderName;
};
