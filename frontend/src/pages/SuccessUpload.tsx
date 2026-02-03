import { Link } from "react-router-dom";

const SuccessUpload = () => {
  return (
    <div className="font-kanit bg-[var(--bg)] min-h-screen flex flex-col items-center animate-in fade-in zoom-in-95 duration-700">
      {/* Header Container - Full width for image */}
      <div className="w-full h-full min-h-[300px]  md:w-96 ">
        <img src="success_header.png" alt="header1page" className="w-full" />
      </div>

      {/* Main Content - Centered with specific width */}
      <div className="flex flex-col text-[var(--text)] justify-center items-center w-[90%] md:w-96 h-full text-center gap-5 px-0 py-5">
        {/* <div className="text-xl  w-full h-20 ">
          <img src="icon_Receipt.png" alt="header1page" className="w-full" />
        </div> */}

        <h1 className="text-3xl font-poppins font-medium text-[var(--text)]">
          SUCCESS!
        </h1>
        <h1 className="text-3xl  ">ขอบคุณที่ร่วมสนุกกับกิจกรรม</h1>
        <div className=" flex items-center justify-center w-44 mt-10">
          <img src="tempImagejOecHH_1-removebg-preview.png" alt="successUpload" className="w-60" />
        </div>
        <p className="font-light  text-base w-full">
          ตรวจสอบสถานะการลงทะเบียนได้ หลังลงทะเบียนแล้ว 24 ชม. <br></br>
        </p>

        <p className="font-light  text-base w-full">
          กรุณาเก็บใบเสร็จไว้เพื่อยืนยันตัวตน และติดตามการประกาศ <br></br>
          ผู้ที่ได้รับรางวัล Top Spender 14 ท่าน ในวันที่ 10 มี.ค. 69
          <br></br>
          ผ่านช่องทาง Facebook Page Robinson Lifestyle, <br></br>
          Line Official และจุดประชาสัมพันธ์ภายในศูนย์ฯ

        </p>
        <section className="w-full flex flex-col gap-3 mt-10">
          <Link
            to="/upload"
            className=" button-base bg-[var(--dark-green)] text-white w-full "
            type="submit"
          >
            <button className="bg-[var(--button)]  text-xl text-white w-full px-4 py-3 rounded-md hover:bg-gray-800 transition">
              ส่งใบเสร็จเพิ่มเติม
            </button>
          </Link>
          <Link
            to="/menu"
            className=" button-base  text-white w-full "
            type="submit"
          >
            <button className="bg-white text-[var(--button)]  border-1 border-[var(--button)]  text-xl w-full px-4 py-3 rounded-md hover:bg-gray-800 transition">
              กลับหน้าหลัก
            </button>
          </Link>
        </section>
        {/* Added bottom space */}
        <div className="w-full h-32 md:w-96 relative">
          {/* Bottom space */}
        </div>
      </div>
    </div>
  );
};

export default SuccessUpload;