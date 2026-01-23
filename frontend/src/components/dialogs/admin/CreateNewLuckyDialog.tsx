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
import { FaXmark } from "react-icons/fa6";

import Swal from "sweetalert2";
import { useAdminStore } from "../../../store/AdminStore";
import { handleError } from "../../../data/functions";

interface CreateAdminDialogClose {
  isCreateAdminOpen: boolean;
  handleCreateAdminDialogClose: () => void;
  refreshData: () => void;
}

const CreateNewLuckyDialog: React.FC<CreateAdminDialogClose> = ({
  isCreateAdminOpen,
  handleCreateAdminDialogClose,
  refreshData,
}) => {
  //store
  const { createLuckyByAdmin } = useAdminStore();
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
    if (isCreateAdminOpen) setIsVisible(true);
  }, [isCreateAdminOpen]);

  //form
  const [phone, setPhone] = useState<string>("");
  const [week, setWeek] = useState<number>(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phone) {
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
    } else {
      const luckyBody = {
        phone,
        week: Number(week),
      };
      try {
        const response = await createLuckyByAdmin(luckyBody);
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
                  <DialogPanel className=" z-[60]  md:ml-0 w-[20rem] md:w-[26rem]   h-full md:h-[20rem] text-center  flex-col  rounded-xl bg-white drop-shadow-lg flex ">
                    <div className="bg-[var(--red)] w-full h-full rounded-t-xl text-white flex flex-col justify-center items-center relative border-[1.5px] p-2">
                      {/* Title Section */}
                      <h1 className="text-xl font-semibold mb-4">
                        สร้างรายชื่อผู้โชคดี
                      </h1>

                      {/* Close Button */}
                      <div
                        className="absolute top-4 right-4 cursor-pointer text-white hover:text-gray-300 transition"
                        onClick={handleCreateAdminDialogClose}
                      >
                        <FaXmark size={24} />
                      </div>
                    </div>
                    <div className="w-full h-full mt-4">
                      {/* Form */}
                      <Form
                        className="w-full px-6 md:px-14"
                        onSubmit={handleSubmit}
                      >
                        <TextField
                          isRequired
                          //isInvalid={!!error.email}
                          name="receiptNo"
                          className="mt-6  relative w-full min-w-[14.4rem] h-10 font-kanit mb-8 flex gap-2 items-center "
                        >
                          <Label className="text-start ml-2 text-[15px] w-[9rem] flex">
                            เบอร์โทรศัพท์ :
                          </Label>
                          <div className="flex flex-col w-full h-full">
                            <Input
                              className="flex w-full h-full select-none  transition-all text-sm   border border-slate-400  rounded-md focus-within::border-teal-500 focus-within:border-2 text-slate-500  pl-3 pr-3 py-[4px]"
                              placeholder=""
                              value={phone}
                              inputMode="tel"
                              max={10}
                              onChange={(e) => {
                                setPhone(
                                  e.target.value.replace(/\D/g, "").slice(0, 10)
                                );
                              }}
                            />

                            <div className=" bg-white text-red-400 text-start text-[0.65rem] ml-2 mt-1">
                              <FieldError>
                                {({ validationDetails }) =>
                                  validationDetails.valueMissing
                                    ? "กรุณากรอกเบอร์โทรศัพท์"
                                    : ""
                                }
                              </FieldError>
                            </div>
                          </div>
                        </TextField>

                        <TextField
                          isRequired
                          //isInvalid={!!error.email}
                          name="receiptNo"
                          className="mt-6 md:mt-10relative w-full min-w-[14.4rem] h-10 font-kanit mb-8 flex gap-2 items-center "
                        >
                          <Label className="text-start ml-2 text-[15px] w-[10rem] flex">
                            สัปดาห์ที่ประกาศรางวัล :
                          </Label>
                          <div className="flex flex-col w-full h-full">
                          <select
                            className="flex w-full h-full select-none transition-all text-sm border border-slate-400 rounded-md focus-within:border-teal-500 focus-within:border-2 text-slate-500 pl-3 pr-3 py-[4px]"
                            value={week}
                            onChange={(e) => setWeek(Number(e.target.value))}
                          >
                            <option value="">เลือกสัปดาห์</option>
                            {[1, 2, 3, 4, 5].map((number) => (
                              <option key={number} value={number}>
                                {number}
                              </option>
                            ))}
                          </select>

                            <div className=" bg-white text-red-400 text-start text-[0.65rem] ml-2 mt-1">
                              <FieldError>
                                {({ validationDetails }) =>
                                  validationDetails.valueMissing
                                    ? "กรุณากรอกเบอร์โทรศัพท์"
                                    : ""
                                }
                              </FieldError>
                            </div>
                          </div>
                        </TextField>
                        <Button
                          type="submit"
                          className={
                            "md:mt-5 bg-[var(--red)] p-2 rounded-lg text-white w-44 mb-5"
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

export default CreateNewLuckyDialog;
