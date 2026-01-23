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
//import CreateNewAdminDialog from "../dialogs/admin/createNewAdminDialog";
import CreateNewAdminDialog from "../dialogs/admin/CreateNewAdminDialog";
import BranchAdminDialog from "../dialogs/admin/BranchAdminDialog";
import ConfirmDeleteAdminDialog from "../dialogs/admin/ConfirmDeleteAdminDialog";
import { GoPlusCircle } from "react-icons/go";
//import { formatThaiDateTime, handleError } from "../../data/functions";
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
  //pagination
  const [pageSize, setPageSize] = useState("10");
  const [lastVisibleStack, setLastVisibleStack] = useState<string[]>([]); //string array
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [firstItem, setFirstItem] = useState(0);
  const [lastItem, setLastItem] = useState(0);

  //API calling
  const [adminData, setAdminData] = useState<AdminList[]>([]);
  const [shouldRefetch, setShouldRefetch] = useState<boolean>(false);

  //initial Pagination
  useEffect(() => {
    const getAdminData = async () => {
      try {
        const data = await fetchInitialAdmin(pageSize);
        const { admins, totalCount, nextCursor } = data;
        //console.log("data: ", data);
        if (nextCursor !== null && nextCursor !== undefined) {
          setLastVisibleStack((prevStack) => [...prevStack, nextCursor]);
        }
        setCurrentPage(1);
        setAdminData(admins ?? []);
        setTotalCount(totalCount ?? 0);
      } catch (error) {
        //handleError(error);
      }
    };

    getAdminData();
  }, [pageSize, shouldRefetch]);

  //next Pagination
  const handleNextPage = async () => {
    //console.log("Next page");
    try {
      const lastVisible = lastVisibleStack[currentPage - 1];

      const data = await fetchNextAdmin(pageSize, lastVisible);
      const { admins, nextCursor } = data;

      setCurrentPage((prevPage) => prevPage + 1);
      if (nextCursor) {
        setLastVisibleStack((prevStack) => [...prevStack, nextCursor]);
      } else if (nextCursor === null) {
        setLastVisibleStack((prevStack) => [...prevStack, "0"]);
      }
      //console.log("data again: ", data);
      setAdminData(admins ?? []);
      //console.log("next: ",adminData);
    } catch (error) {
      //handleError(error);
    }
  };

  const handlePreviousPage = async () => {
    //console.log("Previous page");
    try {
      if (currentPage <= 1) {
        //console.log("Already on the first page, cannot go back.");
        return;
      }

      const lastVisible = lastVisibleStack[currentPage - 3];
      const data = await fetchNextAdmin(pageSize, lastVisible);
      const { admins } = data;
      setCurrentPage((prevPage) => prevPage - 1);
      setLastVisibleStack((prevStack) =>
        prevStack.slice(0, prevStack.length - 1)
      );
      setAdminData(admins ?? []);
    } catch (error) {
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
      //console.log(lastVisibleStack);
    } else {
      setFirstItem(0);
      setLastItem(0);
    }
  }, [currentPage, pageSize, totalCount]);

  const totalPages = Math.ceil(totalCount / Number(pageSize));

  //create admin dialog
  const [isCreateAdminOpen, setIsCreateAdminOpen] = useState<boolean>(false);

  const handleCreateAdminOpenDialog = () => {
    setIsCreateAdminOpen(true); //set to open dialog
    setUniversalOverlayTrue(); //overlay on
  };

  const handleCreateAdminDialogClose = () => {
    setIsCreateAdminOpen(false); //set to close dialog
    setUniversalOverlayFalse(); //overlay off
  };

  const refreshData = () => {
    //have to refresh everytime we create new admin
    setCurrentPage(1);
    setLastVisibleStack([]);
    setShouldRefetch((prev) => !prev);
    //console.log("refreshData");
  };

  //branch admin dialog
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

  //delete admin dialog
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] =
    useState<boolean>(false);

  // const handleDeleteAdminOpenDialog = (admin: AdminList) => {
  //   setSelectedAdmin(admin);
  //   setIsConfirmDeleteOpen(true);
  //   setUniversalOverlayTrue();
  // };
  const handleAdminEnable = async (username: string, isEnabled: Boolean) => {
    try {
      await enableAdmin(username, isEnabled);
      //refreshData();
      //เปลี่ยนเป็นfetchหน้านั้น
      try {
        const lastVisible = lastVisibleStack[currentPage - 2];

        const data = await fetchNextAdmin(pageSize, lastVisible);
        const { admins } = data;

        setAdminData(admins ?? []);
      } catch (error) {}
      //console.log("Admin status updated successfully:", response);
    } catch (error) {
      throw error;
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
    setShouldRefetch((prev) => !prev);
  };
  return (
    <div>
      <section className="mt-0 m-8 ">
        <div className="flex flex-col md:flex-row gap-3 items-start md:items-end">
          <h1 className="text-3xl text-[var(--text)] mt-10">
            รายชื่อแอดมิน
          </h1>
          <button
            className="p-2 px-5 text-white bg-[var(--button)] rounded-full flex items-center gap-3"
            onClick={handleCreateAdminOpenDialog}
          >
            <GoPlusCircle />
            สร้างรายชื่อแอดมิน
          </button>
        </div>

        <div className="w-[18rem]  md:w-full h-full bg-white mt-5 rounded-2xl p-5 text-black overflow-x-auto">
          <table className="w-full text-center text-xs lg:text-[0.9rem]">
            <thead>
              <tr>
                {/* <td className="w-32  border-b border-b-slate-400 pb-3">
                  วันที่
                </td> */}
                <td className="w-32 border-b border-b-slate-400 pb-3">สาขา</td>
                <td className="w-5 pl-5 border-b border-b-slate-400 pb-3"></td>
                <td className="w-40 border-b border-b-slate-400 pb-3">
                  ชื่อผู้ใช้แอดมิน
                </td>
                {/* <td className="w-32  border-b border-b-slate-400 pb-3">
                  รหัสผ่าน
                </td> */}

                <td className="w-5  border-b border-b-slate-400 pb-3 text-white">
                  {" "}
                  แก้ไข
                </td>
                <td className="w-5  border-b border-b-slate-400 pb-3 text-white">
                  {" "}
                  ลบ
                </td>
              </tr>
            </thead>
            <tbody>
              {adminData.length === 0 ? (
                <tr className="">
                  <td
                    colSpan={6}
                    className="w-full border-b border-b-slate-400  h-12 font-light"
                  >
                    ไม่พบรายการ
                  </td>
                </tr>
              ) : (
                <>
                  {adminData.map((admin, index) => {
                    return (
                      <tr
                        className="font-light hover:bg-slate-100 duration-200"
                        key={index}
                      >
                        {/* <td className="w-32 border-b border-b-slate-400 py-5 text-slate-500">
                          {formatThaiDateTime(admin.createdAt)}
                        </td> */}
                        <td className="w-32 border-b border-b-slate-400 py-5">
                          { admin.branchId
                            ?findBranchNameByBranchId(admin.branchId)
                            :"ไม่สังกัดสาขา"
                          }
                        </td>
                        <td className="w-2 border-b border-b-slate-400 py-5 text-end text-slate-600 ">
                          <div className="  flex items-center justify-center w-full h-8">
                            <FaUserCircle size={25} />
                          </div>
                        </td>

                        <td className="w-40  border-b border-b-slate-400 py-5 text-center pl-3">
                          {admin.username}
                        </td>
                        <td className="w-5 border-b border-b-slate-400 py-2 cursor-pointer ">
                          <div
                            className=" rounded-full  flex items-center justify-center w-8 h-8  hover:bg-slate-200 duration-200"
                            onClick={() => handleBranchAdminOpenDialog(admin)}
                          >
                            <LuPencil size={16} />
                          </div>
                        </td>
                        <td className="w-5 border-b border-b-slate-400 py-2 cursor-pointer ">
                          <div
                            className=" rounded-full  flex items-center justify-center w-8 h-8  hover:bg-slate-200 duration-200"
                            // onClick={() => handleDeleteAdminOpenDialog(admin)}
                          >
                            {/* <FaRegTrashAlt size={16} /> */}
                            <td className="py-2 px-4 ">
                              <Switch
                                checked={admin.isEnable}
                                onChange={(isChecked) =>
                                  handleAdminEnable(
                                    admin.adminId,
                                    isChecked
                                  )
                                }
                                onColor="#4caf50"
                                offColor="#f44336"
                                uncheckedIcon={false}
                                checkedIcon={false}
                              />
                            </td>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </>
              )}
            </tbody>
          </table>
        </div>
        <section className="mt-3 p-3 flex md:flex-row flex-col items-center md:justify-between gap-3 text-[var(--text)]">
          <Select
            isRequired
            className="flex flex-row justify-start items-center  gap-1  relative"
            selectedKey={pageSize}
            onSelectionChange={(key) => handleChangeSelectionPageSize(key)}
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
              className="disabled:bg-[#95a59f] bg-[var(--red)] text-white px-3 py-2 rounded-lg w-20 flex items-center justify-center"
            >
              <MdOutlineKeyboardArrowLeft size={20} />
            </button>
            <p>{currentPage}</p>
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
