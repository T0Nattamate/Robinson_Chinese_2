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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const { findFilteredBranchNameByBranchId } = useBranchStore();

  const [branchCode, setBranchCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [stockItem, setStockItem] = useState<BranchStock | null>(null);

  // Selection state
  type RewardCategory = 'MOVIE' | 'GOLD' | null;
  type GoldType = 'redeem003' | 'redeem004' | 'GOLD_BOTH';

  const [selectedCategory, setSelectedCategory] = useState<RewardCategory>(null);
  const [selectedGoldType, setSelectedGoldType] = useState<GoldType>('redeem003');

  const {
    eligibleMovie,
    eligibleGoldA,
    eligibleGoldB,
    fetchUserRights,
    rights,
    usedMovie,
    usedGold
  } = useUserStore();

  useEffect(() => {
    fetchUserRights();
  }, [fetchUserRights]);

  // Map category and type to current reward display info
  const getRewardInfo = () => {
    if (selectedCategory === 'MOVIE') {
      return {
        name: "บัตรชมภาพยนตร์",
        image: "ตั๋วคู่.png",
        redeemId: "redeem001",
        deductionText: "1 สิทธิ์"
      };
    } else if (selectedCategory === 'GOLD') {
      if (selectedGoldType === 'redeem003') {
        return {
          name: "ส่วนลดค่ากำเหน็จ 40%",
          image: "คูปอง 1.png",
          redeemId: "redeem003",
          deductionText: "1 สิทธิ์"
        };
      } else if (selectedGoldType === 'redeem004') {
        return {
          name: "ส่วนลดค่ากำเหน็จ 500.-",
          image: "คูปอง 2.png",
          redeemId: "redeem004",
          deductionText: "1 สิทธิ์"
        };
      } else {
        return {
          name: "ส่วนลดค่ากำเหน็จ 40% และ 500.- บาท",
          image: "คูปองคู่.png",
          redeemId: "GOLD_BOTH",
          deductionText: "1 สิทธิ์รวม"
        };
      }
    }
    return null;
  };

  const currentReward = getRewardInfo();
  const combinedBranchId = "R-" + branchCode.trim();

  const handleRedeemClick = async () => {
    if (!currentReward) {
      setErrorMessage("กรุณาเลือกของรางวัล");
      return;
    }

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
      setIsLoading(true);
      const response = await axiosInterceptor.get(
        `/reward/available/${combinedBranchId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const rewards: any[] = response.data;
      const targetRedeemId = currentReward.redeemId === 'GOLD_BOTH' ? 'redeem003' : currentReward.redeemId;
      const stockItemFound = rewards.find(r => r.redeemId === targetRedeemId);

      if (!stockItemFound || stockItemFound.remainStock <= 0) {
        setErrorMessage(`ขออภัย ของรางวัลนี้ในสต็อกหมดแล้วค่ะ`);
        setIsLoading(false);
        return;
      }

      if (!stockItemFound.isEnable) {
        setErrorMessage("ขออภัย ของรางวัลไม่เปิดให้บริการในขณะนี้");
        setIsLoading(false);
        return;
      }

      setStockItem({
        ...stockItemFound,
        amount: stockItemFound.remainStock
      });
      setIsLoading(false);
      setShowConfirmDialog(true);
    } catch (error) {
      console.error("Error fetching branch item:", error);
      setErrorMessage("เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์แลกรับ");
      setIsLoading(false);
    }
  };

  const confirmRedeem = async () => {
    if (isConfirming || !currentReward) return;
    try {
      setIsConfirming(true);
      setIsLoading(true);

      await axiosInterceptor.post(
        `/reward/redeem`,
        {
          branchId: combinedBranchId,
          redeemId: currentReward.redeemId,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );

      setIsLoading(false);
      navigate(`/success-redeem/${combinedBranchId}`, { state: { itemName: currentReward.name } });

    } catch (error: any) {
      setIsLoading(false);
      setIsConfirming(false);
      const msg = error?.response?.data?.message || "แลกรับไม่สำเร็จ";
      Swal.fire({
        icon: "error",
        text: msg,
        confirmButtonText: "ยืนยัน",
      });
    }
  };

  const cancelRedeem = () => {
    setShowConfirmDialog(false);
  };

  return (
    <div className="font-kanit bg-[var(--bg)] w-full min-h-screen h-full flex flex-col justify-start items-center relative pb-10 animate-in fade-in duration-700">
      {isLoading && <LoadingOverlay />}
      <div className="w-full h-full min-h-[400px] md:w-96 relative bg-white">
        <img src="//banner_major.webp" alt="header1page" className="w-full" />
      </div>

      <div className="flex flex-col justify-start items-center w-[90%] md:w-96 mt-8 text-center gap-6">
        <h1 className="text-3xl text-white font-medium">
          แลกรับของสมนาคุณ
        </h1>

        <div className="flex flex-col gap-4 w-full">
          {usedMovie || usedGold ? (
            <div className="text-lg border border-[var(--text)] p-2 rounded-lg bg-white text-yellow-600" >
              คุณใช้สิทธิ์แลกรับของรางวัลประจำวันแล้ว
            </div>
          ) : (
            <div className="text-lg border border-[var(--text)] p-2 rounded-lg bg-white" >
              สิทธิ์แลกรับของรางวัล:  {rights} สิทธิ์
            </div>
          )}
          {/* Category Selection */}
          <div className="flex flex-col gap-4">
            {/* Movie Reward Item */}
            <button
              onClick={() => setSelectedCategory('MOVIE')}
              disabled={!eligibleMovie || usedMovie || (rights <= 0 && selectedCategory !== 'MOVIE')}
              className={`w-full py-4 rounded-full font-bold text-lg shadow-lg transition-all flex items-center justify-between px-8 border-2 
                ${selectedCategory === 'MOVIE'
                  ? 'bg-white text-black border-yellow-400 scale-105 ring-4 ring-yellow-400/50'
                  : (!eligibleMovie || (rights <= 0 && !usedMovie))
                    ? 'bg-[#1a0a0c] text-white/30 border-transparent cursor-not-allowed opacity-50'
                    : usedMovie
                      ? 'bg-[#2a1215] text-white/50 border-gray-700 opacity-70'
                      : 'bg-[#4a1d24] text-white border-white/10 hover:bg-[#5a242c]'}`}
            >
              <div className="flex items-center gap-3">
                <span>{(!eligibleMovie || (rights <= 0 && !usedMovie && selectedCategory !== 'MOVIE')) ? '🔒' : '🎬'}</span>
                <div className="flex flex-col items-start">
                  <span className="leading-tight">บัตรชมภาพยนตร์ (2,500.-)</span>
                  {!eligibleMovie && <span className="text-[10px] font-light text-yellow-500/80">สะสมยอดซื้อไม่เพียงพอ</span>}
                  {eligibleMovie && rights <= 0 && !usedMovie && <span className="text-[10px] font-light text-yellow-500/60">ใช้สิทธิ์ครบตามโควตาประจำวันแล้ว</span>}
                  {usedMovie && <span className="text-[10px] font-light text-gray-400">แลกรับไปแล้ววันนี้</span>}
                </div>
              </div>
              {selectedCategory === 'MOVIE' && <span className="text-yellow-500">✓</span>}
            </button>

            {/* Gold Reward Item */}
            <button
              onClick={() => setSelectedCategory('GOLD')}
              disabled={(!eligibleGoldA && !eligibleGoldB) || usedGold || (rights <= 0 && selectedCategory !== 'GOLD')}
              className={`w-full py-4 rounded-full font-bold text-lg shadow-lg transition-all flex items-center justify-between px-8 border-2
                ${selectedCategory === 'GOLD'
                  ? 'bg-white text-black border-yellow-400 scale-105 ring-4 ring-yellow-400/50'
                  : ((!eligibleGoldA && !eligibleGoldB) || (rights <= 0 && !usedGold))
                    ? 'bg-[#1a0a0c] text-white/30 border-transparent cursor-not-allowed opacity-50'
                    : usedGold
                      ? 'bg-[#2a1215] text-white/50 border-gray-700 opacity-70'
                      : 'bg-[#4a1d24] text-white border-white/10 hover:bg-[#5a242c]'}`}
            >
              <div className="flex items-center gap-3">
                <span>{((!eligibleGoldA && !eligibleGoldB) || (rights <= 0 && !usedGold && selectedCategory !== 'GOLD')) ? '🔒' : '✨'}</span>
                <div className="flex flex-col items-start">
                  <span className="leading-tight">ส่วนลดทองคำ (3,500.-)</span>
                  {(!eligibleGoldA && !eligibleGoldB) && <span className="text-[10px] font-light text-yellow-500/80">สะสมยอดซื้อไม่เพียงพอ</span>}
                  {(eligibleGoldA || eligibleGoldB) && rights <= 0 && !usedGold && <span className="text-[10px] font-light text-yellow-500/60">ใช้สิทธิ์ครบตามโควตาประจำวันแล้ว</span>}
                  {usedGold && <span className="text-[10px] font-light text-gray-400">แลกรับไปแล้ววันนี้</span>}
                </div>
              </div>
              {selectedCategory === 'GOLD' && <span className="text-yellow-500">✓</span>}
            </button>
          </div>

          {/* Gold Sub-Selection */}
          {selectedCategory === 'GOLD' && (
            <div className="grid grid-cols-1 gap-2 mt-2 bg-black/20 p-4 rounded-2xl animate-in fade-in duration-300">
              <p className="text-white text-sm mb-2">เลือกรูปแบบส่วนลดทองคำ:</p>
              <button
                onClick={() => setSelectedGoldType('redeem003')}
                className={`py-2 px-4 rounded-full text-sm font-bold transition ${selectedGoldType === 'redeem003' ? 'bg-yellow-400 text-black' : 'bg-white/20 text-white'}`}
              >
                ส่วนลดค่ากำเหน็จ 40%
              </button>
              <button
                onClick={() => setSelectedGoldType('redeem004')}
                className={`py-2 px-4 rounded-full text-sm font-bold transition ${selectedGoldType === 'redeem004' ? 'bg-yellow-400 text-black' : 'bg-white/20 text-white'}`}
              >
                ส่วนลดค่ากำเหน็จ 500.-
              </button>
              {eligibleGoldA && eligibleGoldB && (
                <button
                  onClick={() => setSelectedGoldType('GOLD_BOTH')}
                  className={`py-2 px-4 rounded-full text-sm font-bold transition ${selectedGoldType === 'GOLD_BOTH' ? 'bg-yellow-400 text-black' : 'bg-white/20 text-white'}`}
                >
                  รับทั้ง 2 แบบ (ใช้ 1 สิทธิ์รวม)
                </button>
              )}
            </div>
          )}
        </div>

        {/* {currentReward && (
          <div className="bg-white py-3 px-6 rounded-full inline-flex justify-center items-center shadow-lg w-full max-w-xs transition-all">
            <p className="text-lg text-black">
              คุณมีสิทธิ์แลก: <span className="font-bold">{rights}</span> สิทธิ์
            </p>
          </div>
        )} */}

        {currentReward ? (
          <div className="mt-2 flex justify-center items-center w-full animate-in fade-in duration-500">
            <img
              src={currentReward.image}
              alt={currentReward.name}
              className="w-[50%] object-contain drop-shadow-2xl"
            />
          </div>
        ) : (
          <div className="h-24 flex items-center justify-center text-white/50 italic">
            กรุณาเลือกประเภทรางวัล
          </div>
        )}

        <div className="w-full max-w-xs flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <label className="text-white text-lg whitespace-nowrap">
              โรบินสันไล์สไตล์ สาขา
            </label>
            <div className="flex items-center bg-white rounded-full px-5 py-2 flex-1 shadow-md">
              <span className="mr-1 text-gray-500 font-bold">R</span>
              <span className="mr-1 text-gray-400">-</span>
              <input
                type="text"
                maxLength={3}
                inputMode="numeric"
                placeholder="xxx"
                pattern="[0-9]*"
                value={branchCode}
                onChange={(e) => {
                  const onlyDigits = e.target.value.replace(/\D/g, "");
                  setBranchCode(onlyDigits);
                }}
                className="w-full focus:outline-none text-gray-700 bg-transparent font-bold"
              />
            </div>
          </div>
          <p className="text-center text-sm text-white opacity-90">
            กรุณากรอกรหัส 3 หลัก ของสาขาโรบินสัน
          </p>

          {errorMessage && (
            <p className="text-yellow-300 text-sm font-bold text-center animate-pulse">
              {errorMessage}
            </p>
          )}
        </div>

        <div className="mt-4 flex flex-col gap-4 w-full max-w-[280px]">
          <button
            onClick={handleRedeemClick}
            className={`w-full py-4 rounded-xl font-bold text-xl text-white shadow-xl transition-all transform active:scale-95 ${!currentReward || rights === 0 ? "bg-gray-800 opacity-50 cursor-not-allowed" : "bg-[#4a1d24] hover:bg-black hover:scale-105"}`}
            disabled={isConfirming || !currentReward || rights === 0}
          >
            {isConfirming ? "กำลังตรวจสอบ..." : "ยืนยัน"}
          </button>

          <Link
            to="/menu"
            className="w-full py-3 rounded-xl font-bold text-lg bg-white text-[var(--bg)] shadow-lg transition-transform hover:scale-105 active:scale-95 text-center"
          >
            กลับหน้าหลัก
          </Link>
        </div>
      </div>

      {showConfirmDialog && stockItem && currentReward && (
        <div
          className="fixed inset-0 backdrop-blur-md flex justify-center items-center z-50 px-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
        >
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm mx-auto relative overflow-hidden font-kanit">
            <div className="p-8 flex flex-col items-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-4xl text-green-600">✓</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 text-center mb-2 leading-relaxed">
                ยืนยันการแลกรับ
              </h3>
              <p className="text-gray-500 text-center mb-6">{currentReward.name}</p>

              <div className="w-full space-y-4 mb-8">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-400">สาขา</span>
                  <span className="font-bold text-black">{findFilteredBranchNameByBranchId(combinedBranchId)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-400">หักสิทธิ์การแลก</span>
                  <span className="font-bold text-red-600">{currentReward.deductionText}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-400">เหลือสต็อกสาขานี้</span>
                  <span className="font-bold text-black">{stockItem.amount} รางวัล</span>
                </div>
              </div>

              <div className="flex flex-col gap-3 w-full">
                <button
                  onClick={confirmRedeem}
                  disabled={isConfirming}
                  className="w-full py-4 rounded-2xl bg-[var(--bg)] text-white font-bold shadow-lg hover:shadow-red-200/50 transition-all active:scale-95"
                >
                  {isConfirming ? "กำลังแลกรับ..." : "ยืนยันการแลกรับสิทธิ์"}
                </button>
                <button
                  onClick={cancelRedeem}
                  className="w-full py-4 rounded-2xl bg-gray-50 text-gray-400 font-bold hover:bg-gray-100 transition-colors"
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