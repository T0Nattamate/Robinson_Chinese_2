import { Button, Form, Input, Label, TextField } from "react-aria-components";
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
  }, [clearAuth]);

  const updateAdminLogin = (field: string, value: string) => {
    setAdminLogin((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  const handleAdminLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (adminLogin.username && adminLogin.password) {
      try {
        setIsLoading(true);
        const success = await adminLoginAction(adminLogin);
        setIsLoading(false);
        if (success) {
          navigate("/admin/mfa");
        }
      } catch (error) {
        setIsLoading(false);
        let errorMessage = "เกิดข้อผิดพลาดในการเข้าสู่ระบบ";
        if (error instanceof Error) errorMessage = error.message;
        else if (typeof error === "object" && error !== null && "message" in error) errorMessage = (error as { message: string }).message;

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
        {/* Abstract shapes for premium feel */}
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
          <div className="space-y-4">
            <div className="  l flex items-center justify-center    mb-6">
              <img src="/logo 1.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">เข้าสู่ระบบแอดมิน</h1>
            <p className="text-gray-500 font-medium">กรุณาเข้าสู่ระบบเพื่อจัดการกิจกรรม</p>
          </div>

          <Form className="space-y-6" onSubmit={handleAdminLoginSubmit}>
            <div className="space-y-5">
              <TextField isRequired name="username" type="text" className="flex flex-col gap-2">
                <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Username</Label>
                <Input
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all font-medium"
                  placeholder="Enter your username"
                  value={adminLogin.username}
                  onChange={(e) => updateAdminLogin("username", e.target.value)}
                />
              </TextField>

              <TextField isRequired name="password" type="password" className="flex flex-col gap-2">
                <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Password</Label>
                <Input
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all font-medium"
                  placeholder="••••••••"
                  value={adminLogin.password}
                  onChange={(e) => updateAdminLogin("password", e.target.value)}
                />
              </TextField>
            </div>

            <Button
              className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold tracking-wide hover:bg-black active:scale-[0.98] transition-all shadow-xl shadow-gray-200 flex items-center justify-center gap-2"
              type="submit"
            >
              เข้าสู่ระบบ
            </Button>
          </Form>

          <div className="pt-12 text-center text-gray-400 text-xs font-medium">
            <p>© 2026 Robinson Lifestyle.</p>
            <p className="mt-1 uppercase tracking-widest">All Rights Reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
