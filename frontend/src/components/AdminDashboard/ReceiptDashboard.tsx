/* eslint-disable */
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import { useEffect, useState } from "react";
import {
  MdKeyboardArrowDown,
  MdOutlineClear,
  MdOutlineKeyboardArrowLeft,
  MdOutlineKeyboardArrowRight,
  MdRefresh,
} from "react-icons/md";
import {
  FaCircleCheck,
  FaCircleMinus,
  FaCircleXmark,
  FaMagnifyingGlass,
  FaRegCalendar,
} from "react-icons/fa6";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Swal from "sweetalert2";
import { FiDownload } from "react-icons/fi";

import ApproveDialog from "../dialogs/admin/ApproveDialog";
import { useAdminStore } from "../../store/AdminStore";
import { Branch } from "../../store/BranchStore";
import useBranchStore from "../../store/BranchStore";
import { formatThaiDateTime, formatDateToYYYYMMDD } from "../../data/functions";
import { status, pageSizeChoice } from "../../data/dataVariables";

import {
  Button,
  Label,
  Select,
  Popover,
  ListBox,
  SelectValue,
} from "react-aria-components";
import MyListBoxItem from "../../styles/MyListBoxItem";

export interface Receipt {
  branchName: string;
  branchId: string;
  lineId: string;
  receiptNo: string;
  fullname: string;
  phone: string;
  amount: number;
  storeId: string;
  storeName: string;
  receiptImage: string;
  status: string;
  updatedAt: string;
  receiptDate: string;
  receiptId: number;
  uploadedAt: string;
  canLuckydraw?: boolean;
  canBag?: boolean;
  canVip?: boolean;
}

interface StatusDetails {
  key: string;
  icon: JSX.Element;
  textTH: string;
  textEN: string;
}

