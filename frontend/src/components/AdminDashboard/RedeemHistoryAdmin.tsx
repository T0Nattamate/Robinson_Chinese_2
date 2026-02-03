/* eslint-disable */
import { Branch } from "../../store/BranchStore";
import { pageSizeChoice } from "../../data/dataVariables";
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
  MdOutlineClear,
  MdOutlineKeyboardArrowLeft,
  MdOutlineKeyboardArrowRight,
  MdRefresh,
} from "react-icons/md";
import MyListBoxItem from "../../styles/MyListBoxItem";
import { useEffect, useState } from "react";
import { RewardRedeemStat, useAdminStore } from "../../store/AdminStore";
import { FaRegCalendar, FaMagnifyingGlass } from "react-icons/fa6";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { formatDateToYYYYMMDD, formatNumber } from "../../data/functions";
import { FiDownload } from "react-icons/fi";
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import useBranchStore from "../../store/BranchStore";
import Swal from "sweetalert2";
import { GoGift } from "react-icons/go";

export type Redemption = {
  date: string;
  branchId: string;
  branchName: string;
  fullname: string;
  phone: string;
  redeemId: string;
};

const RedeemHistoryAdmin = () => {
  const { branches, findBranchNameByBranchId } = useBranchStore();
  const {
    fetchInitialAllRedeem,
    fetchNextAllRedeem,
    fetchInitialBranchRedeem,
    fetchNextBranchRedeem,
    adminData,
    downloadAllRedeem,
    downloadBranchRedeem,
    fetchAllStatRedeem,
    fetchBranchStatRedeem,
  } = useAdminStore();

  const { role, branch } = adminData;
  const isSuperAdmin = role === "superAdmin";

  const [pageSize, setPageSize] = useState("10");
  const [lastVisibleStack, setLastVisibleStack] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [firstItem, setFirstItem] = useState(0);
  const [lastItem, setLastItem] = useState(0);
  const [isClearingFilter, setIsClearingFilter] = useState(false);

  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [phoneFilter, setPhoneFilter] = useState<string>("");
  const [selectedRewardId] = useState<string>("");

  useEffect(() => {
    setStartDate(dateRange[0] || undefined);
    setEndDate(dateRange[1] || undefined);
  }, [dateRange]);

  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Branch | null>(null);
  const [branchName, setBranchName] = useState<string | null>(null);

  useEffect(() => {
    if (branch) {
      setBranchName(findBranchNameByBranchId(branch));
    }
  }, [branch, findBranchNameByBranchId]);

  const filteredBranch = query === "" ? branches : branches.filter(b => b.branchName.toLowerCase().includes(query.toLowerCase()));

  const [redemptionData, setredemptionData] = useState<Redemption[]>([]);
  const [shouldRefetch, setShouldRefetch] = useState<boolean>(false);

  useEffect(() => {
    if (isClearingFilter) return;
    if (phoneFilter || selectedRewardId || startDate || endDate) setLastVisibleStack([]);

    const formattedStartDate = startDate ? formatDateToYYYYMMDD(startDate) : undefined;
    const formattedEndDate = endDate ? formatDateToYYYYMMDD(endDate) : undefined;

    const getRedeemData = async () => {
      let data;
      try {
        if (isSuperAdmin) {
          if (selected === null) data = await fetchInitialAllRedeem(pageSize, selectedRewardId, phoneFilter, formattedStartDate, formattedEndDate);
          else data = await fetchInitialBranchRedeem(selected.branchId, pageSize, selectedRewardId, phoneFilter, formattedStartDate, formattedEndDate);
        } else if (branch) {
          data = await fetchInitialBranchRedeem(branch, pageSize, selectedRewardId, phoneFilter, formattedStartDate, formattedEndDate);
        }

        if (data) {
          const { claimedHistory, totalCount, nextCursor } = data;
          setredemptionData(claimedHistory ?? []);
          setTotalCount(totalCount ?? 0);
          setLastVisibleStack(nextCursor ? [nextCursor] : []);
          setCurrentPage(1);
        }
      } catch (error) {
        console.error(error);
      }
    };
    getRedeemData();
  }, [pageSize, shouldRefetch, startDate, endDate, selectedRewardId, phoneFilter, selected, isSuperAdmin, branch]);

  const handleNextPage = async () => {
    try {
      const formattedStartDate = startDate ? formatDateToYYYYMMDD(startDate) : undefined;
      const formattedEndDate = endDate ? formatDateToYYYYMMDD(endDate) : undefined;
      const lastVisible = lastVisibleStack[currentPage - 1];

      let data;
      if (isSuperAdmin) {
        if (selected === null) data = await fetchNextAllRedeem(pageSize, lastVisible, selectedRewardId, phoneFilter, formattedStartDate, formattedEndDate);
        else data = await fetchNextBranchRedeem(selected.branchId, pageSize, lastVisible, selectedRewardId, phoneFilter, formattedStartDate, formattedEndDate);
      } else if (branch) {
        data = await fetchNextBranchRedeem(branch, pageSize, lastVisible, selectedRewardId, phoneFilter, formattedStartDate, formattedEndDate);
      }

      if (data) {
        const { claimedHistory, nextCursor } = data;
        setCurrentPage(prev => prev + 1);
        setLastVisibleStack(prev => [...prev, nextCursor || "0"]);
        setredemptionData(claimedHistory ?? []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handlePreviousPage = async () => {
    if (currentPage <= 1) return;
    try {
      const formattedStartDate = startDate ? formatDateToYYYYMMDD(startDate) : undefined;
      const formattedEndDate = endDate ? formatDateToYYYYMMDD(endDate) : undefined;
      const lastVisible = lastVisibleStack[currentPage - 3];

      let data;
      if (isSuperAdmin) {
        if (selected === null) data = await fetchNextAllRedeem(pageSize, lastVisible, selectedRewardId, phoneFilter, formattedStartDate, formattedEndDate);
        else data = await fetchNextBranchRedeem(selected.branchId, pageSize, lastVisible, selectedRewardId, phoneFilter, formattedStartDate, formattedEndDate);
      } else if (branch) {
        data = await fetchNextBranchRedeem(branch, pageSize, lastVisible, selectedRewardId, phoneFilter, formattedStartDate, formattedEndDate);
      }

      if (data) {
        setCurrentPage(prev => prev - 1);
        setLastVisibleStack(prev => prev.slice(0, prev.length - 1));
        setredemptionData(data.claimedHistory ?? []);
      }
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

  const refreshData = () => {
    setCurrentPage(1);
    setLastVisibleStack([]);
    setShouldRefetch(prev => !prev);
  };

  const handleDownloadExcel = async () => {
    try {
      const formattedStartDate = startDate ? formatDateToYYYYMMDD(startDate) : undefined;
      const formattedEndDate = endDate ? formatDateToYYYYMMDD(endDate) : undefined;
      if (isSuperAdmin) {
        if (selected === null) await downloadAllRedeem(phoneFilter, selectedRewardId, formattedStartDate, formattedEndDate);
        else await downloadBranchRedeem(selected.branchId, phoneFilter, selectedRewardId, formattedStartDate, formattedEndDate);
      } else if (branch) {
        await downloadBranchRedeem(branch, phoneFilter, selectedRewardId, formattedStartDate, formattedEndDate);
      }
    } catch (error) {
      let errorMessage = "เกิดข้อผิดพลาดในการดาวน์โหลด";
      if (error instanceof Error) {
        if (error.message === "Network Error") errorMessage = "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้";
        else if (error.message === "No data found") errorMessage = "ไม่พบข้อมูลสำหรับการดาวน์โหลด";
        else if (error.message.includes("404")) errorMessage = "ไม่พบข้อมูลที่ต้องการดาวน์โหลด";
      }
      Swal.fire({ icon: "error", text: errorMessage, confirmButtonText: "ยืนยัน", customClass: { htmlContainer: "font-kanit", confirmButton: "bg-gray-700 text-white rounded-md font-kanit" } });
    }
  };

  const [statData, setStatData] = useState<RewardRedeemStat[]>([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        let statResults: RewardRedeemStat[] = [];
        const fetchStat = async (redeemId: string, bId?: string): Promise<RewardRedeemStat[]> => {
          if (bId) {
            const data = await fetchBranchStatRedeem(redeemId, bId);
            const dataArray = Array.isArray(data) ? data : [data];
            return dataArray.filter((item): item is RewardRedeemStat => item !== undefined);
          } else {
            const data = await fetchAllStatRedeem(redeemId);
            return data?.filter((item): item is RewardRedeemStat => item !== undefined) ?? [];
          }
        };

        if (isSuperAdmin) {
          const s1 = await fetchStat("redeem001", selected?.branchId);
          const s3 = await fetchStat("redeem003", selected?.branchId);
          const s4 = await fetchStat("redeem004", selected?.branchId);
          statResults = [...s1, ...s3, ...s4];
        } else if (branch) {
          const s1 = await fetchStat("redeem001", branch);
          const s3 = await fetchStat("redeem003", branch);
          const s4 = await fetchStat("redeem004", branch);
          statResults = [...s1, ...s3, ...s4];
        }
        setStatData(statResults);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, [selected, branch, isSuperAdmin, fetchAllStatRedeem, fetchBranchStatRedeem]);

  const maxDate = new Date();

  return (
    <div className="p-6 lg:p-10 space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">ประวัติการแลกรับสิทธิ์</h1>
          <p className="text-gray-500 mt-1">ตรวจสอบรายการแลกรับของสมนาคุณและสถิติในแต่ละสาขา</p>
        </div>

        <div className="flex items-center gap-3">
          {isSuperAdmin ? (
            <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl shadow-sm border border-gray-100">
              <button
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selected === null
                  ? "bg-[var(--red)] text-white shadow-md shadow-red-100"
                  : "text-gray-600 hover:bg-gray-50"
                  }`}
                onClick={() => setSelected(null)}
              >
                ทั้งหมด
              </button>
              <Combobox value={selected} onChange={setSelected} onClose={() => setQuery("")}>
                <div className="relative w-48 md:w-64">
                  <ComboboxInput
                    className="w-full rounded-lg border-none bg-gray-50 pr-10 pl-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-red-500/20 transition-all outline-none"
                    placeholder="ค้นหาสาขา..."
                    displayValue={(b: Branch) => b?.branchName || ""}
                    onChange={(event) => setQuery(event.target.value)}
                  />
                  <ComboboxButton className="absolute inset-y-0 right-0 px-2.5 text-gray-400">
                    <MdKeyboardArrowDown className="size-5" />
                  </ComboboxButton>
                  <ComboboxOptions anchor="bottom end" transition className="w-[var(--input-width)] mt-2 rounded-xl border border-gray-100 bg-white shadow-xl p-1 z-[100] transition duration-100 ease-in data-[leave]:data-[closed]:opacity-0">
                    {filteredBranch.map((b) => (
                      <ComboboxOption key={b.branchId} value={b} className="group flex items-center gap-2 rounded-lg py-2 px-3 select-none data-[focus]:bg-red-50 data-[focus]:text-[var(--red)] cursor-pointer transition-colors">
                        <span className="text-sm font-medium">{b.branchName}</span>
                      </ComboboxOption>
                    ))}
                  </ComboboxOptions>
                </div>
              </Combobox>
            </div>
          ) : (
            <div className="bg-red-50 text-[var(--red)] px-4 py-2 rounded-xl border border-red-100 font-bold text-sm">
              โรบินสันสาขา {branchName ? branchName : "ไม่พบสาขา"}
            </div>
          )}
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statData.map((item, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 group hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-[var(--red)]">
                <GoGift size={20} />
              </div>
              <h3 className="text-sm font-bold text-gray-900 line-clamp-1">
                {item.redeemId === "redeem001" ? 'บัตรชมภาพยนตร์ 2 ใบ' :
                  item.redeemId === "redeem003" ? 'ส่วนลดค่ากำเหน็จ 40%' :
                    item.redeemId === "redeem004" ? 'ส่วนลดค่ากำเหน็จ 500.-' : item.redeemId}
              </h3>
            </div>
            <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1">
              {item.branchId ? 'แลกแล้วในสาขานี้' : 'แลกแล้วทั้งหมด'}
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-gray-900">{formatNumber(item.gotRedeemded !== undefined ? item.gotRedeemded : item.sumgotRedeemded)}</span>
              <span className="text-xs font-bold text-gray-400">รายการ</span>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <FaRegCalendar size={14} />
              </div>
              <DatePicker
                selectsRange startDate={startDate} endDate={endDate}
                onChange={(update) => setDateRange(update)}
                placeholderText="เลือกช่วงวันที่แลกรับ" calendarStartDay={1} maxDate={maxDate}
                className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-red-500/20 outline-none transition-all"
              />
              {(startDate || endDate) && (
                <button className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-300 hover:text-red-500" onClick={async () => { setIsClearingFilter(true); setDateRange([null, null]); await new Promise(r => setTimeout(r, 0)); setIsClearingFilter(false); refreshData(); }}>
                  <MdOutlineClear size={18} />
                </button>
              )}
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <FaMagnifyingGlass size={14} />
              </div>
              <input
                type="tel" maxLength={10} value={phoneFilter}
                onInput={(e) => setPhoneFilter((e.target as HTMLInputElement).value.replace(/\D/g, ""))}
                placeholder="ค้นหาเบอร์โทรศัพท์..."
                className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-red-500/20 outline-none transition-all"
              />
              {phoneFilter && <button className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-300" onClick={() => { setPhoneFilter(""); refreshData(); }}><MdOutlineClear size={18} /></button>}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={refreshData} className="p-3 rounded-xl border border-gray-100 hover:bg-gray-50 text-gray-500 transition-colors shadow-sm bg-white active:scale-95"><MdRefresh size={20} /></button>
            {isSuperAdmin && (
              <button onClick={handleDownloadExcel} className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-black transition-all shadow-lg shadow-gray-200 font-medium text-sm"><FiDownload size={18} /><span>ดาวน์โหลด Excel</span></button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-500">วันเวลาที่แลกสิทธิ์</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-500">พิกัด/สาขา</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-500">ข้อมูลลูกค้า</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-500 text-right">ชื่อรางวัล</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {redemptionData.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-20 text-center"><div className="text-gray-300 mb-2 text-4xl">🎁</div><div className="text-gray-500 font-medium">ไม่พบรายการแลกรับสิทธิ์</div></td></tr>
              ) : (
                redemptionData.map((redemption, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xs font-medium text-gray-900">{redemption.date}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-gray-600 line-clamp-1">{redemption.branchName}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-bold text-gray-800">{redemption.fullname}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">{redemption.phone}</div>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="text-xs font-bold text-[var(--red)] bg-red-50 px-3 py-1 rounded-lg border border-red-100 inline-block">
                        {redemption.redeemId === "redeem001" ? "บัตรชมภาพยนตร์ 2 ใบ" :
                          redemption.redeemId === "redeem003" ? "ส่วนลดค่ากำเหน็จ 40%" :
                            redemption.redeemId === "redeem004" ? "ส่วนลดค่ากำเหน็จ 500.-" : redemption.redeemId}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Select aria-label="Items per page" className="flex items-center gap-2" selectedKey={pageSize} onSelectionChange={k => setPageSize(k as string)}>
              <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">ต่อหน้า:</Label>
              <div className="relative">
                <Button className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-700 flex items-center gap-2 hover:border-gray-300 transition-colors shadow-sm outline-none"><SelectValue /><MdKeyboardArrowDown size={14} className="text-gray-400" /></Button>
                <Popover className="overflow-auto rounded-xl bg-white shadow-xl border border-gray-100 p-1 z-[100]"><ListBox className="outline-none">{pageSizeChoice.map(sz => (<MyListBoxItem key={sz} id={sz}>{sz}</MyListBoxItem>))}</ListBox></Popover>
              </div>
            </Select>
            <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider pt-0.5">แสดง {firstItem}-{lastItem} จากทั้งหมด {totalCount} รายการ</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handlePreviousPage} disabled={currentPage <= 1} className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-all shadow-sm"><MdOutlineKeyboardArrowLeft size={20} /></button>
            <div className="flex items-center gap-1.5 px-4 h-9 bg-white border border-gray-200 rounded-xl shadow-sm"><span className="text-xs font-bold text-gray-900">{currentPage}</span><span className="text-gray-300 mx-0.5">/</span><span className="text-xs font-bold text-gray-400">{totalPages || 1}</span></div>
            <button onClick={handleNextPage} disabled={currentPage >= totalPages} className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-all shadow-sm"><MdOutlineKeyboardArrowRight size={20} /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RedeemHistoryAdmin;
