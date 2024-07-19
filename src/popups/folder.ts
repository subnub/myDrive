import Swal from "sweetalert2";

export const renameFolderPopup = async (folderName: string) => {
  const result = await Swal.fire({
    title: "Enter A folder Name",
    input: "text",
    inputValue: folderName,
    showCancelButton: true,
    inputValidator: (value) => {
      if (!value) {
        return "Please Enter a Name";
      }
    },
  });
  return result.value;
};

export const deleteFolderPopup = async () => {
  const result = await Swal.fire({
    title: "Delete folder?",
    text: "You will not be able to recover this folder.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes",
  });
  return result.value;
};

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
