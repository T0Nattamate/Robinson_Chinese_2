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
    if (otpInput) {
      try {
        setIsLoading(true);
        if (!adminId) throw new Error("ไม่พบข้อมูลผู้ดูแลระบบ");

        const success = await verifyOtp(otpInput, adminId);
        setIsLoading(false);

        if (success) {
          setAlreadyMfa();
          Swal.fire({
            icon: "success",
            text: "เข้าสู่ระบบสำเร็จ!",
            confirmButtonText: "ไปที่หน้าหลัก",
            customClass: {
              htmlContainer: "font-kanit",
              confirmButton: "bg-red-600 text-white rounded-md font-kanit px-8 py-2",
            },
          });
          if (adminData.role === "secretAdmin") navigate("/admin/dashboard/secret");
          else navigate("/admin/dashboard/receipts");
        }
      } catch (error) {
        setIsLoading(false);
        let errorMessage = "รหัสยืนยันไม่ถูกต้อง";
        if (error instanceof Error) errorMessage = error.message;

        Swal.fire({
          icon: "error",
          text: errorMessage,
          confirmButtonText: "ยืนยัน",
          customClass: {
            htmlContainer: "font-kanit",
            confirmButton: "bg-red-600 text-white rounded-md font-kanit px-8 py-2",
          },
        });
      }
    }
  };

  return (
    <div className="font-kanit bg-white min-h-screen flex relative overflow-hidden">
      {isLoading && <LoadingOverlay />}

      {/* Visual Side */}
      <div className="hidden lg:flex lg:w-3/5 h-screen bg-[var(--red)] relative items-center justify-center p-12 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] bg-black/10 rounded-full blur-2xl"></div>

        <div className="relative z-10 w-full max-w-2xl animate-in zoom-in duration-1000">
          <div className="bg-white/10 backdrop-blur-md p-2 rounded-[2.5rem] shadow-2xl border border-white/20">
            <img
              src="/ปกมีข้อความ.png"
              alt="Robinson Chinese New Year 2026"
              className="w-full h-auto rounded-[2rem] shadow-inner"
            />
          </div>

          <div className="mt-12 text-center text-white space-y-4">
            <h2 className="text-4xl font-black tracking-tight leading-tight uppercase">Robinson Chinese New Year 2026</h2>
            <div className="h-1 w-24 bg-white/40 mx-auto rounded-full"></div>
            <p className="text-white/70 font-light text-lg tracking-wide uppercase">Campaign Management Dashboard</p>
          </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="w-full lg:w-2/5 flex flex-col items-center justify-center p-8 md:p-16 bg-white animate-in slide-in-from-right duration-700">
        <div className="w-full max-w-sm space-y-12">
          {!isMfa ? (
            <div className="space-y-6">
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center shadow-sm border border-red-100 mb-6 mx-auto">
                <RiLockLine size={28} className="text-[var(--red)]" />
              </div>
              <div className="text-center">
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">การยืนยันตัวตน 2 ขั้นตอน</h1>
                <p className="text-gray-500 font-medium mt-2">สแกน QR Code ด้วย Google Authenticator เพื่อสมัคร</p>
              </div>
              <div className="p-4 bg-white border-2 border-dashed border-gray-100 rounded-3xl flex justify-center shadow-sm">
                <div className="p-2 bg-gray-50 rounded-2xl">
                  <img src={qrCodeUrl} alt="MFA QR Code" className="w-48 h-48 rounded-xl mix-blend-multiply" />
                </div>
              </div>
              <p className="text-xs text-center text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
                กรุณากรอกรหัส 6 หลัก <br />จากแอปพลิเคชัน
              </p>
            </div>
          ) : (
            <div className="space-y-6 flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center shadow-sm border border-red-100 mb-6">
                <RiLockLine size={28} className="text-[var(--red)]" />
              </div>
              <div className="text-center">
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">กรอกรหัสยืนยัน</h1>
                <p className="text-gray-500 font-medium mt-2">กรุณาตรวจสอบรหัส 6 หลักจากแอป Google Authenticator ของคุณ</p>
              </div>
            </div>
          )}

          <Form className="space-y-8" onSubmit={handleAuthVerify}>
            <div className="flex justify-center">
              <OtpInput
                value={otpInput}
                onChange={setOtp}
                numInputs={6}
                inputType="tel"
                containerStyle="flex gap-2.5"
                renderInput={(props) => (
                  <input
                    {...props}
                    className="w-12 h-14 md:w-14 md:h-16 text-2xl font-black text-center bg-gray-200 border-2 border-black rounded-xl focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all font-poppins text-gray-900"
                  />
                )}
              />
            </div>

            <Button
              className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold tracking-wide hover:bg-black active:scale-[0.98] transition-all shadow-xl shadow-gray-200"
              type="submit"
              isDisabled={otpInput.length < 6}
            >
              ยืนยันและดำเนินการต่อ
            </Button>
          </Form>

          <div className="pt-12 text-center text-gray-400 text-xs font-medium">
            <button
              type="button"
              className="text-red-500 hover:text-red-600 font-bold tracking-wide"
              onClick={() => navigate("/admin/login")}
            >
              กลับไปยังหน้าเข้าสู่ระบบ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MfaPage;
