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
import { LuckyResponse, useAdminStore } from "../../../store/AdminStore";
import { handleError } from "../../../data/functions";

interface CreateAdminDialogClose {
  isLuckyOpen: boolean;
  handleBranchAdminDialogClose: () => void;
  refreshData: () => void;
  lucky: LuckyResponse | null;
}

const LuckyDialog: React.FC<CreateAdminDialogClose> = ({
  isLuckyOpen,
  handleBranchAdminDialogClose,
  refreshData,
  lucky,
}) => {
  const { updateLuckyByAdmin } = useAdminStore();
  const [isVisible, setIsVisible] = useState(isLuckyOpen);

  const springProps = useSpring({
    transform: isLuckyOpen ? "scale(1)" : "scale(0.6)",
    config: { tension: 170, friction: 16 },
  });
  const transitions = useTransition(isLuckyOpen, {
    from: { opacity: 0, transform: "scale(0.9)" },
    enter: { opacity: 1, transform: "scale(1)" },
    leave: { opacity: 0, transform: "scale(0.9)" },
    config: { duration: 200 },
    onRest: () => {
      if (!isLuckyOpen) setIsVisible(false);
    },
  });

  useEffect(() => {
    if (isLuckyOpen) setIsVisible(true);
  }, [isLuckyOpen]);

  //form
  const [phone, setPhone] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phone) {
      Swal.fire({
        icon: "error",
        text: "กรุณากรอกเบอร์โทรศัพท์ที่ถูกต้องและมีอยู่ในระบบ",
        confirmButtonText: "ยืนยัน",
        customClass: {
          htmlContainer: "font-kanit",
          confirmButton: "bg-gray-700 text-white rounded-md font-kanit",
        },
      });
      return;
    } else {
      if (lucky && lucky.userId) {
        const luckyBody = {
          phone,
        };
        try {
          const response = await updateLuckyByAdmin(luckyBody, lucky.userId);

          if (response) {
            handleBranchAdminDialogClose();
            refreshData();
          }
        } catch (error) {
          handleError(error);
        }
      } else {
        //console.log("Admin ID is missing or incorrect.");
      }
    }
  };

  useEffect(() => {
    if (isLuckyOpen) {
      setIsVisible(true);
      if (lucky) {
        setPhone(lucky.phone);
      }
    }
  }, [isLuckyOpen, lucky]);

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
                  <DialogPanel className="z-[60] md:ml-0 w-[20rem]  md:w-[24rem]   h-full md:h-[20rem] text-center  flex-col  rounded-xl bg-white drop-shadow-lg flex ">
                    <div className=" w-full h-[5rem] rounded-t-xl text-black flex justify-center items-center relative mt-5">
                      <h1 className="text-xl">แก้ไขรายชื่อผู้โชคดี</h1>
                      <div
                        className="absolute top-5 right-8 cursor-pointer"
                        onClick={handleBranchAdminDialogClose}
                      >
                        <FaXmark size={20} />
                      </div>
                    </div>
                    <div className="w-full h-full ">
                      {/* Form */}
                      <Form
                        className="w-full px-6 md:px-14"
                        onSubmit={handleSubmit}
                      >
                        <TextField
                          isRequired
                          //isInvalid={!!error.email}
                          name="receiptNo"
                          className="mt-5 md:mt-14 relative w-full min-w-[14.4rem] h-10 font-kanit mb-8 flex gap-2 items-center "
                        >
                          <Label className="text-start pl-5 md:pl-0 ml-2 text-[15px] w-[9rem] flex">
                            เบอร์โทรศัพท์ :
                          </Label>
                          <div className="flex flex-col w-[10rem] md:w-full h-full">
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

                        <Button
                          type="submit"
                          className={
                            "md:mt-5 bg-black p-2 rounded-lg text-white w-44 mb-5"
                          }
                        >
                          ยืนยันการแก้ไข
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

export default LuckyDialog;
