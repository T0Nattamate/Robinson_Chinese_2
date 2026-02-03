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
} from "react-icons/md";
import MyListBoxItem from "../../styles/MyListBoxItem";
import { useEffect, useState } from "react";
import { useAdminStore } from "../../store/AdminStore";
import { FaUserCircle } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { formatDateToYYYYMMDD, formatNumber } from "../../data/functions";
import { FaRegCalendarAlt } from "react-icons/fa";
import { FiDownload } from "react-icons/fi";
import { GoTrophy } from "react-icons/go";
import { formatThaiDateTime } from "../../data/functions";
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
    //downloadCustomerAdminLuckyDraw,
  } = useAdminStore();
  //pagination
  const [pageSize, setPageSize] = useState("10");
  const [lastVisibleStack, setLastVisibleStack] = useState<string[]>([]); //string array
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [firstItem, setFirstItem] = useState(0);
  const [lastItem, setLastItem] = useState(0);
  const [isClearingFilter, setIsClearingFilter] = useState(false);

  //filter
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [phoneFilter, setPhoneFilter] = useState<string>("");
  const [the1Filter, setThe1Filter] = useState<boolean | null>(null);
  const [the1CardFilter] = useState<string>("");

  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    null,
    null,
  ]);

  //filter:Datepicker
  const maxDate = new Date();
  //console.log(startDate, endDate, dateRange);
  useEffect(() => {
    if (dateRange[0]) {
      setStartDate(dateRange[0]);
    } else {
      setStartDate(undefined);
    }

    if (dateRange[1]) {
      setEndDate(dateRange[1]);
    } else {
      setEndDate(undefined);
    }
  }, [dateRange]);

  //filter:sort
  const [sortOrder, setSortOrder] = useState<"allPoints" | null>(null);


  const handleSort = () => {
    if (sortOrder === null) {
      // First click => Top spender
      setSortOrder("allPoints");
    } else {
      // Third click => no sort
      setSortOrder(null);
    }
  };

  //console.log("sortOrder", sortOrder);

  //API calling
  const [customersData, setCustomersData] = useState<Customer[]>([]);
  const [shouldRefetch, setShouldRefetch] = useState<boolean>(false);

  // CRITICAL: Reset pagination completely when filters/sort changes
  useEffect(() => {
    setLastVisibleStack([]);
    setCurrentPage(0);
  }, [pageSize, phoneFilter, startDate, endDate, the1Filter, the1CardFilter, sortOrder]);

  //initial Pagination
  useEffect(() => {
    if (isClearingFilter) {
      // Skip the fetch if we are clearing filters
      return;
    }

    const formattedStartDate = startDate
      ? formatDateToYYYYMMDD(startDate)
      : undefined;
    const formattedEndDate = endDate
      ? formatDateToYYYYMMDD(endDate)
      : undefined;
    const getCustomersData = async () => {
      try {
        const response = await fetchInitialCustomerAdmin(
          pageSize,
          phoneFilter,
          the1Filter !== null ? (the1Filter ? "true" : "false") : null,
          sortOrder,
          the1CardFilter,
          formattedStartDate,
          formattedEndDate
        );
        const { data, totalCount, nextCursor } = response;
        //console.log("data: ", data);

        // CRITICAL: Clear old stack and start fresh
        setLastVisibleStack([]);
        if (nextCursor !== null && nextCursor !== undefined) {
          setLastVisibleStack([nextCursor]);
        }
        setCurrentPage(1);
        setCustomersData(data ?? []);
        setTotalCount(totalCount ?? 0);
      } catch (error) {
        //console.log(error);
        //handleError(error);
      }
    };

    getCustomersData();
  }, [
    pageSize,
    shouldRefetch,
    startDate,
    endDate,
    the1Filter,
    phoneFilter,
    sortOrder,
    the1CardFilter,
  ]);

  //next Pagination
  const handleNextPage = async () => {
    const formattedStartDate = startDate
      ? formatDateToYYYYMMDD(startDate)
      : undefined;
    const formattedEndDate = endDate
      ? formatDateToYYYYMMDD(endDate)
      : undefined;
    //console.log("Next page");
    try {
      const lastVisible = lastVisibleStack[currentPage - 1];
      const response = await fetchNextCustomerAdmin(
        pageSize,
        lastVisible,
        phoneFilter,
        the1Filter !== null ? (the1Filter ? "true" : "false") : null,
        sortOrder,
        the1CardFilter,
        formattedStartDate,
        formattedEndDate
      );
      const { data, nextCursor } = response;

      setCurrentPage((prevPage) => prevPage + 1);
      if (nextCursor) {
        setLastVisibleStack((prevStack) => [...prevStack, nextCursor]);
      } else if (nextCursor === null) {
        setLastVisibleStack((prevStack) => [...prevStack, "0"]);
      }
      //console.log("data again: ", data);
      setCustomersData(data ?? []);
    } catch (error) {
      //console.log("error in handleNextPage", error);
      //handleError(error);
    }
  };

  const handlePreviousPage = async () => {
    const formattedStartDate = startDate
      ? formatDateToYYYYMMDD(startDate)
      : undefined;
    const formattedEndDate = endDate
      ? formatDateToYYYYMMDD(endDate)
      : undefined;
    //console.log("Previous page");
    try {
      if (currentPage <= 1) {
        //console.log("Already on the first page, cannot go back.");
        return;
      }

      const lastVisible = lastVisibleStack[currentPage - 3];
      const response = await fetchNextCustomerAdmin(
        pageSize,
        lastVisible,
        phoneFilter,
        the1Filter !== null ? (the1Filter ? "true" : "false") : null,
        sortOrder,
        the1CardFilter,
        formattedStartDate,
        formattedEndDate
      );
      const { data } = response;
      setCurrentPage((prevPage) => prevPage - 1);
      setLastVisibleStack((prevStack) =>
        prevStack.slice(0, prevStack.length - 1)
      );
      setCustomersData(data ?? []);
    } catch (error) {
      //console.log("error in handleNextPage", error);
      //handleError(error);
    }
  };

  //show pagination items
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

  const refreshData = () => {
    setCurrentPage(1);
    setLastVisibleStack([]);
    setShouldRefetch((prev) => !prev);
    //console.log("refreshData");
  };
  ////console.log(refreshData);
  useEffect(() => {
    //console.log("lastVisibleStack updated:", lastVisibleStack);
    //console.log("Page: ", currentPage);
  }, [lastVisibleStack, currentPage]);

  //download excel
  const handleDownloadExcel = async () => {
    try {
      const formattedStartDate = startDate
        ? formatDateToYYYYMMDD(startDate)
        : undefined;
      const formattedEndDate = endDate
        ? formatDateToYYYYMMDD(endDate)
        : undefined;

      await downloadCustomerAdmin(
        phoneFilter,
        the1Filter !== null ? (the1Filter ? "true" : "false") : null,
        sortOrder,
        the1CardFilter,
        formattedStartDate,
        formattedEndDate
      );

    } catch (error) {
      Swal.fire({
        icon: "error",
        text: "เกิดข้อผิดพลาดในการดาวน์โหลด",
        confirmButtonText: "ยืนยัน",
        customClass: {
          htmlContainer: "font-kanit",
          confirmButton: "bg-gray-700 text-white rounded-md font-kanit",
        },
      });
    }
  };

  // const handleDownloadExcelLuckyDraw = async () => {
  //   try {
  //     const formattedStartDate = startDate
  //       ? formatDateToYYYYMMDD(startDate)
  //       : undefined;
  //     const formattedEndDate = endDate
  //       ? formatDateToYYYYMMDD(endDate)
  //       : undefined;

  //     await downloadCustomerAdminLuckyDraw(
  //       phoneFilter,
  //       the1Filter !== null ? (the1Filter ? "true" : "false") : null,
  //       sortOrder,
  //       the1CardFilter,
  //       formattedStartDate,
  //       formattedEndDate
  //     );

  //   } catch (error) {
  //     let errorMessage = "ไม่พบรายชื่อผู้ใช้ที่ยังไม่เคยได้รับรางวัล";

  //     if (error instanceof Error) {
  //       if (error.message === "Network Error") {
  //         errorMessage = "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้";
  //       } else if (error.message === "No data found") {
  //         errorMessage = "ไม่พบข้อมูลสำหรับการดาวน์โหลด";
  //       }
  //     }

  //     Swal.fire({
  //       icon: "error",
  //       text: errorMessage,
  //       confirmButtonText: "ยืนยัน",
  //       customClass: {
  //         htmlContainer: "font-kanit",
  //         confirmButton: "bg-gray-700 text-white rounded-md font-kanit",
  //       },
  //     });
  //   }
  // };

  useEffect(() => {
    setLastVisibleStack([]);
    //console.log("lastVisibleStack has been reset ");
  }, [pageSize]);

  return (
    <div>
      {" "}
      <section className="mt-0 m-8 ">
        <div className="flex flex-col md:flex-row gap-3 items-start md:items-end">
          <h1 className="text-3xl text-[var(--text)] mt-10">
            {/* 1) Sort states */}
            {sortOrder === null ? (
              "รายชื่อลูกค้าทั้งหมด"
            ) : (
              "รายชื่อลูกค้า เรียงตามลำดับ Top spender"
            )}

            {/* 2) The1 filter logic */}
            {the1Filter === true
              ? " ที่เป็นสมาชิก the 1"
              : the1Filter === false
                ? " ที่ไม่ได้เป็นสมาชิก the 1"
                : ""}
          </h1>

        </div>
        {/* Filter */}
        <section className="w-full   flex lg:justify-start mt-3">
          <section className="flex flex-wrap xl:flex-nowrap  flex-col  max-w-[46rem] items-start lg:items-center gap-3  mt-3">
            {/* Filter row 1 */}
            <div className="w-full flex gap-3 md:flex-row flex-col">
              <div className="relative z-20">
                <div className="text-slate-400  absolute z-10 h-10 w-10 flex items-center justify-center border-r-[2px]  rounded-l-md top-0 left-0">
                  <FaRegCalendarAlt />
                </div>
                <DatePicker
                  maxDate={maxDate}
                  selectsRange={true}
                  startDate={startDate}
                  endDate={endDate}
                  onChange={(update) => {
                    setDateRange(update);
                  }}
                  placeholderText="เลือกช่วงวันที่"
                  calendarStartDay={1}
                  className=" text-[0.93rem] w-[15rem] md:w-[15.5rem] pl-12 p-2 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300 -top-6 right-0"
                />
                <div
                  className="absolute top-3 right-2  cursor-pointer text-slate-200 hover:text-black duration-200 z-10"
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
                <div className="text-slate-400  absolute z-[5] h-10 w-10 flex items-center justify-center border-r-[2px]  rounded-l-md top-0 left-0">
                  <FaMagnifyingGlass />
                </div>
                <input
                  type="tel"
                  maxLength={10}
                  pattern="[0-9]*"
                  inputMode="numeric"
                  onInput={
                    (e) =>
                      setPhoneFilter(
                        (e.target as HTMLInputElement).value.replace(/\D/g, "")
                      ) // Prevent non-numeric input
                  }
                  value={phoneFilter}
                  placeholder="ค้นหาเบอร์โทรศัพท์"
                  className=" text-[0.93rem] w-[15rem] md:w-[13rem] pl-12 p-2 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300 relative"
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

              {/* <div className="relative">
                {/* <div className="text-slate-400 absolute z-[5] h-10 w-10 flex items-center justify-center border-r-[2px] rounded-l-md top-0 left-0">
                  <FaMagnifyingGlass />
                </div> 
                 <input
                  type="text"
                  onInput={(e) =>
                    setThe1CardFilter((e.target as HTMLInputElement).value)
                  }
                  value={the1CardFilter}
                  placeholder="ค้นหาหมาย The1 Card"
                  className="text-[0.93rem] w-[15rem] md:w-[15.5rem] pl-12 p-2 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300 relative"
                /> 
                <div
                  className="absolute top-3 right-2 cursor-pointer text-slate-200 hover:text-black duration-200 z-10"
                  onClick={() => {
                    refreshData();
                    setThe1CardFilter("");
                  }}
                >
               
                </div>
              </div>*/}
            </div>
            {/* Filter row 2 */}
            <div className="w-full flex gap-3 md:flex-row flex-col ">
              <div
                className={`w-44 h-10 gap-3 flex justify-center items-center rounded-md mt-0 cursor-pointer  ${the1Filter === null
                  ? "bg-[#95a59f] text-white"
                  : the1Filter === true
                    ? "bg-[var(--button)] text-white"
                    : "bg-yellow-500 text-white"
                  }`}
                onClick={() => {
                  setThe1Filter((prev) => {
                    if (prev === null) {
                      return true;
                    } else if (prev === true) {
                      return false;
                    } else {
                      return null;
                    }
                  });
                }}
              >
                {the1Filter === null
                  ? "ไม่ได้ระบุสถานะสมาชิก"
                  : the1Filter === true
                    ? "เป็นสมาชิก the 1"
                    : "ไม่ได้เป็นสมาชิก the 1"}
              </div>

              <section className="flex flex-row ">
                <div
                  className={`
                    w-60 h-10 gap-3 flex justify-center items-center rounded-md mt-0 cursor-pointer
                    ${sortOrder === null
                      ? "bg-[#95a59f] text-white"
                      : "border-slate-400 bg-[var(--button)] text-white"
                    }
                  `}
                  onClick={handleSort}
                >
                  <GoTrophy />
                  {sortOrder === null ? (
                    <p>ไม่ได้เรียงลำดับ</p>
                  ) : (
                    <p>เรียงตามลำดับ Top spender</p>
                  )}
                </div>
              </section>

              <div
                className="cursor-pointer flex items-center w-full justify-center md:w-auto gap-2 p-1 py-2  rounded-lg bg-[var(--button)] h-10"
                onClick={handleDownloadExcel}
              >
                <FiDownload color="white" size={20} />

                <p className="text-white">ดาวน์โหลด</p>
              </div>
              {/* <div
                className="cursor-pointer flex items-center w-full justify-center md:w-auto gap-2 p-1 py-2 border-2 rounded-lg border-white  bg-amber-500 h-10 "
                onClick={handleDownloadExcelLuckyDraw}
              >
                <FiDownload color="white" size={20} />

                <p className="text-white w-40">ดาวน์โหลด Luckydraw</p>
              </div> */}
            </div>
          </section>
        </section>
        <div className="w-[18rem]  md:w-full h-full bg-white mt-5 rounded-2xl p-5 text-black overflow-x-auto">
          <table className="text-center text-xs lg:text-[0.9rem] w-full">
            <thead>
              <tr>
                <td className="w-12  border-b border-b-slate-400 pb-3">
                  อัพเดทล่าสุดเมื่อ
                </td>
                <td className="w-12 border-b border-b-slate-400 pb-3">
                  รูปโปรไฟล์
                </td>

                <td className="w-28 border-b border-b-slate-400 pb-3 ">
                  ชื่อ-นามสกุล
                </td>
                <td className="w-16  border-b border-b-slate-400 pb-3">
                  เบอร์โทรศัพท์
                </td>
                <td className="w-10 border-b border-b-slate-400 pb-3">
                  สมาชิก <br></br> The 1
                </td>
                {/* <td className="w-10 border-b border-b-slate-400 pb-3">
                  The 1<br></br> Card
                </td> */}
                {/* <td className="w-14  border-b border-b-slate-400 pb-3">
                  ยอดซื้อ<br></br>สะสมทั้งหมด
                </td> */}
                <td className="w-14  border-b border-b-slate-400 pb-3">
                  ยอดซื้อ<br></br>สะสมทั้งหมด
                </td>

                {/* <td className="w-14  border-b border-b-slate-400 pb-3 ">
                  {" "}
                  สิทธิ์แลกรับ<br></br>กระเป๋า
                </td> */}

                <td className="w-10  border-b border-b-slate-400 pb-3 ">
                  {" "}
                  สิทธิ์ลุ้นรางวัล
                </td>
                <td className="w-12  border-b border-b-slate-400 pb-3 ">
                  {" "}
                  วันที่ลงทะเบียน
                </td>
                <td className="w-16  border-b border-b-slate-400 pb-3">
                  สาขาที่ใช้บริการบ่อยที่สุด
                </td>
              </tr>
            </thead>
            <tbody>
              {customersData.length === 0 ? (
                <tr className="">
                  <td
                    colSpan={10}
                    className="w-full border-b border-b-slate-400  h-12 font-light"
                  >
                    ไม่พบรายการ
                  </td>
                </tr>
              ) : (
                customersData.map((customer) => (
                  <tr
                    key={customer.lineId}
                    className="font-light hover:bg-slate-100 duration-200"
                  >

                    <td className="w-12 border-b border-b-slate-400 pb-3">
                      {formatThaiDateTime(customer.updatedAt)}
                    </td>

                    <td className="w-3 pt-2 border-b border-b-slate-400 pb-3">
                      <div className="flex items-center justify-center ">
                        {customer.lineProfilePic ? (
                          <>
                            <div className="w-10 h-10 rounded-full bg-slate-200 flex justify-center items-center overflow-hidden relative ">
                              <img
                                src={customer.lineProfilePic || "placeholder.jpg"}
                                alt=""
                                className="w-10 h-10 rounded-full bg-slate-100 object-cover"
                              />
                            </div>
                          </>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-slate-200 flex justify-center items-center overflow-hidden text-slate-300">
                            <FaUserCircle size={40} />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="w-16 text-center border-b border-b-slate-400 pb-3 pl-2">
                      {customer.fullname}
                    </td>
                    <td className=" border-b border-b-slate-400 pb-3">
                      {customer.phone}
                    </td>
                    <td className="w-10 border-b border-b-slate-400 pb-3 ">
                      {customer.isTheOne ? (
                        <div className="flex justify-center items-center">
                          <RxCheck size={20} />
                        </div>
                      ) : (
                        <div className="flex justify-center items-center">
                          <RxCross2 size={20} />
                        </div>
                      )}
                    </td>
                    {/* <td className="w-14 border-b border-b-slate-400 pb-3">
                      {  customer.theOneId ? customer.theOneId : "-" }
                    </td> */}
                    {/* <td className="w-14 border-b border-b-slate-400 pb-3">
                      {formatNumber(customer.allPoints)}
                    </td> */}
                    <td className="w-14 border-b border-b-slate-400 pb-3">
                      {formatNumber(customer.accPoints)}
                    </td>
                    {/* <td className="w-14 border-b border-b-slate-400 pb-3">
                      {customer.rights}
                    </td> */}

                    <td className="w-10 border-b border-b-slate-400 pb-3">
                      {formatNumber(customer.accRights)}
                    </td>
                    <td className="w-12 border-b border-b-slate-400 pb-3">
                      {new Date(customer.createdAt).toLocaleDateString(
                        "th-TH",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </td>
                    <td className="w-16 border-b border-b-slate-400 pb-3">
                      {customer.mostBranchName ? customer.mostBranchName : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <section className="mt-3 p-3 flex md:flex-row flex-col items-center md:justify-between gap-3 text-[var(--text)]">
          <Select
            isRequired
            className="flex flex-row justify-start items-center  gap-1  relative"
            selectedKey={pageSize}
            onSelectionChange={(key) => setPageSize(key as string)}
          >
            <Label className="text-start text-[15px] w-32 md:w-56  ml-2">
              Items per page :
            </Label>
            <Button className=" bg-white flex relative w-full cursor-default rounded-lg  data-[pressed]:bg-opacity-100 transition py-2 pl-3 pr-2 text-left  text-gray-700 focus:outline-none data-[focus-visible]:border-indigo-500 data-[focus-visible]:ring-2 data-[focus-visible]:ring-black sm:text-sm">
              <div className=" "></div>
              <div className=" p-2 absolute right-1 -top-1">
                <MdKeyboardArrowDown size={24} />
              </div>
              <SelectValue
                className="flex-1 truncate data-[placeholder]:font-base  text-slate-500"

              //className={InputCss}
              />
            </Button>
            <Popover
              className="max-h-60  w-40 overflow-auto rounded-md bg-white text-base shadow-lg ring-1 ring-red-400 ring-opacity-5 sm:text-sm 
                        data-[entering]:animate-fadein
                        data-[exiting]:animate-fadeout  fill-mode-forwards"
            >
              <ListBox className="outline-none p-1 [--focus-bg:theme(colors.rose.600)]">
                {pageSizeChoice.map((pageSizeChoice) => (
                  <MyListBoxItem key={pageSizeChoice} id={pageSizeChoice}>
                    {pageSizeChoice}
                  </MyListBoxItem>
                ))}
              </ListBox>
            </Popover>
          </Select>

          <p>
            Showing {firstItem} to {lastItem} of {totalCount} items
          </p>

          <div className="flex gap-3 items-center">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage <= 1}
              className="disabled:bg-[#95a59f] bg-[var(--dark-green)] text-white px-3 py-2 rounded-lg w-20 flex items-center justify-center"
            >
              <MdOutlineKeyboardArrowLeft size={20} />
            </button>
            <p>{currentPage}</p>
            <button
              onClick={handleNextPage}
              disabled={currentPage >= totalPages}
              className="disabled:bg-[#95a59f] bg-[var(--dark-green)] text-white px-3 py-2 rounded-lg w-20 flex items-center justify-center"
            >
              <MdOutlineKeyboardArrowRight size={20} />
            </button>
          </div>
        </section>
      </section>
    </div>
  );
};

export default CustomerAdmin;