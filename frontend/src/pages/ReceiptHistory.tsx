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
  const { lineId, accRights,accPoints, fetchUserRights } = useUserStore();
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
        <img src="banner_major.webp" alt="header1page" className="w-full" />
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
          <p className="px-2 py-1 rounded-md text-[var(--button)] text-left bg-white pl-5 font-light">
            จำนวนสิทธิ์ลุ้นรางวัล : {accRights} สิทธิ์
          </p>
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

        {/* Table container (allow horizontal scroll on mobile) */}
        <div className="relative min-w-[22rem]  h-full w-full overflow-x-auto">
          {items.length > 0 ? (
            <table className=" border-separate text-center rounded-lg border-spacing-0 text-black min-w-[30rem] bg-white">
              <InfiniteScroll
                dataLength={items.length}
                next={fetchMoreData}
                hasMore={hasMore}
                loader={
                  <tr>
                    <td colSpan={11} className="text-center"></td>
                  </tr>
                }
                endMessage={<></>}
              >
                <thead>
                  <tr>
                    <th className="px-4 py-2 border-[var(--black)] border-l border-t border-b rounded-tl-lg text-xs h-10 w-[15rem]">
                      วันที่อัพโหลด
                    </th>
                    <th className="px-4 py-2 border-[var(--black)] border-l border-t border-b text-xs w-[15rem]">
                      สาขาโรบินสัน
                    </th>
                    <th className="px-4 py-2 border-[var(--black)] border-l border-t border-b text-xs w-[8rem]">
                      เลขที่ใบเสร็จ
                    </th>
                    <th className="px-4 py-2 border-[var(--black)] border-l border-t border-b text-xs w-[15rem]">
                      ยอดซื้อ
                    </th>
                    <th className="px-4 py-2 border-[var(--black)] border-l border-t border-b text-xs w-[12rem]">
                      ร้านค้า
                    </th>
                    <th className="px-4 py-2 border-[var(--black)] border-l border-t border-b text-xs w-[15rem]">
                      วันที่ออกใบเสร็จ
                    </th>
                    <th className="px-4 py-2 border-[var(--black)] border-l border-t border-b text-xs w-[10rem]">
                      ภาพใบเสร็จ
                    </th>
                    {/* <th className="px-4 py-2 border-[var(--black)] border-l border-t border-b text-xs w-[10rem]">
                      สิทธิ์ลุ้นรางวัล
                    </th>
                    <th className="px-4 py-2 border-[var(--black)] border-l border-t border-b text-xs w-[10rem]">
                      สิทธิ์แลกซื้อ
                    </th>
                    <th className="px-4 py-2 border-[var(--black)] border-l border-t border-b text-xs w-[10rem]">
                      สิทธิ์ VIP
                    </th> */}
                    <th className="px-4 py-2 border-[var(--black)] border border-t border-b rounded-tr-lg text-xs w-[9rem]">
                      สถานะทางแอดมิน
                    </th>
                  </tr>
                </thead>

                <tbody className="font-light text-center text-[0.65rem]">
                  {items.map((item, index) => {
                    const statusDetails = getStatusDetails(item.status);
                    const isLastRow = index === items.length - 1;

                    return (
                      <tr key={item.receiptId} className="hover:bg-gray-50">
                        {/* 1) วันที่อัพโหลด */}
                        <td
                          className={`px-2 py-2 ${
                            isLastRow
                              ? "border-l-[var(--black)] border-l border-b-[var(--black)] border-b rounded-bl-lg"
                              : "border-l-[var(--black)] border-l border-b border-b-slate-300"
                          }`}
                        >
                          {formatThaiDateTime(item.uploadedAt)}
                        </td>
                        {/* 2) สาขาโรบินสัน */}
                        <td
                          className={`px-2 py-2 ${
                            isLastRow
                              ? "border-l-[var(--black)] border-l border-b-[var(--black)] border-b"
                              : "border-l-[var(--black)] border-l border-b border-b-slate-300"
                          }`}
                        >
                          {item.branchName}
                        </td>
                        {/* 3) เลขที่ใบเสร็จ */}
                        <td
                          className={`px-2 py-2 ${
                            isLastRow
                              ? "border-l-[var(--black)] border-l border-b-[var(--black)] border-b"
                              : "border-l-[var(--black)] border-l border-b border-b-slate-300"
                          }`}
                        >
                          {item.receiptNo}
                        </td>
                        {/* 4) ยอดซื้อ */}
                        <td
                          className={`px-2 py-2 ${
                            isLastRow
                              ? "border-l-[var(--black)] border-l border-b-[var(--black)] border-b"
                              : "border-l-[var(--black)] border-l border-b border-b-slate-300"
                          }`}
                        >
                          {formatNumber(parseFloat(item.amount))}฿
                        </td>
                        {/* 5) ร้านค้า */}
                        <td
                          className={`px-2 py-2 ${
                            isLastRow
                              ? "border-l-[var(--black)] border-l border-b-[var(--black)] border-b"
                              : "border-l-[var(--black)] border-l border-b border-b-slate-300"
                          }`}
                        >
                          {item.storeName}
                        </td>
                        {/* 6) วันที่ออกใบเสร็จ */}
                        <td
                          className={`px-4 py-2 ${
                            isLastRow
                              ? "border-l-[var(--black)] border-l border-b-[var(--black)] border-b"
                              : "border-l-[var(--black)] border-l border-b border-b-slate-300"
                          }`}
                        >
                          {item.receiptDate}
                        </td>
                        {/* 7) ภาพใบเสร็จ */}
                        <td
                          className={`px-2 py-2 underline text-blue-600 cursor-pointer ${
                            isLastRow
                              ? "border-l-[var(--black)] border-l border-b-[var(--black)] border-b"
                              : "border-l-[var(--black)] border-l border-b border-b-slate-300"
                          }`}
                          onClick={() => handleOpenDialog(item.receiptImage)}
                        >
                          Pick link
                        </td>
                        {/* 8) สิทธิ์ลุ้นรางวัล */}
                        {/* <td
                          className={`px-2 py-2 justify-items-center ${
                            isLastRow
                              ? "border-l-[var(--black)] border-l border-b-[var(--black)] border-b"
                              : "border-l-[var(--black)] border-l border-b border-b-slate-300"
                          }`}
                        >
                          {renderBooleanIcon(item.canLuckydraw)}
                        </td> */}
                        {/* 9) สิทธิ์แลกซื้อ */}
                        {/* <td
                          className={`px-2 py-2 justify-items-center ${
                            isLastRow
                              ? "border-l-[var(--black)] border-l border-b-[var(--black)] border-b"
                              : "border-l-[var(--black)] border-l border-b border-b-slate-300"
                          }`}
                        >
                          {renderBooleanIcon(item.canBag)}
                        </td> */}
                        {/* 10) สิทธิ์ VIP */}
                        {/* <td
                          className={`px-2 py-2 justify-items-center ${
                            isLastRow
                              ? "border-l-[var(--black)] border-l border-b-[var(--black)] border-b"
                              : "border-l-[var(--black)] border-l border-b border-b-slate-300"
                          }`}
                        >
                          {renderBooleanIcon(item.canVip)}
                        </td> */}
                        {/* 11) สถานะทางแอดมิน */}
                        <td
                          className={`px-2 py-2 border-r border-black ${
                            isLastRow
                              ? "border-[var(--black)] border-l border-r-[var(--black)] border-b  rounded-br-lg"
                              : "border-l-[var(--black)] border-l border-r-[var(--black)] border-b border-b-slate-300"
                          } flex items-center justify-center gap-2 py-10`}
                        >
                          {statusDetails?.icon}
                          <p className="whitespace-nowrap">
                            {statusDetails?.text}
                          </p>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </InfiniteScroll>
            </table>
          ) : (
            <div className="my-3 text-black h-32 flex justify-center items-center">
              ไม่พบประวัติการร่วมกิจกรรม
            </div>
          )}
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
                  {["rejected", "invalidImage", "amountDontMatch","breakRules","duplicated"].includes(
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

