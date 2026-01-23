import { Dialog, DialogPanel } from "@headlessui/react";
import { animated, useTransition, useSpring } from "@react-spring/web";
import { useEffect, useState } from "react";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { IoMdCloseCircleOutline } from "react-icons/io";
import Viewer from "react-viewer";
import { useAdminStore } from "../../../store/AdminStore";
import {
  Button,
  Label,
  ListBox,
  Popover,
  Select,
  SelectValue,
} from "react-aria-components";
import { MdKeyboardArrowDown } from "react-icons/md";
import MyListBoxItem from "../../../styles/MyListBoxItem";
import { status } from "../../../data/dataVariables";
//import useBranchStore from "../../../store/BranchStore";
import { FaCircleCheck, FaCircleMinus, FaCircleXmark } from "react-icons/fa6";
import { FaPhone } from "react-icons/fa6";
import { handleError } from "../../../data/functions";

interface Receipt {
  receiptId: number;
  receiptNo: string;
  lineId: string;
  receiptDate: string;
  amount: number;
  branchId: string;
  branchName: string;
  storeId: string;
  storeName: string;
  receiptImage: string;
  status: string;
  fullname: string;
  phone: string;
  uploadedAt: string;
  updatedAt: string;
}

interface PicDialogProps {
  isPicOpen: boolean;
  handlePicDialogClose: () => void;
  receipt: Receipt | null;
  refreshData: () => void;
}

interface StatusDetails {
  key: string;
  icon: JSX.Element;
  textTH: string;
  textEN: string;
}

