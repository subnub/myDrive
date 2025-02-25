import { useParams } from "react-router-dom";
import { verifyEmailAPI } from "../../api/userAPI";
import { toast, ToastContainer } from "react-toastify";
import { useEffect } from "react";

const VerifyEmailPage = () => {
  const token = useParams().token!;

  const verifyEmail = async () => {
    try {
      await toast.promise(verifyEmailAPI(token), {
        pending: "Verifying email...",
        success: "Email Verified",
        error: "Error verifying email",
      });

      setTimeout(() => {
        window.location.assign("/");
      }, 1500);
    } catch (e) {
      console.log("Error verifying email", e);
    }
  };

  useEffect(() => {
    verifyEmail();
  }, []);

  return (
    <div className="w-screen dynamic-height flex justify-center items-center flex-col">
      <h1>Verifying email...</h1>
      <ToastContainer position="bottom-left" pauseOnFocusLoss={false} />
    </div>
  );
};

export default VerifyEmailPage;
