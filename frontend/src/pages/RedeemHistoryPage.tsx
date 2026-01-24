/* eslint-disable */
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import axiosInceptor from "../utils/axiosInterceptor";

//import { useUserStore } from "../store/userStore";
import useAuthStore from "../store/AuthStore";

interface ClaimedHistory {
  claimId: number;
  redeemId: string;
  lineId: string;
  fullname: string;
  claimedAmount: number;
  branchId: string;
  branchName: string;
  claimedAt: string;
  date: string; // e.g. "17 ก.พ. 2025 14:39 น."
}

interface ApiResponse {
  message: string;
  ClaimedHistoryList: ClaimedHistory[];
  totalCount: number;
  nextCursor: string | null;
  pageSize: number;
}

const RedeemHistoryPage = () => {

  const { accessToken } = useAuthStore();

  // We store the claimed histories
  const [claimedHistory, setClaimedHistory] = useState<ClaimedHistory[]>([]);
  const [lastCursor, setLastCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);

  // 1) Initial fetch
  useEffect(() => {
    const fetchClaimedHistory = async () => {
      try {
        const response = await axiosInceptor.get<ApiResponse>("/user/claimed/hist", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        // The response structure has "ClaimedHistoryList" and "nextCursor"
        setClaimedHistory(response.data.ClaimedHistoryList ?? []);
        setLastCursor(response.data.nextCursor);

        // If nextCursor is null, no more data
        if (!response.data.nextCursor) {
          setHasMore(false);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setHasMore(false);
      }
    };

    fetchClaimedHistory();
  }, [accessToken]);

  // 2) Load more data (pagination)
  const fetchMoreData = async () => {
    if (!lastCursor) return; // No more data to fetch
    try {
      // e.g. /claimed/hist?cursor=xxx
      const response = await axiosInceptor.get<ApiResponse>(
        `/user/claimed/hist?cursor=${lastCursor}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = response.data;
      // Append new items
      setClaimedHistory((prev) => [...prev, ...data.ClaimedHistoryList]);

      // Update nextCursor
      setLastCursor(data.nextCursor);
      if (!data.nextCursor) {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching more data:", error);
      setHasMore(false);
    }
  };

  return (
    <div className="font-kanit bg-wite w-full min-h-screen flex flex-col justify-start items-center bg-[var(--bg)] relative">
      {/* Header */}
      <div className="w-full min-h-[400px] bg-white md:w-96 relative">
        <img src="//banner_major.webp" alt="header1page" className="w-full" />
      </div>

      <div className="flex flex-col justify-start items-center w-[90%] md:w-96 min-h-screen text-center gap-5 px-3 py-5">
        <h1 className="text-3xl text-[var(--text)]">ประวัติการแลกรับของสมนาคุณ</h1>

        {claimedHistory.length > 0 ? (
          <div className="w-full bg-white rounded-xl overflow-hidden">
            <InfiniteScroll
              dataLength={claimedHistory.length}
              next={fetchMoreData}
              hasMore={hasMore}
              loader={<div className="text-center py-2 text-gray-500 text-sm">กำลังโหลด...</div>}
              endMessage={<></>}
            >
              <table className="w-full text-center text-black">
                <thead>
                  <tr className="text-sm bg-gray-50">
                    <th className="p-3">วันเวลา</th>
                    <th className="p-3">รหัสของรางวัล</th>
                    <th className="p-3">จำนวน<br></br>ที่แลก</th>
                    <th className="p-3">สาขาที่<br></br>แลกรับ</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-light">
                  {claimedHistory.map((history, index) => (
                    <tr key={history.claimId} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="p-3">
                        {history.date || "N/A"}
                      </td>
                      <td className="p-3">
                        {history.redeemId === "redeem001" ? "แลกรับ Movie Ticket" :
                          history.redeemId === "redeem003" ? "ส่วนลดค่ากำเหน็จ 40%" :
                            history.redeemId === "redeem004" ? "ส่วนลดค่ากำเหน็จ 500.-" :
                              history.redeemId === "GOLD_BOTH" ? "ทองทั้ง 2 รูปแบบ" : "แลกรับของสมนาคุณ"}
                      </td>
                      <td className="p-3">
                        {history.claimedAmount}
                      </td>
                      <td className="p-3">
                        {history.branchName}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </InfiniteScroll>
          </div>
        ) : (
          <div className="mt-5 text-center h-32 text-black flex items-center justify-center">
            ยังไม่มีประวัติการแลกของรางวัลพิเศษ
          </div>
        )}

        {/* Back button - updated to match other pages */}
        <div className="flex flex-col gap-4 w-full mt-6">
          <Link
            to="/menu"
            className="w-full inline-flex justify-center items-center rounded-md bg-white py-2 px-10 text-sm text-[var(--button)] border border-[var(--button)] shadow-inner shadow-white/10 focus:outline-none hover:bg-gray-100 transition-colors text-center"
          >
            กลับสู่หน้าหลัก
          </Link>
        </div>

        {/* Bottom space */}
        <div className="w-full h-32 md:w-96 relative">
          {/* Bottom space */}
        </div>
      </div>
    </div>
  );
};

export default RedeemHistoryPage;