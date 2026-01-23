import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useUserStore } from "../store/userStore";
import useBranchStore from "../store/BranchStore";
import axiosInterceptor from "../utils/axiosInterceptor";
import useAuthStore from "../store/AuthStore";
import Swal from "sweetalert2";
import LoadingOverlay from "../components/overlay/LoadingOverlay";

interface BranchStock {
  branchStockId: number;
  branchId: string;
  branchName: string;
  isEnable: boolean;
  redeemId: string;
  amount: number;
  gotRedeemded: number;
}

const RedeemPage = () => {
  const navigate = useNavigate();
  const { accessToken } = useAuthStore();
  const { lineId, fetchUserRights, rights } = useUserStore();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const { findFilteredBranchNameByBranchId } = useBranchStore();

  const [branchCode, setBranchCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [stockItem, setStockItem] = useState<BranchStock | null>(null);

  // Check current day of week
  const [isWeekday, setIsWeekday] = useState<boolean>(true);
  // const [redeemType, setRedeemType] = useState<{
  //   name: string;
  //   image: string;
  //   redeemId: string;
  //   claimedAmount: number;
  //   deductionText: string;
  // }>({
  //   name: "บัตรชมภาพยนตร์",
  //   image: "/movie_ticket.png",
  //   redeemId: "redeem001",
  //   claimedAmount: 1,
  //   deductionText: "1 สิทธิ์"
  // });

  // better initial redeemtype default value Calculate initial state immediately
  const getInitialRedeemType = () => {
    const today = new Date().getDay();
    const isWeekdayCheck = today >= 1 && today <= 5;
    
    if (isWeekdayCheck) {
      // Phase 2 weekday: Gift Voucher
      return {
        name: "บัตรกำนัลเงินสด",
        image: "/Gift Voucher.png",
        redeemId: "redeem002",
        claimedAmount: 1,
        deductionText: "1 สิทธิ์"
      };
    } else {
      // Phase 2 weekend: Movie Ticket
      return {
        name: "บัตรชมภาพยนตร์",
        image: "/ตั๋ว 2 ใบ.png",
        redeemId: "redeem001",
        claimedAmount: 1,
        deductionText: "1 สิทธิ์"
      };
    }
  };

  const [redeemType, setRedeemType] = useState(getInitialRedeemType());
  const combinedBranchId = "R-" + branchCode.trim();

  // Determine day of week on mount
  useEffect(() => {
    //const today = 6;
    const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const isWeekdayCheck = today >= 1 && today <= 5; // Monday to Friday
    setIsWeekday(isWeekdayCheck);

    if (isWeekdayCheck) {
      // Phase 1 Weekday: Movie Ticket
      // setRedeemType({
      //   name: "บัตรชมภาพยนตร์",
      //   image: "/ตั๋ว 2 ใบ.png",
      //   redeemId: "redeem001",
      //   claimedAmount: 1,
      //   deductionText: "1 สิทธิ์"
      // });

      //Phase 2 weekday: Gift Voucher
      setRedeemType({
        name: "บัตรกำนัลเงินสด",
        image: "/Gift Voucher.png",
        redeemId: "redeem002",
        claimedAmount: 1,
        deductionText: "1 สิทธิ์"
      });
    } else {
      // Phase 1 Weekend: Money/Gift Voucher
      // setRedeemType({
      //   name: "บัตรกำนัลเงินสด",
      //   image: "/Gift Voucher.png",
      //   redeemId: "redeem002",
      //   claimedAmount: 1,
      //   deductionText: "1 สิทธิ์"
      // });

      // Phase 2 weekend: Movie Ticket
      setRedeemType({
        name: "บัตรชมภาพยนตร์",
        image: "/ตั๋ว 2 ใบ.png",
        redeemId: "redeem001",
        claimedAmount: 1,
        deductionText: "1 สิทธิ์"
      });
    }
  }, []);

  useEffect(() => {
    const fetchDataRedeem = async () => {
      try {
        await fetchUserRights();
      } catch (error) {
        console.error("Error fetching user rights:", error);
      }
    };
    fetchDataRedeem();
  }, [fetchUserRights]);

  const handleRedeemClick = async () => {
    if (!branchCode) {
      setErrorMessage("กรุณากรอกรหัสสาขา");
      return;
    }

    const branchName = findFilteredBranchNameByBranchId(combinedBranchId);
    if (!branchName) {
      setErrorMessage("ไม่พบสาขาจากรหัสสาขานี้");
      return;
    }

    setErrorMessage("");

    try {
      console.log("accessToken:", accessToken);
      // Send redeemId as query parameter to get specific stock
      const response = await axiosInterceptor.get(
        `/branch/stock/${combinedBranchId}/${redeemType.redeemId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const data: BranchStock = response.data;

      if (!data) {
        setErrorMessage(`ไม่พบข้อมูลสต็อก${redeemType.name}สำหรับสาขานี้`);
        return;
      }

      // Check if enabled (backend also checks this, but double-check on frontend)
      if (data.isEnable === false) {
        setErrorMessage("ขออภัย สต็อกของรางวัลไม่เปิดให้บริการในขณะนี้");
        return;
      }

      const remainStock = data.amount;
      if (remainStock <= 0) {
        setErrorMessage("ขออภัย ไม่พบสินค้าในสต็อกค่ะ");
        return;
      }

      setStockItem(data);
      setShowConfirmDialog(true);
    } catch (error) {
      console.error("Error fetching branch item:", error);
      setErrorMessage("เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์แลกรับ");
    }
  };

  const confirmRedeem = async () => {
    if (isConfirming) return;
    try {
      setIsConfirming(true);
      setIsLoading(true);
      const combinedBranchId = "R-" + branchCode.trim();
      console.log(combinedBranchId);

      const requestBody = {
        branchId: combinedBranchId,
        lineId: lineId,
        redeemId: redeemType.redeemId,
        claimedAmount: redeemType.claimedAmount
      };

      const response = await axiosInterceptor.post(
        `/user/claimed?redeemId=${stockItem?.redeemId}`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );

      console.log("Claim success:", response.data);
      setIsLoading(false);
      navigate(`/success-redeem/${combinedBranchId}`);

    } catch (error) {
      setIsLoading(false);
      setIsConfirming(false);
      console.error("Error claiming:", error);
      Swal.fire({
        icon: "error",
        text: "แลกรับไม่สำเร็จ สิทธิ์แลกรับไม่เพียงพอ",
        confirmButtonText: "ยืนยัน",
      });
    }
  };

  const cancelRedeem = () => {
    setShowConfirmDialog(false);
  };

  return (
    <div className="font-kanit bg-[var(--bg)] w-full min-h-screen h-full flex flex-col justify-start items-center relative">
      {isLoading && <LoadingOverlay />}
      <div className="w-full h-full min-h-[400px] bg-white md:w-96">
        <img src="Poster black friday  50x70cm_SF.jpg" alt="header1page" className="w-full" />
      </div>
      <div className="flex flex-col justify-center items-center w-[90%] md:w-96 md:h-full mt-5 text-center gap-5 py-5 mb-10">
        <h1 className="text-2xl relative text-[var(--text)]">
          แลกรับของสมนาคุณ
        </h1>
        
        {/* phase 1
        <p className="mt-2 text-xl text-[var(--text)]">
          {isWeekday 
            ? "แลกรับบัตรชมภาพยนตร์ (จันทร์-ศุกร์)" 
            : "แลกรับบัตรกำนัลเงินสด (เสาร์-อาทิตย์)"}
        </p> */}

        {/* phase 2 */}
        <p className="mt-2 text-xl text-[var(--text)]">
          {isWeekday 
            ? "แลกรับบัตรกำนัลเงินสด (จันทร์-ศุกร์)" 
            : "แลกรับบัตรชมภาพยนตร์ (เสาร์-อาทิตย์)"}
        </p>
        <div className="mt-4 text-[var(--text)] bg-white py-2 px-8 rounded-lg text-lg">
          จำนวนสิทธิ์แลกรับ{redeemType.name}: <span className="font-bold">{rights}</span> สิทธิ์
        </div>

        <div className="mt-4 flex flex-col justify-center items-center">
          <img 
            src={redeemType.image} 
            alt={redeemType.name} 
            className="w-[70%] object-contain" 
          />
        </div>

        <div className="mt-6 w-11/12 max-w-sm">
          <div className="flex items-center">
            <label className="text-[var(--text)] text-lg mr-2 whitespace-nowrap">
              โรบินสันไลฟ์สไตล์ สาขา
            </label>
            <div className="flex items-center border border-white bg-white rounded-md px-3 py-2 flex-1">
              <span className="mr-2">R</span>
              <input
                type="text"
                maxLength={3}
                inputMode="numeric"
                placeholder="-xxx"
                pattern="[0-9]*"
                value={branchCode}
                onChange={(e) => {
                  const onlyDigits = e.target.value.replace(/\D/g, "");
                  setBranchCode(onlyDigits);
                }}
                className="w-full focus:outline-none"
              />
            </div>
          </div>
          <p className="text-center text-md pt-5 text-[var(--text)]">
            กรุณากรอกรหัส 3 หลัก ของสาขาโรบินสัน
          </p>

          {errorMessage && (
            <p className="text-red-400 text-sm mt-2 text-center">
              {errorMessage}
            </p>
          )}
        </div>

        <div className="mt-8 flex flex-col gap-4 w-[80%]">
          <button
            onClick={handleRedeemClick}
            className={`w-full inline-flex justify-center items-center rounded-md bg-[var(--button)] py-2 px-10 text-sm text-white shadow-inner shadow-white/10 focus:outline-none hover:bg-gray-700 transition-colors ${rights === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={isConfirming || rights === 0}
          >
            {isConfirming ? "กำลังแลก..." : "ยืนยัน"}
          </button>
          
          <Link 
            to="/menu"
            className="w-full inline-flex justify-center items-center rounded-md bg-white py-2 px-10 text-sm text-[var(--button)] border border-[var(--button)] shadow-inner shadow-white/10 focus:outline-none hover:bg-gray-100 transition-colors"
          >
            กลับหน้าหลัก
          </Link>
        </div>
      </div>

      {showConfirmDialog && stockItem && (
        <div 
          className="fixed inset-0 backdrop-blur-md flex justify-center items-center z-50 px-4"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)' 
        }}>
          <div className="bg-white rounded-lg shadow-xl border border-gray-200 w-full max-w-md mx-auto relative">
            {/* Close button */}
            <button
              onClick={cancelRedeem}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl font-bold z-10"
            >
              ×
            </button>
            
            {/* Content container with proper padding */}
            <div className="p-6 pt-8">
              {/* Title */}
              <h3 className="text-lg md:text-xl font-semibold text-center mb-4 leading-relaxed">
                คุณยืนยันแลกรับ{redeemType.name}
              </h3>
              
              {/* Branch info */}
              <p className="text-center mb-4 text-base md:text-lg">
                ณ โรบินสันไลฟ์สไตล์สาขา{" "}
                <span className="font-bold text-blue-600">
                  {findFilteredBranchNameByBranchId(combinedBranchId)}
                </span>{" "}
                หรือไม่
              </p>
              
              {/* Deduction info */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-center text-sm md:text-base text-gray-700 leading-relaxed">
                  สิทธิ์แลกรับ{redeemType.name}ของคุณจะถูกหักออก
                </p>
                <p className="text-center font-bold text-red-600 text-base md:text-lg mt-2">
                  จำนวน {redeemType.deductionText}
                </p>
              </div>
              
              {/* Stock info */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
                <p className="text-center font-semibold text-green-700 text-sm md:text-base">
                  เหลือสต็อกสาขานี้: {stockItem.amount} ชิ้น
                </p>
              </div>
              
              {/* Action buttons - Updated to match TermsRedeem style */}
              <div className="flex flex-col gap-4 w-full mt-6">
                <button
                  onClick={confirmRedeem}
                  disabled={isConfirming}
                  className="w-full inline-flex justify-center items-center gap-2 rounded-md bg-[var(--button)] py-2 px-10 text-sm text-white shadow-inner shadow-white/10 focus:outline-none hover:bg-gray-700 transition-colors text-center"
                  type="submit"
                >
                  {isConfirming ? "กำลังดำเนินการ..." : "ยืนยัน"}
                </button>
                <button
                  onClick={cancelRedeem}
                  className="w-full inline-flex justify-center items-center gap-2 rounded-md bg-white py-2 px-10 text-sm text-[var(--button)] border border-[var(--button)] shadow-inner shadow-white/10 focus:outline-none hover:bg-gray-100 transition-colors text-center"
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RedeemPage;