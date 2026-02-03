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
  MdOutlineKeyboardArrowLeft,
  MdOutlineKeyboardArrowRight,
  MdOutlineClear,
  MdRefresh,
} from "react-icons/md";
import MyListBoxItem from "../../styles/MyListBoxItem";
import { useEffect, useState } from "react";
import { useAdminStore } from "../../store/AdminStore";
import { FaUserCircle } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaMagnifyingGlass, FaRegCalendar } from "react-icons/fa6";
import { formatDateToYYYYMMDD, formatNumber, formatThaiDateTime } from "../../data/functions";
import { FiDownload } from "react-icons/fi";
import { GoTrophy } from "react-icons/go";
import { RxCheck, RxCross2 } from "react-icons/rx";
import Swal from "sweetalert2";

export type Customer = {
  fullname: string;
  phone: string;
  email: string;
  lineId: string | null;
  lineProfilePic: string | null;
  isTheOne: boolean;
  createdAt: string;
  updatedAt: string;
  accPointsByBranch: string;
  accPoints: string;
  rights: number;
  mostbranchId: string;
  accRights: number;
  theOneId: string;
  mostBranchName: string;
}

const CustomerAdmin = () => {
  const {
    fetchInitialCustomerAdmin,
    fetchNextCustomerAdmin,
    downloadCustomerAdmin,
  } = useAdminStore();

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
  const [the1Filter, setThe1Filter] = useState<boolean | null>(null);
  const [sortOrder, setSortOrder] = useState<"allPoints" | null>(null);

  useEffect(() => {
    setStartDate(dateRange[0] || undefined);
    setEndDate(dateRange[1] || undefined);
  }, [dateRange]);

  const [customersData, setCustomersData] = useState<Customer[]>([]);
  const [shouldRefetch, setShouldRefetch] = useState<boolean>(false);

  useEffect(() => {
    setLastVisibleStack([]);
    setCurrentPage(0);
  }, [pageSize, phoneFilter, startDate, endDate, the1Filter, sortOrder]);

  useEffect(() => {
    if (isClearingFilter) return;

    const formattedStartDate = startDate ? formatDateToYYYYMMDD(startDate) : undefined;
    const formattedEndDate = endDate ? formatDateToYYYYMMDD(endDate) : undefined;

    const getCustomersData = async () => {
      try {
        const response = await fetchInitialCustomerAdmin(
          pageSize,
          phoneFilter,
          the1Filter !== null ? (the1Filter ? "true" : "false") : null,
          sortOrder,
          "",
          formattedStartDate,
          formattedEndDate
        );
        const { data, totalCount, nextCursor } = response;
        setLastVisibleStack([]);
        if (nextCursor !== null && nextCursor !== undefined) {
          setLastVisibleStack([nextCursor]);
        }
        setCurrentPage(1);
        setCustomersData(data ?? []);
        setTotalCount(totalCount ?? 0);
      } catch (error) {
        console.error(error);
      }
    };
    getCustomersData();
  }, [pageSize, shouldRefetch, startDate, endDate, the1Filter, phoneFilter, sortOrder]);

  const handleNextPage = async () => {
    const formattedStartDate = startDate ? formatDateToYYYYMMDD(startDate) : undefined;
    const formattedEndDate = endDate ? formatDateToYYYYMMDD(endDate) : undefined;
    try {
      const lastVisible = lastVisibleStack[currentPage - 1];
      const response = await fetchNextCustomerAdmin(
        pageSize,
        lastVisible,
        phoneFilter,
        the1Filter !== null ? (the1Filter ? "true" : "false") : null,
        sortOrder,
        "",
        formattedStartDate,
        formattedEndDate
      );
      const { data, nextCursor } = response;
      setCurrentPage((prev) => prev + 1);
      if (nextCursor) {
        setLastVisibleStack((prev) => [...prev, nextCursor]);
      } else {
        setLastVisibleStack((prev) => [...prev, "0"]);
      }
      setCustomersData(data ?? []);
    } catch (error) {
      console.error(error);
    }
  };

  const handlePreviousPage = async () => {
    const formattedStartDate = startDate ? formatDateToYYYYMMDD(startDate) : undefined;
    const formattedEndDate = endDate ? formatDateToYYYYMMDD(endDate) : undefined;
    try {
      if (currentPage <= 1) return;
      const lastVisible = lastVisibleStack[currentPage - 3];
      const response = await fetchNextCustomerAdmin(
        pageSize,
        lastVisible,
        phoneFilter,
        the1Filter !== null ? (the1Filter ? "true" : "false") : null,
        sortOrder,
        "",
        formattedStartDate,
        formattedEndDate
      );
      const { data } = response;
      setCurrentPage((prev) => prev - 1);
      setLastVisibleStack((prev) => prev.slice(0, prev.length - 1));
      setCustomersData(data ?? []);
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
    setShouldRefetch((prev) => !prev);
  };

  const handleDownloadExcel = async () => {
    try {
      const formattedStartDate = startDate ? formatDateToYYYYMMDD(startDate) : undefined;
      const formattedEndDate = endDate ? formatDateToYYYYMMDD(endDate) : undefined;
      await downloadCustomerAdmin(
        phoneFilter,
        the1Filter !== null ? (the1Filter ? "true" : "false") : null,
        sortOrder,
        "",
        formattedStartDate,
        formattedEndDate
      );
    } catch (error) {
      Swal.fire({
        icon: "error",
        text: "เกิดข้อผิดพลาดในการดาวน์โหลด",
        confirmButtonText: "ยืนยัน",
        customClass: { htmlContainer: "font-kanit", confirmButton: "bg-gray-700 text-white rounded-md font-kanit" },
      });
    }
  };

  const maxDate = new Date();

  return (
    <div className="p-6 lg:p-10 space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">รายชื่อลูกค้า</h1>
          <p className="text-gray-500 mt-1">จัดการและตรวจสอบข้อมูลลูกค้าที่ลงทะเบียนเข้าร่วมกิจกรรม</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl shadow-sm border border-gray-100">
            <button
              onClick={() => {
                setThe1Filter(prev => {
                  if (prev === null) return true;
                  if (prev === true) return false;
                  return null;
                });
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${the1Filter !== null
                ? "bg-red-50 text-[var(--red)] border border-red-100 shadow-sm"
                : "text-gray-600 hover:bg-gray-50"
                }`}
            >
              {the1Filter === null ? "สมาชิกทั้งหมด" : the1Filter ? "สมาชิก The 1" : "ทั่วไป (ไม่ใช่ The 1)"}
            </button>
            <div className="w-[1px] h-6 bg-gray-100 mx-1"></div>
            <button
              onClick={() => setSortOrder(prev => prev === null ? "allPoints" : null)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${sortOrder !== null
                ? "bg-amber-50 text-amber-700 border border-amber-100 shadow-sm"
                : "text-gray-600 hover:bg-gray-50"
                }`}
            >
              <GoTrophy size={16} />
              <span>{sortOrder === null ? "ไม่ได้เรียงลำดับ" : "Top Spender"}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <FaRegCalendar size={14} />
              </div>
              <DatePicker
                selectsRange startDate={startDate} endDate={endDate}
                onChange={(update) => setDateRange(update)}
                placeholderText="เลือกช่วงวันที่สมัคร" calendarStartDay={1} maxDate={maxDate}
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
              {phoneFilter && <button className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-300" onClick={() => { setPhoneFilter(""); refreshData(); }}><MdRefresh size={18} /></button>}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={refreshData} className="p-3 rounded-xl border border-gray-100 hover:bg-gray-50 text-gray-500 transition-colors shadow-sm bg-white"><MdRefresh className="rotate-45" size={20} /></button>
            <button onClick={handleDownloadExcel} className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-black transition-all shadow-lg shadow-gray-200 font-medium text-sm"><FiDownload size={18} /><span>ดาวน์โหลด Excel</span></button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-500 text-center">ข้อมูลลูกค้า</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-500 text-center">The 1</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-500 text-center">สาขาที่ใช้ประจำ</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-500 text-center">ยอดซื้อสะสม</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-500 text-center">วันที่ลงทะเบียน</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-500 text-center">อัพเดทล่าสุด</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {customersData.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-20 text-center"><div className="text-gray-300 mb-2 text-4xl">👥</div><div className="text-gray-500 font-medium">ไม่พบข้อมูลลูกค้า</div></td></tr>
              ) : (
                customersData.map((customer, i) => (
                  <tr key={customer.lineId || i} className="hover:bg-gray-50/80 transition-all transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden border border-gray-100 flex-shrink-0 shadow-sm">
                          {customer.lineProfilePic ? (
                            <img src={customer.lineProfilePic} alt={customer.fullname} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50"><FaUserCircle size={24} /></div>
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-gray-900">{customer.fullname || "ไม่พบชื่อ"}</div>
                          <div className="text-[10px] text-gray-500 font-medium mt-0.5">{customer.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className={`inline-flex items-center justify-center w-6 h-6 rounded-lg ${customer.isTheOne ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-gray-50 text-gray-300 border border-gray-100'}`}>
                        {customer.isTheOne ? <RxCheck size={18} /> : <RxCross2 size={16} />}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-[11px] font-bold text-gray-700 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100 inline-block ">
                        {customer.mostBranchName || "ยังไม่มีข้อมูลสาขา"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <div className="text-xs font-bold text-gray-900">{formatNumber(customer.accPoints)} ฿</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-[11px] text-gray-500">
                        {new Date(customer.createdAt).toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <div className="text-[11px] font-medium text-gray-900">{formatThaiDateTime(customer.updatedAt)}</div>
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

export default CustomerAdmin;