import { Link } from "react-router-dom";

const SuccessPage = () => {
  return (
    <div className="font-kanit bg-[var(--bg)] w-full min-h-screen flex flex-col items-center relative">
      {/* Header Section */}
      <div className="w-full h-full min-h-[250px] md:w-96 ">
        <img src="Poster.png" alt="header1page" className="w-full" />
      </div>

      {/* Content Section */}
      <div className="flex flex-col justify-center items-center w-full px-5 text-center gap-8 ">

        {/* Success Message */}
        <h1 className="text-2xl md:text-2xl text-white leading-relaxed pt-16">
          คุณลงทะเบียนสำเร็จ <br />
          ขอบคุณค่ะ
        </h1>

        {/* Success Icon */}
        <div className="w-50 md:w-50 relative">
          <img src="tempImagejOecHH_1-removebg-preview.png" alt="success-icon" className="w-full h-auto" />
        </div>

        {/* Continue Button */}
        <Link
          to="/menu"
          className="w-full px-6 py-2 bg-[var(--button)] text-white rounded-lg shadow-md transform transition hover:scale-105"
        >
          ดำเนินการต่อ
        </Link>
      </div>

      {/* Footer Section (Optional) */}
      <div className="w-full h-20 md:h-32"></div>
    </div>
  );
};

export default SuccessPage;
