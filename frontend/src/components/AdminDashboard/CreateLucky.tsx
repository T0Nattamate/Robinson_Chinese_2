/* eslint-disable */
import { FaRegTrashAlt } from "react-icons/fa";

import { useEffect, useState } from "react";
import { useAdminStore } from "../../store/AdminStore";
import CreateNewLuckyDialog from "../dialogs/admin/CreateNewLuckyDialog";

import LuckyDialog from "../dialogs/admin/LuckyDialog";
import ConfirmDeleteLucky from "../dialogs/admin/ConfirmDeleteLucky";
import { LuckyResponse } from "../../store/AdminStore";
import { GoTrophy } from "react-icons/go";

const CreateLucky = () => {
  const { setUniversalOverlayFalse, setUniversalOverlayTrue, getLuckyByAdmin } =
    useAdminStore();

  //API calling
  const [luckyData, setluckyData] = useState<LuckyResponse[]>([]);
  const [shouldRefetch, setShouldRefetch] = useState<boolean>(false);

  //initial Pagination
  useEffect(() => {
    const getluckyData = async () => {
      try {
        const data = await getLuckyByAdmin();
        const filteredData = data.filter(
          (item): item is LuckyResponse => !!item
        );
        setluckyData(filteredData);
        //console.log("fetch create lucky admin", data);
      } catch (error) {
        //handleError(error);
      }
    };

    getluckyData();
  }, [shouldRefetch]);

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
    setShouldRefetch((prev) => !prev);
    //console.log("refreshData");
  };

  //branch admin dialog
  const [isLuckyOpen, setIsBranchAdminOpen] = useState<boolean>(false);
  const [selectedLucky, setselectedLucky] = useState<LuckyResponse | null>(
    null
  );

  // const handleBranchAdminOpenDialog = (admin: LuckyResponse) => {
  //   setselectedLucky(admin);
  //   setIsBranchAdminOpen(true);
  //   setUniversalOverlayTrue();
  // };

  const handleBranchAdminDialogClose = () => {
    setIsBranchAdminOpen(false);
    setUniversalOverlayFalse();
  };

  //delete admin dialog
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] =
    useState<boolean>(false);

  const handleDeleteAdminOpenDialog = (admin: LuckyResponse) => {
    setselectedLucky(admin);
    setIsConfirmDeleteOpen(true);
    setUniversalOverlayTrue();
  };

  const handleDeleteDialogClose = () => {
    setIsConfirmDeleteOpen(false);
    setUniversalOverlayFalse();
  };
  return (
    <div>
      <section className="mt-0 m-8 ">
        <div className="flex flex-col md:flex-row gap-3 items-start md:items-end">
          <h1 className="text-3xl mt-10 text-[var(--ghost-white)]">ส่งรายชื่อผู้โชคดี</h1>
          <button
            className="p-2 px-5 bg-[var(--red)] text-white rounded-full flex items-center gap-3"
            onClick={handleCreateAdminOpenDialog}
          >
            <GoTrophy />
            สร้างรายชื่อผู้โชคดี
          </button>
        </div>

        <div className="w-[18rem]  md:w-full h-full bg-white mt-5 rounded-2xl p-5 text-black overflow-x-auto">
          <table className="w-full text-center text-xs lg:text-[0.9rem]">
            <thead>
              <tr>
                <td className="w-10  border-b border-b-slate-400 pb-3">
                  ลำดับที่
                </td>
                <td className="w-28 border-b border-b-slate-400 pb-3">
                  ชื่อ-นามสกุล
                </td>
                <td className="w-5 pl-5 border-b border-b-slate-400 pb-3">
                  เบอร์โทรศัพท์
                </td>
                <td className="w-5 pl-5 border-b border-b-slate-400 pb-3">
                  โรบินสันสาขา
                </td>
                <td className="w-5 pl-5 border-b border-b-slate-400 pb-3">
                  สัปหาห์ที่ได้รับรางวัล
                </td>
                <td className="w-5  border-b border-b-slate-400 pb-3 text-black">
                  {" "}
                  ลบ
                </td>
              </tr>
            </thead>
            <tbody>
              {luckyData.length === 0 ? (
                <tr className=" e">
                  <td
                    colSpan={6}
                    className="w-full border-b border-b-slate-400  h-12 font-light"
                  >
                    ไม่พบรายการ
                  </td>
                </tr>
              ) : (
                <>
                  {luckyData.map((lucky, index) => {
                    return (
                      <tr
                        className="font-light hover:bg-slate-100 duration-200"
                        key={index}
                      >
                        <td className="w-10 border-b border-b-slate-400 py-5 text-slate-500">
                          {index + 1}
                        </td>
                        <td className="w-20 border-b border-b-slate-400 py-5">
                          {lucky.fullname}
                        </td>
                        <td className="w-5 border-b border-b-slate-400 py-5 text-slate-600">
                          {lucky.phone}
                        </td>
                        <td className="w-5 border-b border-b-slate-400 py-5 text-slate-600">
                          {lucky.mostBranchName}
                        </td>
                        <td className="w-5 border-b border-b-slate-400 py-5 text-slate-600">
                          {lucky.week}
                        </td>
                        <td
                          className="w-5 border-b border-b-slate-400 py-5 cursor-pointer text-center"
                          onClick={() => handleDeleteAdminOpenDialog(lucky)}
                        >
                          <FaRegTrashAlt className="inline-block" />
                        </td>
                      </tr>
                    );
                  })}
                </>
              )}
            </tbody>
          </table>
        </div>
      </section>
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
