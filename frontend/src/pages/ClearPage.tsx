import LoadingOverlay from "../components/overlay/LoadingOverlay";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ClearPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const clearLocal = async () => {
      localStorage.clear();
      sessionStorage.clear();
    };

    clearLocal();
    navigate("/loading");
  }, []);

  return (
    <div className="font-poppins bg-[var(--primary)] w-full h-screen flex flex-col justify-center items-center">
      <div className=" bg-transparent flex flex-col justify-center items-center w-[90%] md:w-96 md:h-[30rem] h-[80%] text-center gap-5 p-5">
        <LoadingOverlay />
      </div>
    </div>
  );
};

export default ClearPage;
