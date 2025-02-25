import Swal from "sweetalert2";

export const emailVerificationSentPopup = async () => {
  const result = await Swal.fire({
    title: "Email verification sent",
    icon: "success",
    confirmButtonColor: "#3085d6",
    confirmButtonText: "Okay",
  });
  return result.value;
};
