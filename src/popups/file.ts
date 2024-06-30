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
