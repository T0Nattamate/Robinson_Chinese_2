/* eslint-disable */
import useBranchStore from "../../store/BranchStore";
import { pageSizeChoice } from "../../data/dataVariables";
import { FaUserCircle } from "react-icons/fa";
import Switch from "react-switch";
import {
  Button,
  Label,
  ListBox,
  Popover,
  Select,
  SelectValue,
} from "react-aria-components";
import {
  MdKeyboardArrowDown,
  MdOutlineKeyboardArrowLeft,
  MdOutlineKeyboardArrowRight,
} from "react-icons/md";
import MyListBoxItem from "../../styles/MyListBoxItem";
import { useEffect, useState } from "react";
import { useAdminStore } from "../../store/AdminStore";
import CreateNewAdminDialog from "../dialogs/admin/CreateNewAdminDialog";
import BranchAdminDialog from "../dialogs/admin/BranchAdminDialog";
import ConfirmDeleteAdminDialog from "../dialogs/admin/ConfirmDeleteAdminDialog";
import { GoPlus } from "react-icons/go";
import { LuPencil } from "react-icons/lu";

export interface AdminList {
  adminId: string;
  role: "branchAdmin" | "superAdmin";
  password: string;
  username: string;
  branchId: string;
  isEnable: boolean;
  isMfa: string | null;
}

