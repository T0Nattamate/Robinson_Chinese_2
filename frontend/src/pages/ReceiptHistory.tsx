import { status } from "../data/dataVariables";
import { FaCircleCheck, FaCircleMinus, FaCircleXmark } from "react-icons/fa6";
import InfiniteScroll from "react-infinite-scroll-component";
import { useState, useEffect } from "react";
import PicDialog from "../components/dialogs/PicDialog";
import { Link } from "react-router-dom";
import { useUserStore } from "../store/userStore";
import useAuthStore from "../store/AuthStore";
import { formatNumber, formatThaiDateTime } from "../data/functions";
import axiosInterceptor from "../utils/axiosInterceptor";
import { useWebSocket } from '../../hook/useWebSocket';



export interface Receipt {
  receiptId: number;
  receiptNo: string;
  receiptDate: string;
  amount: string;
  branchName: string;
  storeName: string;
  receiptImage: string;
  status: string;
  uploadedAt: string;
  updatedAt: string;
  canVip: boolean;
  canBag: boolean;
  canLuckydraw: boolean;
}

const ReceiptHistory = () => {
  // Extract data fromZustand store
  const { lineId, accPoints, fetchUserRights } = useUserStore(); //accRights
  const { accessToken } = useAuthStore();
  const pageSize = 10;

  //Local state for receipts & pagination
  const [items, setItems] = useState<Receipt[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [lastReceiptId, setLastReceiptId] = useState<string | null>(null);

  // For image dialog
  const [isPicOpen, setIsPicOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  + // Use the WebSocket hook, passing lineId and setItems
    + useWebSocket(lineId, setItems);

  // Helper to show boolean as a check or x
  // const renderBooleanIcon = (flag: boolean) =>
  //   flag ? <FaCheck size={10} /> : <FaX size={10} />;

  // Convert status to icon + text
  const getStatusDetails = (statusText: string) => {
    switch (statusText) {
      case "approved":
        return {
          icon: <FaCircleCheck size={10} className="text-green-600" />,
          text: "ถูกต้อง",
        };
      case "pending":
        return {
          icon: <FaCircleMinus size={10} className="text-slate-600" />,
          text: "รอตรวจสอบ",
        };
      case "rejected":
        return {
          icon: <FaCircleXmark size={10} className="text-red-600" />,
          text: "เลขที่ใบเสร็จผิด",
        };
      case "invalidImage":
        return {
          icon: <FaCircleXmark size={10} className="text-red-600" />,
          text: "ภาพไม่ชัด / ภาพไม่ถูกต้อง",
        };
      case "amountDontMatch":
        return {
          icon: <FaCircleXmark size={10} className="text-red-600" />,
          text: "ยอดซื้อไม่ตรงกับใบเสร็จ",
        };
      case "breakRules":
        return {
          key: "breakRules",
          icon: <FaCircleXmark size={14} className="text-red-600" />,
          text: "ยอดสั่งซื้อไม่ตรงตามเงื่อนไข",
        };
      case "duplicated":
        return {
          key: "duplicated",
          icon: <FaCircleXmark size={14} className="text-red-600" />,
          text: "ใบเสร็จซ้ำกับใบที่อนุมัติแล้ว",
        };
      default:
        return null;
    }
  };

  // Image dialog logic
  const handleOpenDialog = (image: string) => {
    setSelectedImage(image);
    setIsPicOpen(true);
  };
  const handlePicDialogClose = () => {
    setSelectedImage(null);
    setIsPicOpen(false);
  };
  //format amount 
  function formatAmount(amount: string | number): string {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return num.toLocaleString("en-US");
  }
  //Initial fetch
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const response = await axiosInterceptor.get(
          `user/receiptHistory/${lineId}?pageSize=${pageSize}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        const data = response.data;
        const receipts = data.receiptHistory || [];

        setItems(receipts);
        setLastReceiptId(data.nextCursor || null);

        if (!data.nextCursor || receipts.length === 0) {
          setHasMore(false);
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
        setHasMore(false);
      }
    };

    fetchInitialData();
    // Also fetch user data
    fetchUserRights();
  }, [fetchUserRights, lineId, accessToken]);

  // 4) Pagination load more
  const fetchMoreData = async () => {
    if (!lastReceiptId) return;
    try {
      const response = await axiosInterceptor.get(
        `user/receiptHistory/${lineId}?pageSize=${pageSize}&cursor=${lastReceiptId}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      const data = response.data;
      const moreReceipts = data.receiptHistory || [];

      setItems((prevItems) => [...prevItems, ...moreReceipts]);
      setLastReceiptId(data.nextCursor || null);

      if (!data.nextCursor || moreReceipts.length === 0) {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching more data:", error);
      setHasMore(false);
    }
  };

  return (
    <div className="font-kanit bg-[var(--bg)] w-full min-h-screen h-full flex flex-col justify-start items-center relative">
      {/* Header */}
      <div className="w-full h-full min-h-[400px] bg-white md:w-96">
        <img src="/Poster.png" alt="header1page" className="w-full" />
      </div>

      <h1 className="text-3xl text-center text-[var(--text)] relative pt-5 pb-5">
        ประวัติการร่วมกิจกรรม
      </h1>

      <div className="flex flex-col justify-start items-center w-[90%] md:w-96  min-h-[42rem] text-center gap-5 relative -top-10">
        {/* Display accumulated points and rights */}
        <section className="w-72 flex flex-col gap-2 text-[0.9rem] pt-10">
          <p className="px-2 py-1 rounded-md text-start bg-white pl-5 font-light">
            ยอดซื้อสะสม : {formatAmount(accPoints)} ฿
          </p>
          {/* <p className="px-2 py-1 rounded-md text-[var(--button)] text-left bg-white pl-5 font-light">
            จำนวนสิทธิ์ลุ้นรางวัล : {accRights} สิทธิ์
          </p> */}
        </section>

        {/* Link to top-spender */}
        <Link
          to="/top-spender"
          className="w-[70%] relative transform transition hover:scale-105 items-center"
        >
          <button className="bg-[var(--button)] rounded-sm text-white text-center w-full h-8">
            ดูอันดับ Top Spender
          </button>
        </Link>

        {/* Modern Table Container */}
        <div className="w-full bg-white rounded-2xl shadow-xl animate-in fade-in slide-in-from-bottom-5 duration-700">
          <div className="overflow-x-auto p-1">
            {items.length > 0 ? (
              <InfiniteScroll
                dataLength={items.length}
                next={fetchMoreData}
                hasMore={hasMore}
                loader={<div className="h-10 w-full flex items-center justify-center text-xs text-gray-400">กำลังโหลด...</div>}
                endMessage={<div className="py-4 text-center text-[10px] text-gray-400 font-light">สิ้นสุดประวัติการร่วมกิจกรรม</div>}
              >
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-100">
                      <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-gray-500 whitespace-nowrap">วันที่อัพโหลด</th>
                      <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-gray-500 whitespace-nowrap">สาขา</th>
                      <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-gray-500 whitespace-nowrap">เลขที่ใบเสร็จ</th>
                      <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-gray-500 whitespace-nowrap">วันที่ออกใบเสร็จ</th>
                      <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-gray-500 whitespace-nowrap text-right">ยอดซื้อ</th>
                      <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-gray-500 whitespace-nowrap">ร้านค้า</th>
                      <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-gray-500 whitespace-nowrap text-center">ภาพ</th>
                      <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-gray-500 whitespace-nowrap text-center">สถานะ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {items.map((item) => {
                      const statusDetails = getStatusDetails(item.status);
                      return (
                        <tr key={item.receiptId} className="hover:bg-gray-50/80 transition-colors group">
                          <td className="px-5 py-4 whitespace-nowrap">
                            <div className="text-xs font-medium text-gray-900">{formatThaiDateTime(item.uploadedAt)}</div>
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap">
                            <div className="text-xs text-gray-600">{item.branchName}</div>
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap">
                            <div className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md inline-block">
                              {item.receiptNo}
                            </div>
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap">
                            <div className="text-xs text-gray-600">{item.receiptDate}</div>
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap text-right">
                            <div className="text-xs font-bold text-gray-900">{formatNumber(parseFloat(item.amount))} ฿</div>
                          </td>
                          <td className="px-5 py-4 min-w-[150px]">
                            <div className="text-xs text-gray-600 break-words">{item.storeName}</div>
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap text-center">
                            <button
                              onClick={() => handleOpenDialog(item.receiptImage)}
                              className="text-xs text-blue-500 hover:text-blue-700 font-medium underline decoration-blue-500/30 underline-offset-4"
                            >
                              ดูรูป
                            </button>
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap text-center">
                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-medium
                              ${item.status === 'approved' ? 'bg-green-50 text-green-700 border border-green-100' :
                                item.status === 'pending' ? 'bg-slate-50 text-slate-700 border border-slate-100' :
                                  'bg-red-50 text-red-700 border border-red-100'}`}>
                              {statusDetails?.icon}
                              <span>{statusDetails?.text}</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </InfiniteScroll>
            ) : (
              <div className="py-20 text-center">
                <div className="text-gray-400 mb-2 text-2xl">📭</div>
                <div className="text-sm text-gray-500">ไม่พบประวัติการร่วมกิจกรรม</div>
              </div>
            )}
          </div>
        </div>

        {/* STATUS Description */}
        <section className="text-xs font-light text-start w-[23rem] text-[var(--text)] mt-4">
          <h1 className="mb-2">STATUS ต่างๆ</h1>
          {status.map((historyStatus, index) => {
            return (
              <div
                key={index}
                className="flex gap-2 justify-start items-start text-start"
              >
                <div className="ml-1 mt-1">
                  {historyStatus.key === "approved" && (
                    <FaCircleCheck className="text-green-600" />
                  )}
                  {historyStatus.key === "pending" && (
                    <FaCircleMinus className="text-slate-500" />
                  )}
                  {["rejected", "invalidImage", "amountDontMatch", "breakRules", "duplicated"].includes(
                    historyStatus.key
                  ) && <FaCircleXmark className="text-red-700" />}
                </div>
                <p>
                  {historyStatus.thStatus} = {historyStatus.enStatus}
                </p>
              </div>
            );
          })}
        </section>

        <section className="gap-3 mb-10 pt-6 relative">
          <Link to="/menu">
            <button className="bg-white text-[var(--button)] px-6 py-2 rounded-md w-80 border-1 border-[var(--button)] hover:bg-gray-800 transition">
              กลับสู่หน้าหลัก
            </button>
          </Link>
        </section>
      </div>

      {/* PicDialog for previewing receipt images */}
      <PicDialog
        isPicOpen={isPicOpen}
        handlePicDialogClose={handlePicDialogClose}
        image={selectedImage}
      />
    </div>
  );
};

export default ReceiptHistory;

