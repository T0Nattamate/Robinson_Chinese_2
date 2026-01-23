import { Dialog, DialogPanel } from "@headlessui/react";
import { animated, useTransition, useSpring } from "@react-spring/web";
import { useEffect, useState } from "react";
import {
  FieldError,
  TextField,
  Label,
  Input,
  Form,
  Button,
} from "react-aria-components";
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
import Swal from "sweetalert2";
import { useAdminStore } from "../../../store/AdminStore";
import { handleError, showAlert } from "../../../data/functions";
import useBranchStore from "../../../store/BranchStore";
import { Branch } from "../../../store/BranchStore";

interface CreateAdminDialogClose {
  isCreateAdminOpen: boolean;
  handleCreateAdminDialogClose: () => void;
  refreshData: () => void;
}

const CreateNewAdminDialog: React.FC<CreateAdminDialogClose> = ({
  isCreateAdminOpen,
  handleCreateAdminDialogClose,
  refreshData,
}) => {
  //store
  const { branches } = useBranchStore();
  const { createBranchAdmin } = useAdminStore();
  const [isVisible, setIsVisible] = useState(isCreateAdminOpen);

  const springProps = useSpring({
    transform: isCreateAdminOpen ? "scale(1)" : "scale(0.6)",
    config: { tension: 170, friction: 16 },
  });
  const transitions = useTransition(isCreateAdminOpen, {
    from: { opacity: 0, transform: "scale(0.9)" },
    enter: { opacity: 1, transform: "scale(1)" },
    leave: { opacity: 0, transform: "scale(0.9)" },
    config: { duration: 200 },
    onRest: () => {
      if (!isCreateAdminOpen) setIsVisible(false);
    },
  });

  useEffect(() => {
    if (isCreateAdminOpen) {
      setErrors({});
      setUsername("");
      setPassword("");
      setConfirmPassword("");
      setIsVisible(true);
      setSelected(null);
    }
  }, [isCreateAdminOpen]);

  //combobox
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Branch | null>(null);

  //form
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPass, setShowPass] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password || !selected) {
      Swal.fire({
        icon: "error",
        text: "กรุณาตั้งค่าการสร้างรายชื่อแอดมินให้ครบทุกช่อง",
        confirmButtonText: "ยืนยัน",
        customClass: {
          htmlContainer: "font-kanit",
          confirmButton: "bg-gray-700 text-white rounded-md font-kanit",
        },
      });
      return;
    } else if (Object.keys(errors).length > 0) {
      showAlert("กรุณากรอกข้อมูลให้ถูกต้อง", "error");
      return;
    } else {
      try {
        const response = await createBranchAdmin(
          username,
          password,
          selected.branchId,
        );
        if (response) {
          await refreshData();
          //console.log("refresh data");
          handleCreateAdminDialogClose();
        }
      } catch (error) {
        handleError(error);
      }
    }
  };

  const handleToggle = () => {
    //console.log("show or not");
    setShowPass(!showPass);
  };

  const [ConfirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // useEffect(()=>{
  //   console.log("debug:",username)
  // },[username,password,ConfirmPassword])

  useEffect(() => {
    if (ConfirmPassword.length > 0) {
      if (password !== ConfirmPassword) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          newPassword: "ยืนยันรหัสผ่านไม่ถูกต้อง",
        }));
      } else {
        setErrors((prevErrors) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { newPassword, ...rest } = prevErrors;
          return rest;
        });
        //console.log("ยืนยันรหัสผ่านถูกต้อง");
      }
    }
  }, [ConfirmPassword, password]);
  useEffect(() => {
    //console.log(errors);
  }, [errors]);

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
  return (
    <Dialog
      open={isVisible}
      as="div"
      className="relative z-[60] focus:outline-none"
      onClose={handleCreateAdminDialogClose}
    >
      <div className="fixed inset-0  w-screen overflow-y-auto font-kanit z-50">
        <div className="flex min-h-full items-center justify-center p-4">
          {transitions(
            (styles, item) =>
              item && (
                <animated.div style={{ ...styles, ...springProps }}>
                  <DialogPanel className="z-[60]  md:ml-0 w-[26rem]   h-full md:h-[30rem] text-center  flex-col  rounded-xl bg-white drop-shadow-lg flex ">
                    <div className="bg-[var(--button)] w-full h-[5rem] rounded-t-xl text-white flex justify-center items-center relative border-[1.5px]">
                      <h1 className="text-xl">สร้างรายชื่อแอดมิน</h1>
                      <div
                        className="absolute top-5 right-8 cursor-pointer"
                        onClick={handleCreateAdminDialogClose}
                      >
                        <FaXmark size={20} />
                      </div>
                    </div>
                    <div className="w-full h-full mt-4">
                      {/* Form */}
                      <Form
                        className="w-full px-6 md:px-12"
                        onSubmit={handleSubmit}
                      >
                        <TextField
                          isRequired
                          //isInvalid={!!error.email}
                          name="receiptNo"
                          className="mt-3 relative w-full min-w-[14.4rem] h-10 font-kanit mb-8 flex gap-2 items-center "
                        >
                          <Label className="text-start ml-2 text-[15px] w-[9rem] flex">
                            ชื่อผู้ใช้แอดมิน :
                          </Label>
                          <div className="flex flex-col w-full h-full">
                            <Input
                              className="flex w-full h-full select-none  transition-all text-sm   border border-slate-400  rounded-md focus-within::border-teal-500 focus-within:border-2 text-slate-500  pl-3 pr-3 py-[4px]"
                              placeholder=""
                              value={username}
                              onChange={(e) => {
                                const englishOnlyValue = e.target.value.replace(
                                  /[^A-Za-z0-9\s@.]/g,
                                  ""
                                );
                                setUsername(englishOnlyValue);
                              }}
                            />

                            <div className=" bg-white text-red-400 text-start text-[0.65rem] ml-2 mt-1 absolute top-10">
                              <FieldError>
                                {({ validationDetails }) =>
                                  validationDetails.valueMissing
                                    ? "กรุณาตั้ง Username"
                                    : ""
                                }
                              </FieldError>
                            </div>
                          </div>
                        </TextField>
                        <TextField
                          isRequired
                          type={showPass ? "text" : "password"}
                          name="receiptNo"
                          className="mt-8 relative w-full min-w-[14.4rem] h-10 font-kanit mb-8 flex gap-2 items-center "
                        >
                          <Label className="text-start ml-2 text-[15px] w-[9rem] flex">
                            รหัสผ่าน :
                          </Label>
                          <div className="flex flex-col w-full h-full relative">
                            <button
                              onClick={handleToggle}
                              className="absolute top-3 right-3"
                              type="button"
                            >
                              {!showPass ? <FaRegEyeSlash /> : <FaRegEye />}
                            </button>
                            <Input
                              className="flex w-full h-full select-none  transition-all text-sm   border border-slate-400  rounded-md focus-within::border-teal-500 focus-within:border-2 text-slate-500  pl-3 pr-3 py-[4px]"
                              placeholder=""
                              value={password}
                              onChange={(e) => {
                                const englishOnlyValue = e.target.value.replace(
                                  /[^A-Za-z0-9\s.!@#$%^&*()_\-+=]/g,
                                  ""
                                );
                                setPassword(englishOnlyValue);
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
                          type={showPass ? "text" : "password"}
                          name="receiptNo"
                          className="relative w-full min-w-[14.4rem] h-10 font-kanit mb-8 flex gap-2 items-center "
                        >
                          <Label className="text-start ml-2 text-[15px] w-[13rem] flex">
                            ยืนยันรหัสผ่าน :
                          </Label>
                          <div className="flex flex-col w-full h-full relative">
                            <button
                              onClick={handleToggle}
                              className="absolute top-3 right-3"
                              type="button"
                            >
                              {!showPass ? <FaRegEyeSlash /> : <FaRegEye />}
                            </button>
                            <Input
                              className="flex w-full h-full select-none  transition-all  text-sm  border border-slate-400  rounded-md focus-within::border-teal-500 focus-within:border-2 text-slate-500  pl-3 pr-3 py-[4px]"
                              placeholder=""
                              value={ConfirmPassword}
                              onChange={(e) => {
                                const englishOnlyValue = e.target.value.replace(
                                  /[^A-Za-z0-9\s.!@#$%^&*()_\-+=]/g,
                                  ""
                                );
                                setConfirmPassword(englishOnlyValue);
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
                        <p className="text-start mb-2 p-1 -mt-2">
                          เลือกสาขาของแอดมิน :
                        </p>
                        <Combobox
                          value={selected}
                          onChange={(value) => setSelected(value)}
                          onClose={() => setQuery("")}
                        >
                          <div className="relative w-40 md:w-full border-[1px] rounded-lg border-slate-400 ">
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
                              "w-[18rem] rounded-xl border border-black/5 bg-white drop-shadow-md p-1 [--anchor-gap:var(--spacing-1)] empty:invisible",
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
                            "mt-6 bg-[var(--button)] p-2 rounded-lg text-white w-44"
                          }
                        >
                          สร้างรายชื่อ
                        </Button>
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

export default CreateNewAdminDialog;
