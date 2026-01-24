import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import useAuthStore from "../store/AuthStore";
import useBranchStore from "../store/BranchStore";
import BasicOverlay from "../components/overlay/BasicOverlay";

const TermsFileUpload = () => {
  const { setAcceptUpload, resetTermsAccess } = useAuthStore();
  const { fetchBranches } = useBranchStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchBranches();
  }, []);

  const handleClick = () => {
    navigate("/upload"); // Navigate to the desired route
    setAcceptUpload();
  };

  useEffect(() => {
    // Scroll to the top of the page when the component is mounted
    window.scrollTo(0, 0);
  }, []);

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
          src="//banner_major.webp"
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

        <h1 className="flex flex-row text-xl mt-16 text-black py-2 w-full relative ">
          <p className="px-8 text-start"> รายละเอียด  </p>
          <p className="text-center"> | </p>
          <p className="px-5 text-end"> กำหนด เงื่อนไข </p>
        </h1>

        <div className="w-full">
          <img src="/reward_cut.png" alt="luckydraw_aw" className="w-full h-auto" />
        </div>

        <section className="font-light w-full text-sm text-left">
          <p className="font-medium mb-3">รับสิทธิ์ลุ้นรางวัลใหญ่ รวมมูลค่ากว่า 5 ล้านบาท</p>
          <p className="text-gray-700 mb-3">เมื่อกิน-ช้อปครบทุก 1,000 บาท</p>
          <p className="font-medium mb-2">เงื่อนไข:</p>
          <ul className="list-outside list-decimal mt-2 text-gray-600 pl-3 space-y-2">
            <li>
              สินค้าทั้งศูนย์ฯ ทั้งห้างฯ ลดสูงสุด 80% เฉพาะสินค้าที่เข้าร่วมรายการ / เงื่อนไขเป็นไปตามที่แต่ละร้านค้ากำหนด เมื่อกิน-ช้อปรวบรวมใบเสร็จภายในศูนย์ฯ และห้างฯ สะสมครบทุก 1,000 บาท รับ 1 สิทธิ์ลุ้นรางวัลใหญ่
            </li>
            <li>
              รถยนต์ BYD SEALION 6 DM-i จำนวน 1 รางวัล มูลค่า 1,099,900 บาท
            </li>
            <li>
              สร้อยคอทองคำ หนัก 1 บาท จำนวน 10 รางวัล รวมมูลค่า 468,200 บาท (มูลค่าทองคำ ณ วันที่ 4 ก.พ. 68)
            </li>
            <li>
              ตั๋วเครื่องบินไป-กลับ (ระหว่างประเทศ) จำนวน 5 รางวัล (รางวัลละ 2 ที่นั่ง) รวมมูลค่าสูงสุด 250,000 บาท / มูลค่ารางวัลอ้างอิง ณ วันที่สำรองบัตรโดยสาร / เงื่อนไขเป็นไปตามที่สายการบินกำหนด / โปรดตรวจสอบเงื่อนไขเพิ่มเติมกับสายการบิน
            </li>
            <li>
              OPPO Reno 13 Series จำนวน 6 รางวัล, OPPO Watch X Series จำนวน 4 รางวัล รวมมูลค่า 165,990 บาท
            </li>
            <li>
              แพ็คเกจเที่ยวฟรี เซี่ยงไฮ้ ดิสนีย์แลนด์ พร้อมตั๋วเครื่องบินไป-กลับ จำนวน 3 รางวัล (รางวัลละ 2 ท่าน) รวมมูลค่า 150,000 บาท
            </li>
            <li>
              พิเศษสำหรับสมาชิกเดอะวัน, ห้างทองพรีเมี่ยมโกลด์ เยาวราช, เวียตเจ็ท, OPPO, gother รับสิทธิ์ลุ้น X2 / สงวนสิทธิ์เฉพาะลูกค้าที่ให้ข้อมูลครบถ้วนและสามารถติดต่อได้เท่านั้น / สามารถรวมใบเสร็จตลอดรายการที่โรบินสันไลฟ์สไตล์ทุกสาขา (ยกเว้นสาขาจันทบุรี) / สงวนสิทธิ์ไม่รวมใบเสร็จจากการซื้อเพื่อลงทุน, การค้า, ขายส่ง, ใบจองสินค้า, ใบมัดจำสินค้า, การชำระค่าสาธารณูปโภค, การทำธุรกรรมทางการเงินทุกประเภท, การชำระเบี้ยประกัน, การเติมเงินในบัตรเติมเงินทุกชนิด, การใช้บริการบริษัทขนส่งทุกประเภท / ขอสงวนสิทธิ์ในการเปลี่ยนแปลงเงื่อนไข, สินค้า และ/หรือสิทธิพิเศษ ตามที่บริษัทเห็นสมควรและเป็นไปตามที่กฎหมายกำหนด โดยไม่ต้องแจ้งให้ทราบล่วงหน้า / ขอสงวนสิทธิ์ในการให้รางวัลแก่ผู้โชคดีลำดับถัดไป กรณีที่ตรวจสอบพบว่าผู้โชคดีไม่สามารถติดต่อได้ / ผู้โชคดีที่ได้รับรางวัลมูลค่า 1,000 บาทขึ้นไป ต้องชำระภาษี ณ ที่จ่าย 5% ของมูลค่าของรางวัล / ของรางวัลไม่สามารถแลกเปลี่ยนเป็นเงินสด หรือรางวัลอื่นได้ / ผู้โชคดีมีสิทธิ์ได้รับรางวัลสูงสุดเพียงรางวัลเดียวเท่านั้น / พนักงานโรบินสัน, พนักงานในเครือเซ็นทรัลกรุ๊ป, พนักงานของบริษัทคู่ค้า, หรือญาติของพนักงาน และคณะกรรมการในการตัดสิน ไม่มีสิทธิ์เข้าร่วมรายการ / กำหนดจับรางวัลวันที่ 9 ม.ค. 69 ณ ศูนย์การค้าโรบินสันไลฟ์สไตล์ ราชพฤกษ์ / ประกาศรายชื่อผู้โชคดีวันที่ 15 ม.ค. 69 ที่ Facebook Page: Robinson Lifestyle
            </li>
            <li>
              ผู้มียอดช้อปสูงสุด 27 สาขา (สะสมยอดช้อปตลอดรายการ 50,000 บาทขึ้นไป) รับตั๋วเครื่องบินไป-กลับภายในประเทศ สาขาละ 1 รางวัล (รางวัลละ 1 ที่นั่ง) มูลค่ารางวัลละ 15,000 บาท / เงื่อนไขเป็นไปตามที่กำหนด / โปรดตรวจสอบเงื่อนไขเพิ่มเติม ณ จุดลงทะเบียนภายในศูนย์ฯ / ขอสงวนสิทธิ์ในการเปลี่ยนแปลงเงื่อนไขโดยมิต้องแจ้งให้ทราบล่วงหน้า / บริษัทฯสงวนสิทธิ์ในการเปลี่ยนแปลงเงื่อนไขหรือสิทธิประโยชน์ต่างๆตามที่บริษัทฯเห็นสมควร และเป็นไปตามที่กฎหมายกำหนด รวมถึงความผิดพลาดในการพิมพ์โดยไม่ต้องแจ้งให้ทราบล่วงหน้า
            </li>
          </ul>
        </section>

        <button
          onClick={handleClick}
          className="w-70 inline-flex justify-center items-center gap-2 rounded-md bg-[var(--button)] py-2 px-10 text-sm text-white shadow-inner shadow-white/10 focus:outline-none hover:bg-gray-700 transition-colors text-center"
          type="submit"
        >
          ดำเนินการต่อ
        </button>
      </div>
    </div>
  );
};

export default TermsFileUpload;