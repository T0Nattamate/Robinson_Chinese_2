import { Dialog, DialogPanel} from "@headlessui/react";
import { animated, useTransition, useSpring } from "@react-spring/web";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useUserStore } from "../../store/userStore";
import useBranchStore from "../../store/BranchStore";
import Swal from "sweetalert2";

interface RulesDialogProps {
  isConfirmRedeemOpen: boolean;
  handleConfirmRedeemClose: () => void;
}

const ConfirmRedeemDialog: React.FC<RulesDialogProps> = ({
  isConfirmRedeemOpen,
  handleConfirmRedeemClose,
}) => {
  const navigate = useNavigate();
  const { branchId } = useParams<{ branchId: string }>();
  const {
    selectedRedeemId: redeemId,
    selectedAnpaoName: anpaoName,
    confirmRedeem,
    userId,
    setUploadCurrentBranch
  } = useUserStore();

  //const { uploadCurrentBranch: branch } = useUserStore();
  const [displayBranch, setDisplayBranch] = useState<string>("");
  const [isVisible, setIsVisible] = useState(isConfirmRedeemOpen);

  const springProps = useSpring({
    transform: isConfirmRedeemOpen ? "scale(1)" : "scale(0.6)",
    config: { tension: 170, friction: 16 },
  });
  const { findBranchNameByBranchId } = useBranchStore();
  const transitions = useTransition(isConfirmRedeemOpen, {
    from: { opacity: 0, transform: "scale(0.9)" },
    enter: { opacity: 1, transform: "scale(1)" },
    leave: { opacity: 0, transform: "scale(0.9)" },
    config: { duration: 200 },
    onRest: () => {
      if (!isConfirmRedeemOpen) setIsVisible(false); // Close the dialog after animation ends
    },
  });

  useEffect(() => {
    if (isConfirmRedeemOpen) {
      setIsVisible(true);
  
      // Resolve branch name dynamically
      if (branchId) {
        const resolvedBranchName = findBranchNameByBranchId(branchId);
        if (resolvedBranchName) {
          setDisplayBranch(resolvedBranchName);
        } else {
          setDisplayBranch("ไม่พบข้อมูลสาขา");
          console.warn("Branch name not found for branchId:", branchId);
        }
      } else {
        setDisplayBranch("ไม่พบข้อมูลสาขา");
        console.warn("Branch ID is missing.");
      }
    }
  }, [isConfirmRedeemOpen, branchId]);

  //confirm button logic
  const handleConfirmRedeemSuccess = async () => {
  if (!userId || !redeemId || !branchId || !anpaoName) {
    console.error("One or more required parameters are missing.");
    return;
  }

  try {
    const result = await confirmRedeem(userId, redeemId, branchId);
    if (result) {
      const branchName = findBranchNameByBranchId(branchId);
      if (branchName) {
        setUploadCurrentBranch(branchName);
        setDisplayBranch(branchName); // Update displayBranch to resolved branch name
        //console.log("Branch name resolved:", branchName);
      } else {
        console.error("Branch name not found for branchId:", branchId);
        setDisplayBranch("ไม่พบข้อมูลสาขา");
      }
      navigate("/success-redeem");
      handleConfirmRedeemClose();
    } else {
      console.error("Redeem failed or undefined result");
    }
  } catch (error) {
    let errorMessage = "An unknown error occurred.";
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (
      typeof error === "object" &&
      error !== null &&
      "message" in error
    ) {
      errorMessage = (error as { message: string }).message;
    }

    Swal.fire({
      icon: "error",
      text: errorMessage,
      confirmButtonText: "ยืนยัน",
      customClass: {
        htmlContainer: "font-kanit",
        confirmButton: "bg-gray-700 text-white rounded-md font-kanit",
      },
    });
    console.error("Error handling redeem:", error);
  }
};

  return (
    <Dialog
      open={isVisible}
      as="div"
      className="relative z-20 focus:outline-none"
      onClose={handleConfirmRedeemClose}
    >
      <div className="fixed inset-0 z-20 w-screen overflow-y-auto font-kanit">
        {/* Background overlay with opacity */}
        <div className="fixed inset-0 bg-black opacity-50" />
        <div className="flex min-h-full items-center justify-center p-4">
          {transitions(
            (styles, item) =>
              item && (
                <animated.div style={{ ...styles, ...springProps }}>
                  <DialogPanel className="w-full text-center p-6 max-w-md rounded-xl bg-white drop-shadow-lg">
                  
                    <section className="mt-5 ">
                      {/* {rewardId && (
                        <p className="text-green-700 text-sm font-light">
                          Debug: rewardId{rewardId.toString()}
                        </p>
                      )} */}

                        <p className="mt-5  font-kanit">
                          คุณยืนยันแลกรับอั่งเปา ณ โรบินสัน <br></br>
                          ไลฟ์สไตล์ {displayBranch} หรือไม่ 
                        </p>
                    </section>

                    <div className="mt-8">
                      <button
                        className="inline-flex items-center gap-2 rounded-md bg-gray-400 py-1.5 px-3 text-sm/6  text-white shadow-inner shadow-white/10 focus:outline-none hover:bg-gray-600"
                        onClick={handleConfirmRedeemClose}
                      >
                        ยกเลิก
                      </button>
                      <button
                        className="ml-3 inline-flex items-center gap-2 rounded-md bg-[#C8102E] py-1.5 px-3 text-sm/6  text-white shadow-inner shadow-white/10 focus:outline-none hover:bg-green-600"
                        onClick={handleConfirmRedeemSuccess}
                      >
                        ยืนยัน
                      </button>
                    </div>
                  </DialogPanel>
                </animated.div>
              )
          )}
        </div>
      </div>
    </Dialog>
  );
};

export default ConfirmRedeemDialog;
