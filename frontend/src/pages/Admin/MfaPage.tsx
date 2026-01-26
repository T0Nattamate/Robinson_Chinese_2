import { useState } from "react";
import { Button, Form } from "react-aria-components";
import OtpInput from "react-otp-input";
import { RiLockLine } from "react-icons/ri";
import { useAdminStore } from "../../store/AdminStore";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import LoadingOverlay from "../../components/overlay/LoadingOverlay";
import useAuthStore from "../../store/AuthStore";

const MfaPage = () => {
  const { setAlreadyMfa } = useAuthStore();
  const navigate = useNavigate();
  const { adminData, verifyOtp } = useAdminStore();
  const { qrCodeUrl, adminId, isMfa } = adminData;
  const [otpInput, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleAuthVerify = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    //console.log("Submitted login form:", otp);
    if (otpInput) {
      try {
        setIsLoading(true);
        if (!adminId) {
          throw new Error("adminId is not available");
        }

        const success = await verifyOtp(otpInput, adminId);
        setIsLoading(false);

        if (success) {
          setAlreadyMfa();
          Swal.fire({
            icon: "success",
            text: "Login successful!",
            confirmButtonText: "ยืนยัน",
            customClass: {
              htmlContainer: "font-kanit",
              confirmButton: "bg-gray-700 text-white rounded-md font-kanit",
            },
          });
          if (adminData.role == "secretAdmin") {
            navigate("/admin/dashboard/secret");
          } else {
            navigate("/admin/dashboard/receipts");
          }
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
    <div className="font-kanit bg-white w-full h-full min-h-screen flex  justify-center items-center relative">
      {isLoading && <LoadingOverlay />}
      <div className="hidden  lg:w-full h-full min-h-screen bg-cover bg-center lg:flex items-center justify-center bg-[var(--bg)]"
        style={{
          backgroundImage: `url('/bg-02.jpg')`, backgroundPosition: "center 10rem"
        }}
      >
        <img
          src="//banner_cut.webp"
          alt="garnierlogo"
          className="w-full h-full"
        />
      </div>
      <div className="card flex flex-col justify-start items-center w-full lg:w-[50rem] my-10 text-center gap-5 p-5">
        {!isMfa ? (
          <section className="flex flex-col gap-2 items-center justify-center">
            <p>ระบบยืนยันตัวตนแบบ 2 ขั้นตอน</p>
            <div className="bg-slate-200 w-36 h-36 my-5 relative">
              {/* <img src={mockQrUrl} alt="" className="object-fill" /> */}
              <img src={qrCodeUrl} alt="" className="object-fill" />
            </div>
            <p className="font-light text-sm">
              แสกน QR code ลงทะเบียนสำหรับ กรอกรหัสยืนยัน 6 หลัก
            </p>
            <p className="font-light text-sm"></p>
          </section>
        ) : (
          <section className="flex flex-col gap-2 items-center justify-center">
            <div className="bg-slate-200 p-6 rounded-full mb-3">
              <RiLockLine size={30} />
            </div>
            <p>ระบบยืนยันตัวตนแบบ 2 ขั้นตอน</p>
            <p className="font-light text-sm">
              กรุณาตรวจสอบรหัสผ่าน Google Authenticator
            </p>
          </section>
        )}

        <Form
          className="w-full flex items-center justify-center flex-col"
          onSubmit={handleAuthVerify}
        >
          <OtpInput
            value={otpInput}
            onChange={setOtp}
            numInputs={6}
            inputType="tel"
            inputStyle={{
              width: "48px",
              fontSize: "20px",
            }}
            containerStyle={"md:w-full flex items-center justify-center"}
            renderSeparator={<span> </span>}
            renderInput={(props) => (
              <input
                {...props}
                className=" w-[40px] h-[44px] md:w-16 md:h-16   border-2 border-black rounded-md mx-[3px] md:mx-[5px] font-poppins"
              />
            )}
          />
          <Button
            className="mt-5 button-base bg-[var(--button)] text-white w-44"
            type="submit"
          >
            ยืนยัน
          </Button>
        </Form>
      </div>
    </div>
  );
};

export default MfaPage;
