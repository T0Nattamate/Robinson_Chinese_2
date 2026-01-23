import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useBranchStore from "../store/BranchStore";
import { useUserStore } from "../store/userStore";
import ConfirmRedeemDialog from "../components/dialogs/ConfirmRedeemDialog";
import { Link } from "react-router-dom";
//import { LuCopyright } from "react-icons/lu";

interface RedeemItemAvailable {
  branchId:string;
  redeemId: number;
  anpaoName: string;
  remainStock: number;
  isEnable: boolean;
  gotRedeem: number;
  updatedAt: string;
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
    getAvailableRewardsInBranch,
    setSelectedReward,
    rights,
    fullname,
    fetchUserRights,
  } = useUserStore();
  const [redeemItems, setRedeemItems] = useState<RedeemItemAvailable[]>([]);

  useEffect(() => {
    if (!branchId) return;
    
    const fetchDataRedeemEachBranch = async () => {
      try {
        const response = await getAvailableRewardsInBranch(branchId);
        if (response) {
          //console.log("response: ", response);
          setRedeemItems(response);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
  
    fetchDataRedeemEachBranch();
  }, [getAvailableRewardsInBranch, lineId, branchId]);
  
  // Second useEffect to log the updated state
  useEffect(() => {
    if (redeemItems) {
      //console.log("reward: ", redeemItems);
    }
  }, [redeemItems]);

  //dialog logic
  const [isConfirmRedeemOpen, setIsConfirmRedeemOpen] =
    useState<boolean>(false);

  const handleConfirmRedeemOpen = ( redeemId: number,anpaoName: string) => {
    setSelectedReward(redeemId, anpaoName);
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
          แลกรับอั่งเปา
        </h1>
      </div>
      <div className="flex flex-col justify-start items-center w-[90%] md:w-96 text-center gap-5 p-5 relative -top-10">
        
        {selectedBranch ? (
          <div className="text-2xl text-[var(--ghost-white)]"> โรบินสันไลฟ์สไตล์ {selectedBranch}</div>
        ) : (
          <div className="text-3xl text-[var(--ghost-white)] mt-5">ไม่พบสาขา</div>
        )}

        <section className="rounded-lg  p-1 px-5 text-[var(--dark-green)] bg-white mb-8">
        <p>
          จำนวนการแลกรับสิทธิ์ :{" "}
          <span className="">{rights > 0 ? rights - (rights - 1) : 0}</span>{" "}
          สิทธิ์
        </p>
        </section>

        {(redeemItems.length > 0 && redeemItems[0].remainStock > 0) ? (
            <div>
              <p className="text-gray-300 text-3xl">
                ซินเจียยู่อี่ ซินนี้ฮวดใช้
              </p>
              <div className="my-6">
                <p className="text-[var(--ghost-white)] text-lg font-semibold">
                  อั่งเปาของคุณ ({fullname})
                </p>
              </div>
              <img
                src="/ungpao.png"
                alt="อั่งเปา"
                className="w-32 mx-auto"
              />
              <button
                className="block w-[80%] mx-auto my-4 transform transition hover:scale-105"
                onClick={() => {
                  if (redeemItems && redeemItems.length > 0) {
                    handleConfirmRedeemOpen(
                      redeemItems[0].redeemId,
                      redeemItems[0].anpaoName
                    );
                  }
                }}
              >
                <img
                  src="/Button_receivedUngpao.png"
                  alt="Redeem"
                  className="w-full h-auto"
                />
              </button>
            </div>
          ) : (
            <div className=" text-xl bg-white text-black rounded-md border-black border-2 h-[8rem] flex flex-col items-center justify-center py-4">
              <p>สิทธิ์แลกรับอั่งเปาโรบินสันไลฟ์สไตล์ {selectedBranch} เต็มจำนวนสิทธิ์แล้วค่ะ ขอบคุณค่ะ</p>
            </div>
          )}
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
