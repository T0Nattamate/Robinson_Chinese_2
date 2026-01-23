import { Button, Form, Input, Label, TextField } from "react-aria-components";
import { InputCss, labelCss } from "../../styles/reactAriaCss";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminStore } from "../../store/AdminStore";
import Swal from "sweetalert2";
import LoadingOverlay from "../../components/overlay/LoadingOverlay";
import useAuthStore from "../../store/AuthStore";

interface Credentials {
  username: string;
  password: string;
}

const AdminLoginPage = () => {
  const { clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const { adminLoginAction } = useAdminStore();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [adminLogin, setAdminLogin] = useState<Credentials>({
    username: "",
    password: "",
  });

  useEffect(() => {
    clearAuth();
  }, []);

  const updateAdminLogin = (field: string, value: string) => {
    setAdminLogin((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  const handleAdminLoginSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    //console.log("Submitted login form:", adminLogin);
    if (adminLogin.username && adminLogin.password) {
      try {
        setIsLoading(true);
        const success = await adminLoginAction(adminLogin);
        setIsLoading(false);
        //console.log(success);
        if (success) {
          navigate("/admin/mfa");
        }
      } catch (error) {
        setIsLoading(false);
        let errorMessage = "An unknown error occurred.";

        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (
          typeof error === "object" &&
          error !== null &&
          "message" in error
        ) {
          errorMessage = (error as { message: string }).message;
        } else {
          errorMessage = String(error);
        }

        Swal.fire({
          icon: "error",
          text: errorMessage,
          confirmButtonText: "ยืนยัน",
          customClass: {
            htmlContainer: "font-kanit",
            confirmButton: "bg-gray-700 text-white rounded-md font-kanit",
          },
        });
        console.error("Error handling redeem:", error);
      }

      //navigate("/admin/mfa");
    } else {
      console.error("Please fill in all required fields.");
    }
  };

  return (
    <div className="font-kanit bg-white w-full h-full min-h-screen flex  justify-center items-center relative" >
      {isLoading && <LoadingOverlay />}
      <div className="hidden  lg:w-full h-full min-h-screen bg-cover bg-center lg:flex items-center justify-center bg-[var(--bg)]"
        style={{
          backgroundImage: `url('/header.jpg')`,backgroundPosition: "center 10rem" 
        }}
      >
        <img
          src="/banner_cut.webp"
          alt="robinsonlogo"
          className="w-full h-full rounded-2xl"
        />
      </div>
      <div className="card flex flex-col justify-start items-center w-full lg:w-[50rem] my-10 text-center gap-5 p-5 ">
        <Form
          className="flex flex-col items-center w-[20rem] "
          onSubmit={handleAdminLoginSubmit}
        >
          <h1 className="w-full md:text-start text-3xl font-semibold font-poppins text-[var(--btn-dark)]">
            Admin Login
          </h1>
          <h1 className="w-full md:text-start text-sm font-semibold font-poppins text-slate-400 mt-2 mb-8">
            Robinson Celebration Campaign
          </h1>
          <TextField
            isRequired
            name="username"
            type="text"
            className="mt-3 relative w-full min-w-[14.4rem] h-10"
          >
            <Input
              className={InputCss}
              placeholder=" "
              value={adminLogin.username}
              onChange={(e) => updateAdminLogin("username", e.target.value)}
            />
            <Label className={labelCss}>Username</Label>
          </TextField>
          <TextField
            isRequired
            name="password"
            type="password"
            className="mt-3 relative w-full min-w-[14.4rem] h-10"
          >
            <Input
              className={InputCss}
              placeholder=" "
              value={adminLogin.password}
              onChange={(e) => updateAdminLogin("password", e.target.value)}
            />
            <Label className={labelCss}>Password</Label>
          </TextField>
          <Button
            className="mt-5 button-base bg-[var(--button)] text-white w-44"
            type="submit"
          >
            เข้าสู่ระบบ
          </Button>
        </Form>
      </div>
    </div>
  );
};

export default AdminLoginPage;
