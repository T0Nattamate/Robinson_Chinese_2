import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { animated, useTransition, useSpring } from "@react-spring/web";
import { useEffect, useState } from "react";
import { IoWarningOutline } from "react-icons/io5";
import { AdminList } from "../../AdminDashboard/CreateAdmin";
import { FaXmark } from "react-icons/fa6";
import { useAdminStore } from "../../../store/AdminStore";
import useBranchStore from "../../../store/BranchStore";

interface RulesDialogProps {
  isConfirmDeleteOpen: boolean;
  handleDeleteDialogClose: () => void;
  refreshData: () => void;
  admin: AdminList | null;
}

const ConfirmDeleteAdminDialog: React.FC<RulesDialogProps> = ({
  isConfirmDeleteOpen,
  handleDeleteDialogClose,
  refreshData,
  admin,
}) => {
  const { findBranchNameByBranchId } = useBranchStore();
  const { deleteAdmin } = useAdminStore();
  const [isVisible, setIsVisible] = useState(isConfirmDeleteOpen);
  const springProps = useSpring({
    transform: isConfirmDeleteOpen ? "scale(1)" : "scale(0.6)",
    config: { tension: 170, friction: 16 },
  });

  const transitions = useTransition(isConfirmDeleteOpen, {
    from: { opacity: 0, transform: "scale(0.9)" },
    enter: { opacity: 1, transform: "scale(1)" },
    leave: { opacity: 0, transform: "scale(0.9)" },
    config: { duration: 200 },
    onRest: () => {
      if (!isConfirmDeleteOpen) setIsVisible(false);
    },
  });

  useEffect(() => {
    if (isConfirmDeleteOpen) setIsVisible(true);
  }, [isConfirmDeleteOpen]);

  const handleConfirm = () => {
    if (admin) {
      deleteAdmin(admin.adminId);
      handleDeleteDialogClose();
      refreshData();
    }
  };

  return (
    <Dialog
      open={isVisible}
      as="div"
      className="relative z-[60] focus:outline-none"
      onClose={handleDeleteDialogClose}
    >
      <div className=" fixed inset-0 z-50 w-screen overflow-y-auto font-kanit">
        <div className="flex min-h-full items-center justify-center p-4">
          {transitions(
            (styles, item) =>
              item && (
                <animated.div style={{ ...styles, ...springProps }}>
                  <DialogPanel className="w-[30rem] text-center p-6 max-w-md rounded-xl bg-white drop-shadow-lg relative">
                    <div
                      className="absolute top-5 right-8 cursor-pointer"
                      onClick={handleDeleteDialogClose}
                    >
                      <FaXmark size={20} />
                    </div>
                    <DialogTitle
                      as="h3"
                      className="text-xl font-medium text-red-500"
                    >
                      ยืนยันที่จะลบแอดมินนี้?
                    </DialogTitle>
                    <div className="w-full flex flex-col gap-5 items-center justify-center mt-3 text-red-500">
                      {/* <p className=" text-xs text-green-200 font-poppins w-[90%]">
                        Debug: {admin.adminId}
                      </p> */}
                      {admin && (
                        <div className="w-full flex flex-col gap-5 items-center justify-center mt-5 text-red-500">
                          <IoWarningOutline size={40} />
                          <p className=" text-black font-medium font-kanit w-[90%]">
                            {admin.username}
                          </p>
                          <p className=" text-sm text-black font-kanit w-[90%] -mt-3">
                            สาขา {findBranchNameByBranchId(admin.branchId)}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="mt-8 flex gap-3 w-full justify-center">
                      <button
                        className="w-44 text-center justify-center inline-flex items-center gap-2 rounded-md bg-red-700 ring-2 ring-red-700 py-1.5 px-3 text-sm/6  text-white shadow-inner shadow-white/10 focus:outline-none hover:bg-red-400 duration-200"
                        onClick={handleConfirm}
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

export default ConfirmDeleteAdminDialog;