const CreateAdmin = () => {
  const { findBranchNameByBranchId } = useBranchStore();
  const {
    setUniversalOverlayFalse,
    setUniversalOverlayTrue,
    fetchInitialAdmin,
    fetchNextAdmin,
    enableAdmin,
  } = useAdminStore();

  const [pageSize, setPageSize] = useState("10");
  const [lastVisibleStack, setLastVisibleStack] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [firstItem, setFirstItem] = useState(0);
  const [lastItem, setLastItem] = useState(0);

  const [adminData, setAdminData] = useState<AdminList[]>([]);
  const [shouldRefetch, setShouldRefetch] = useState<boolean>(false);

  useEffect(() => {
    const getAdminData = async () => {
      try {
        const data = await fetchInitialAdmin(pageSize);
        const { admins, totalCount, nextCursor } = data;
        setAdminData(admins ?? []);
        setTotalCount(totalCount ?? 0);
        setLastVisibleStack(nextCursor ? [nextCursor] : []);
        setCurrentPage(1);
      } catch (error) {
        console.error(error);
      }
    };
    getAdminData();
  }, [pageSize, shouldRefetch, fetchInitialAdmin]);

  const handleNextPage = async () => {
    try {
      const lastVisible = lastVisibleStack[currentPage - 1];
      const data = await fetchNextAdmin(pageSize, lastVisible);
      const { admins, nextCursor } = data;
      setCurrentPage(prev => prev + 1);
      setLastVisibleStack(prev => [...prev, nextCursor || "0"]);
      setAdminData(admins ?? []);
    } catch (error) {
      console.error(error);
    }
  };

  const handlePreviousPage = async () => {
    if (currentPage <= 1) return;
    try {
      const lastVisible = lastVisibleStack[currentPage - 3];
      const data = await fetchNextAdmin(pageSize, lastVisible);
      setCurrentPage(prev => prev - 1);
      setLastVisibleStack(prev => prev.slice(0, prev.length - 1));
      setAdminData(data.admins ?? []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const pageSizeNumber = Number(pageSize);
    if (currentPage > 0) {
      setFirstItem((currentPage - 1) * pageSizeNumber + 1);
      setLastItem(Math.min(currentPage * pageSizeNumber, totalCount));
    } else {
      setFirstItem(0);
      setLastItem(0);
    }
  }, [currentPage, pageSize, totalCount]);

  const totalPages = Math.ceil(totalCount / Number(pageSize));

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
    setCurrentPage(1);
    setLastVisibleStack([]);
    setShouldRefetch(prev => !prev);
  };

  const [isBranchAdminOpen, setIsBranchAdminOpen] = useState<boolean>(false);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminList | null>(null);

  const handleBranchAdminOpenDialog = (admin: AdminList) => {
    setSelectedAdmin(admin);
    setIsBranchAdminOpen(true);
    setUniversalOverlayTrue();
  };

  const handleBranchAdminDialogClose = () => {
    setIsBranchAdminOpen(false);
    setUniversalOverlayFalse();
  };

  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState<boolean>(false);

  const handleAdminEnable = async (adminId: string, isEnabled: boolean) => {
    try {
      await enableAdmin(adminId, isEnabled);
      const lastVisible = lastVisibleStack[currentPage - 2];
      const data = await fetchNextAdmin(pageSize, lastVisible);
      setAdminData(data.admins ?? []);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteDialogClose = () => {
    setIsConfirmDeleteOpen(false);
    setUniversalOverlayFalse();
  };

  const handleChangeSelectionPageSize = (key: string | number) => {
    setPageSize(key as string);
    setCurrentPage(1);
    setLastVisibleStack([]);
    setShouldRefetch(prev => !prev);
  };

  return (
    <div className="p-6 lg:p-10 space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">รายชื่อทีมแอดมิน</h1>
          <p className="text-gray-500 mt-1">จัดการสิทธิ์การเข้าถึงและความปลอดภัยของพนักงานในแต่ละสาขา</p>
        </div>

        <button
          className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-black transition-all shadow-lg shadow-gray-200 font-bold active:scale-[0.98]"
          onClick={handleCreateAdminOpenDialog}
        >
          <GoPlus size={20} />
          <span>สร้างแอดมินใหม่</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-widest text-gray-400">ข้อมูลแอดมิน (Admin Account)</th>
                <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-widest text-gray-400 text-center">สิทธิ์การใช้งาน (Role)</th>
                <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-widest text-gray-400">สังกัดสาขา (Branch)</th>
                <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-widest text-gray-400 text-center">สถานะบัญชี</th>
                <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-widest text-gray-400 text-right">ดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {adminData.length === 0 ? (
                <tr><td colSpan={5} className="px-8 py-20 text-center text-gray-400 font-medium">ไม่พบข้อมูลแอดมินในระบบ</td></tr>
              ) : (
                adminData.map((admin, idx) => (
                  <tr key={idx} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-[var(--red)] border border-red-100/50">
                          <FaUserCircle size={22} />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900">{admin.username}</div>
                          <div className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">ID: {admin.adminId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${admin.role === 'superAdmin'
                        ? 'bg-purple-50 text-purple-600 border-purple-100'
                        : 'bg-blue-50 text-blue-600 border-blue-100'
                        }`}>
                        {admin.role === 'superAdmin' ? 'SUPER ADMIN' : 'BRANCH ADMIN'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-medium text-gray-600">
                        {admin.branchId ? findBranchNameByBranchId(admin.branchId) : "สำนักงานใหญ่ (HQ)"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <Switch
                          checked={admin.isEnable}
                          onChange={(isChecked) => handleAdminEnable(admin.adminId, isChecked)}
                          onColor="#000"
                          offColor="#e5e7eb"
                          handleDiameter={18}
                          uncheckedIcon={false}
                          checkedIcon={false}
                          boxShadow="0px 1px 5px rgba(0, 0, 0, 0.2)"
                          activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                          height={24}
                          width={44}
                          className="react-switch"
                        />
                      </div>
                    </td>
                    <td className="px-8 py-4 text-right">
                      <button
                        onClick={() => handleBranchAdminOpenDialog(admin)}
                        className="p-2.5 rounded-xl bg-gray-50 text-gray-400 hover:bg-gray-900 hover:text-white transition-all shadow-sm"
                      >
                        <LuPencil size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-8 py-5 bg-gray-50/50 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <Select aria-label="Items per page" className="flex items-center gap-3" selectedKey={pageSize} onSelectionChange={k => handleChangeSelectionPageSize(k as string)}>
              <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">ต่อหน้า:</Label>
              <div className="relative">
                <Button className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs font-bold text-gray-700 flex items-center gap-3 hover:border-gray-300 transition-all shadow-sm outline-none"><SelectValue /><MdKeyboardArrowDown size={16} className="text-gray-400" /></Button>
                <Popover className="overflow-auto rounded-xl bg-white shadow-2xl border border-gray-100 p-1.5 z-[100] min-w-[100px]"><ListBox className="outline-none space-y-1">{pageSizeChoice.map(sz => (<MyListBoxItem key={sz} id={sz}>{sz}</MyListBoxItem>))}</ListBox></Popover>
              </div>
            </Select>
            <div className="h-4 w-[1px] bg-gray-200 hidden md:block"></div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">แสดง {firstItem}-{lastItem} จาก {totalCount} รายการ</span>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={handlePreviousPage} disabled={currentPage <= 1} className="p-2.5 rounded-xl bg-white border border-gray-200 text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 hover:text-gray-900 transition-all shadow-sm"><MdOutlineKeyboardArrowLeft size={24} /></button>
            <div className="flex items-center gap-2 px-5 h-11 bg-white border border-gray-200 rounded-xl shadow-sm">
              <span className="text-sm font-black text-gray-900">{currentPage}</span>
              <span className="text-gray-300 font-light mx-0.5">/</span>
              <span className="text-sm font-black text-gray-300">{totalPages || 1}</span>
            </div>
            <button onClick={handleNextPage} disabled={currentPage >= totalPages} className="p-2.5 rounded-xl bg-white border border-gray-200 text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 hover:text-gray-900 transition-all shadow-sm"><MdOutlineKeyboardArrowRight size={24} /></button>
          </div>
        </div>
      </div>

      <CreateNewAdminDialog
        isCreateAdminOpen={isCreateAdminOpen}
        handleCreateAdminDialogClose={handleCreateAdminDialogClose}
        refreshData={refreshData}
      />
      <BranchAdminDialog
        isBranchAdminOpen={isBranchAdminOpen}
        handleBranchAdminDialogClose={handleBranchAdminDialogClose}
        refreshData={refreshData}
        admin={selectedAdmin}
      />
      <ConfirmDeleteAdminDialog
        isConfirmDeleteOpen={isConfirmDeleteOpen}
        handleDeleteDialogClose={handleDeleteDialogClose}
        refreshData={refreshData}
        admin={selectedAdmin}
      />
    </div>
  );
};

export default CreateAdmin;
