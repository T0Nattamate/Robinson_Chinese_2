import { Dialog, DialogPanel } from "@headlessui/react";
import { animated, useTransition, useSpring } from "@react-spring/web";
import { useEffect, useState } from "react";
import { TextField, Label, Input, Form, Button } from "react-aria-components";
import { FaRegEye, FaRegEyeSlash, FaXmark } from "react-icons/fa6";
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
//import { Branch } from "../../../data/mockExternalData";
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/20/solid";
import clsx from "clsx";
import { useAdminStore } from "../../../store/AdminStore";
import { AdminList } from "../../AdminDashboard/CreateAdmin";
import { handleError, showAlert } from "../../../data/functions";
import useBranchStore from "../../../store/BranchStore";
import { Branch } from "../../../store/BranchStore";

interface CreateAdminDialogClose {
  isBranchAdminOpen: boolean;
  handleBranchAdminDialogClose: () => void;
  refreshData: () => void;
  admin: AdminList | null;
}

const BranchAdminDialog: React.FC<CreateAdminDialogClose> = ({
  isBranchAdminOpen,
  handleBranchAdminDialogClose,
  refreshData,
  admin,
}) => {
  const { branches } = useBranchStore();
  const { updateNewBranch, updateNewPassword, validateOldPassword } =
    useAdminStore();
  const [isVisible, setIsVisible] = useState(isBranchAdminOpen);

  const springProps = useSpring({
    transform: isBranchAdminOpen ? "scale(1)" : "scale(0.6)",
    config: { tension: 170, friction: 16 },
  });
  const transitions = useTransition(isBranchAdminOpen, {
    from: { opacity: 0, transform: "scale(0.9)" },
    enter: { opacity: 1, transform: "scale(1)" },
    leave: { opacity: 0, transform: "scale(0.9)" },
    config: { duration: 200 },
    onRest: () => {
      if (!isBranchAdminOpen) setIsVisible(false);
    },
  });

  //เปิด dialog -> ให้ clear state password ทั้งหมด แล้วบังคับเปิดแท็บแรกเสมอ
  useEffect(() => {
    if (isBranchAdminOpen) {
      setIsVisible(true);
      clearOldPassState();
      setIsFirstTab(true);
    }
  }, [isBranchAdminOpen]);

  //combobox
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Branch | null>(null);

  const enabledBranches = branches
  .filter((branch) => branch.isBranchEnable)
  .filter((branch) => branch.stores.some(store => store.isStoreEnable));

  const filteredBranch =
    query === ""
      ? enabledBranches
      : enabledBranches.filter((branch) => {
          return branch.branchName
            .toLowerCase()
            .includes(query.toLowerCase());
        });

  //form
  const [username, setUsername] = useState(admin?.username || "");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  // Separate show password states
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const toggleOldPass = () => setShowOldPass(!showOldPass);
  const toggleNewPass = () => setShowNewPass(!showNewPass);
  const toggleConfirmPass = () => setShowConfirmPass(!showConfirmPass);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    switch (true) {
      case isFirstTab: {
        if (!selected) {
          //First Tab: บังคับให้เลือกสาขาก่อน
          showAlert("กรุณาเลือกสาขาของแอดมิน", "error");
        } else {
          //console.log("ยิงapi แก้ไขสาขา");
          try {
            const requestBody = {
              adminId: admin!.adminId,
              branchId: selected.branchId
            };
            const response = await updateNewBranch(requestBody);
            if (response) {
              showAlert("อัพเดทสาขาของแอดมินแล้ว", "success", [refreshData]);
            }
          } catch (error) {
            handleError(error);
          }
        }
        break;
      }
      default: {
        //Second Tab

        //1. ยืนยันพาสเก่า
        if (!oldPassCorrect) {
          //1.1 validate: กรอกพาสเก่าด้วย
          if (!oldPassword) {
            showAlert("กรุณากรอกรหัสผ่านเดิม", "error");
          } else {
            // 1.2 api call
            //console.log("ยิงapi แก้ไขรหัสผ่าน");
            try {
              const requestBody = {
                adminId: admin!.adminId,
                inputPassword: oldPassword
              };
              const response = await validateOldPassword(requestBody);
              //console.log(response);
              if (response.data) {
                setOldPassCorrect(true);
              }
            } catch (error) {
              handleError(error);
            }
          }
        } else {
          // 2.อัพเดทพาสใหม่
          //2.1 validate: ถ้า confirmpass ไม่ตรง ไม่ให้ submit+api call
          if (Object.keys(errors).length > 0) {
            showAlert("กรุณากรอกข้อมูลให้ถูกต้อง", "error");
            return;
          } else {
            //2.2 api call
            try {
              const requestBody = {
                adminId: admin!.adminId,
                newPassword: newPassword
              };
              const response = await updateNewPassword(requestBody);
              if (response) {
                showAlert("อัพเดทรหัสผ่านของแอดมินแล้ว", "success", [
                  refreshData,
                  clearOldPassState,
                ]);
              }
            } catch (error) {
              handleError(error);
            }
          }
        }

        break;
      }
    }
  };

  useEffect(() => {
    if (isBranchAdminOpen) {
      setErrors({});
      setIsVisible(true);
      setOldPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      if (admin) {
        setUsername(admin.username);
        const selectedBranch = branches.find(
          (branch) => branch.branchId === admin.branchId
        );
        setSelected(selectedBranch || null);
      }
    }
  }, [isBranchAdminOpen, admin]);

  //console.log("อัพเดทสาขาใหม่", selected);
  //password validate
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [oldPassCorrect, setOldPassCorrect] = useState<boolean>(false);

  useEffect(() => {
    if (confirmNewPassword.length > 0) {
      if (newPassword !== confirmNewPassword) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          newPassword: "ยืนยันรหัสผ่านใหม่ไม่ถูกต้อง",
        }));
      } else {
        setErrors((prevErrors) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { newPassword, ...rest } = prevErrors;
          return rest;
        });
        //console.log("ยืนยันรหัสผ่านใหม่ถูกต้อง");
      }
    }
  }, [newPassword, confirmNewPassword, oldPassword]);
  useEffect(() => {
    //console.log(errors);
  }, [errors]);

  //select tab
  const [isFirstTab, setIsFirstTab] = useState<boolean>(true);
  useEffect(() => {
    if (!isFirstTab) {
      clearOldPassState();
    }
  }, [isFirstTab]);

  const clearOldPassState = () => {
    setOldPassCorrect(false);
    setNewPassword("");
    setOldPassword("");
    setConfirmNewPassword("");
  };

  return (
    <Dialog
      open={isVisible}
      as="div"
      className="relative z-[60] focus:outline-none"
      onClose={handleBranchAdminDialogClose}
    >
      <div className="fixed inset-0  w-screen overflow-y-auto font-kanit z-50">
        <div className="flex min-h-full items-center justify-center p-4">
          {transitions(
            (styles, item) =>
              item && (
                <animated.div style={{ ...styles, ...springProps }}>
                  <DialogPanel className="z-[60]  md:ml-0 w-[20rem] md:w-[26rem]   h-[24rem] md:h-[30rem] text-center  flex-col  rounded-xl bg-white drop-shadow-lg flex ">
                    <div className=" w-full h-[5.5rem] rounded-t-xl bg-[var(--button)] text-white flex justify-center items-center relative  font-medium pt-2 border-white border-[1px] ">
                      <h1 className="text-xl">แก้ไขข้อมูลแอดมินสาขา</h1>
                      <div
                        className="absolute top-5 right-8 cursor-pointer"
                        onClick={handleBranchAdminDialogClose}
                      >
                        <FaXmark size={20} />
                      </div>
                    </div>
                    <p className="mb-2 md:mb-5 mt-3  p-2 ">{username}</p>
                    <section className="w-full  h-16 md:h-16 flex items-center justify-center px-3">
                      <div
                        onClick={() => {
                          setIsFirstTab(true);
                        }}
                        className={`w-[50%] bg-white drop-x-shadow-lg h-full flex items-center justify-center border-b-[4px]  rounded-t-md cursor-pointer hover:bg-slate-200 duration-200 ${
                          isFirstTab
                            ? "text-black font-medium border-b-black"
                            : "text-slate-400"
                        }`}
                      >
                        แก้ไขสาขา
                      </div>

                      <div
                        onClick={() => {
                          setIsFirstTab(false);
                        }}
                        className={`w-[50%] bg-white drop-x-shadow-lg h-full flex items-center justify-center border-b-[4px]  rounded-t-md cursor-pointer hover:bg-slate-200 duration-200 ${
                          !isFirstTab
                            ? "text-black font-medium border-b-black"
                            : "text-slate-400"
                        }`}
                      >
                        แก้ไขรหัสผ่าน
                      </div>
                    </section>
                    <div className="w-full h-full ">
                      {/* Form */}
                      <Form
                        className="w-full px-5 md:px-10 flex flex-col items-center justify-start h-full relative"
                        onSubmit={handleSubmit}
                      >
                        {isFirstTab ? (
                          <>
                            <p className="text-start mb-2 p-1 mt-8 md:mt-16">
                              เลือกสาขาของแอดมิน :
                            </p>
                            <Combobox
                              value={selected}
                              onChange={(value) => setSelected(value)}
                              onClose={() => setQuery("")}
                            >
                              <div className="relative w-40 md:w-[80%] border-[1px] rounded-lg border-slate-400 ">
                                <ComboboxInput
                                  className={clsx(
                                    "w-full rounded-lg border-none bg-white  pr-8 pl-3 p-2 text-black",
                                    "focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-black/25"
                                  )}
                                  placeholder="เลือกสาขา"
                                  displayValue={(branches: Branch) =>
                                    branches?.branchName || ""
                                  }
                                  onChange={(event) =>
                                    setQuery(event.target.value)
                                  }
                                />
                                <ComboboxButton className="group absolute inset-y-0 right-0 px-2.5">
                                  <ChevronDownIcon className="size-4 fill-black/60 group-data-[hover]:fill-black" />
                                </ComboboxButton>
                              </div>

                              <ComboboxOptions
                                anchor="bottom"
                                transition
                                className={clsx(
                                  "w-[12rem] md:w-[17rem] rounded-xl border border-black/5 bg-white drop-shadow-md p-1 [--anchor-gap:var(--spacing-1)] empty:invisible",
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
                            <Button
                              type="submit"
                              className={
                                "mt-10 bg-[var(--button)] p-2 rounded-lg text-white w-44 absolute bottom-10 disabled:bg-slate-700"
                              }
                            >
                              ยืนยันการแก้ไข
                            </Button>
                          </>
                        ) : (
                          <>
                            {oldPassCorrect ? (
                              <>
                                {/* รหัสเดิมถูกแล้ว ให้ใส่รหัสใหม่ */}
                                <TextField
                                  isRequired
                                  type={showNewPass ? "text" : "password"}
                                  name="receiptNo"
                                  className="relative w-full min-w-[14.4rem] h-10 font-kanit mb-8 flex gap-2 items-center mt-5 md:mt-16"
                                >
                                  <Label className="text-start ml-2 text-[15px]  w-[14rem] md:w-[13rem] flex">
                                    รหัสผ่านใหม่ :
                                  </Label>
                                  <div className="flex flex-col w-full h-full relative">
                                    <button
                                      onClick={toggleNewPass}
                                      className="absolute top-3 right-3"
                                      type="button"
                                    >
                                      {!showNewPass ? (
                                        <FaRegEyeSlash />
                                      ) : (
                                        <FaRegEye />
                                      )}
                                    </button>
                                    <Input
                                      className="flex w-full h-full select-none  transition-all  text-sm  border border-slate-400  rounded-md focus-within::border-teal-500 focus-within:border-2 text-slate-500  pl-3 pr-3 py-[4px]"
                                      placeholder=""
                                      value={newPassword}
                                      onChange={(e) => {
                                        const englishOnlyValue =
                                          e.target.value.replace(
                                            /[^A-Za-z0-9\s.!@#$%^&*()_\-+=]/g,
                                            ""
                                          );
                                        setNewPassword(englishOnlyValue);
                                      }}
                                    />

                                    <div className=" bg-white text-red-400 text-start text-[0.65rem] ml-2 absolute top-11">
                                      {errors.newPassword && (
                                        <p className="text-red-500">
                                          {errors.newPassword}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </TextField>
                                <TextField
                                  isRequired
                                  type={showConfirmPass ? "text" : "password"}
                                  name="receiptNo"
                                  className="relative w-full min-w-[14.4rem] h-10 font-kanit mb-8 flex gap-2 items-center "
                                >
                                  <Label className="text-start ml-2 text-[15px] w-[14rem] md:w-[13rem] flex ">
                                    ยืนยันรหัสผ่านใหม่ :
                                  </Label>
                                  <div className="flex flex-col w-full h-full relative">
                                    <button
                                      onClick={toggleConfirmPass}
                                      className="absolute top-3 right-3"
                                      type="button"
                                    >
                                      {!showConfirmPass ? (
                                        <FaRegEyeSlash />
                                      ) : (
                                        <FaRegEye />
                                      )}
                                    </button>
                                    <Input
                                      className="flex w-full h-full select-none  transition-all  text-sm  border border-slate-400  rounded-md focus-within::border-teal-500 focus-within:border-2 text-slate-500  pl-3 pr-3 py-[4px]"
                                      placeholder=""
                                      value={confirmNewPassword}
                                      onChange={(e) => {
                                        const englishOnlyValue =
                                          e.target.value.replace(
                                            /[^A-Za-z0-9\s.!@#$%^&*()_\-+=]/g,
                                            ""
                                          );
                                        setConfirmNewPassword(englishOnlyValue);
                                      }}
                                    />

                                    <div className=" bg-white text-red-400 text-start text-[0.65rem] ml-2 absolute top-11">
                                      {errors.newPassword && (
                                        <p className="text-red-500">
                                          {errors.newPassword}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </TextField>
                                <Button
                                  type="submit"
                                  className={
                                    "mt-10 bg-[var(--button)] p-2 rounded-lg text-white w-44 absolute bottom-10 disabled:bg-slate-700"
                                  }
                                >
                                  ยืนยันการแก้ไข
                                </Button>
                              </>
                            ) : (
                              <>
                                {/* รหัสเดิมยังไม่ถูก ให้ใส่รหัสเดิม */}
                                <TextField
                                  isRequired
                                  type={showOldPass ? "text" : "password"}
                                  //isInvalid={!!error.email}
                                  name="receiptNo"
                                  className="relative w-full min-w-[14.4rem] h-10 font-kanit mb-8 flex gap-2 items-center mt-12 md:mt-24"
                                >
                                  <Label className="text-start ml-2 text-[15px] w-[13rem] flex">
                                    รหัสผ่านเดิม :
                                  </Label>
                                  <div className="flex flex-col w-full h-full relative">
                                    <button
                                      onClick={toggleOldPass}
                                      className="absolute top-3 right-3"
                                      type="button"
                                    >
                                      {!showOldPass ? (
                                        <FaRegEyeSlash />
                                      ) : (
                                        <FaRegEye />
                                      )}
                                    </button>
                                    <Input
                                      className="flex w-full h-full select-none  transition-all  text-sm  border border-slate-400  rounded-md focus-within::border-teal-500 focus-within:border-2 text-slate-500  pl-3 pr-3 py-[4px]"
                                      placeholder=""
                                      value={oldPassword}
                                      onChange={(e) => {
                                        const englishOnlyValue =
                                          e.target.value.replace(
                                            /[^A-Za-z0-9\s.!@#$%^&*()_\-+=]/g,
                                            ""
                                          );
                                        setOldPassword(englishOnlyValue);
                                      }}
                                    />

                                    <div className=" bg-white text-red-400 text-start text-[0.65rem] ml-2 absolute top-11">
                                      {errors.oldPassword && (
                                        <p className="text-red-500">
                                          {errors.oldPassword}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </TextField>
                                <Button
                                  type="submit"
                                  className={
                                    "mt-10 bg-[var(--button)] p-2 rounded-lg text-white w-44 absolute bottom-10 disabled:bg-slate-700"
                                  }
                                >
                                  ยืนยันรหัสผ่านเดิม
                                </Button>
                              </>
                            )}
                          </>
                        )}
                      </Form>
                    </div>
                  </DialogPanel>
                </animated.div>
              )
          )}
        </div>
      </div>
    </Dialog>
  );
};

export default BranchAdminDialog;
