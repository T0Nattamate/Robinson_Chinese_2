import LoadingOverlay from "../components/overlay/LoadingOverlay";
import { useEffect } from "react";
import liff from "@line/liff";
import { useUserStore } from "../store/userStore";
import { useNavigate } from "react-router-dom";

const LoadingAfterLogin = () => {
  const { lineId, confirmLoginWithLineId, setLineId, setLineProfilePic } =
    useUserStore();
  const navigate = useNavigate();

  // Initial LIFF ID
  const liffId = import.meta.env.VITE_LIFF_ID || "";

  useEffect(() => {
    const initializeLiff = async () => {
      try {
        await liff.init({ liffId });

        liff.ready.then(async () => {
          if (liff.isLoggedIn()) {
            const profile = await liff.getProfile();
            
            // Log userId and linePicUrl
            //console.log("User ID:", profile.userId);
            //console.log("Line Profile Picture URL:", profile.pictureUrl);

            setLineId(profile.userId);
            if (profile.pictureUrl) {
              setLineProfilePic(profile.pictureUrl);
            }

            if (profile.userId) {
              try {
                const response = profile.pictureUrl
                  ? await confirmLoginWithLineId(profile.userId, profile.pictureUrl)
                  : await confirmLoginWithLineId(profile.userId);
              
                //console.log("Access token received:", response); // Check this value
              
                if (response) {
                  navigate("/menu");
                } else {
                  console.warn("No access token found, redirecting to register");
                  navigate("/register");
                }
              } catch (error) {
                console.error("Error during login confirmation:", error);
                navigate("/register");
              }
              
            }
          } else {
            liff.login();
          }
        });
      } catch (error) {
        console.error("Error initializing LIFF:", error);
      }
    };

    initializeLiff();
  }, [liffId, lineId]);

  return (
    <div className="font-poppins bg-[var(--ghost-white)] w-full h-screen flex flex-col justify-center items-center">
      <div className=" bg-transparent flex flex-col justify-center items-center w-[90%] md:w-96 md:h-[30rem] h-[80%] text-center gap-5 p-5">
        <LoadingOverlay />
      </div>
    </div>
  );
};

export default LoadingAfterLogin;
