import React, { useEffect, useState } from "react";
import Switch from "react-switch";
import { IoCheckmarkCircle, IoCloseCircleSharp } from "react-icons/io5";
import { VscTools } from "react-icons/vsc";
import axios from "axios";
import { handleError } from "../../data/functions";
import Swal from "sweetalert2";
import useAuthStore from "../../store/AuthStore";
import useBranchStore from "../../store/BranchStore";

interface BranchResponse {
  branchId: string;
  branchName: string;
  isBranchEnable: boolean;
  vipPoint: string;
  stores: {
    storeId: string;
    storeName: string;
    branchId: string;
    isStoreEnable: boolean;
  }[];
}

interface BranchOption {
  value: string;
  label: string;
}

const SecretAdminEdit = () => {
  // Global stores
  const { accessToken } = useAuthStore();
  const { findBranchNameByBranchId } = useBranchStore();

  // State for listing branches/stores
  const [branchData, setBranchData] = useState<BranchResponse[]>([]);
  const [branchOption, setBranchOption] = useState<BranchOption[]>([]);

  // State for adding a new store
  const [newStore, setNewStore] = useState<string>("");
  const [selectedBranchOption, setSelectedBranchOption] = useState<string>("");

  // State for adding a new branch
  const [newBranchId, setNewBranchId] = useState<string>(""); // Optional custom branchId
  const [newBranchName, setNewBranchName] = useState<string>("");
  const [canVip, setCanVip] = useState<boolean>(true);
  const [vipPoint, setVipPoint] = useState<number>(70000);
  const [canHokkaido, setCanHokkaido] = useState<boolean>(true);
  const [canBag, setCanBag] = useState<boolean>(true);

  // Loading and logs
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastEdited, setLastEdited] = useState<string>("");

  // ───────────────────────────────────────────────────────────
  // 1. Fetch initial branch data
  // ───────────────────────────────────────────────────────────
  const refreshData = async () => {
    try {
      const response = await axios.get("/branch", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (response) {
        // Convert branches into select options
        const branchOptions = response.data.map((branch: BranchResponse) => ({
          value: branch.branchId,
          label: branch.branchName,
        }));
        setBranchOption(branchOptions);
        setBranchData(response.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    refreshData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ───────────────────────────────────────────────────────────
  // 2. Handle store creation in existing branch
  // ───────────────────────────────────────────────────────────
  const handleBranchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBranchOption(e.target.value);
  };

  const handleSubmitStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStore || !selectedBranchOption) return;

    // The user selected an existing branch, so we add a store to it
    const requestBody = {
      branchId: selectedBranchOption,
      stores: [
        {
          storeName: newStore,
        },
      ],
    };

    try {
      setIsLoading(true);
      await axios.post("/branch/add-store", requestBody, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      setLastEdited(
        `เพิ่มร้านค้า ${newStore} สาขา ${findBranchNameByBranchId(
          requestBody.branchId
        )}`
      );

      await Swal.fire({
        title: "เพิ่มร้านค้าลง db สำเร็จ",
        text: `เพิ่มร้านค้า: ${newStore} ในสาขา: ${findBranchNameByBranchId(
          requestBody.branchId
        )}`,
        icon: "success",
        confirmButtonText: "ตกลง",
        allowOutsideClick: false,
      });

      // Refresh and reset
      refreshData();
      setNewStore("");
      setSelectedBranchOption("");
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // ───────────────────────────────────────────────────────────
  // 3. Handle branch creation (with optional branchId, canVip, vipPoint, etc.)
  // ───────────────────────────────────────────────────────────
  const handleSubmitBranch = async (e: React.FormEvent) => {
    e.preventDefault();

    // If newBranchId is empty, the backend can auto-generate branchId
    // If you want to always send branchId, remove the spread operator
    const requestBody = {
      ...(newBranchId && { branchId: newBranchId }),
      branchName: newBranchName,
      isBranchEnable: true,
      canVip,
      vipPoint,
      canHokkaido,
      canBag,
      stores: [],
    };

    if (!newBranchName) return;

    try {
      setIsLoading(true);
      await axios.post("/branch/create", requestBody, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      setLastEdited(`เพิ่มสาขา ${requestBody.branchName}`);

      await Swal.fire({
        title: "เพิ่มสาขาลง db สำเร็จ",
        text: `เพิ่มสาขา: ${requestBody.branchName}`,
        icon: "success",
        confirmButtonText: "ตกลง",
        allowOutsideClick: false,
      });

      // Refresh and reset
      setNewBranchId("");
      setNewBranchName("");
      setCanVip(true);
      setVipPoint(70000);
      setCanHokkaido(true);
      setCanBag(true);
      refreshData();
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // ───────────────────────────────────────────────────────────
  // 4. Toggle branch enable/disable
  // ───────────────────────────────────────────────────────────
  const handleBranchToggle = async (branchId: string) => {
    try {
      setIsLoading(true);

      const branchIndex = branchData.findIndex(
        (branch) => branch.branchId === branchId
      );
      if (branchIndex === -1) throw new Error("Branch not found");

      const newIsBranchEnabled = !branchData[branchIndex].isBranchEnable;

      // Update on backend
      await axios.patch(
        `/branch/status/${branchId}`,
        { isBranchEnable: newIsBranchEnabled },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      // Update local state
      const updatedBranches = [...branchData];
      updatedBranches[branchIndex].isBranchEnable = newIsBranchEnabled;
      setBranchData(updatedBranches);

      setLastEdited(
        `${newIsBranchEnabled ? "ใช้งาน" : "ไม่ใช้งาน"} สาขา ${
          updatedBranches[branchIndex].branchName
        }`
      );
    } catch (error) {
      console.error("Error updating branch status:", error);
      Swal.fire({
        title: "Error",
        text: "ไม่สามารถอัปเดตสถานะสาขาได้",
        icon: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ───────────────────────────────────────────────────────────
  // 5. Toggle store enable/disable
  // ───────────────────────────────────────────────────────────
  const handleStoreToggle = async (branchId: string, storeId: string) => {
    try {
      setIsLoading(true);

      const branchIndex = branchData.findIndex(
        (branch) => branch.branchId === branchId
      );
      if (branchIndex === -1) throw new Error("Branch not found");

      const storeIndex = branchData[branchIndex].stores.findIndex(
        (store) => store.storeId === storeId
      );
      if (storeIndex === -1) throw new Error("Store not found");

      const newIsStoreEnabled = !branchData[branchIndex].stores[storeIndex]
        .isStoreEnable;

      // Update on backend
      await axios.patch(
        `/branch/status/${branchId}/${storeId}`,
        { isStoreEnable: newIsStoreEnabled },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      // Update local state
      const updatedBranches = [...branchData];
      updatedBranches[branchIndex].stores[storeIndex].isStoreEnable =
        newIsStoreEnabled;
      setBranchData(updatedBranches);

      setLastEdited(
        `ร้าน ${
          branchData[branchIndex].stores[storeIndex].storeName
        } - สาขา ${branchData[branchIndex].branchName} - ${
          newIsStoreEnabled ? "เปิด" : "ปิด"
        }`
      );
    } catch (error) {
      console.error("Error updating store status:", error);
      Swal.fire({
        title: "Error",
        text: "ไม่สามารถอัปเดตสถานะร้านค้าได้",
        icon: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ───────────────────────────────────────────────────────────
  // 6. Loading overlay effect
  // ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (isLoading) {
      Swal.fire({
        title: "Loading...",
        width: 600,
        backdrop: "rgba(0,0,0,0.5)",
        background: "transparent",
        showConfirmButton: false,
        allowOutsideClick: false,
        customClass: {
          title: "text-white text-2xl font-kanit",
        },
      });
    } else {
      Swal.close();
    }
  }, [isLoading]);

  // ───────────────────────────────────────────────────────────
  // Render
  // ───────────────────────────────────────────────────────────
  return (
    <div className="relative">
      <div className="mt-0 m-8 flex flex-col h-[80rem]">
        <h1 className="text-white text-2xl mt-10 flex gap-3 items-center">
          <span>
            <VscTools />
          </span>{" "}
          Secret Admin แก้ไข db
        </h1>

        <div className="flex gap-3 items-start mt-5">
          {/* ─────────────────────────────────────────────────────────
              1) Add Store to an Existing Branch
              ───────────────────────────────────────────────────────── */}
          <form
            onSubmit={handleSubmitStore}
            className="flex flex-col gap-5 mt-5 bg-gray-400 rounded-lg p-4"
          >
            <h1 className="text-xl text-white">เพิ่มร้านค้า</h1>
            <div>
              <label
                htmlFor="options"
                className="block mb-1 font-medium text-white"
              >
                เลือกสาขา:
              </label>
              <select
                id="options"
                value={selectedBranchOption}
                onChange={handleBranchChange}
                className="w-full border  border-gray-300 rounded-md p-2"
              >
                <option value="" disabled>
                  ไม่พบสาขา
                </option>
                {branchOption.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-3 items-center">
              <label
                htmlFor="newStore"
                className="block mb-1 font-medium w-44 text-white"
              >
                ร้านค้าที่จะเพิ่ม:
              </label>
              <input
                id="newStore"
                type="text"
                value={newStore}
                onChange={(e) => setNewStore(e.target.value)}
                className="w-full text-white border border-gray-300 rounded-md p-2 "
                placeholder="ใส่ชื่อร้าน"
              />
            </div>
            <button type="submit" className="bg-[var(--button)] text-white p-2 rounded-md">
              + เพิ่มร้านค้า
            </button>
          </form>

          {/* ─────────────────────────────────────────────────────────
              2) Add a New Branch (Optional branchId)
              ───────────────────────────────────────────────────────── */}
          <form
            onSubmit={handleSubmitBranch}
            className="flex flex-col gap-5 mt-5 bg-gray-400 rounded-lg p-4"
          >
            <h1 className="text-xl text-white">เพิ่มสาขา</h1>

            {/* Optional custom branchId */}
            <div className="flex gap-3 items-center">
              <label
                htmlFor="newBranchId"
                className="block mb-1 font-medium w-44 text-white"
              >
                รหัสสาขา :
              </label>
              <input
                id="newBranchId"
                type="text"
                value={newBranchId}
                onChange={(e) => setNewBranchId(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 text-white"
                placeholder="R001"
              />
            </div>

            {/* Branch name */}
            <div className="flex gap-3 items-center">
              <label
                htmlFor="newBranchName"
                className="block mb-1 font-medium w-44 text-white"
              >
                สาขาที่จะเพิ่ม:
              </label>
              <input
                id="newBranchName"
                type="text"
                value={newBranchName}
                onChange={(e) => setNewBranchName(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 text-white"
                placeholder="Ex. สาขาเชียงใหม่"
              />
            </div>

            {/* Optional fields */}
            <div className="flex flex-col gap-2 text-white">
              
              
              <label className="flex items-center gap-2">
                vipPoint:
                <input
                  type="number"
                  className="border border-gray-300 rounded-md p-1 w-28"
                  value={vipPoint}
                  onChange={(e) => setVipPoint(Number(e.target.value))}
                />
              </label>
            </div>

            <button type="submit" className="bg-[var(--button)] text-white p-2 rounded-md">
              + เพิ่มสาขาใหม่
            </button>
          </form>
        </div>

        {/* ─────────────────────────────────────────────────────────
            3) Table of branches & stores
            ───────────────────────────────────────────────────────── */}
        <div className="overflow-x-auto mt-10">
          <p className="text-white text-xl">
            รายการแก้ไขล่าสุด:{" "}
            <span className="text-black font-light text-xl">{lastEdited}</span>{" "}
          </p>
          <table className="min-w-full bg-white border border-gray-300 mt-5 text-sm rounded-lg">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b"></th>
                <th className="py-2 px-4 border-b">Branch ID</th>
                <th className="py-2 px-4 border-b">Branch Name</th>
                <th className="py-2 px-4 border-b">VIP Points</th>
                <th className="py-2 px-4 border-b">Store ID</th>
                <th className="py-2 px-4 border-b">Store Name</th>
                <th className="py-2 px-4 border-b">Store Status</th>
              </tr>
            </thead>
            <tbody className="font-light text-center">
              {branchData.map((branch) => (
                <React.Fragment key={branch.branchId}>
                  {branch.stores && branch.stores.length > 0 ? (
                    branch.stores.map((store) => (
                      <tr
                        key={store.storeId}
                        className={
                          !branch.isBranchEnable ? "text-slate-300" : "text-black"
                        }
                      >
                        {/* Toggle Branch */}
                        <td
                          className="w-10 py-2 px-4 border-b cursor-pointer hover:bg-slate-200 duration-200"
                          onClick={() => handleBranchToggle(branch.branchId)}
                        >
                          {branch.isBranchEnable ? (
                            <span className="text-green-600">
                              <IoCheckmarkCircle size={20} />
                            </span>
                          ) : (
                            <span className="text-red-500">
                              <IoCloseCircleSharp size={20} />
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-4 border-b text-xs">
                          {branch.branchId}
                        </td>
                        <td className="py-2 px-4 border-b">
                          {branch.vipPoint}
                        </td>
                        <td className="py-2 px-4 border-b">
                          {branch.branchName}
                        </td>
                        <td
                          className={`py-2 px-4 border-b text-xs ${
                            store.isStoreEnable ? "" : "text-red-500"
                          }`}
                        >
                          {store.storeId}
                        </td>
                        <td
                          className={`py-2 px-4 border-b ${
                            store.isStoreEnable ? "" : "text-red-500"
                          }`}
                        >
                          {store.storeName}
                        </td>
                        <td className="py-2 px-4 border-b">
                          <Switch
                            checked={store.isStoreEnable}
                            onChange={() =>
                              handleStoreToggle(branch.branchId, store.storeId)
                            }
                            onColor="#4caf50"
                            offColor="#f44336"
                            uncheckedIcon={false}
                            checkedIcon={false}
                            disabled={!branch.isBranchEnable}
                          />
                        </td>
                      </tr>
                    ))
                  ) : (
                    // If no stores
                    <tr
                      key={branch.branchId}
                      className={
                        !branch.isBranchEnable ? "text-slate-300" : "text-black"
                      }
                    >
                      <td
                        className="w-10 py-2 px-4 border-b cursor-pointer hover:bg-slate-200 duration-200"
                        onClick={() => handleBranchToggle(branch.branchId)}
                      >
                        {branch.isBranchEnable ? (
                          <span className="text-green-600">
                            <IoCheckmarkCircle size={20} />
                          </span>
                        ) : (
                          <span className="text-red-500">
                            <IoCloseCircleSharp size={20} />
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-4 border-b text-xs">
                        {branch.branchId}
                      </td>
                      <td className="py-2 px-4 border-b">{branch.branchName}</td>
                      <td className="py-2 px-4 border-b text-center" colSpan={3}>
                        ไม่มีร้านค้า
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SecretAdminEdit;
