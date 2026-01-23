import { Dialog, DialogPanel } from "@headlessui/react";
import { animated, useTransition, useSpring } from "@react-spring/web";
import { useEffect, useState } from "react";
import { FaXmark } from "react-icons/fa6";
import { useAdminStore } from "../../../store/AdminStore";
import { RewardsRespond } from "../../../store/AdminStore";
import { FiMinusCircle, FiPlusCircle } from "react-icons/fi";
import Switch from "react-switch";

interface StockDialogProps {
  isStockOpen: boolean;
  handleStockDialogClose: () => void;
  refreshData: () => void;
  stock: RewardsRespond | null;
}

const StockDialog: React.FC<StockDialogProps> = ({
  isStockOpen,
  handleStockDialogClose,
  refreshData,
  stock,
}) => {
  const { updateStockInBranch, adminData } = useAdminStore();
  const [isVisible, setIsVisible] = useState(isStockOpen);

  // Animation props
  const springProps = useSpring({
    transform: isStockOpen ? "scale(1)" : "scale(0.6)",
    config: { tension: 170, friction: 16 },
  });

  const transitions = useTransition(isStockOpen, {
    from: { opacity: 0, transform: "scale(0.9)" },
    enter: { opacity: 1, transform: "scale(1)" },
    leave: { opacity: 0, transform: "scale(0.9)" },
    config: { duration: 200 },
    onRest: () => {
      if (!isStockOpen) setIsVisible(false);
    },
  });

  // Show/hide logic
  useEffect(() => {
    if (isStockOpen) setIsVisible(true);
  }, [isStockOpen]);

  // Switch for enabling or disabling this stock item
  const [checked, setChecked] = useState<boolean>(true);
  const handleChangeSwitch = (newChecked: boolean) => {
    setChecked(newChecked);
  };

  // Quantity editing
  const [quantity, setQuantity] = useState<number>(0);

  // Redeem name display
  const [redeemName, setRedeemName] = useState<string>("");

  // Initialize form fields when the dialog opens
  useEffect(() => {
    if (stock) {
      // Set quantity
      setQuantity(stock.amount);
      // Set enable toggle
      setChecked(stock.isEnable);
      // Check redeemId
      if (stock.redeemId === "redeem001") {
        setRedeemName("Movie Ticket");
      } else if(stock.redeemId === "redeem002"){
        setRedeemName("Gift Voucher");
      }
    }
  }, [stock, isStockOpen]);

  // Handle text input for quantity (limit to 6 digits)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d{0,6}$/.test(value)) {
      setQuantity(Number(value));
    }
  };

  const incrementQuantity = () => {
    setQuantity((prev) => prev + 1);
  };

  const decrementQuantity = () => {
    setQuantity((prev) => Math.max(0, prev - 1));
  };

  // Confirm the update (both quantity and isEnable)
  const handleConfirm = async () => {
    if (stock && typeof stock.amount === "number" && adminData.adminId) {
      const diff = quantity - stock.amount;

      // Base payload for updating
      const basePayload = {
        adminId: adminData.adminId,
        branchId: stock.branchId,
        redeemId: stock.redeemId,// from the new type
        amount: 0,
      } as {
        adminId: string;
        branchId: string;
        redeemId:string;
        amount: number;
        isEnable?: boolean;
      };

      // Determine what changed
      const isAmountChanged = diff !== 0;
      const isEnableChanged = checked !== stock.isEnable;

      // Only include fields that changed
      if (isAmountChanged) {
        basePayload.amount = diff;
      }
      if (isEnableChanged) {
        basePayload.isEnable = checked;
      }

      try {
        // Only call the update API if there is a real change
        if (isAmountChanged || isEnableChanged) {
          await updateStockInBranch(basePayload);
        }
        handleStockDialogClose();
        refreshData();
      } catch (error) {
        console.error("Error updating stock:", error);
      }
    }
  };

  return (
    <Dialog
      open={isVisible}
      as="div"
      className="relative z-[60] focus:outline-none"
      onClose={handleStockDialogClose}
    >
      <div className="fixed inset-0 z-50 w-screen overflow-y-auto font-kanit">
        <div className="flex min-h-full items-center justify-center p-4">
          {transitions(
            (styles, item) =>
              item && (
                <animated.div style={{ ...styles, ...springProps }}>
                  <DialogPanel className="w-[20rem] md:w-[35rem] p-6 rounded-xl bg-white drop-shadow-lg relative text-center">
                    {/* Close button */}
                    <div
                      className="absolute top-5 right-5 cursor-pointer"
                      onClick={handleStockDialogClose}
                    >
                      <FaXmark size={20} />
                    </div>

                    {/* Dialog content */}
                    <div className="w-full h-full flex flex-col md:flex-row gap-3 items-center justify-center">
                      {/* Image (example placeholder) */}
                      <div className="w-60 md:w-56 h-64 rounded-lg md:mt-0 mt-5 flex items-center justify-center">
                        <img
                          src={
                            stock?.redeemId === "redeem001"
                              ? "/ตั๋ว 2 ใบ.png"
                              : stock?.redeemId === "redeem002"
                              ? "/Gift Voucher.png"
                              : "/no_image.png"
                          }
                          alt=""
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>

                      {/* Details / Form */}
                      {stock ? (
                        <div className="w-[16rem] pl-4 flex flex-col gap-2 items-start text-black select-none">
                          <h1 className="text-2xl text-start max-h-20">
                            {redeemName || "No item name available"}
                          </h1>

                          {/* Toggle availability */}
                          <div className="w-full flex gap-3 items-center">
                            <Switch
                              onChange={handleChangeSwitch}
                              checked={checked}
                              checkedIcon={false}
                              uncheckedIcon={false}
                              width={42}
                              height={20}
                            />
                            {checked ? <p>เปิดให้แลก</p> : <p>ไม่เปิดให้แลก</p>}
                          </div>

                          {/* Quantity controls */}
                          <section className="w-full flex gap-2 items-center mt-4 justify-around">
                            <div
                              className="cursor-pointer duration-200"
                              onClick={decrementQuantity}
                            >
                              <FiMinusCircle size={20} />
                            </div>
                            <input
                              value={quantity}
                              type="text"
                              className="border border-slate-500 rounded-lg h-12 w-24 md:w-36 px-3 text-center text-2xl"
                              onChange={handleInputChange}
                            />
                            <div
                              className="cursor-pointer duration-200"
                              onClick={incrementQuantity}
                            >
                              <FiPlusCircle size={20} />
                            </div>
                          </section>

                          {/* Display the difference */}
                          <p className="w-full text-center text-xs font-light text-red-800">
                            เปลี่ยนแปลงจำนวนในคลัง{" "}
                            {quantity - stock.amount > 0 ? (
                              <>+ {quantity - stock.amount}</>
                            ) : (
                              <>{quantity - stock.amount}</>
                            )}
                          </p>

                          {/* Confirm button */}
                          <div className="mt-2 flex gap-3 w-full justify-center select-none">
                            <button
                              className="w-44 inline-flex items-center justify-center gap-2 rounded-md bg-[var(--red)] py-1.5 px-3 text-sm/6 text-white shadow-inner shadow-white/10 focus:outline-none hover:bg-slate-700 duration-150"
                              onClick={handleConfirm}
                            >
                              ยืนยัน
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p>No item available</p>
                      )}
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

export default StockDialog;
