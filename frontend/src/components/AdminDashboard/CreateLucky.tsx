/* eslint-disable */
import { FaRegTrashAlt } from "react-icons/fa";
import { useEffect, useState } from "react";
import { useAdminStore } from "../../store/AdminStore";
import CreateNewLuckyDialog from "../dialogs/admin/CreateNewLuckyDialog";
import LuckyDialog from "../dialogs/admin/LuckyDialog";
import ConfirmDeleteLucky from "../dialogs/admin/ConfirmDeleteLucky";
import { LuckyResponse } from "../../store/AdminStore";
import { GoTrophy, GoPlus } from "react-icons/go";

const CreateLucky = () => {
  const { setUniversalOverlayFalse, setUniversalOverlayTrue, getLuckyByAdmin } =
    useAdminStore();

  const [luckyData, setluckyData] = useState<LuckyResponse[]>([]);
  const [shouldRefetch, setShouldRefetch] = useState<boolean>(false);

  useEffect(() => {
    const getluckyData = async () => {
      try {
        const data = await getLuckyByAdmin();
        const filteredData = data.filter(
          (item): item is LuckyResponse => !!item
        );
        setluckyData(filteredData);
      } catch (error) {
        console.error(error);
      }
    };
    getluckyData();
  }, [shouldRefetch, getLuckyByAdmin]);

  const [isCreateAdminOpen, setIsCreateAdminOpen] = useState<boolean>(false);
  const handleCreateAdminOpenDialog = () => {
    setIsCreateAdminOpen(true);
    setUniversalOverlayTrue();
  };
  const handleCreateAdminDialogClose = () => {
    setIsCreateAdminOpen(false);
    setUniversalOverlayFalse();
  };

  const refreshData = () => {
    setShouldRefetch((prev) => !prev);
  };

  const [isLuckyOpen, setIsBranchAdminOpen] = useState<boolean>(false);
  const [selectedLucky, setselectedLucky] = useState<LuckyResponse | null>(null);

  const handleBranchAdminDialogClose = () => {
    setIsBranchAdminOpen(false);
    setUniversalOverlayFalse();
  };

  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState<boolean>(false);
  const handleDeleteAdminOpenDialog = (lucky: LuckyResponse) => {
    setselectedLucky(lucky);
    setIsConfirmDeleteOpen(true);
    setUniversalOverlayTrue();
  };

  const handleDeleteDialogClose = () => {
    setIsConfirmDeleteOpen(false);
    setUniversalOverlayFalse();
  };

  return (
    <div className="p-6 lg:p-10 space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">รายชื่อผู้โชคดี</h1>
          <p className="text-gray-500 mt-1">ประกาศรายชื่อผู้โชคดีได้รับรางวัลสุดพิเศษประจำสัปดาห์</p>
        </div>

        <button
          className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-black transition-all shadow-lg shadow-gray-200 font-bold active:scale-[0.98]"
          onClick={handleCreateAdminOpenDialog}
        >
          <GoPlus size={20} />
          <span>สร้างรายชื่อผู้โชคดี</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-widest text-gray-400">ลำดับ (No.)</th>
                <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-widest text-gray-400">ข้อมูลผู้โชคดี (Winner Details)</th>
                <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-widest text-gray-400">สาขา (Branch)</th>
                <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-widest text-gray-400 text-center">สัปดาห์ที่ได้รับ</th>
                <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-widest text-gray-400 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {luckyData.length === 0 ? (
                <tr><td colSpan={5} className="px-8 py-20 text-center text-gray-400 font-medium font-poppins italic">No lucky winners announced yet...</td></tr>
              ) : (
                luckyData.map((lucky, index) => (
                  <tr key={index} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-4 whitespace-nowrap">
                      <span className="text-xs font-bold text-gray-400">#{String(index + 1).padStart(2, '0')}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 border border-amber-100">
                          <GoTrophy size={18} />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900">{lucky.fullname}</div>
                          <div className="text-[10px] text-gray-400 font-medium mt-0.5">{lucky.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xs font-medium text-gray-600">{lucky.mostBranchName}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-3 py-1 bg-red-50 text-[var(--red)] rounded-lg text-[10px] font-black border border-red-100">
                        WEEK {lucky.week}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-right">
                      <button
                        onClick={() => handleDeleteAdminOpenDialog(lucky)}
                        className="p-2.5 rounded-xl bg-gray-50 text-gray-300 hover:bg-red-50 hover:text-red-500 transition-all shadow-sm"
                      >
                        <FaRegTrashAlt size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CreateNewLuckyDialog
        isCreateAdminOpen={isCreateAdminOpen}
        handleCreateAdminDialogClose={handleCreateAdminDialogClose}
        refreshData={refreshData}
      />
      <LuckyDialog
        isLuckyOpen={isLuckyOpen}
        handleBranchAdminDialogClose={handleBranchAdminDialogClose}
        refreshData={refreshData}
        lucky={selectedLucky}
      />
      <ConfirmDeleteLucky
        isConfirmDeleteOpen={isConfirmDeleteOpen}
        handleDeleteDialogClose={handleDeleteDialogClose}
        refreshData={refreshData}
        lucky={selectedLucky}
      />
    </div>
  );
};

export default CreateLucky;
