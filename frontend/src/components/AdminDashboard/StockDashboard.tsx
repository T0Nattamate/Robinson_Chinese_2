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
import { GoGift } from "react-icons/go";
import { MdRefresh } from "react-icons/md";

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

  const knownItems = [
    { redeemId: "redeem001", label: "บัตรชมภาพยนตร์ 2 ใบ" },
    { redeemId: "redeem003", label: "ส่วนลดค่ากำเหน็จ 40%" },
    { redeemId: "redeem004", label: "ส่วนลดค่ากำเหน็จ 500.-" },
  ];

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

  const [stockData, setStockData] = useState<RewardsRespond[] | null>(null);

  useEffect(() => {
    const getStockInitial = async () => {
      if (!branch) return;
      try {
        const data = await getStockInBranch(branch);
        let dbArray: RewardsRespond[] = [];
        if (Array.isArray(data)) dbArray = data;
        else if (data) dbArray = [data as RewardsRespond];

        const mergedStock = knownItems.map((kItem) => {
          const found = dbArray.find((row) => row.redeemId === kItem.redeemId);
          return found || {
            branchStockId: 0,
            branchId: branch,
            branchName: findBranchNameByBranchId(branch),
            redeemId: kItem.redeemId,
            amount: 0,
            isEnable: false,
            updatedAt: new Date().toISOString(),
          } as RewardsRespond;
        });
        setStockData(mergedStock);
      } catch (error) {
        console.error(error);
        setStockData([]);
      }
    };
    getStockInitial();
  }, [branch, shouldRefetch, findBranchNameByBranchId, getStockInBranch]);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  useEffect(() => {
    const getTransaction = async () => {
      if (!branch) return;
      try {
        const data = await fetchStockTransaction(branch);
        if (Array.isArray(data)) {
          setTransactions(data.filter((t): t is Transaction => t !== undefined));
        } else if (data) {
          setTransactions([data as Transaction]);
        } else {
          setTransactions([]);
        }
      } catch (error) {
        console.error(error);
      }
    };
    getTransaction();
  }, [shouldRefetch, branch, fetchStockTransaction]);

  const formatChange = (amount: number) => {
    if (amount > 0) return `+${formatNumber(amount)}`;
    return formatNumber(amount);
  };

  return (
    <div className="p-6 lg:p-10 space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">คลังของสมนาคุณ</h1>
          <p className="text-gray-500 mt-1">จัดการสต็อกสินค้าและเปิด-ปิดการแลกรับสิทธิ์ในสาขาของคุณ</p>
        </div>

        {branch && (
          <div className="flex items-center gap-3">
            <button
              onClick={refreshData}
              className="p-3 rounded-xl border border-gray-100 hover:bg-white hover:shadow-md text-gray-500 transition-all bg-gray-50 active:scale-95"
              title="รีเฟรชข้อมูล"
            >
              <MdRefresh size={22} />
            </button>
            <div className="bg-red-50 text-[var(--red)] px-4 py-2 rounded-xl border border-red-100 font-bold text-sm shadow-sm whitespace-nowrap">
              โรบินสันสาขา {findBranchNameByBranchId(branch) || "ไม่พบสาขา"}
            </div>
          </div>
        )}
      </div>

      {/* Stock Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stockData && stockData.length > 0 ? (
          stockData.map((item) => {
            const itemName =
              item.redeemId === "redeem001" ? "บัตรชมภาพยนตร์ 2 ใบ" :
                item.redeemId === "redeem003" ? "ส่วนลดค่ากำเหน็จ 40%" :
                  item.redeemId === "redeem004" ? "ส่วนลดค่ากำเหน็จ 500.-" : item.redeemId;

            return (
              <div key={`${item.redeemId}-${item.branchStockId}`} className="bg-white rounded-2xl p-7 shadow-sm border border-gray-100 relative group hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-[var(--red)]">
                      <GoGift size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 line-clamp-1">{itemName}</h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        {item.isEnable ? (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 uppercase tracking-wider">
                            <FaRegCheckCircle size={10} /> เปิดให้แลก
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-red-500 uppercase tracking-wider">
                            <RxCrossCircled size={12} /> ไม่เปิดให้แลก
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    className="p-2 rounded-xl bg-gray-50 text-gray-400 hover:bg-gray-900 hover:text-white transition-all shadow-sm"
                    onClick={() => handleStockDialogOpen(item)}
                  >
                    <LuPencil size={16} />
                  </button>
                </div>

                <div className="space-y-1">
                  <p className="text-[11px] font-medium text-gray-400 uppercase tracking-widest">จำนวนในคลังปัจจุบัน</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-gray-900">{formatNumber(item.amount)}</span>
                    <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">หน่วย</span>
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gray-50 rounded-b-2xl overflow-hidden">
                  <div
                    className={`h-full transition-all duration-1000 ${item.amount > 50 ? 'bg-green-500' : item.amount > 10 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                    style={{ width: `${Math.min(100, (item.amount / 200) * 100)}%` }}
                  ></div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-12 bg-white rounded-2xl border border-dashed border-gray-200 text-center">
            <div className="text-gray-300 text-4xl mb-3">📦</div>
            <p className="text-gray-500 font-medium">ไม่พบข้อมูลสินค้าในคลัง</p>
          </div>
        )}
      </div>

      {/* Transaction History Table */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <div className="w-1.5 h-6 bg-[var(--red)] rounded-full"></div>
          <h2 className="text-xl font-bold text-gray-900">ประวัติการอัพเดทคลัง</h2>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-500">วันเวลาที่ดำเนินการ</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-500">แอดมินผู้ดำเนินการ</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-500">สินค้าพรีเมียม</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-500 text-right">รายละเอียดการเปลี่ยนแปลง</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {transactions.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-16 text-center text-gray-500">ไม่พบประวัติการอัพเดท</td></tr>
                ) : (
                  transactions.map((transaction, index) => {
                    const itemName = transaction.redeemId === "redeem001" ? "บัตรชมภาพยนตร์ 2 ใบ" :
                      transaction.redeemId === "redeem003" ? "ส่วนลดค่ากำเหน็จ 40%" :
                        transaction.redeemId === "redeem004" ? "ส่วนลดค่ากำเหน็จ 500.-" : transaction.redeemId;

                    return (
                      <tr key={index} className="hover:bg-gray-50/80 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-xs font-medium text-gray-900">{formatThaiDateTime(transaction.editDate)}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-400">
                              {transaction.username?.[0]?.toUpperCase() || 'A'}
                            </div>
                            <span className="text-xs font-bold text-gray-700">{transaction.username}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs text-gray-600">{itemName}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="inline-flex flex-col items-end gap-1">
                            {!transaction.updatedStatus ? (
                              <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-lg border border-blue-100">
                                <span className="text-[10px] font-bold uppercase">อัพเดทจำนวน:</span>
                                <span className="text-xs font-black">{formatChange(transaction.amount)}</span>
                              </div>
                            ) : (
                              <div className="flex flex-col items-end gap-1.5">
                                <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-700 rounded-lg border border-amber-100">
                                  <span className="text-[10px] font-bold uppercase">ปรับสต็อกเป็น:</span>
                                  <span className="text-xs font-black">{formatNumber(transaction.amount)}</span>
                                </div>
                                <div className={`flex items-center gap-1.5 text-[10px] font-bold ${transaction.isEnable ? 'text-green-600' : 'text-red-500'}`}>
                                  {transaction.isEnable ? <FaRegCheckCircle /> : <RxCrossCircled />}
                                  <span>{transaction.isEnable ? 'เปิดให้แลก' : 'ปิดการแลก'}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <StockDialog
        isStockOpen={isStockOpen}
        handleStockDialogClose={handleStockDialogClose}
        refreshData={refreshData}
        stock={selectedStock}
      />
    </div>
  );
};

export default StockDashboard;
