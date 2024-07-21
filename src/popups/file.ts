import Swal from "sweetalert2";

export const renameFilePopup = async (filename: string) => {
  const result = await Swal.fire({
    title: "Enter A File Name",
    input: "text",
    inputValue: filename,
    showCancelButton: true,
    inputValidator: (value) => {
      if (!value) {
        return "Please Enter a Name";
      }
    },
  });
  return result.value;
};

export const deleteFilePopup = async () => {
  const result = await Swal.fire({
    title: "Delete file?",
    text: "You will not be able to recover this file.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes",
  });
  return result.value;
};

export const restoreItemPopup = async () => {
  const result = await Swal.fire({
    title: "Restore item?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes",
  });
  return result.value;
};

export const restoreItemsPopup = async () => {
  const result = await Swal.fire({
    title: "Restore items?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes",
  });
  return result.value;
};

export const deleteItemsPopup = async () => {
  const result = await Swal.fire({
    title: "Delete items?",
    text: "You will not be able to recover these items.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes",
  });
  return result.value;
};

export const trashItemsPopup = async () => {
  const result = await Swal.fire({
    title: "Move to trash?",
    text: "Items in the trash will eventually be deleted.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes",
  });
  return result.value;
};

export const makePublicPopup = async () => {
  const result = await Swal.fire({
    title: "Make file public?",
    text: "Anyone with the link will be able to download the file.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes",
  });
  return result.value;
};

export const makeOneTimePublicPopup = async () => {
  const result = await Swal.fire({
    title: "Make file temporarly public?",
    text: "Anyone with the link will be able to downoad the file once.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes",
  });
  return result.value;
};

export const removeLinkPopup = async () => {
  const result = await Swal.fire({
    title: "Remove link?",
    text: "This will remove public access to the file.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes",
  });
  return result.value;
};
