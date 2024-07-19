import Swal from "sweetalert2";

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
    text: "This iwill make the file public, anyone with the link will be able to access the file.",
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
    title: "Make file public?",
    text: "This iwill make the file public, anyone with the link will be able to access the file for a single time.",
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
