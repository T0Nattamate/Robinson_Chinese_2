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
} from "react-icons/md";
import {
  FaCircleCheck,
  FaCircleMinus,
  FaCircleXmark,
  FaMagnifyingGlass,
  FaRegCalendar,
} from "react-icons/fa6";
import clsx from "clsx";
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
  canLuckydraw?: boolean; // สิทธิ์ลุ้นรางวัล
  canBag?: boolean; // สิทธิ์แลกซื้อ
  canVip?: boolean; // สิทธิ์ VIP
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

  // Admin info
  const { role, branch } = adminData;
  const isSuperAdmin = role === "superAdmin";

  // For branch admin, store the derived branchName
  const [branchName, setBranchName] = useState<string | null>(null);
  useEffect(() => {
    if (branch) {
      const name = findBranchNameByBranchId(branch);
      setBranchName(name);
    }
  }, [branch, findBranchNameByBranchId]);

  // SuperAdmin branch combobox
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Branch | null>(null);

  const filteredBranch =
    query === ""
      ? branches
      : branches.filter((b) =>
        b.branchName.toLowerCase().includes(query.toLowerCase())
      );

  // Date filter
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    null,
    null,
  ]);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  useEffect(() => {
    if (dateRange[0]) setStartDate(dateRange[0]);
    else setStartDate(undefined);

    if (dateRange[1]) setEndDate(dateRange[1]);
    else setEndDate(undefined);
  }, [dateRange]);

  // Phone, receiptNo, status
  const [phoneFilter, setPhoneFilter] = useState<string>("");
  const [receiptFilter, setReceiptFilter] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  // Dialog
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

  // Pagination
  const [pageSize, setPageSize] = useState("10");
  const [lastVisibleStack, setLastVisibleStack] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isClearingFilter, setIsClearingFilter] = useState(false);
  const [receiptData, setReceiptData] = useState<Receipt[]>([]);
  const [shouldRefetch, setShouldRefetch] = useState<boolean>(false);

  // Load initial data
  useEffect(() => {
    const getReceipts = async () => {
      if (isClearingFilter) return; // skip if clearing

      try {
        // If user changes any filter, reset pagination
        if (
          phoneFilter ||
          receiptFilter ||
          startDate ||
          endDate ||
          selectedStatus ||
          selected !== null
        ) {
          setLastVisibleStack([]);
        }

        const formattedStartDate = startDate
          ? formatDateToYYYYMMDD(startDate)
          : undefined;
        const formattedEndDate = endDate
          ? formatDateToYYYYMMDD(endDate)
          : undefined;

        if (isSuperAdmin) {
          if (selected === null) {
            // SuperAdmin: show all
            const data = await fetchInitialAllReceipts(
              pageSize,
              receiptFilter,
              phoneFilter,
              formattedStartDate,
              formattedEndDate,
              selectedStatus
            );
            setReceiptData(data.receiptHistory ?? []);
            setTotalCount(data.totalCount ?? 0);
            if (data.nextCursor != null) {
              setLastVisibleStack((prevStack) => [
                ...prevStack,
                data.nextCursor as number,
              ]);
            }
            setCurrentPage(1);
          } else {
            // SuperAdmin: show branch
            const data = await fetchInitialBranchReceipts(
              selected.branchId,
              pageSize,
              receiptFilter,
              phoneFilter,
              formattedStartDate,
              formattedEndDate,
              selectedStatus
            );
            setReceiptData(data.receiptHistory ?? []);
            setTotalCount(data.totalCount ?? 0);
            if (data.nextCursor != null) {
              setLastVisibleStack((prevStack) => [
                ...prevStack,
                data.nextCursor as number,
              ]);
            }
            setCurrentPage(1);
          }
        } else {
          // Branch admin
          if (branch) {
            const data = await fetchInitialBranchReceipts(
              branch,
              pageSize,
              receiptFilter,
              phoneFilter,
              formattedStartDate,
              formattedEndDate,
              selectedStatus
            );
            setReceiptData(data.receiptHistory ?? []);
            setTotalCount(data.totalCount ?? 0);
            if (data.nextCursor != null) {
              setLastVisibleStack((prevStack) => [
                ...prevStack,
                data.nextCursor as number,
              ]);
            }
            setCurrentPage(1);
          }
        }
      } catch (error) {
        console.error("Error fetching receipts:", error);
      }
    };

    getReceipts();
  }, [
    selected,
    pageSize,
    shouldRefetch,
    startDate,
    endDate,
    phoneFilter,
    receiptFilter,
    isClearingFilter,
    selectedStatus,
    branch,
    fetchInitialAllReceipts,
    fetchInitialBranchReceipts,
    isSuperAdmin,
  ]);

  // Next page
  const handleNextPage = async () => {
    try {
      const formattedStartDate = startDate
        ? formatDateToYYYYMMDD(startDate)
        : undefined;
      const formattedEndDate = endDate
        ? formatDateToYYYYMMDD(endDate)
        : undefined;
      const lastVisible = lastVisibleStack[currentPage - 1];

      if (isSuperAdmin) {
        if (selected === null) {
          // superAdmin no branch
          const data = await fetchNextAllReceipts(
            pageSize,
            lastVisible,
            receiptFilter,
            phoneFilter,
            formattedStartDate,
            formattedEndDate,
            selectedStatus
          );
          const { nextCursor, totalCount } = data;
          setCurrentPage((prev) => prev + 1);
          if (nextCursor) {
            setLastVisibleStack((prevStack) => [...prevStack, nextCursor]);
          } else if (nextCursor === null) {
            setLastVisibleStack((prevStack) => [...prevStack, 0]);
          }
          setReceiptData(data.receiptHistory ?? []);
          setTotalCount(totalCount ?? 0);
        } else {
          // superAdmin with branch
          const data = await fetchNextBranchReceipts(
            selected.branchId,
            pageSize,
            lastVisible,
            receiptFilter,
            phoneFilter,
            formattedStartDate,
            formattedEndDate,
            selectedStatus
          );
          const { nextCursor, totalCount } = data;
          setCurrentPage((prev) => prev + 1);
          if (nextCursor) {
            setLastVisibleStack((prevStack) => [...prevStack, nextCursor]);
          } else if (nextCursor === null) {
            setLastVisibleStack((prevStack) => [...prevStack, 0]);
          }
          setReceiptData(data.receiptHistory ?? []);
          setTotalCount(totalCount ?? 0);
        }
      } else {
        // branch admin
        if (branch) {
          const data = await fetchNextBranchReceipts(
            branch,
            pageSize,
            lastVisible,
            receiptFilter,
            phoneFilter,
            formattedStartDate,
            formattedEndDate,
            selectedStatus
          );
          const { nextCursor, totalCount } = data;
          setCurrentPage((prev) => prev + 1);
          if (nextCursor) {
            setLastVisibleStack((prevStack) => [...prevStack, nextCursor]);
          } else if (nextCursor === null) {
            setLastVisibleStack((prevStack) => [...prevStack, 0]);
          }
          setReceiptData(data.receiptHistory ?? []);
          setTotalCount(totalCount ?? 0);
        }
      }
    } catch (error) {
      console.error("Error fetching next page:", error);
    }
  };

  // Previous page
  const handlePreviousPage = async () => {
    try {
      const formattedStartDate = startDate
        ? formatDateToYYYYMMDD(startDate)
        : undefined;
      const formattedEndDate = endDate
        ? formatDateToYYYYMMDD(endDate)
        : undefined;

      if (currentPage <= 1) return;

      const lastVisible = lastVisibleStack[currentPage - 3];

      if (isSuperAdmin) {
        if (selected === null) {
          // superAdmin no branch
          const data = await fetchNextAllReceipts(
            pageSize,
            lastVisible,
            receiptFilter,
            phoneFilter,
            formattedStartDate,
            formattedEndDate,
            selectedStatus
          );
          const { receiptHistory } = data;
          setCurrentPage((prev) => prev - 1);
          setLastVisibleStack((prevStack) =>
            prevStack.slice(0, prevStack.length - 1)
          );
          setReceiptData(receiptHistory ?? []);
        } else {
          // superAdmin with branch
          const data = await fetchNextBranchReceipts(
            selected.branchId,
            pageSize,
            lastVisible,
            receiptFilter,
            phoneFilter,
            formattedStartDate,
            formattedEndDate,
            selectedStatus
          );
          const { receiptHistory } = data;
          setCurrentPage((prev) => prev - 1);
          setLastVisibleStack((prevStack) =>
            prevStack.slice(0, prevStack.length - 1)
          );
          setReceiptData(receiptHistory ?? []);
        }
      } else {
        // branch admin
        if (branch) {
          const data = await fetchNextBranchReceipts(
            branch,
            pageSize,
            lastVisible,
            receiptFilter,
            phoneFilter,
            formattedStartDate,
            formattedEndDate,
            selectedStatus
          );
          const { receiptHistory } = data;
          setCurrentPage((prev) => prev - 1);
          setLastVisibleStack((prevStack) =>
            prevStack.slice(0, prevStack.length - 1)
          );
          setReceiptData(receiptHistory ?? []);
        }
      }
    } catch (error) {
      console.error("Error fetching previous page:", error);
    }
  };

  // Refresh data
  const refreshData = () => {
    setCurrentPage(1);
    setLastVisibleStack([]);
    setShouldRefetch((prev) => !prev);
  };

  // Re-fetch the same page
  const fetchSamePage = async () => {
    try {
      const formattedStartDate = startDate
        ? formatDateToYYYYMMDD(startDate)
        : undefined;
      const formattedEndDate = endDate
        ? formatDateToYYYYMMDD(endDate)
        : undefined;
      const lastVisible = lastVisibleStack[currentPage - 2];

      if (isSuperAdmin) {
        if (selected === null) {
          const data = await fetchNextAllReceipts(
            pageSize,
            lastVisible,
            receiptFilter,
            phoneFilter,
            formattedStartDate,
            formattedEndDate,
            selectedStatus
          );
          if (data) {
            setReceiptData(data.receiptHistory ?? []);
          }
        } else {
          const data = await fetchNextBranchReceipts(
            selected.branchId,
            pageSize,
            lastVisible,
            receiptFilter,
            phoneFilter,
            formattedStartDate,
            formattedEndDate,
            selectedStatus
          );
          if (data) {
            setReceiptData(data.receiptHistory ?? []);
          }
        }
      } else {
        if (branch) {
          const data = await fetchNextBranchReceipts(
            branch,
            pageSize,
            lastVisible,
            receiptFilter,
            phoneFilter,
            formattedStartDate,
            formattedEndDate,
            selectedStatus
          );
          if (data) {
            setReceiptData(data.receiptHistory ?? []);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching next page:", error);
    }
  };

  // Show pagination items
  const [firstItem, setFirstItem] = useState(0);
  const [lastItem, setLastItem] = useState(0);

  useEffect(() => {
    const pageSizeNumber = Number(pageSize);
    if (currentPage > 0) {
      const calculatedFirstItem = (currentPage - 1) * pageSizeNumber + 1;
      const calculatedLastItem = Math.min(
        currentPage * pageSizeNumber,
        totalCount
      );
      setFirstItem(calculatedFirstItem);
      setLastItem(calculatedLastItem);
    } else {
      setFirstItem(0);
      setLastItem(0);
    }
  }, [currentPage, pageSize, totalCount]);

  const totalPages = Math.ceil(totalCount / Number(pageSize));

  // status details
  const getStatusDetails = (statusKey: string): StatusDetails | null => {
    switch (statusKey) {
      case "approved":
        return {
          key: "approved",
          icon: <FaCircleCheck size={14} className="text-green-600" />,
          textTH: "ถูกต้อง",
          textEN: "Approved",
        };
      case "pending":
        return {
          key: "pending",
          icon: <FaCircleMinus size={14} className="text-slate-600" />,
          textTH: "รอตรวจสอบ",
          textEN: "Under review",
        };
      case "rejected":
        return {
          key: "rejected",
          icon: <FaCircleXmark size={14} className="text-red-600" />,
          textTH: "เลขที่ใบเสร็จผิด",
          textEN: "Incorrect receipt number",
        };
      case "invalidImage":
        return {
          key: "invalidImage",
          icon: <FaCircleXmark size={14} className="text-red-600" />,
          textTH: "ภาพไม่ชัด/ภาพไม่ถูกต้อง",
          textEN: "Invalid image",
        };
      case "amountDontMatch":
        return {
          key: "amountDontMatch",
          icon: <FaCircleXmark size={14} className="text-red-600" />,
          textTH: "ยอดซื้อไม่ตรงกับใบเสร็จ",
          textEN: "Amount entered and upload don't match",
        };
      case "breakRules":
        return {
          key: "breakRules",
          icon: <FaCircleXmark size={14} className="text-red-600" />,
          textTH: "ยอดสั่งซื้อไม่ตรงตามเงื่อนไข",
          textEN: "Purchase amount is insufficient.",
        };
      case "duplicated":
        return {
          key: "duplicated",
          icon: <FaCircleXmark size={14} className="text-red-600" />,
          textTH: "ใบเสร็จซ้ำกับใบที่อนุมัติแล้ว",
          textEN: "This receipt has already approved.",
        };

      default:
        return null;
    }
  };


  // Download Excel
  const handleDownloadExcel = async () => {
    try {
      const formattedStartDate = startDate
        ? formatDateToYYYYMMDD(startDate)
        : undefined;
      const formattedEndDate = endDate
        ? formatDateToYYYYMMDD(endDate)
        : undefined;

      if (isSuperAdmin) {
        if (selected === null) {
          await downloadAllReceipt(
            receiptFilter,
            phoneFilter,
            formattedStartDate,
            formattedEndDate,
            selectedStatus
          );
        } else {
          await downloadBranchReceipt(
            selected.branchId,
            receiptFilter,
            phoneFilter,
            formattedStartDate,
            formattedEndDate,
            selectedStatus
          );
        }
      } else {
        if (branch) {
          await downloadBranchReceipt(
            branch,
            receiptFilter,
            phoneFilter,
            formattedStartDate,
            formattedEndDate,
            selectedStatus
          );
        }
      }
    } catch (error) {
      let errorMessage = "เกิดข้อผิดพลาดในการดาวน์โหลด";

      if (error instanceof Error) {
        if (error.message === "Network Error") {
          errorMessage = "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้";
        } else if (error.message === "No data found") {
          errorMessage = "ไม่พบข้อมูลสำหรับการดาวน์โหลด";
        } else if (error.message.includes("404")) {
          errorMessage = "ไม่พบข้อมูลที่ต้องการดาวน์โหลด";
        }
      }

      Swal.fire({
        icon: "error",
        text: errorMessage,
        confirmButtonText: "ยืนยัน",
        customClass: {
          htmlContainer: "font-kanit",
          confirmButton: "bg-gray-700 text-white rounded-md font-kanit",
        },
      });
      console.error("Download error:", error);
    }
  };

  const maxDate = new Date();
  // We'll display a green check if true, red "X" if false
  // const booleanIcon = (flag?: boolean) =>
  //   flag ? (
  //     <FaCheck />
  //   ) : (
  //     <FaX/>
  //   );
  return (
    <div>
      <section className="mt-15 m-8 ">
        <h1 className="text-3xl text-[var(--text)]">รายการใบเสร็จ</h1>

        {/* SuperAdmin: branch combobox + "ทั้งหมด" button */}
        <section className="flex lg:flex-row items-start flex-col lg:justify-between">
          {isSuperAdmin ? (
            <div className="mt-3 flex gap-3 ">
              <button
                className="bg-[var(--button)] text-white px-3 py-2 rounded-lg"
                onClick={() => setSelected(null)}
              >
                ทั้งหมด
              </button>
              <Combobox
                value={selected}
                onChange={(value) => setSelected(value)}
                onClose={() => setQuery("")}
              >
                <div className="relative w-40 md:w-56 ">
                  <ComboboxInput
                    className={clsx(
                      "w-full rounded-lg border-none bg-white pr-8 pl-3 p-2 text-black",
                      "focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-black/25"
                    )}
                    placeholder="เลือกสาขา"
                    displayValue={(branch: Branch) => branch?.branchName || ""}
                    onChange={(event) => setQuery(event.target.value)}
                  />
                  <ComboboxButton className="group absolute inset-y-0 right-0 px-2.5">
                    <MdKeyboardArrowDown className="size-4 text-black/60 group-data-[hover]:text-black" />
                  </ComboboxButton>
                </div>

                <ComboboxOptions
                  anchor="bottom"
                  transition
                  className={clsx(
                    "w-[var(--input-width)] rounded-xl border border-black/5 bg-white drop-shadow-md p-1 [--anchor-gap:var(--spacing-1)] empty:invisible",
                    "transition duration-100 ease-in data-[leave]:data-[closed]:opacity-0 z-50"
                  )}
                >
                  {filteredBranch.map((branch) => (
                    <ComboboxOption
                      key={branch.branchId}
                      value={branch}
                      className=" group flex  items-center gap-2 rounded-lg py-1.5 px-3 select-none data-[focus]:bg-white/3 cursor-pointer"
                    >
                      <div className="text-sm/6 text-slate-600">
                        {branch.branchName}
                      </div>
                    </ComboboxOption>
                  ))}
                </ComboboxOptions>
              </Combobox>
            </div>
          ) : (
            <div className="mt-5 text-[1.1rem] text-[var(--text)]">
              สาขา {branchName ? branchName : "ไม่พบสาขา"}
            </div>
          )}
        </section>

        {/* Filters */}
        <section className="w-full flex lg:justify-start mt-3 ">
          <section className="flex flex-col max-w-[30rem] items-start lg:items-center gap-3 mt-3 flex-wrap xl:flex-nowrap">
            {/* Row 1 */}
            <div className="w-full flex gap-3 md:flex-row flex-col">
              <div className="relative z-20">
                <div className="text-slate-400 absolute z-10 h-10 w-10 flex items-center justify-center border-r-[2px] rounded-l-md top-0 left-0">
                  <FaRegCalendar />
                </div>
                <DatePicker
                  selectsRange={true}
                  startDate={startDate}
                  endDate={endDate}
                  onChange={(update) => {
                    setDateRange(update);
                  }}
                  placeholderText="เลือกช่วงวันที่"
                  calendarStartDay={1}
                  maxDate={maxDate}
                  className="text-[0.93rem] w-[15rem] md:w-[15.5rem] pl-12 p-2 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300 -top-6 right-0"
                />
                <div
                  className="absolute top-3 right-2 cursor-pointer text-slate-200 hover:text-black duration-200 z-10"
                  onClick={async () => {
                    setIsClearingFilter(true);
                    setDateRange([null, null]);
                    await new Promise((resolve) => setTimeout(resolve, 0));
                    setIsClearingFilter(false);
                    refreshData();
                  }}
                >
                  <MdOutlineClear />
                </div>
              </div>

              <div className="relative">
                <div className="text-slate-400 absolute z-[5] h-10 w-10 flex items-center justify-center border-r-[2px] rounded-l-md top-0 left-0">
                  <FaMagnifyingGlass />
                </div>
                <input
                  type="tel"
                  maxLength={10}
                  pattern="[0-9]*"
                  inputMode="numeric"
                  onInput={(e) =>
                    setPhoneFilter(
                      (e.target as HTMLInputElement).value.replace(/\D/g, "")
                    )
                  }
                  value={phoneFilter}
                  placeholder="ค้นหาเบอร์โทรศัพท์"
                  className="text-[0.93rem] w-[15rem] md:w-[15.2rem] pl-12 p-2 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300 relative"
                />
                <div
                  className="absolute top-3 right-2 cursor-pointer text-slate-200 hover:text-black duration-200 z-10"
                  onClick={() => {
                    refreshData();
                    setPhoneFilter("");
                  }}
                >
                  <MdOutlineClear />
                </div>
              </div>
            </div>

            {/* Row 2 */}
            <div className="w-full flex gap-3 md:flex-row flex-col">
              <div className="relative">
                <div className="text-slate-400 absolute z-[5] h-10 w-10 flex items-center justify-center border-r-[2px] rounded-l-md top-0 left-0">
                  <FaMagnifyingGlass />
                </div>
                <input
                  type="text"
                  onInput={(e) =>
                    setReceiptFilter((e.target as HTMLInputElement).value)
                  }
                  value={receiptFilter}
                  placeholder="ค้นหาหมายเลขใบเสร็จ"
                  className="text-[0.93rem] w-[15rem] md:w-[15.5rem] pl-12 p-2 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300 relative"
                />
                <div
                  className="absolute top-3 right-2 cursor-pointer text-slate-200 hover:text-black duration-200 z-10"
                  onClick={() => {
                    refreshData();
                    setReceiptFilter("");
                  }}
                >
                  <MdOutlineClear />
                </div>
              </div>

              <div>
                <Select
                  aria-labelledby="reward-select-label"
                  isRequired
                  className="flex flex-row justify-start items-center gap-1 relative ring-[1px] rounded-lg ring-slate-300"
                  selectedKey={selectedStatus}
                  onSelectionChange={(key) => setSelectedStatus(key as string)}
                >
                  <div
                    className="absolute -top-[1px] -right-0 md:-right-5 cursor-pointer bg-white w-7 h-[2.62rem] flex 
                    border-t-[1px] border-t-slate-300 
                    border-b-[1px] border-b-slate-300 
                    border-r-[1px] border-r-slate-300 
                    rounded-r-lg items-center text-slate-200 hover:text-black duration-200 z-10"
                    onClick={() => {
                      refreshData();
                      setSelectedStatus("");
                    }}
                  >
                    <MdOutlineClear />
                  </div>
                  <Button className="bg-white flex relative w-[15rem] md:w-[14rem] h-10 rounded-lg data-[pressed]:bg-opacity-100 transition py-2 pl-3 pr-2 text-left text-gray-700 focus:outline-none data-[focus-visible]:border-indigo-500 data-[focus-visible]:ring-[1px] data-[focus-visible]:ring-black sm:text-sm">
                    {selectedStatus ? (
                      (() => {
                        const statusDetails = getStatusDetails(selectedStatus);
                        return (
                          statusDetails && (
                            <div className="w-full h-full flex items-center gap-4 pl-3">
                              {statusDetails.icon}
                              <span>{statusDetails.textTH}</span>
                            </div>
                          )
                        );
                      })()
                    ) : (
                      <div className="flex items-center w-full h-full gap-2 pl-3 ">
                        <p className="text-gray-400">ค้นหาจากสถานะ</p>
                      </div>
                    )}
                  </Button>
                  <Popover className="max-h-96 w-60 font-kanit overflow-auto rounded-md bg-white text-base  shadow-lg ring-1 ring-red-400 ring-opacity-5 sm:text-sm data-[entering]:animate-fadein data-[exiting]:animate-fadeout fill-mode-forwards">
                    <ListBox className="outline-none p-1 [--focus-bg:theme(colors.slate.300)] -ml-5">
                      {status.map((statusItem) => {
                        const statusDetails = getStatusDetails(statusItem.key);
                        return (
                          <MyListBoxItem
                            key={statusItem.key}
                            id={statusItem.key.toString()}
                          >
                            {statusDetails && (
                              <div className="w-full h-full flex items-center gap-2 cursor-pointer">
                                {statusDetails.icon}
                                <span>{statusDetails.textTH}</span>
                              </div>
                            )}
                          </MyListBoxItem>
                        );
                      })}
                    </ListBox>
                  </Popover>
                </Select>
              </div>

              {isSuperAdmin && (
                <div
                  className="cursor-pointer flex items-center h-10 w-full justify-center md:w-auto gap-2 p-1 py-2 rounded-lg bg-[var(--button)] md:ml-5"
                  onClick={async () => {
                    await handleDownloadExcel();
                  }}
                >
                  <FiDownload size={20} color="white" />
                  <p className="text-white">ดาวน์โหลด</p>
                </div>
              )}
            </div>
          </section>
        </section>

        {/* Table */}
        <div className="w-[18rem] md:w-full h-full bg-white mt-5 rounded-2xl p-5 text-black overflow-x-auto">
          <table className="w-full text-center text-xs lg:text-[0.9rem]">
            <thead>
              <tr>
                <td className="w-24 border-b border-b-slate-400 pb-3">
                  วันเวลาที่ลงทะเบียน
                </td>
                <td className="w-40 pl-5 border-b border-b-slate-400 pb-3">
                  ชื่อ-นามสกุล
                </td>
                <td className="w-22 border-b border-b-slate-400 pb-3">
                  เบอร์โทรศัพท์
                </td>
                <td className="w-22 border-b border-b-slate-400 pb-3">
                  จำนวนเงิน
                </td>
                {isSuperAdmin && (
                  <td className="w-16 border-b border-b-slate-400 pb-3">
                    สาขา
                  </td>
                )}
                <td className="w-20 border-b border-b-slate-400 pb-3">
                  ร้านค้า
                </td>
                <td className="w-22 border-b border-b-slate-400 pb-3">
                  หมายเลขใบเสร็จ
                </td>
                <td className="w-20 border-b border-b-slate-400 pb-3">
                  ภาพใบเสร็จ
                </td>
                {/* 1) สิทธิ์ลุ้นรางวัล (boolean) */}
                {/* <td className="w-20 border-b border-b-slate-400 pb-3">
                  สิทธิ์ลุ้นรางวัล
                </td> */}
                {/* 2) สิทธิ์แลกซื้อ (boolean) */}
                {/* <td className="w-20 border-b border-b-slate-400 pb-3">
                  สิทธิ์แลกซื้อ
                </td> */}
                {/* 3) สิทธิ์ VIP (boolean) */}
                {/* <td className="w-20 border-b border-b-slate-400 pb-3">
                  สิทธิ์ VIP
                </td> */}
                <td className="w-20 border-b border-b-slate-400 pb-3">
                  อัพเดตเมื่อ
                </td>
                <td className="w-26 border-b border-b-slate-400 pb-3">
                  สถานะ
                </td>
              </tr>
            </thead>
            <tbody className="font-light">
              {receiptData.length === 0 ? (
                <tr>
                  <td
                    colSpan={isSuperAdmin ? 12 : 11}
                    className="w-full border-b border-b-slate-400 h-12"
                  >
                    ไม่พบรายการ
                  </td>
                </tr>
              ) : (
                <>
                  {receiptData.map((receipt, index) => {
                    const statusDetails = getStatusDetails(receipt.status);

                    return (
                      <tr
                        key={index}
                        className="hover:bg-slate-100 duration-200 cursor-pointer"
                        onClick={() => handleOpenDialog(receipt)}
                      >
                        <td className="h-12 border-b border-b-slate-200">
                          {formatThaiDateTime(receipt.uploadedAt)}
                        </td>
                        <td className="h-12 text-center border-b border-b-slate-200">
                          {receipt.fullname}
                        </td>
                        <td className="h-12 border-b border-b-slate-200">
                          {receipt.phone}
                        </td>
                        <td className="h-12 border-b border-b-slate-200">
                          {receipt.amount.toLocaleString("en-US")} ฿
                        </td>
                        {isSuperAdmin && (
                          <td className="border-b border-b-slate-200">
                            {receipt.branchName}
                          </td>
                        )}
                        <td className="h-12 border-b border-b-slate-200">
                          {receipt.storeName}
                        </td>
                        <td className="w-28 h-12 border-b border-b-slate-200">
                          {receipt.receiptNo.length > 15
                            ? `${receipt.receiptNo.slice(0, 15)}\n${receipt.receiptNo.slice(15)}`
                            : receipt.receiptNo}
                        </td>
                        <td className="h-12 border-b border-b-slate-200 text-blue-700 underline ">
                          Pic link
                        </td>
                        {/* 3 new columns (boolean) */}
                        {/* <td className="h-12 border-b border-b-slate-200 justify-items-center">
                          {receipt.canLuckydraw ? <FaCheck/>: <FaX/> }
                        </td>
                        <td className="h-12 border-b border-b-slate-200 justify-items-center">
                          {receipt.canBag ? <FaCheck/>: <FaX/>}
                        </td>
                        <td className="h-12 border-b border-b-slate-200 justify-items-center">
                          {receipt.canVip ? <FaCheck/>: <FaX/>}
                        </td> */}
                        <td className="h-12 border-b border-b-slate-200 justify-items-center">
                          {formatThaiDateTime(receipt.updatedAt)}
                        </td>
                        <td className="h-12 border-b border-b-slate-200 px-5 ml-5 w-[11rem] justify-items-start">
                          {statusDetails && (
                            <div className="w-full h-full flex items-center gap-3 ml-2 text-sm">
                              {statusDetails.icon}
                              <span>{statusDetails.textTH}</span>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        <section className="mt-3 p-3 flex md:flex-row flex-col items-center md:justify-between gap-3">
          <Select
            isRequired
            className="flex flex-row justify-start items-center gap-1 relative"
            selectedKey={pageSize}
            onSelectionChange={(key) => setPageSize(key as string)}
          >
            <Label className="text-start text-[15px] w-32 md:w-56 text-white ml-2">
              Items per page :
            </Label>
            <Button className="bg-white flex relative w-full cursor-default rounded-lg data-[pressed]:bg-opacity-100 transition py-2 pl-3 pr-2 text-left text-gray-700 focus:outline-none data-[focus-visible]:border-indigo-500 data-[focus-visible]:ring-2 data-[focus-visible]:ring-black sm:text-sm">
              <SelectValue className="flex-1 truncate data-[placeholder]:font-base text-slate-500" />
              <div className="p-2 absolute right-1 -top-1">
                <MdKeyboardArrowDown size={24} />
              </div>
            </Button>
            <Popover className="max-h-60 w-40 overflow-auto rounded-md bg-white text-base shadow-lg ring-1 ring-red-400 ring-opacity-5 sm:text-sm data-[entering]:animate-fadein data-[exiting]:animate-fadeout fill-mode-forwards">
              <ListBox className="outline-none p-1 [--focus-bg:theme(colors.rose.600)]">
                {pageSizeChoice.map((pageSizeChoice) => (
                  <MyListBoxItem key={pageSizeChoice} id={pageSizeChoice}>
                    {pageSizeChoice}
                  </MyListBoxItem>
                ))}
              </ListBox>
            </Popover>
          </Select>

          <p className="text-white">
            Showing {firstItem} to {lastItem} of {totalCount} items
          </p>

          <div className="flex gap-3 items-center">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage <= 1}
              className="disabled:bg-[#95a59f] bg-[var(--red)] text-white px-3 py-2 rounded-lg w-20 flex items-center justify-center"
            >
              <MdOutlineKeyboardArrowLeft size={20} />
            </button>
            <p className="text-white">{currentPage}</p>
            <button
              onClick={handleNextPage}
              disabled={currentPage >= totalPages}
              className="disabled:bg-[#95a59f] bg-[var(--red)] text-white px-3 py-2 rounded-lg w-20 flex items-center justify-center"
            >
              <MdOutlineKeyboardArrowRight size={20} />
            </button>
          </div>
        </section>
      </section>

      {/* ApproveDialog for image & status update */}
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
