import { ImSpinner2 } from "react-icons/im";

const LoadingOverlay = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 text-white">
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
        <ImSpinner2 className="animate-spin" size={50} />
        <p className="mt-5 font-kanit">กำลังดำเนินการ</p>
      </div>
    </div>
  );
};

export default LoadingOverlay;