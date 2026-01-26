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
} from "react-icons/md";
import MyListBoxItem from "../../styles/MyListBoxItem";
import { useEffect, useState } from "react";
import { RewardRedeemStat, useAdminStore } from "../../store/AdminStore";
import { FaRegCalendarAlt } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaMagnifyingGlass } from "react-icons/fa6";
//import { premiumReward } from "../../data/dataVariables";
import { formatDateToYYYYMMDD } from "../../data/functions";
import { FiDownload } from "react-icons/fi";
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import useBranchStore from "../../store/BranchStore";
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/20/solid";
import clsx from "clsx";
//import { formatThaiDateTime } from "../../data/functions";
import Swal from "sweetalert2";

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

  //roll
  let isSuperAdmin = false;
  if (role == "superAdmin") {
    isSuperAdmin = true;
  } else {
    isSuperAdmin = false;
  }
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
  const [selectedRewardId] = useState<string>("");
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

  //combobox
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Branch | null>(null);

  const [branchName, setBranchName] = useState<string | null>(null);
  useEffect(() => {
    if (branch) {
      const name = findBranchNameByBranchId(branch);
      setBranchName(name);
    }
  }, [branch]);

  const filteredBranch =
    query === ""
      ? branches
      : branches.filter((branch) => {
        return branch.branchName
          .toLowerCase()
          .includes(query.toLowerCase());
      });

  //API calling
  const [redemptionData, setredemptionData] = useState<Redemption[]>([]);
  const [shouldRefetch, setShouldRefetch] = useState<boolean>(false);

  //initial Pagination
  useEffect(() => {
    if (isClearingFilter) {
      return;
    }
    if (phoneFilter || selectedRewardId || startDate || endDate) {
      setLastVisibleStack([]);
    }
    const formattedStartDate = startDate
      ? formatDateToYYYYMMDD(startDate)
      : undefined;
    const formattedEndDate = endDate
      ? formatDateToYYYYMMDD(endDate)
      : undefined;

    const getCustomersData = async () => {
      if (isSuperAdmin) {
        if (selected === null) {
          //1. SuperAdmin show All
          try {
            const data = await fetchInitialAllRedeem(
              pageSize,
              selectedRewardId,
              phoneFilter,
              formattedStartDate,
              formattedEndDate
            );
            const { claimedHistory, totalCount, nextCursor } = data;
            //console.log("data: ", data);
            if (nextCursor !== null && nextCursor !== undefined) {
              setLastVisibleStack((prevStack) => [...prevStack, nextCursor]);
            }
            setCurrentPage(1);
            setredemptionData(claimedHistory ?? []);
            setTotalCount(totalCount ?? 0);
          } catch (error) {
            //handleError(error);
          }
        } else {
          //2. SuperAdmin select branch
          try {
            const data = await fetchInitialBranchRedeem(
              selected.branchId,
              pageSize,
              selectedRewardId,
              phoneFilter,
              formattedStartDate,
              formattedEndDate
            );
            const { claimedHistory, totalCount, nextCursor } = data;
            //console.log("data: ", data);
            if (nextCursor !== null && nextCursor !== undefined) {
              setLastVisibleStack((prevStack) => [...prevStack, nextCursor]);
            }
            setCurrentPage(1);
            setredemptionData(claimedHistory ?? []);
            setTotalCount(totalCount ?? 0);
          } catch (error) {
            //handleError(error);
          }
        }
      } else {
        if (branch) {
          //3.Branch Admin
          try {
            const data = await fetchInitialBranchRedeem(
              branch,
              pageSize,
              selectedRewardId,
              phoneFilter,
              formattedStartDate,
              formattedEndDate
            );
            const { claimedHistory, totalCount, nextCursor } = data;
            //console.log("data: ", data);
            if (nextCursor !== null && nextCursor !== undefined) {
              setLastVisibleStack((prevStack) => [...prevStack, nextCursor]);
            }
            setCurrentPage(1);
            setredemptionData(claimedHistory ?? []);
            setTotalCount(totalCount ?? 0);
          } catch (error) {
            // handleError(error);
          }
        }
      }
    };

    getCustomersData();
  }, [
    pageSize,
    shouldRefetch,
    startDate,
    endDate,
    selectedRewardId,
    phoneFilter,
    selected,
  ]);

  //next Pagination
  const handleNextPage = async () => {
    //console.log("Next page");
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
          //1. SuperAdmin show ALl
          try {
            const data = await fetchNextAllRedeem(
              pageSize,
              lastVisible,
              selectedRewardId,
              phoneFilter,
              formattedStartDate,
              formattedEndDate
            );
            const { claimedHistory, nextCursor } = data;

            setCurrentPage((prevPage) => prevPage + 1);
            if (nextCursor) {
              setLastVisibleStack((prevStack) => [...prevStack, nextCursor]);
            } else if (nextCursor === null) {
              setLastVisibleStack((prevStack) => [...prevStack, "0"]);
            }
            //console.log("data again: ", data);
            setredemptionData(claimedHistory ?? []);
          } catch (error) {
            //handleError(error);
          }
        } else {
          //2. SuperAdmin select branch
          try {
            const data = await fetchNextBranchRedeem(
              selected.branchId,
              pageSize,
              lastVisible,
              selectedRewardId,
              phoneFilter,
              formattedStartDate,
              formattedEndDate
            );
            const { claimedHistory, nextCursor } = data;

            setCurrentPage((prevPage) => prevPage + 1);
            if (nextCursor) {
              setLastVisibleStack((prevStack) => [...prevStack, nextCursor]);
            } else if (nextCursor === null) {
              setLastVisibleStack((prevStack) => [...prevStack, "0"]);
            }
            //console.log("data again: ", data);
            setredemptionData(claimedHistory ?? []);
          } catch (error) {
            //handleError(error);
          }
        }
      } else {
        if (branch) {
          //3.Branch Admin
          try {
            const data = await fetchNextBranchRedeem(
              branch,
              pageSize,
              lastVisible,
              selectedRewardId,
              phoneFilter,
              formattedStartDate,
              formattedEndDate
            );
            const { claimedHistory, nextCursor } = data;

            setCurrentPage((prevPage) => prevPage + 1);
            if (nextCursor) {
              setLastVisibleStack((prevStack) => [...prevStack, nextCursor]);
            } else if (nextCursor === null) {
              setLastVisibleStack((prevStack) => [...prevStack, "0"]);
            }
            //console.log("data again: ", data);
            setredemptionData(claimedHistory ?? []);
          } catch (error) {
            //handleError(error);
          }
        }
      }
    } catch (error) {
      //console.log("error in handleNextPage", error);
    }
  };

  const handlePreviousPage = async () => {
    //console.log("Previous page");
    try {
      const formattedStartDate = startDate
        ? formatDateToYYYYMMDD(startDate)
        : undefined;
      const formattedEndDate = endDate
        ? formatDateToYYYYMMDD(endDate)
        : undefined;
      if (currentPage <= 1) {
        //console.log("Already on the first page, cannot go back.");
        return;
      }

      const lastVisible = lastVisibleStack[currentPage - 3];
      if (isSuperAdmin) {
        if (selected === null) {
          //1. SuperAdmin show ALl
          try {
            const data = await fetchNextAllRedeem(
              pageSize,
              lastVisible,
              selectedRewardId,
              phoneFilter,
              formattedStartDate,
              formattedEndDate
            );
            const { claimedHistory } = data;
            setCurrentPage((prevPage) => prevPage - 1);
            setLastVisibleStack((prevStack) =>
              prevStack.slice(0, prevStack.length - 1)
            );
            setredemptionData(claimedHistory ?? []);
          } catch (error) {
            //handleError(error);
          }
        } else {
          //2. SuperAdmin select branch
          try {
            const data = await fetchNextBranchRedeem(
              selected.branchId,
              pageSize,
              lastVisible,
              selectedRewardId,
              phoneFilter,
              formattedStartDate,
              formattedEndDate
            );
            const { claimedHistory } = data;
            setCurrentPage((prevPage) => prevPage - 1);
            setLastVisibleStack((prevStack) =>
              prevStack.slice(0, prevStack.length - 1)
            );
            setredemptionData(claimedHistory ?? []);
          } catch (error) {
            //handleError(error);
          }
        }
      } else {
        if (branch) {
          //3.Branch Admin
          try {
            const data = await fetchNextBranchRedeem(
              branch,
              pageSize,
              lastVisible,
              selectedRewardId,
              phoneFilter,
              formattedStartDate,
              formattedEndDate
            );
            const { claimedHistory } = data;
            setCurrentPage((prevPage) => prevPage - 1);
            setLastVisibleStack((prevStack) =>
              prevStack.slice(0, prevStack.length - 1)
            );
            setredemptionData(claimedHistory ?? []);
          } catch (error) {
            // handleError(error);
          }
        }
      }
    } catch (error) {
      //console.log("error in handleNextPage", error);
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

  //download excel
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
          // 1. SuperAdmin show All
          await downloadAllRedeem(
            phoneFilter,
            selectedRewardId,
            formattedStartDate,
            formattedEndDate
          );
        } else {
          // 2. SuperAdmin select branch
          await downloadBranchRedeem(
            selected.branchId,
            phoneFilter,
            selectedRewardId,
            formattedStartDate,
            formattedEndDate
          );
        }
      } else {
        if (branch) {
          // 3. Branch Admin
          await downloadBranchRedeem(
            branch,
            phoneFilter,
            selectedRewardId,
            formattedStartDate,
            formattedEndDate
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

      // Optional: Log error for debugging
      console.error("Download redemption error:", error);
    }
  };

  ////console.log(refreshData);
  //console.log(selectedRewardId);
  //console.log(selected);
  useEffect(() => {
    //console.log("lastVisibleStack updated:", lastVisibleStack);
    //console.log("Page: ", currentPage);
  }, [lastVisibleStack, currentPage]);

  useEffect(() => {
    //console.log(selected);
    setLastVisibleStack([]);
    //console.log("lastVisibleStack has been reset ");
  }, [selected, pageSize]);

  //show stat redeem
  const [statData, setStatData] = useState<RewardRedeemStat[]>([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        let statResults: RewardRedeemStat[] = [];

        const fetchStat = async (redeemId: string, branchId?: string) => {
          if (branchId) {
            const data = await fetchBranchStatRedeem(redeemId, branchId);
            return Array.isArray(data)
              ? data.map((item: any) => ({
                redeemId: item.redeemId,
                branchId: item.branchId,
                gotRedeemded: item.gotRedeemded,
                sumgotRedeemded: item.sumgotRedeemded,
              }))
              : [data];
          } else {
            const data = await fetchAllStatRedeem(redeemId);
            return (
              data?.filter(
                (item): item is RewardRedeemStat => item !== undefined
              ) ?? []
            );
          }
        };

        if (isSuperAdmin) {
          if (selected === null) {
            // SuperAdmin: all branches
            const stat001 = await fetchStat("redeem001");
            const stat002 = await fetchStat("redeem002");
            statResults = [...stat001, ...stat002];
          } else {
            // SuperAdmin: selected branch
            const stat001 = await fetchStat("redeem001", selected.branchId);
            const stat002 = await fetchStat("redeem002", selected.branchId);
            statResults = [...stat001, ...stat002];
          }
        } else {
          // Branch admin
          if (branch) {
            const stat001 = await fetchStat("redeem001", branch);
            const stat002 = await fetchStat("redeem002", branch);
            statResults = [...stat001, ...stat002];
          }
        }

        setStatData(statResults);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [selected, branch]);

  return (
    <div>
      {" "}
      <section className="mt-0 m-8 ">
        <div className="flex flex-col md:flex-row gap-3 items-start md:items-end">
          <h1 className="text-3xl mt-10 text-[var(--text)]">ประวัติการแลกรับของสมนาคุณ</h1>
        </div>
        <section className="flex lg:flex-row items-start flex-col lg:justify-between">
          {isSuperAdmin ? (
            <div className="mt-3 flex gap-3 ">
              <button
                className="bg-[var(--button)] text-white px-3 py-2 rounded-lg"
                onClick={() => setSelected(null)}
              >
                ทั้งหมด
              </button>
              {/* <p className="mt-3 ml-5 text-[1.1rem]">สาขา:</p> */}
              <Combobox
                value={selected}
                onChange={(value) => setSelected(value)}
                onClose={() => setQuery("")}
              >
                <div className="relative w-40 md:w-56 ">
                  <ComboboxInput
                    className={clsx(
                      "w-full rounded-lg border-none bg-white  pr-8 pl-3 p-2 text-black",
                      "focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-black/25"
                    )}
                    placeholder="เลือกสาขา"
                    displayValue={(branches: Branch) =>
                      branches?.branchName || ""
                    }
                    onChange={(event) => setQuery(event.target.value)}
                  />
                  <ComboboxButton className="group absolute inset-y-0 right-0 px-2.5">
                    <ChevronDownIcon className="size-4 fill-black/60 group-data-[hover]:fill-black" />
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
                      <CheckIcon className="invisible size-4  group-data-[selected]:visible" />
                      <div className="text-sm/6 text-slate-600">
                        {branch.branchName}
                      </div>
                    </ComboboxOption>
                  ))}
                </ComboboxOptions>
              </Combobox>
            </div>
          ) : (
            <div className="text-[var(--text)] mt-5 text-[1.1rem]">
              สาขา {branchName ? branchName : "ไม่พบสาขา"}
            </div>
          )}
        </section>
        <section className="flex flex-wrap gap-3 mt-5">
          {/* {mockStatRedeem.rewards.map((item) => (
            <div
              key={item.rewardId}
              className={` rounded-xl w-56 max-w-72 h-40 p-7 flex flex-col gap-3 relative bg-white`}
            >
              <h1 className="text-xl">{item.rewardName}</h1>

              <p className="text-sm">แลกไปแล้ว</p>
              <h2 className="text-[2rem] -mt-5">{item.count}</h2>
            </div>
          ))} */}
          {statData.map((item) => (
            <div
              key={item.redeemId}
              className={`rounded-xl w-56 max-w-72 h-40 p-7 flex flex-col gap-3 relative bg-white`}
            >
              <h1 className="text-xl">
                {item.redeemId === "redeem001" ? 'บัตรชมภาพยนตร์ 2 ใบ' :
                  item.redeemId === "redeem003" ? 'ส่วนลดค่ากำเหน็จ 40%' :
                    item.redeemId === "redeem004" ? 'ส่วนลดค่ากำเหน็จ 500.-' :
                      item.redeemId}
              </h1>
              <p className="text-sm">
                {item.branchId ? 'จำนวนที่ถูกแลกในสาขา' : 'จำนวนที่ถูกแลกไปแล้วทั้งหมด'}
              </p>
              <h2 className="text-[2rem] -mt-2 relative">
                {item.gotRedeemded !== undefined ? item.gotRedeemded : item.sumgotRedeemded}
              </h2>
            </div>
          ))}

        </section>

        {/* Filters*/}
        <section className="w-full   flex lg:justify-start mt-3">
          <section className="flex  flex-col md:flex-row max-w-[30rem] items-start lg:items-center gap-3  mt-3">
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

            {isSuperAdmin && (
              <div
                className="cursor-pointer flex bg-[var(--button)] items-center h-10 w-full justify-center md:w-auto gap-2 p-1 py-2  rounded-lg md:ml-5"
                onClick={handleDownloadExcel}
              >
                <FiDownload size={20} color="white" />

                <p className="text-white">ดาวน์โหลด</p>
              </div>
            )}
          </section>
        </section>

        <div className="w-[18rem]  md:w-full h-full bg-white mt-5 rounded-2xl p-5 text-black overflow-x-auto">
          <table className="w-full text-center text-xs lg:text-[0.9rem]">
            <thead>
              <tr>
                <td className="w-20  border-b border-b-slate-400 pb-3 ">
                  วันที่
                </td>
                <td className="w-20 border-b border-b-slate-400 pb-3">สินค้าที่แลกรับ</td>
                <td className="w-20 border-b border-b-slate-400 pb-3">สาขา</td>
                {/* <td className="w-11  border-b border-b-slate-400 pb-3">
                  แลกรับ
                </td> */}
                <td className="w-20  border-b border-b-slate-400 pb-3">
                  ผู้แลกสินค้า
                </td>
                <td className="w-20  border-b border-b-slate-400 pb-3">
                  เบอร์โทรศัพท์
                </td>
                {/* <td className="w-20 border-b border-b-slate-400 pb-3">
                  แต้มที่ใช้
                </td> */}
              </tr>
            </thead>
            <tbody>
              {redemptionData.length === 0 ? (
                <tr className="">
                  <td
                    colSpan={6}
                    className="w-full border-b border-b-slate-400  h-12 font-light"
                  >
                    ไม่พบรายการ
                  </td>
                </tr>
              ) : (
                redemptionData.map((redemption, index) => (
                  <tr
                    key={index}
                    className="font-light hover:bg-slate-100 duration-200"
                  >
                    <td className="w-16 border-b border-b-slate-400 pb-3 pt-2 h-12">
                      {redemption.date}
                    </td>
                    <td className="w-16 text-center border-b border-b-slate-400 pb-3 pt-2 h-12">
                      {redemption.redeemId === "redeem001" ? 'บัตรชมภาพยนตร์ 2 ใบ' :
                        redemption.redeemId === "redeem003" ? 'ส่วนลดค่ากำเหน็จ 40%' :
                          redemption.redeemId === "redeem004" ? 'ส่วนลดค่ากำเหน็จ 500.-' :
                            redemption.redeemId}
                    </td>
                    <td className="w-16 text-center border-b border-b-slate-400 pb-3 pt-2 h-12">
                      {findBranchNameByBranchId(redemption.branchId)}
                    </td>
                    {/* <td className="w-20  border-b border-b-slate-400 pb-3">
                      {redemption.rewardName}
                    </td> */}
                    <td className="w-20 border-b text-center border-b-slate-400 pb-3 pt-2 h-12">
                      {redemption.fullname}
                    </td>
                    <td className="w-20 border-b text-center border-b-slate-400 pb-3 pt-2 h-12">
                      {redemption.phone}
                    </td>
                    {/* <td className="w-20 border-b border-b-slate-400 pb-3 pt-2 h-12">
                      {formatNumber(redemption.pointsUsed)}
                    </td> */}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <section className="mt-3 p-3 flex md:flex-row flex-col items-center md:justify-between gap-3">
          <Select
            isRequired
            className="flex flex-row justify-start items-center  gap-1  relative"
            selectedKey={pageSize}
            onSelectionChange={(key) => setPageSize(key as string)}
          >
            <Label className="text-start text-white text-[15px] w-32 md:w-56  ml-2">
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
    </div>
  );
};

export default RedeemHistoryAdmin;
