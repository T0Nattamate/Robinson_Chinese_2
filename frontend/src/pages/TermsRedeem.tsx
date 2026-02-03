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
    <div className="font-kanit bg-[var(--bg)] w-full min-h-screen flex flex-col items-center relative animate-in fade-in duration-700">
      {/* Header image container */}
      {/* <div className="w-full bg-white md:w-96 flex items-center justify-center">
        <img
          src="//banner_major.webp"
          alt="header1page"
          className="w-full object-contain"
        />
      </div> */}
      <div className="w-full h-full min-h-[400px] md:w-96 relative bg-white">
        <img src="Poster.png" alt="header1page" className="w-full" />
      </div>

      {/* Overlay behind the card */}
      <BasicOverlay />

      {/* Main card */}
      <div className="relative z-50 flex flex-col justify-start items-center w-11/12 md:w-96 my-6 text-center -mt-24 bg-white rounded-md shadow-md overflow-hidden">
        {/* "Header bar" - Now relative to flow naturally */}
        <div className="bg-white w-full h-24 flex items-center justify-center border-b border-gray-100">
          <div className="w-4/5 flex justify-center items-center h-full">
            <img
              src="logo 1.png"
              alt="robinsonLogoWhite"
              className="h-20 max-h-full w-auto object-contain"
              style={{ maxWidth: "80%" }}
            />
          </div>
        </div>
        {/* Image section */}
        <div className="w-full">
          <img
            src="tempImageJT8MIY 2.png"
            alt="luckydraw_aw"
            className="w-full h-auto"
          />
        </div>

        <div className="w-full p-7 flex flex-col gap-5">
          <h1 className="flex flex-row text-md text-black py-2 w-full relative border-t border-b border-gray-100">
            <p className="px-8 text-start flex-1"> รายละเอียด </p>
            <p className="text-center"> | </p>
            <p className="px-5 text-end flex-1"> กำหนด เงื่อนไข </p>
          </h1>

          {/* Text section */}
          <section className="font-light w-full text-sm text-left">
            <p className="font-medium mb-3 text-center text-base">เงื่อนไขการเข้าร่วมรายการ</p>
            <ul className="list-outside list-decimal mt-2 text-gray-700 pl-4 space-y-4">
              <li>
                เมื่อกิน และ ช้อปสะสมใบเสร็จ (ภายในวัน) ครบ 3,500 บาทขึ้นไป รับส่วนลดค่ากำเหน็จ 40% สำหรับซื้อทองรูปพรรณครึ่งสลึงขึ้นไป จากห้างทองหวังโต๊ะกังเยาวราช / จำกัด 100 สิทธิ์ ตลอดแคมเปญ; จำกัด 1 คน / 1 สิทธิ์ / ยกเว้นสาขาสุรินทร์, สมุทรปราการ, สระบุรี, ฉะเชิงเทรา, มุกดาหาร และสกลนคร / รับส่วนลดค่ากำเหน็จ 500 บาท สำหรับซื้อทองรูปพรรณน้ำหนัก 1 บาทขึ้นไป จากห้างทองบางกอกโกลด์ / จำกัด 50 สิทธิ์ ตลอดแคมเปญ; จำกัด 1 คน / 1 สิทธิ์ / เฉพาะสาขาสุรินทร์, ราชบุรี, บ่อวิน, มุกดาหาร, ชลบุรี และปราจีนบุรี / ไม่รวมใบเสร็จ จากห้างสรรพสินค้าโรบินสัน, ร้านค้าในเครือเซ็นทรัล รีเทล, การซื้อทองหรือเพชร, ร้านค้าหมวดเสริมความงาม (Beauty Clinic), Education, IT Gadget / จำกัดใบเสร็จที่นำมาสะสมไม่เกิน 3 ใบเสร็จ / วัน
              </li>
              <li>
                เมื่อช้อปสะสมยอด และรวบรวมใบเสร็จภายในวันครบ 2,500 บาท รับคูปองซื้อบัตรชมภาพยนตร์ 1 ที่นั่ง ฟรี 1 ที่นั่ง จาก เอสเอฟ ซีเนม่า / จำกัด 175 สิทธิ์ /สาขา รวม 5,250 ใบตลอดแคมเปญ หรือ รับฟรีบัตรชมภาพยนตร์ 2 ใบ จาก เมเจอร์ ซีนีเพล็ก / จำกัด 150 สิทธิ์ /สาขา รวม 3,300 ใบตลอดแคมเปญ; จำกัด 1 คน ต่อ 1 สิทธิ์ / พิเศษเฉพาะ ยอดใช้จ่ายสะสมต่อวันผ่านบัตรเครดิต เซ็นทรัล เดอะวัน ทั้งยอดรูดเต็มและแบ่งจ่าย 2,500 บาทขึ้นไปต่อวัน รับบัตรชมภาพยนตร์เพิ่มอีก 1 ใบ / ไม่รวมใบเสร็จ จากห้างสรรพสินค้าโรบินสัน, ร้านค้าในเครือเซ็นทรัล รีเทล, การซื้อทองหรือเพชร, ร้านค้าหมวดอาหาร, ร้านค้าหมวดเสริมความงาม (Beauty Clinic), Education, IT Gadget / จำกัดใบเสร็จที่นำมาสะสมไม่เกิน 3 ใบเสร็จ / วัน
              </li>
              <li>
                ผู้มียอดช้อปสะสมตลอดรายการ 20,000 บาทขึ้นไป สูงสูด 14 ท่านแรก รับสิทธิ์ดู ดวงออนไลน์กับ อ.คฑา / พิเศษเฉพาะ ยอดใช้จ่ายสะสมต่อวันผ่านบัตรเครดิต เซ็นทรัล เดอะวัน ทั้งยอดรูดเต็มและแบ่งจ่าย สะสมตลอดรายการ 15,000 บาทขึ้นไป และเป็นผู้ที่มียอดช้อปสะสมสูงสุด 14 ท่านแรก ของโรบินสันไลฟ์สไตล์ทุกสาขาที่ร่วมรายการ รับสิทธิ์ดูดวงออนไลน์กับ อ.คฑา / รวมยอดช้อปจาก BU (Tops, Supersports, Auto1, Power Buy, Officemate, B2S) แต่ไม่เกิน 5,000.- / ยกเว้นยอดช้อป จาก Gold & Jewelry, หมวดเสริมความงาม (Beauty Clinic), Education, IT Gadget / จำกัดใบเสร็จที่นำมาสะสมไม่เกิน 10 ใบเสร็จ ตลอดแคมเปญ / ประกาศผลผู้ที่ได้รับรางวัล Top Spender 14 ท่าน ในวันที่ 10 มี.ค. 69 ทาง Robinson Lifestyle Facebook Page
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
    </div>
  );
};

export default TermsRedeem;