const ApproveDialog: React.FC<PicDialogProps> = ({
  isPicOpen,
  handlePicDialogClose,
  receipt,
  refreshData,
}) => {
  //const { findBranchIdByBranchName } = useBranchStore();
  const [isVisible, setIsVisible] = useState(isPicOpen);
  const [view, setView] = useState(false);

  const springProps = useSpring({
    transform: isPicOpen ? "scale(1)" : "scale(0.6)",
    config: { tension: 170, friction: 22 },
  });
  const transitions = useTransition(isPicOpen, {
    from: { opacity: 0, transform: "scale(0.9)" },
    enter: { opacity: 1, transform: "scale(1)" },
    leave: { opacity: 0, transform: "scale(0.9)" },
    config: { duration: 200 },
    onRest: () => {
      if (!isPicOpen) setIsVisible(false);
    },
  });

  useEffect(() => {
    if (isPicOpen) setIsVisible(true);
  }, [isPicOpen]);

  //ROLE default is branchAdmin and will update depends on role from store
  const { adminData, updateStatusAction } = useAdminStore();
  const { role } = adminData;

  let isSuperAdmin = false;
  if (role == "superAdmin") {
    isSuperAdmin = true;
  } else {
    isSuperAdmin = false;
  }

  //STATUS use key to render statusDatails object
  const [selectedStatus, setSelectedStatus] = useState<StatusDetails | null>(
    null
  );
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

  useEffect(() => {
    if (receipt && receipt.status) {
      const statusDetails = getStatusDetails(receipt.status);
      setSelectedStatus(statusDetails);
    }
  }, [receipt]);

  const handleStatusChange = (key: string) => {
    const statusDetails = getStatusDetails(key);
    if (statusDetails) {
      setSelectedStatus(statusDetails);
    }
  };

  const handleConfirmApproveDialog = async () => {
    if (!receipt) return;
    const branchId = receipt.branchId;
    const receiptId = receipt.receiptId;
    const lineId = receipt.lineId;
    const receiptNo = receipt?.receiptNo;
    //const storeId = findStoreIdByStoreName(storeObject, receipt?.storeName);
    const branchName = receipt?.branchName;
    const status = selectedStatus?.key;
    const storeName = receipt.storeName;

    if (branchId !== null && status && receipt.storeName) {
      try {
        await updateStatusAction(
          receiptId,
          lineId,
          status,
          receiptNo,
          branchName,
          storeName
        );

        handlePicDialogClose();
        refreshData();
      } catch (error) {
        console.error("Error updating status:", error);
        handleError(error);
      }
    }
    //only branchAdmin can change status
  };

  return (
    <Dialog
      open={isVisible}
      as="div"
      className="relative z-[60] focus:outline-none"
      onClose={handlePicDialogClose}
    >
      <div className="fixed inset-0  w-screen overflow-y-auto font-kanit z-50">
        {/* Background overlay with opacity */}
        {/* <div className="fixed inset-0 bg-black opacity-50 z-30" /> */}
        <div className="flex min-h-full items-center justify-center p-4">
          {transitions(
            (styles, item) =>
              item && (
                <animated.div style={{ ...styles, ...springProps }}>
                  <DialogPanel className="z-[60]  md:ml-0 w-[24rem] md:w-[36rem] lg:w-[48rem] h-full md:h-[30rem] text-center md:flex-row flex-col  rounded-xl bg-white drop-shadow-lg flex ">
                    <button
                      onClick={handlePicDialogClose}
                      className=" absolute top-2 right-2"
                    >
                      <IoMdCloseCircleOutline size={20} />
                    </button>
                    <div className="w-[24rem] md:w-[30rem] h-full rounded-t-xl md:rounded-l-xl bg-white p-3 flex  items-center justify-center hover:cursor-pointer ">
                      {receipt && receipt.receiptImage && (
                        <Viewer
                          visible={view}
                          onClose={() => {
                            setView(false);
                          }}
                          images={[{ src: receipt.receiptImage, alt: "" }]}
                        />
                      )}

                      <div className="w-full h-full min-h-[10rem]  relative rounded-xl mt-7 md:mt-0">
                        {receipt && (
                          <img
                            onClick={() => {
                              setView(true);
                            }}
                            src={receipt.receiptImage}
                            alt="Receipt"
                            className="max-w-[30rem] w-full h-full max-h-[35rem] object-cover rounded-xl"
                          />
                        )}
                        <div className="text-white absolute bottom-3 right-3 text-xs flex gap-3  font-light z-10">
                          <FaMagnifyingGlass />
                          <p>คลิกเพื่อซูมรูปภาพ</p>
                        </div>
                        <div
                          className="absolute bottom-0 right-0 p-3  w-full h-full rounded-xl"
                          style={{
                            background:
                              "linear-gradient(0deg, rgba(0,0,0,0.6617) 0%, rgba(0,212,255,0) 80%)",
                          }}
                          onClick={() => {
                            setView(true);
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="w-[24rem] md:w-[30rem] flex flex-col gap-3 text-sm md:mt-5 pr-3 text-start ml-2 md:ml-0">
                      <section className="flex flex-col justify-start p-3 gap-2">
                        <p className="font-bold text-xl">{receipt?.fullname}</p>
                        <div className="flex justify-start gap-5 -mt-2">
                          <p className="text-slate-500">{receipt?.receiptDate?.split(' ').slice(0, 3).join(' ')}</p>
                          <p className="text-slate-500 flex items-center gap-2 ml-3">
                            <FaPhone />
                            {receipt?.phone}
                          </p>
                        </div>

                        <p className="mt-5 border-b-[1px] border-b-slate-300 pb-3">
                          โรบินสันสาขา {receipt?.branchName}
                        </p>
                        <div className="flex justify-between gap-5 ">
                          <div className="text-base lg:text-xl border-r-[1px] border-r-slate-300 pr-5">
                            <p className="text-xs">จำนวน :</p>
                            <p>
                              {receipt?.amount
                                ? new Intl.NumberFormat().format(
                                    receipt.amount
                                  ) + " ฿"
                                : "0 ฿"}
                            </p>
                          </div>
                          <div className=" text-base lg:text-xl border-r-[1px] border-r-slate-300 pr-5 -ml-2">
                            <p className="text-xs">หมายเลขใบเสร็จ :</p>
                            <p className=" break-words">
                              {receipt?.receiptNo &&
                              receipt.receiptNo.length > 12
                                ? `${receipt.receiptNo.slice(
                                    0,
                                    12
                                  )}\n${receipt.receiptNo.slice(12)}`
                                : receipt?.receiptNo || ""}
                            </p>
                          </div>
                          <div className="text-base lg:text-xl -ml-2">
                            <p className="text-xs">ร้านค้าที่ร่วมรายการ :</p>
                            <p>
                              {receipt?.storeName}
                              {/* {receipt?.storeName &&
                              receipt.storeName.length > 10
                                ? `${receipt.storeName.slice(
                                    0,
                                    10
                                  )}\n${receipt.storeName.slice(10)}`
                                : receipt?.storeName || ""} */}
                            </p>
                          </div>
                        </div>
                      </section>

                      <div className="rounded-xl w-[99%] md:w-full h-[9rem] lg:h-[12rem] bg-slate-200 flex flex-col justify-center items-center">
                        {/* Status */}

                        <div className="w-full pl-16 md:pl-10 gap-4 lg:gap-8 h-[7rem] flex justify-start items-center -mt-5">
                          {/* Wrap the icon in a transform */}
                          <div className="transform scale-250">
                            {selectedStatus?.icon}
                          </div>
                          <section>
                            <h1 className="text-base lg:text-xl">{selectedStatus?.textTH}</h1>
                            <p className="text-[0.8rem]">{selectedStatus?.textEN}</p>
                          </section>
                        </div>

                        {/* Status change */}
                        {!isSuperAdmin && (
                          <div className="w-[80%]">
                            <Select
                              isRequired
                              className="flex flex-row justify-start items-center  gap-1  relative "
                              selectedKey={selectedStatus?.textTH}
                              onSelectionChange={(key) =>
                                handleStatusChange(key as string)
                              }
                            >
                              <Label className="text-start text-[13px] lg:text-[15px] w-[6rem]  lg:w-24  ">
                                เปลี่ยนสถานะ :
                              </Label>
                              <Button className=" bg-white flex text-[13px] lg:text-[15px] relative w-[10rem] lg:w-[13rem] cursor-default rounded-lg  data-[pressed]:bg-opacity-100 transition py-2 pl-3 pr-2 text-left  text-gray-700 focus:outline-none data-[focus-visible]:border-indigo-500 data-[focus-visible]:ring-2 data-[focus-visible]:ring-black sm:text-sm">
                                <div className=" p-2 absolute right-0 -top-0 cursor-pointer">
                                  <MdKeyboardArrowDown size={24} />
                                </div>
                                <SelectValue className="text-[13px] lg:text-[15px] flex-1 truncate data-[placeholder]:font-base text-slate-500">
                                  {selectedStatus?.textTH ||
                                    "เลือกเปลี่ยนสถานะ"}
                                </SelectValue>
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
                        )}
                      </div>

                      <section className="flex gap-3 w-full justify-center md:justify-end mb-3">
                        <button
                          className="bg-white text-[var(--dark-green)] border-2 border-[var(--dark-green)] px-3 py-2 rounded-lg w-20"
                          onClick={handlePicDialogClose}
                        >
                          ปิด
                        </button>
                        {!isSuperAdmin && (
                          <button
                            className="bg-[var(--red)] text-white px-3 py-2 rounded-lg w-20"
                            onClick={handleConfirmApproveDialog}
                          >
                            ยืนยัน
                          </button>
                        )}
                      </section>
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

export default ApproveDialog;
