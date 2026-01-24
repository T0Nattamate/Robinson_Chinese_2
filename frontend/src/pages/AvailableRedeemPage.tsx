import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useBranchStore from "../store/BranchStore";
import { useUserStore } from "../store/userStore";
import ConfirmRedeemDialog from "../components/dialogs/ConfirmRedeemDialog";
import { Link } from "react-router-dom";
//import { LuCopyright } from "react-icons/lu";

interface RewardItem {
  redeemId: string;
  rewardName: string;
  remainStock: number;
  isEnable: boolean;
}

const AvailableRedeemPage = () => {
  const { findBranchNameByBranchId } = useBranchStore();
  const { branchId } = useParams<{ branchId: string }>();

  //console.log(branchId);
  let selectedBranch;
  if (branchId) {
    selectedBranch = findBranchNameByBranchId(branchId);
  }
  //console.log(selectedBranch);
  useEffect(() => {
    const fetchDataRedeem = async () => {
      try {
        await fetchUserRights(); //fetch new update

      } catch (error) {
        //console.log("redeemPage error", error);
      }
    };

    fetchDataRedeem();
  }, []);
  const {
    lineId,
    getAvailableRewards,
    setSelectedReward,
    fetchUserRights,
    eligibleMovie,
    eligibleGoldA,
    eligibleGoldB,
  } = useUserStore();
  const [rewardItems, setRewardItems] = useState<RewardItem[]>([]);

  useEffect(() => {
    if (!branchId) return;

    const fetchDataRewards = async () => {
      try {
        const response = await getAvailableRewards(branchId);
        if (response) {
          setRewardItems(response);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchDataRewards();
  }, [getAvailableRewards, lineId, branchId]);

  // Second useEffect to log the updated state
  useEffect(() => {
    if (rewardItems) {
      //console.log("reward: ", rewardItems);
    }
  }, [rewardItems]);

  //dialog logic
  const [isConfirmRedeemOpen, setIsConfirmRedeemOpen] =
    useState<boolean>(false);

  const handleConfirmRedeemOpen = (redeemId: string, rewardName: string) => {
    setSelectedReward(redeemId, rewardName);
    setIsConfirmRedeemOpen(true);
  };

  const handleConfirmRedeemClose = () => {
    setIsConfirmRedeemOpen(false);
  };

  return (
    <div className="font-kanit bg-[var(--primary)] w-full min-h-screen h-full flex flex-col justify-start items-center relative">
      <div className="w-auto h-auto md:h-[25rem] relative">
        <img
          src="/header-06.png"
          alt="header1page"
          className="w-full h-full object-cover"
        />
        {/* Title in the white space */}
        <h1 className="text-3xl text-center text-[var(--gold)] relative -top-12">
          แลกรับรางวัล
        </h1>
      </div>
      <div className="flex flex-col justify-start items-center w-[90%] md:w-96 text-center gap-5 p-5 relative -top-10">

        {selectedBranch ? (
          <div className="text-2xl text-[var(--ghost-white)]"> โรบินสันไลฟ์สไตล์ {selectedBranch}</div>
        ) : (
          <div className="text-3xl text-[var(--ghost-white)] mt-5">ไม่พบสาขา</div>
        )}

        <section className="rounded-lg p-1 px-5 text-[var(--dark-green)] bg-white mb-2">
          <p>
            คุณมีสิทธิ์แลกรับรางวัล
          </p>
        </section>

        <div className="w-full flex flex-col gap-4 overflow-y-auto pb-10">
          {rewardItems.map((item) => {
            let isEligible = false;
            // Map redeemId to eligibility flag
            if (item.redeemId === 'redeem001') isEligible = eligibleMovie;
            else if (item.redeemId === 'redeem003') isEligible = eligibleGoldA;
            else if (item.redeemId === 'redeem004') isEligible = eligibleGoldB;

            const isOutOfStock = item.remainStock <= 0;
            const canRedeem = isEligible && !isOutOfStock && item.isEnable;

            return (
              <div
                key={item.redeemId}
                className={`bg-white rounded-xl p-4 flex flex-col items-center gap-2 border-2 ${canRedeem ? 'border-[var(--gold)]' : 'border-gray-200 opacity-70'}`}
              >
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  {/* Icon or simplified image based on type */}
                  {item.redeemId === 'redeem001' ? '🎬' : '✨'}
                </div>
                <h3 className="text-lg font-bold text-[var(--primary)]">{item.rewardName}</h3>
                <p className="text-sm text-gray-500">คงเหลือ: {item.remainStock} สิทธิ์</p>

                {!isEligible && (
                  <p className="text-xs text-red-500 italic">ยอดสะสมของคุณยังไม่ถึงเกณฑ์</p>
                )}

                <button
                  disabled={!canRedeem}
                  className={`w-full py-2 rounded-lg font-bold transition ${canRedeem ? 'bg-[var(--gold)] text-white hover:scale-105' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                  onClick={() => handleConfirmRedeemOpen(item.redeemId, item.rewardName)}
                >
                  {isOutOfStock ? 'หมดแล้ว' : 'แลกรับรางวัล'}
                </button>

                {/* Specific option for BOTH if it's Gold and user is eligible for both */}
                {item.redeemId === 'redeem003' && eligibleGoldA && eligibleGoldB && (
                  <button
                    className="w-full py-1 text-xs text-[var(--gold)] underline"
                    onClick={() => handleConfirmRedeemOpen('GOLD_BOTH', 'ทองทั้ง 2 รูปแบบ')}
                  >
                    รับทั้ง 2 แบบ (ใช้ 1 สิทธิ์รวม)
                  </button>
                )}
              </div>
            );
          })}
        </div>
        <Link
          to="/menu"
          className="block w-[80%] mx-auto transform transition hover:scale-105"
        >
          <img
            src="/Button_backMain.png"
            alt="กลับสู่หน้าหลัก"
            className="w-full h-auto"
          />
        </Link>
      </div>
      <ConfirmRedeemDialog
        isConfirmRedeemOpen={isConfirmRedeemOpen}
        handleConfirmRedeemClose={handleConfirmRedeemClose}
      />
    </div>
  );
};

export default AvailableRedeemPage;
