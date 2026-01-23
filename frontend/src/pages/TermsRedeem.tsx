import { useEffect } from "react";
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from "../store/AuthStore";
import useBranchStore from "../store/BranchStore";
import BasicOverlay from "../components/overlay/BasicOverlay";

const TermsRedeem = () => {
  const { setAcceptRedeem, resetTermsAccess } = useAuthStore();
  const { fetchBranches } = useBranchStore();
  const navigate = useNavigate();


  useEffect(() => {
    fetchBranches();
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  const handleClick = () => {
    setAcceptRedeem();
    navigate("/redeem");
  };
  useEffect(() => {
    return () => {
      // Reset when component unmounts (user navigates away)
      resetTermsAccess();
    };
  }, []);

  return (
    <div className="font-kanit bg-[var(--bg)] w-full min-h-screen flex flex-col items-center relative">
      {/* Header image container */}
      <div className="w-full bg-white md:w-96 flex items-center justify-center">
        <img
          src="banner_major.webp"
          alt="header1page"
          className="w-full object-contain"
        />
      </div>

      {/* Overlay behind the card */}
      <BasicOverlay />

      {/* Main card */}
      <div className="relative z-50 flex flex-col justify-start items-center w-11/12 md:w-96 my-6 text-center gap-5 p-7 -mt-90 bg-white rounded-md shadow-md">
        {/* "Header bar" inside the card */}
        <div className="absolute top-0 bg-white w-full h-20 rounded-t-md flex items-center justify-center">
          <div className="w-4/5 flex justify-center items-center h-full">
            <img
              src="logo.png"
              alt="robinsonLogoWhite"
              className="h-20 max-h-full w-auto object-contain"
              style={{ maxWidth: "80%" }}
            />
          </div>
        </div>

        <h1 className="flex flex-row text-xl mt-16 text-black py-2 w-full relative">
          <p className="px-8 text-start"> รายละเอียด  </p>
          <p className="text-center"> | </p>
          <p className="px-5 text-end"> กำหนด เงื่อนไข </p>
        </h1>

        {/* Image section */}
        <div className="w-full h-full border border-gray-300 rounded-sm overflow-hidden">
          <img src="/term_50x70cm_SF.png" alt="luckydraw_aw" className="w-full h-auto" />
        </div>

        {/* Text section */}
        <section className="font-light w-full text-sm text-left">
          <p className="font-medium mb-3">ช้อปสุดมันส์ วันสิ้นเดือน (25 พ.ย. - 3 ธ.ค. 68)</p>
          <p className="text-gray-700 mb-3">เมื่อกิน-ช้อปครบ 3,000 บาทขึ้นไป (เฉพาะร้านค้าในศูนย์ฯ)</p>
          <p className="font-medium mb-2">เงื่อนไข:</p>
          <ul className="list-outside list-decimal mt-2 text-gray-600 pl-3 space-y-3">
            <li>
              <span className="font-medium text-gray-800">เฉพาะวันจันทร์-ศุกร์ที่ 25-28 พ.ย., 1-3 ธ.ค. 68:</span> <br></br>
              รับฟรี Gift Voucher มูลค่า 100 บาท จากร้านค้า และร้านอาหารในกลุ่มเซ็นทรัล (จำกัด 100 สิทธิ์/สาขา ตลอดแคมเปญ)
            </li>
            <li>
              <span className="font-medium text-gray-800">เฉพาะวันเสาร์-อาทิตย์ที่ 29-30 พ.ย. 68:</span>
              <ul className="list-disc ml-5 mt-2 space-y-1">
                <li>𝐒𝐅 𝐂𝐈𝐍𝐄𝐌𝐀 : รับฟรี บัตรชมภาพยนตร์ 1 ฟรี 1 (จำกัด 350 สิทธิ์/สาขา ตลอดแคมเปญ)</li>
                <li>𝐌𝐀𝐉𝐎𝐑 𝐂𝐈𝐍𝐈𝐏𝐋𝐄𝐗 : รับฟรี บัตรชมภาพยนตร์ 1 ใบ (จำกัด 100 สิทธิ์แรก/สาขา) ตลอดแคมเปญ </li>
                หรือ รับฟรี ส่วนลดรวมมูลค่า 250 บาท (จำกัด 250 สิทธิ/สาขา ตลอดแคมเปญ)
              </ul>
            </li>
          </ul>
        </section>

        {/* Action buttons */}
        <div className="flex flex-col gap-4 w-full mt-6">
          <button
            onClick={handleClick}
            className="w-full inline-flex justify-center items-center gap-2 rounded-md bg-[var(--button)] py-2 px-10 text-sm text-white shadow-inner shadow-white/10 focus:outline-none hover:bg-gray-700 transition-colors text-center"
            type="submit"
          >
            ดำเนินการต่อ
          </button>
          <Link
            to={"/menu"}
            className="w-full inline-flex justify-center items-center gap-2 rounded-md bg-white py-2 px-10 text-sm text-[var(--button)] border-1 border-[var(--button)] shadow-inner shadow-white/10 focus:outline-none hover:bg-gray-700 transition-colors text-center"
          >
            กลับหน้าหลัก
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TermsRedeem;