const ReceiptDashboard = () => {
  const { branches, findBranchNameByBranchId } = useBranchStore();
  const {
    setUniversalOverlayTrue,
    setUniversalOverlayFalse,
    fetchInitialAllReceipts,
    adminData,
    fetchInitialBranchReceipts,
    fetchNextAllReceipts,
    fetchNextBranchReceipts,
    downloadAllReceipt,
    downloadBranchReceipt,
  } = useAdminStore();

  const { role, branch } = adminData;
  const isSuperAdmin = role === "superAdmin";

  const [branchName, setBranchName] = useState<string | null>(null);
  useEffect(() => {
    if (branch) {
      const name = findBranchNameByBranchId(branch);
      setBranchName(name);
    }
  }, [branch, findBranchNameByBranchId]);

  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Branch | null>(null);

  const filteredBranch =
    query === ""
      ? branches
      : branches.filter((b) =>
        b.branchName.toLowerCase().includes(query.toLowerCase())
      );

  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  useEffect(() => {
    setStartDate(dateRange[0] || undefined);
    setEndDate(dateRange[1] || undefined);
  }, [dateRange]);

  const [phoneFilter, setPhoneFilter] = useState<string>("");
  const [receiptFilter, setReceiptFilter] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  const [isPicOpen, setIsPicOpen] = useState<boolean>(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);

  const handleOpenDialog = (receipt: Receipt) => {
    setSelectedReceipt(receipt);
    setIsPicOpen(true);
    setUniversalOverlayTrue();
  };
  const handlePicDialogClose = () => {
    setSelectedReceipt(null);
    setIsPicOpen(false);
    setUniversalOverlayFalse();
  };

  const [pageSize, setPageSize] = useState("10");
  const [lastVisibleStack, setLastVisibleStack] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isClearingFilter, setIsClearingFilter] = useState(false);
  const [receiptData, setReceiptData] = useState<Receipt[]>([]);
  const [shouldRefetch, setShouldRefetch] = useState<boolean>(false);

  useEffect(() => {
    const getReceipts = async () => {
      if (isClearingFilter) return;
      try {
        if (phoneFilter || receiptFilter || startDate || endDate || selectedStatus || selected !== null) {
          setLastVisibleStack([]);
        }

        const formattedStartDate = startDate ? formatDateToYYYYMMDD(startDate) : undefined;
        const formattedEndDate = endDate ? formatDateToYYYYMMDD(endDate) : undefined;

        let data;
        if (isSuperAdmin) {
          if (selected === null) {
            data = await fetchInitialAllReceipts(pageSize, receiptFilter, phoneFilter, formattedStartDate, formattedEndDate, selectedStatus);
          } else {
            data = await fetchInitialBranchReceipts(selected.branchId, pageSize, receiptFilter, phoneFilter, formattedStartDate, formattedEndDate, selectedStatus);
          }
        } else if (branch) {
          data = await fetchInitialBranchReceipts(branch, pageSize, receiptFilter, phoneFilter, formattedStartDate, formattedEndDate, selectedStatus);
        }

        if (data) {
          setReceiptData(data.receiptHistory ?? []);
          setTotalCount(data.totalCount ?? 0);
          if (data.nextCursor != null) {
            setLastVisibleStack([data.nextCursor as number]);
          } else {
            setLastVisibleStack([]);
          }
          setCurrentPage(1);
        }
      } catch (error) {
        console.error("Error fetching receipts:", error);
      }
    };
    getReceipts();
  }, [selected, pageSize, shouldRefetch, startDate, endDate, phoneFilter, receiptFilter, isClearingFilter, selectedStatus, branch, fetchInitialAllReceipts, fetchInitialBranchReceipts, isSuperAdmin]);

  const handleNextPage = async () => {
    try {
      const formattedStartDate = startDate ? formatDateToYYYYMMDD(startDate) : undefined;
      const formattedEndDate = endDate ? formatDateToYYYYMMDD(endDate) : undefined;
      const lastVisible = lastVisibleStack[currentPage - 1];

      let data;
      if (isSuperAdmin) {
        if (selected === null) {
          data = await fetchNextAllReceipts(pageSize, lastVisible, receiptFilter, phoneFilter, formattedStartDate, formattedEndDate, selectedStatus);
        } else {
          data = await fetchNextBranchReceipts(selected.branchId, pageSize, lastVisible, receiptFilter, phoneFilter, formattedStartDate, formattedEndDate, selectedStatus);
        }
      } else if (branch) {
        data = await fetchNextBranchReceipts(branch, pageSize, lastVisible, receiptFilter, phoneFilter, formattedStartDate, formattedEndDate, selectedStatus);
      }

      if (data) {
        const { nextCursor, totalCount } = data;
        setCurrentPage((prev) => prev + 1);
        if (nextCursor) {
          setLastVisibleStack((prev) => [...prev, nextCursor]);
        } else {
          setLastVisibleStack((prev) => [...prev, 0]);
        }
        setReceiptData(data.receiptHistory ?? []);
        setTotalCount(totalCount ?? 0);
      }
    } catch (error) {
      console.error("Error fetching next page:", error);
    }
  };

  const handlePreviousPage = async () => {
    try {
      if (currentPage <= 1) return;
      const formattedStartDate = startDate ? formatDateToYYYYMMDD(startDate) : undefined;
      const formattedEndDate = endDate ? formatDateToYYYYMMDD(endDate) : undefined;
      const lastVisible = lastVisibleStack[currentPage - 3];

      let data;
      if (isSuperAdmin) {
        if (selected === null) {
          data = await fetchNextAllReceipts(pageSize, lastVisible, receiptFilter, phoneFilter, formattedStartDate, formattedEndDate, selectedStatus);
        } else {
          data = await fetchNextBranchReceipts(selected.branchId, pageSize, lastVisible, receiptFilter, phoneFilter, formattedStartDate, formattedEndDate, selectedStatus);
        }
      } else if (branch) {
        data = await fetchNextBranchReceipts(branch, pageSize, lastVisible, receiptFilter, phoneFilter, formattedStartDate, formattedEndDate, selectedStatus);
      }

      if (data) {
        setCurrentPage((prev) => prev - 1);
        setLastVisibleStack((prev) => prev.slice(0, prev.length - 1));
        setReceiptData(data.receiptHistory ?? []);
      }
    } catch (error) {
      console.error("Error fetching previous page:", error);
    }
  };

  const refreshData = () => {
    setCurrentPage(1);
    setLastVisibleStack([]);
    setShouldRefetch((prev) => !prev);
  };

  const fetchSamePage = async () => {
    try {
      const formattedStartDate = startDate ? formatDateToYYYYMMDD(startDate) : undefined;
      const formattedEndDate = endDate ? formatDateToYYYYMMDD(endDate) : undefined;
      const lastVisible = lastVisibleStack[currentPage - 2];

      let data;
      if (isSuperAdmin) {
        if (selected === null) {
          data = await fetchNextAllReceipts(pageSize, lastVisible, receiptFilter, phoneFilter, formattedStartDate, formattedEndDate, selectedStatus);
        } else {
          data = await fetchNextBranchReceipts(selected.branchId, pageSize, lastVisible, receiptFilter, phoneFilter, formattedStartDate, formattedEndDate, selectedStatus);
        }
      } else if (branch) {
        data = await fetchNextBranchReceipts(branch, pageSize, lastVisible, receiptFilter, phoneFilter, formattedStartDate, formattedEndDate, selectedStatus);
      }

      if (data) {
        setReceiptData(data.receiptHistory ?? []);
      }
    } catch (error) {
      console.error("Error fetching same page:", error);
    }
  };

  const [firstItem, setFirstItem] = useState(0);
  const [lastItem, setLastItem] = useState(0);
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

  const getStatusDetails = (statusKey: string): StatusDetails | null => {
    switch (statusKey) {
      case "approved":
        return { key: "approved", icon: <FaCircleCheck size={14} className="text-green-600" />, textTH: "ถูกต้อง", textEN: "Approved" };
      case "pending":
        return { key: "pending", icon: <FaCircleMinus size={14} className="text-amber-600" />, textTH: "รอตรวจสอบ", textEN: "Under review" };
      case "rejected":
        return { key: "rejected", icon: <FaCircleXmark size={14} className="text-red-600" />, textTH: "เลขที่ใบเสร็จผิด", textEN: "Incorrect receipt number" };
      case "invalidImage":
        return { key: "invalidImage", icon: <FaCircleXmark size={14} className="text-red-600" />, textTH: "ภาพไม่ชัด/ภาพไม่ถูกต้อง", textEN: "Invalid image" };
      case "amountDontMatch":
        return { key: "amountDontMatch", icon: <FaCircleXmark size={14} className="text-red-600" />, textTH: "ยอดซื้อไม่ตรงกับใบเสร็จ", textEN: "Amount entered and upload don't match" };
      case "breakRules":
        return { key: "breakRules", icon: <FaCircleXmark size={14} className="text-red-600" />, textTH: "ยอดสั่งซื้อไม่ตรงตามเงื่อนไข", textEN: "Purchase amount is insufficient." };
      case "duplicated":
        return { key: "duplicated", icon: <FaCircleXmark size={14} className="text-red-600" />, textTH: "ใบเสร็จซ้ำกับใบที่อนุมัติแล้ว", textEN: "This receipt has already approved." };
      default:
        return null;
    }
  };

  const handleDownloadExcel = async () => {
    try {
      const formattedStartDate = startDate ? formatDateToYYYYMMDD(startDate) : undefined;
      const formattedEndDate = endDate ? formatDateToYYYYMMDD(endDate) : undefined;
      if (isSuperAdmin) {
        if (selected === null) {
          await downloadAllReceipt(receiptFilter, phoneFilter, formattedStartDate, formattedEndDate, selectedStatus);
        } else {
          await downloadBranchReceipt(selected.branchId, receiptFilter, phoneFilter, formattedStartDate, formattedEndDate, selectedStatus);
        }
      } else if (branch) {
        await downloadBranchReceipt(branch, receiptFilter, phoneFilter, formattedStartDate, formattedEndDate, selectedStatus);
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

  const maxDate = new Date();

  return (
    <div className="p-6 lg:p-10 space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">รายการใบเสร็จ</h1>
          <p className="text-gray-500 mt-1">จัดการและตรวจสอบรายการใบเสร็จของลูกค้า</p>
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

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <FaRegCalendar size={14} />
              </div>
              <DatePicker
                selectsRange startDate={startDate} endDate={endDate}
                onChange={(update) => setDateRange(update)}
                placeholderText="เลือกช่วงวันที่" calendarStartDay={1} maxDate={maxDate}
                className="w-full pl-10 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-red-500/20 outline-none transition-all"
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
                placeholder="เบอร์โทรศัพท์"
                className="w-full pl-10 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-red-500/20 outline-none transition-all"
              />
              {phoneFilter && <button className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-300" onClick={() => { setPhoneFilter(""); refreshData(); }}><MdOutlineClear size={18} /></button>}
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <FaMagnifyingGlass size={14} />
              </div>
              <input
                type="text" value={receiptFilter}
                onInput={(e) => setReceiptFilter((e.target as HTMLInputElement).value)}
                placeholder="เลขที่ใบเสร็จ"
                className="w-full pl-10 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-red-500/20 outline-none transition-all"
              />
              {receiptFilter && <button className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-300" onClick={() => { setReceiptFilter(""); refreshData(); }}><MdOutlineClear size={18} /></button>}
            </div>

            <div className="relative">
              <Select aria-label="Status" className="w-full" selectedKey={selectedStatus} onSelectionChange={k => setSelectedStatus(k as string)}>
                <div className="relative">
                  <Button className="w-full flex items-center justify-between pl-3 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-red-500/20 outline-none text-left">
                    {selectedStatus ? <div className="flex items-center gap-2">{getStatusDetails(selectedStatus)?.icon}<span>{getStatusDetails(selectedStatus)?.textTH}</span></div> : <span className="text-gray-400">สถานะทั้งหมด</span>}
                    <MdKeyboardArrowDown className="size-5 text-gray-400 ml-auto" />
                  </Button>
                  {selectedStatus && <button className="absolute inset-y-0 right-8 flex items-center text-gray-300" onClick={e => { e.stopPropagation(); setSelectedStatus(""); refreshData(); }}><MdOutlineClear size={18} /></button>}
                </div>
                <Popover className="max-h-96 w-64 overflow-auto rounded-xl bg-white shadow-2xl border border-gray-100 p-1 z-[100] transition-transform">
                  <ListBox className="outline-none">
                    {status.map(s => (
                      <MyListBoxItem key={s.key} id={s.key}>
                        <div className="flex items-center gap-3">{getStatusDetails(s.key)?.icon}<span className="text-sm">{getStatusDetails(s.key)?.textTH}</span></div>
                      </MyListBoxItem>
                    ))}
                  </ListBox>
                </Popover>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={refreshData} className="p-2.5 rounded-xl border border-gray-100 hover:bg-gray-50 text-gray-500 transition-colors shadow-sm bg-white active:scale-95"><MdRefresh size={20} /></button>
            {isSuperAdmin && (
              <button onClick={handleDownloadExcel} className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-black transition-all shadow-lg shadow-gray-200 font-medium text-sm"><FiDownload size={18} /><span>ดาวน์โหลด Excel</span></button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-500">วันเวลาที่ลงทะเบียน</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-500">ชื่อ-นามสกุล</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-500">พิกัด/สาขา</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-500">ร้านค้า</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-500 text-right">ยอดซื้อ</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-500">หมายเลขใบเสร็จ</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-500 text-center">ภาพ</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-500 text-center">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {receiptData.length === 0 ? (
                <tr><td colSpan={8} className="px-6 py-20 text-center"><div className="text-gray-300 mb-2 text-4xl">📭</div><div className="text-gray-500 font-medium">ไม่พบรายการใบเสร็จที่ค้นหา</div></td></tr>
              ) : (
                receiptData.map((r, i) => {
                  const s = getStatusDetails(r.status);
                  return (
                    <tr key={i} className="hover:bg-gray-50/80 transition-all cursor-pointer group" onClick={() => handleOpenDialog(r)}>
                      <td className="px-6 py-4 whitespace-nowrap"><div className="text-xs font-medium text-gray-900">{formatThaiDateTime(r.uploadedAt)}</div></td>
                      <td className="px-6 py-4"><div className="text-xs font-bold text-gray-800">{r.fullname}</div><div className="text-[10px] text-gray-400 mt-0.5">{r.phone}</div></td>
                      <td className="px-6 py-4"><div className="text-xs text-gray-600 line-clamp-1">{r.branchName}</div></td>
                      <td className="px-6 py-4"><div className="text-xs text-gray-600 line-clamp-1">{r.storeName}</div></td>
                      <td className="px-6 py-4 text-right whitespace-nowrap"><div className="text-xs font-bold text-gray-900">{r.amount.toLocaleString("en-US")} ฿</div></td>
                      <td className="px-6 py-4"><div className="text-[11px] font-mono text-gray-500 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded inline-block max-w-[150px] truncate">{r.receiptNo}</div></td>
                      <td className="px-6 py-4 text-center"><span className="text-xs text-blue-500 group-hover:text-blue-700 font-medium underline underline-offset-4 decoration-blue-500/30">เปิดภาพ</span></td>
                      <td className="px-6 py-4 text-center whitespace-nowrap"><div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold shadow-sm border ${r.status === 'approved' ? 'bg-green-50 text-green-700 border-green-100' : r.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-red-50 text-red-700 border-red-100'}`}>{s?.icon}<span>{s?.textTH}</span></div></td>
                    </tr>
                  )
                })
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

      <ApproveDialog
        isPicOpen={isPicOpen}
        handlePicDialogClose={handlePicDialogClose}
        receipt={selectedReceipt}
        refreshData={fetchSamePage}
      />
    </div>
  );
};

export default ReceiptDashboard;
