import { useEffect, useState } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import useBranchStore from "../store/BranchStore";

const SuccessRedeem = () => {
  // We read the branchId from the route param, e.g. /success-redeem/R001
  const { branchId } = useParams<{ branchId: string }>();
  const location = useLocation();
  const itemName = location.state?.itemName || "ของสมนาคุณ";

  const [displayBranch, setDisplayBranch] = useState<string>("ไม่พบข้อมูลสาขา");
  const { findBranchNameByBranchId } = useBranchStore();
  useEffect(() => {
    if (branchId) {
      setDisplayBranch(branchId);
    }
  }, [branchId]);

  return (
    <div className="font-kanit bg-[var(--bg)] w-full min-h-screen flex flex-col items-center relative">
      {/* Top header area */}
      <div className="w-full h-full min-h-[300px]  md:w-96 ">
        <img src="/success_header.png" alt="header1page" className="w-full" />
      </div>

      {/* Title */}
      <h1 className="text-2xl md:text-3xl text-[var(--text)] mt-10 relative">
        แลกรับของสมนาคุณสำเร็จ!
      </h1>
      {/* <h1 className="text-lg text-[var(--text)]">
        แลกซื้อกระเป๋าพรีเมียม ดีไซน์พิเศษ
      </h1> */}

      {/* Centered success box */}
      <div className="w-[90%] md:w-96 h-auto flex flex-col items-center text-center px-5 ">

        {/* Success message box */}
        <div className="rounded-md w-full px-4 py-6">
          <p className="text-[var(--text)] text-lg">
            คุณแลกรับ <span className="font-bold">{itemName}</span> <br></br>
            ณ ศูนย์การค้าโรบินสันไลฟ์สไตล์ <br></br>{" "}
            สาขา <span className="font-bold">{findBranchNameByBranchId(displayBranch)}</span>{" "}<br></br>
            เรียบร้อยค่ะ
          </p>
        </div>
        {/* Success icon/image */}
        <div className="flex items-center justify-center w-44 ">
          <img src="/tempImagejOecHH_1-removebg-preview.png" alt="successUpload" className="w-60" />
        </div>

        {/* Buttons - updated to match other pages' style */}
        <div className="flex flex-col gap-4 w-full mt-6">

          <Link
            to="/redeem"
            className="w-full inline-flex justify-center items-center rounded-md bg-[var(--button)] py-2 px-10 text-sm text-white shadow-inner shadow-white/10 focus:outline-none hover:bg-gray-700 transition-colors text-center"
          >
            กลับหน้าแลกรับ
          </Link>
          <Link
            to="/menu"
            className="w-full inline-flex justify-center items-center rounded-md bg-white py-2 px-10 text-sm text-[var(--button)] border border-[var(--button)] shadow-inner shadow-white/10 focus:outline-none hover:bg-gray-100 transition-colors text-center"
          >
            กลับหน้าหลัก
          </Link>
        </div>
      </div>

      {/* Added bottom space */}
      <div className="w-full h-32 md:w-96 relative">
        {/* Bottom space */}
      </div>
    </div>
  );
};

export default SuccessRedeem;