import { LuPencil } from "react-icons/lu";
import StockDialog from "../dialogs/admin/StockDialog";
import { useEffect, useState } from "react";
import {
  RewardsRespond,
  Transaction,
  useAdminStore,
} from "../../store/AdminStore";
import { RxCrossCircled } from "react-icons/rx";
import { FaRegCheckCircle } from "react-icons/fa";
import useBranchStore from "../../store/BranchStore";
import { formatNumber, formatThaiDateTime } from "../../data/functions";

const StockDashboard = () => {
  const { findBranchNameByBranchId } = useBranchStore();
  const {
    setUniversalOverlayTrue,
    setUniversalOverlayFalse,
    getStockInBranch,
    adminData,
    fetchStockTransaction,
  } = useAdminStore();
  const { branch } = adminData;

  //default item
  const knownItems = [
    { redeemId: "redeem001", label: "บัตรชมภาพยนตร์ 2 ใบ" },
    { redeemId: "redeem003", label: "ส่วนลดค่ากำเหน็จ 40%" },
    { redeemId: "redeem004", label: "ส่วนลดค่ากำเหน็จ 500.-" },
  ];

  // stock dialog
  const [isStockOpen, setIsStockOpen] = useState<boolean>(false);
  const [selectedStock, setSelectedStock] = useState<RewardsRespond | null>(null);
  const [shouldRefetch, setShouldRefetch] = useState<boolean>(false);

  const handleStockDialogOpen = (item: RewardsRespond) => {
    setSelectedStock(item);
    setIsStockOpen(true);
    setUniversalOverlayTrue();
  };

  const handleStockDialogClose = () => {
    setIsStockOpen(false);
    setUniversalOverlayFalse();
  };

  const refreshData = () => {
    setShouldRefetch((prev) => !prev);
  };

  // We'll store the final, merged stock data here
  const [stockData, setStockData] = useState<RewardsRespond[] | null>(null);

  useEffect(() => {
    const getStockInitial = async () => {
      if (!branch) {
        console.warn("Branch is not defined. Skipping getStockInitial.");
        return;
      }
      console.log("Branch exists:", branch);

      try {
        const data = await getStockInBranch(branch);
        console.log("Response from getStockInBranch:", data);

        // Normalize the API response into an array
        let dbArray: RewardsRespond[] = [];
        if (Array.isArray(data)) {
          dbArray = data as RewardsRespond[];
          console.log("Stock data set as array:", data);
        } else if (data) {
          dbArray = [data as RewardsRespond];
          console.log("Stock data set as object:", data);
        } else {
          dbArray = [];
          console.log("No data returned from getStockInBranch.");
        }

        // Merge knownItems with whatever we got from DB:
        // If the DB is missing a row, we'll create a placeholder with amount=0, isEnable=false.
        const mergedStock = knownItems.map((kItem) => {
          const found = dbArray.find((row) => row.redeemId === kItem.redeemId);
          if (found) {
            return found;
          } else {
            // Return a placeholder row so the admin sees a card anyway
            return {
              branchStockId: 0,
              branchId: branch,
              branchName: findBranchNameByBranchId(branch),
              redeemId: kItem.redeemId,
              amount: 0,
              isEnable: false,
              updatedAt: new Date().toISOString(),
            } as RewardsRespond;
          }
        });

        setStockData(mergedStock);
      } catch (error) {
        console.error("Error fetching stock data:", error);
        setStockData([]); // fallback to empty
      }
    };

    getStockInitial();
  }, [branch, shouldRefetch, findBranchNameByBranchId, getStockInBranch]);

  // A small helper to display the isEnable status
  const translateBoolean = (status: boolean) =>
    status ? (
      <p className="text-green-500">เปิดให้แลก</p>
    ) : (
      <p className="text-red-500">ไม่เปิดให้แลก</p>
    );

  // transaction api call
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  useEffect(() => {
    const getTransaction = async () => {
      if (!branch) return;
      try {
        const data = await fetchStockTransaction(branch);
        if (Array.isArray(data)) {
          setTransactions(data as Transaction[]);
        } else if (data) {
          setTransactions([data as Transaction]);
        } else {
          setTransactions([]);
        }
      } catch (error) {
        // handleError(error);
      }
    };

    getTransaction();
  }, [shouldRefetch, branch, fetchStockTransaction]);

  const formatChange = (amount: number) => {
    if (amount > 0) {
      return `+${formatNumber(amount)}`; // e.g. "+2"
    }
    // Negative numbers will automatically have '-' from the number itself
    return formatNumber(amount); // e.g. "-2" or "0"
  };

  return (
    <>
      <section className="mt-0 m-8">
        <div className="flex flex-col gap-3 items-start">
          <h1 className="text-[var(--text)] text-3xl mt-10">จัดการสินค้าสมนาคุณ</h1>
          {branch ? (
            <p className="text-[var(--text)] font-light mt-2">
              โรบินสันสาขา {findBranchNameByBranchId(branch)}
            </p>
          ) : (
            <p className="text-[var(--text)] font-light mt-2">ไม่พบสาขาของแอดมิน</p>
          )}

          {/* Cards for each premium item */}
          <section className="flex flex-wrap gap-3 mt-5">
            {stockData && stockData.length > 0 ? (
              stockData.map((item) => {
                const itemName =
                  item.redeemId === "redeem001" ? "บัตรชมภาพยนตร์ 2 ใบ" :
                    item.redeemId === "redeem003" ? "ส่วนลดค่ากำเหน็จ 40%" :
                      item.redeemId === "redeem004" ? "ส่วนลดค่ากำเหน็จ 500.-" :
                        item.redeemId;


                return (
                  <div
                    key={`${item.redeemId}-${item.branchStockId}`}
                    className={`${item.redeemId === "redeem001"
                      ? "bg-white text-black"
                      : "bg-white text-black"
                      } rounded-xl w-72 h-40 p-7 flex flex-col gap-3 relative`}
                  >
                    <h1 className="text-xl">{itemName}</h1>
                    {item.isEnable ? (
                      <section className="flex items-center gap-3 -mt-2 text-green-400 text-sm">
                        <FaRegCheckCircle />
                        <p className="text-slate-400">เปิดให้แลก</p>
                      </section>
                    ) : (
                      <section className="flex items-center gap-3 -mt-2 text-red-400 text-sm">
                        <RxCrossCircled size={18} />
                        <p className="text-slate-400">ไม่เปิดให้แลก</p>
                      </section>
                    )}
                    <p className="text-sm">คงเหลือ</p>
                    <h2 className="text-[2rem] -mt-5">{formatNumber(item.amount)}</h2>
                    <div
                      className="absolute top-6 right-6 hover:bg-slate-200 cursor-pointer duration-200 rounded-full w-8 h-8 flex items-center justify-center"
                      onClick={() => handleStockDialogOpen(item)}
                    >
                      <LuPencil />
                    </div>
                  </div>
                );
              })
            ) : (
              <p>ไม่พบรายการสินค้าพรีเมียมในคลัง</p>
            )}
          </section>

          {/* Transaction History */}
          <div className="w-[18rem] md:w-full h-full bg-white mt-5 rounded-2xl p-5 text-black overflow-x-auto">
            <table className="w-full text-center text-xs lg:text-[0.9rem]">
              <thead>
                <tr>
                  <td className="w-20 border-b border-b-slate-400 pb-3">
                    วันเวลาที่มีการเปลี่ยนแปลง
                  </td>
                  <td className="w-20 border-b border-b-slate-400 pb-3">
                    แอดมิน
                  </td>
                  <td className="w-20 border-b border-b-slate-400 pb-3">
                    สินค้าพรีเมียม
                  </td>
                  <td className="w-32 border-b border-b-slate-400 pb-3">
                    รายการอัพเดท
                  </td>
                </tr>
              </thead>
              <tbody className="font-light">
                {transactions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="w-full border-b border-b-slate-400 h-12 font-light"
                    >
                      ไม่พบรายการ
                    </td>
                  </tr>
                ) : (
                  transactions.map((transaction, index) => {
                    return (
                      <tr
                        key={index}
                        className="hover:bg-slate-100 duration-200 cursor-pointer"
                      >
                        <td className="w-20 border-b border-b-slate-400 pb-3 h-10 pt-2">
                          {formatThaiDateTime(transaction.editDate)}
                        </td>
                        <td className="w-20 border-b border-b-slate-400 pb-3 h-10 pt-2">
                          {transaction.username}
                        </td>
                        <td className="w-20 border-b border-b-slate-400 pb-3 h-10 pt-2">
                          {transaction.redeemId === "redeem001"
                            ? "บัตรชมภาพยนตร์ 2 ใบ"
                            : transaction.redeemId === "redeem003"
                              ? "ส่วนลดค่ากำเหน็จ 40%"
                              : transaction.redeemId === "redeem004"
                                ? "ส่วนลดค่ากำเหน็จ 500.-"
                                : transaction.redeemId}
                        </td>
                        <td className=" border-b border-b-slate-400 flex flex-col justify-center items-center text-center pb-3 h-10 pt-2">
                          {/* Case 1: Only amount changed */}
                          {!transaction.updatedStatus && (
                            <span className="flex gap-2">
                              <p>เปลี่ยนแปลงจำนวนในคลัง</p>
                              <p className="font-medium">
                                {formatChange(transaction.amount)}
                              </p>
                            </span>
                          )}

                          {/* Case 2: Status changed (with or without amount) */}
                          {transaction.updatedStatus && (
                            <div className="flex gap-2 flex-col justify-center items-center text-center">
                              <span>
                                เปลี่ยนแปลงจำนวนในคลัง{" "}
                                {formatNumber(transaction.amount)}
                              </span>
                              <span>ปรับเปลี่ยนสถานะเป็น{" "}</span>
                              {translateBoolean(transaction.isEnable)}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Dialog for editing stock */}
      <StockDialog
        isStockOpen={isStockOpen}
        handleStockDialogClose={handleStockDialogClose}
        refreshData={refreshData}
        stock={selectedStock}
      />
    </>
  );
};

export default StockDashboard;
