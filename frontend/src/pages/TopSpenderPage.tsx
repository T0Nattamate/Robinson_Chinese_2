import TopSpenderTermsDialog from "../components/dialogs/TopSpenderTermsDialog";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

import { censorString } from "../data/functions";
import useAuthStore from "../store/AuthStore";
import axiosInterceptor from "../utils/axiosInterceptor";
interface TopSpenderProp {
  rank: number;
  fullname: string;
  accPoints: string;
  phone: string;
  mostFrequentBranch: string;
}

const TopspenderPage = () => {
  const { accessToken } = useAuthStore();
  //const { findBranchNameByBranchId } = useBranchStore();
  const [topspender, setTopspender] = useState<TopSpenderProp[]>([]);
  // const [setLastFetchedTimestamp] = useState<Date | null>(
  //   null
  // );
  const fetchTopSpender = async () => {
    try {
      const response = await axiosInterceptor.get(
        `/user/top-spender`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setTopspender(response.data.topSpenders);
      //setLastFetchedTimestamp(new Date());
      //console.log("refetch");
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    // Fetch data immediately when enter page
    fetchTopSpender();

    // fetch data every 1 minute
    const intervalId = setInterval(fetchTopSpender, 60000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  //Dialog logic
  const [isTermsOpen, setIsTermsOpen] = useState<boolean>(false);
  function formatAmount(amount: string | number): string {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return num.toLocaleString("en-US");
  }

  return (
    <div className="font-kanit bg-[var(--bg)] w-full min-h-screen h-full flex flex-col justify-start items-center relative">
      <div className="w-full h-full min-h-[400px] bg-white md:w-96">
        <img src="//banner_major.webp" alt="header1page" className="w-full" />
      </div>
      <h1 className="text-3xl pt-5 pb-5 relative text-[var(--text)]">Top Spender Ranking</h1>

      {/* Table - Removed borders from rows and cells */}
      <div className="w-[90%] max-w-lg bg-white rounded-xl overflow-hidden">
        {topspender.length > 0 ? (
          <>
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-2 text-center w-5">Rank</th>
                  <th className="p-2 text-center w-60">Name Surname</th>
                  <th className="p-2 text-center w-40">Amount</th>
                  <th className="p-2 text-center w-[15rem]">Mobile No.</th>
                  <th className="p-2 text-center">โรบินไลฟ์สไตล์ สาขา</th>
                </tr>
              </thead>
              <tbody>
                {topspender.map((spender, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="p-2 text-center">{index + 1}.</td>
                    <td className="p-2 text-center">{censorString(spender.fullname)}</td>
                    <td className="p-2 text-center">{formatAmount(spender.accPoints)}</td>
                    <td className="p-2 text-center">{censorString(spender.phone)}</td>
                    <td className="p-2 text-center">{spender.mostFrequentBranch}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : (
          <div className="my-3 text-black h-32 flex justify-center items-center">
            ยังไม่มีรายชื่อ Top Spender
          </div>
        )}
      </div>



      {/* Back Button - Updated to match other pages */}
      <div className="flex flex-col gap-4 w-[90%] max-w-md mt-6 mb-10">
        {/* Terms Button */}
        <button
          className="mt-4 bg-[var(--button)] text-white px-4 py-2 rounded-sm text-sm"
          onClick={() => setIsTermsOpen(true)} // Add onClick handler
        >
          เงื่อนไข Top Spender
        </button>
        <Link
          to="/menu"
          className="w-full inline-flex justify-center items-center rounded-md bg-white py-2 px-10 text-sm text-[var(--button)] border border-[var(--button)] shadow-inner shadow-white/10 focus:outline-none hover:bg-gray-100 transition-colors text-center"
        >
          กลับสู่หน้าหลัก
        </Link>
      </div>
      <div className="w-full h-32 md:w-96 relative">
        {/* Bottom space */}
      </div>
      {/* Add VIP Terms Popup */}
      <TopSpenderTermsDialog
        isTermsOpen={isTermsOpen}
        handleTermsDialogClose={() => setIsTermsOpen(false)}
      />
    </div>

  );
};

export default TopspenderPage;