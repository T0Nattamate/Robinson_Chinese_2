import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../store/userStore";

const LoginPage = () => {
  const { setLineId, setLineProfilePic, confirmLoginWithLineId } = useUserStore();
  const navigate = useNavigate();
  const [lineIdFromInput, setLineIdFromInput] = useState<string>("");

  const handleLogin = async () => {
    if (lineIdFromInput.trim()) {
      setLineId(lineIdFromInput);
      setLineProfilePic(
        "https://ih1.redbubble.net/image.5448836884.7313/bg,f8f8f8-flat,750x,075,f-pad,750x1000,f8f8f8.jpg"
      );

      try {
        await confirmLoginWithLineId(lineIdFromInput);
        // If no error thrown, login was successful
        navigate("/menu");
      } catch (error: any) {
        // User not found or other error - redirect to register
        console.log("Login failed, redirecting to register:", error.message);
        navigate("/register");
      }
    } else {
      alert("Please enter a valid LINE ID.");
    }
  };

  return (
    <div className="font-poppins bg-white w-full h-screen flex flex-col justify-center items-center animate-in fade-in zoom-in-95 duration-700">
      <div className="card flex flex-col justify-center items-center w-[90%] md:w-96 md:h-[30rem] h-[80%] text-center gap-5 p-5">
        <h1 className="text-2xl font-bold text-green-700">LINE LIFF Login</h1>
        <p>สมมติว่านี่คือหน้า line liff login for test dev</p>

        <input
          value={lineIdFromInput}
          onChange={(e) => setLineIdFromInput(e.target.value)}
          type="text"
          placeholder="กรอก line id"
          className="border-[1px] border-slate-400 p-2 rounded-md mt-5"
        />
        <button
          className="bg-slate-500 text-white p-2 rounded-lg px-4"
          onClick={handleLogin}
        >
          login
        </button>
      </div>
    </div>
  );
};

export default LoginPage;