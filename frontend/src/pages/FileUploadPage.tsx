/* eslint-disable */
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { today, CalendarDate } from "@internationalized/date";
import Swal from "sweetalert2";
import axios from "axios";
import {
  Button,
  Form,
  Input,
  Popover,
  Label,
  TextField,
  DatePicker,
  DateInput,
  Group,
  Calendar,
  CalendarCell,
  CalendarGrid,
  DateSegment,
  Heading,
  FileTrigger,
  FieldError,
} from "react-aria-components";
import {
  MdKeyboardArrowDown,
  MdKeyboardArrowLeft,
  MdKeyboardArrowRight,
} from "react-icons/md";
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import clsx from "clsx";
import imageCompression from "browser-image-compression";
import heic2any from "heic2any";
import { FiUpload } from "react-icons/fi";
import { IoCameraOutline } from "react-icons/io5";

import LoadingOverlay from "../components/overlay/LoadingOverlay";
import { tv } from "tailwind-variants";
import axiosInterceptor from "../utils/axiosInterceptor";

import { useUserStore } from "../store/userStore";
import useAuthStore from "../store/AuthStore";
import useBranchStore from "../store/BranchStore";
import RulesDialog from "../components/dialogs/RulesDialog";

interface Errors {
  file?: string | null;
}
interface StoreOption {
  storeName: string;      // Original: "Nike" (sent to API)
  displayName: string;    // Display: "Nike (Sport)" (shown in dropdown)
  category?: string;      // Category: "Sport"
}
const FileUploadPage = () => {
  const { branches } = useBranchStore();
  const navigate = useNavigate();
  const { lineId, uploadCurrentBranch, setUploadCurrentBranch } = useUserStore();
  const { accessToken } = useAuthStore();

  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Form states
  // 1) For branch combobox
  const [branchName, setBranchName] = useState(uploadCurrentBranch || "");
  const [branchQuery, setBranchQuery] = useState("");
  // 2) For date
  const [date, setDatePicked] = useState<CalendarDate | null>(today("Asia/Bangkok"));
  // 3) For receipt no
  const [receiptNo, setReceiptNo] = useState("");
  // 4) For amount
  const [amount, setAmount] = useState("");
  // 5) For file upload
  const [receiptPhoto, setReceiptPhoto] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");

  // Store logic
  //const [haveOtherStore, setHaveOtherStore] = useState(false);
  const [otherStoreName, setOtherStoreName] = useState("");
  const [stores, setStores] = useState<StoreOption[]>([]);
  const [selectedStore, setSelectedStore] = useState<StoreOption | null>(null);
  const [query, setQuery] = useState("");
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isRulesOpen, setIsRulesOpen] = useState(false);

  const handleRulesDialogClose = () => setIsRulesOpen(false);
  const handleRulesDialogOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsRulesOpen(true);
  };

  const createDisplayName = (storeName: string, category?: string): string => {
    if (category && category.trim()) {
      return `${storeName} (${category})`;  // "Nike (Sport)"
    }
    return storeName;  // "Nike" if no category
  };
  // Errors
  const [error, setError] = useState<Errors>({});

  // Filter branches for the branch combobox
  const filteredBranchesForBranch =
    branchQuery === ""
      ? branches
      : branches.filter((b) =>
        b.branchName.toLowerCase().includes(branchQuery.toLowerCase())
      );

  // 1) Convert CalendarDate -> "Wed Dec 04 2024 15:25:41 GMT+0700 (Indochina Time)"
  function calendarDateToJSString(date: CalendarDate): string {
    const now = new Date(); // current local time
    // Create a Date with the chosen day/month/year, but hours/min/sec from `now`
    const jsDate = new Date(
      date.year,
      date.month - 1, // JS months are 0-based
      date.day,
      now.getHours(),
      now.getMinutes(),
      now.getSeconds()
    );
    return jsDate.toString();
  }

  // Called when user picks a branch from the branch combobox
  // const handleBranchChange = (selectedBranchName: string) => {
  //   const selectedBranch = branches.find(
  //     (branch) => branch.branchName === selectedBranchName
  //   );

  //   if (!selectedBranch) {
  //     console.warn("Branch not found:", selectedBranchName);
  //     return;
  //   }

  //   setBranchName(selectedBranch.branchName);

  //   // console.log("=== DEBUG: Store Deduplication ===");
  //   // console.log("Branch:", selectedBranch.branchName);
  //   // console.log("Total stores in branch:", selectedBranch.stores?.length);

  //   const enabledStores = selectedBranch.stores?.filter((store) => store.isStoreEnable) || [];
  //   //console.log("Enabled stores:", enabledStores.length);

  //   const storeNames = enabledStores.map((store) => store.storeName.trim());
  //   //console.log("All store names:", storeNames);

  //   // Find duplicates
  //   const storeCount: { [key: string]: number } = {};
  //   storeNames.forEach((name) => {
  //     storeCount[name] = (storeCount[name] || 0) + 1;
  //   });

  //   // const duplicates = Object.entries(storeCount)
  //   //   .filter(([_, count]) => count > 1)
  //   //   .map(([name, count]) => ({ name, count }));

  //   // if (duplicates.length > 0) {
  //   //   //console.log("🔴 DUPLICATES FOUND:");
  //   //   duplicates.forEach(({ name, count }) => {
  //   //     //console.log(`  - "${name}" appears ${count} times`);
  //   //   });

  //   //   // Show which store IDs have duplicate names
  //   //   duplicates.forEach(({ name }) => {
  //   //     const duplicateStores = enabledStores.filter(
  //   //       (store) => store.storeName.trim() === name
  //   //     );
  //   //     //console.log(`  📍 Store "${name}" - IDs:`, duplicateStores.map(s => s.storeId));
  //   //   });
  //   // } else {
  //   //   //console.log("✅ No duplicates found");
  //   // }

  //   const uniqueStores = [...new Set(storeNames)];
  //   //console.log("Unique stores:", uniqueStores);
  //   //console.log("Total removed duplicates:", storeNames.length - uniqueStores.length);

  //   uniqueStores.sort((a, b) => a.localeCompare(b, 'th'));

  //   setStores(uniqueStores);
  //   setSelectedStore("");
  //   setQuery("");
  //   setOtherStoreName("");
  // };
  const handleBranchChange = (selectedBranchName: string) => {
    const selectedBranch = branches.find(
      (branch) => branch.branchName === selectedBranchName
    );

    if (!selectedBranch) {
      console.warn("Branch not found:", selectedBranchName);
      return;
    }

    setBranchName(selectedBranch.branchName);

    const enabledStores = selectedBranch.stores?.filter((store) => store.isStoreEnable) || [];

    // Create StoreOption objects with displayName including category
    const storeOptions: StoreOption[] = enabledStores.map((store) => ({
      storeName: store.storeName.trim(),
      category: store.category?.trim() || "",
      displayName: createDisplayName(store.storeName.trim(), store.category?.trim()),
    }));

    // Remove duplicates based on displayName
    const uniqueStoresMap = new Map<string, StoreOption>();
    storeOptions.forEach((store) => {
      if (!uniqueStoresMap.has(store.displayName)) {
        uniqueStoresMap.set(store.displayName, store);
      }
    });

    const uniqueStores = Array.from(uniqueStoresMap.values());
    uniqueStores.sort((a, b) => a.displayName.localeCompare(b.displayName, 'th'));

    setStores(uniqueStores);
    setSelectedStore(null);
    setQuery("");
    setOtherStoreName("");
  };

  // If there's a saved branch from store, pre-load the stores
  useEffect(() => {
    if (uploadCurrentBranch) {
      setBranchName(uploadCurrentBranch);
      const selectedBranch = branches.find(
        (branch) => branch.branchName === uploadCurrentBranch
      );

      if (selectedBranch) {
        const enabledStores = selectedBranch.stores?.filter((store) => store.isStoreEnable) || [];

        const storeOptions: StoreOption[] = enabledStores.map((store) => ({
          storeName: store.storeName.trim(),
          category: store.category?.trim() || "",
          displayName: createDisplayName(store.storeName.trim(), store.category?.trim()),
        }));

        const uniqueStoresMap = new Map<string, StoreOption>();
        storeOptions.forEach((store) => {
          if (!uniqueStoresMap.has(store.displayName)) {
            uniqueStoresMap.set(store.displayName, store);
          }
        });

        const uniqueStores = Array.from(uniqueStoresMap.values());
        uniqueStores.sort((a, b) => a.displayName.localeCompare(b.displayName, 'th'));

        setStores(uniqueStores);
      } else {
        console.warn("Branch not found in branches for initial setup");
      }
    }
  }, [uploadCurrentBranch, branches]);

  // For store combobox
  const filteredStores =
    query === ""
      ? [...stores]
      : stores.filter((store) =>
        store.displayName.toLowerCase().includes(query.toLowerCase())
      );

  // const handleStoreChange = (store: string) => {
  //   setSelectedStore(store);
  //   // if (store === "อื่นๆ") {
  //   //   setHaveOtherStore(true);
  //   // } else {
  //   //   setHaveOtherStore(false);
  //   // }
  // };
  const handleStoreChange = (store: StoreOption | null) => {
    setSelectedStore(store);
  };

  // 3) AMOUNT (Up to 2 decimals, with commas)
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    // Remove all except digits and decimal
    val = val.replace(/[^\d.]/g, "");
    // If there's more than one decimal, keep only the first
    const firstDecimal = val.indexOf(".");
    if (firstDecimal !== -1) {
      const rest = val.slice(firstDecimal + 1).replace(/\./g, "");
      val = val.slice(0, firstDecimal + 1) + rest;
    }
    // Limit to 2 decimal places
    const decimalIndex = val.indexOf(".");
    if (decimalIndex !== -1) {
      val = val.slice(0, decimalIndex + 1 + 2);
    }
    // Prevent > 9,999,999.99
    const floatVal = parseFloat(val);
    if (!isNaN(floatVal) && floatVal > 9999999.99) {
      return;
    }
    // Insert commas
    let [intPart, decPart] = val.split(".");
    if (intPart) {
      intPart = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    if (decPart !== undefined) {
      val = intPart + "." + decPart;
    } else {
      val = intPart;
    }
    setAmount(val);
  };

  // 4) FILE UPLOAD
  const handleFileSelect = async (files: File[]) => {
    let file = files[0];
    const validImageTypes = ["image/jpeg", "image/png", "image/webp", "image/heic"];

    // Validate file type
    if (!validImageTypes.includes(file.type)) {
      setError((prevError) => ({
        ...prevError,
        file: "กรุณาเลือกรูปภาพที่มีนามสกุล .jpg, .png หรือ .webp หรือ .heic",
      }));
      return;
    }

    // Check if file size exceeds 10 MB
    if (file.size > 10 * 1024 * 1024) {
      setError((prevError) => ({
        ...prevError,
        file: "กรุณาเลือกรูปที่มีขนาดไม่เกิน 10 MB",
      }));
      return;
    }

    // Clear file errors
    setError((prevError) => ({ ...prevError, file: null }));

    try {
      const options = {
        maxSizeMB: 2,
        maxWidthOrHeight: 800,
        useWebWorker: true,
      };

      // If HEIC, convert
      if (file.type === "image/heic") {
        const convertedBlob = await heic2any({
          blob: file,
          toType: "image/jpeg",
        });
        const finalBlob = Array.isArray(convertedBlob)
          ? convertedBlob[0]
          : convertedBlob;
        file = new File([finalBlob], file.name.replace(/\.heic$/, ".jpeg"), {
          type: "image/jpeg",
        });
      }

      // Compress
      const compressedFile = await imageCompression(file, options);
      setReceiptPhoto(compressedFile);

      // Preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error("Error compressing image:", error);
      setError((prevError) => ({
        ...prevError,
        file: "เกิดข้อผิดพลาดในการบีบอัดรูปภาพ",
      }));
    }
  };

  // 5) SUBMIT
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadCurrentBranch(branchName); // store branch in userStore

    // Validate required fields
    if (!branchName || !date || !receiptNo || !amount || !receiptPhoto) {
      Swal.fire({
        icon: "error",
        text: "กรุณากรอกข้อมูลใบเสร็จให้ครบทุกช่อง",
        confirmButtonText: "ยืนยัน",
        customClass: {
          htmlContainer: "font-kanit",
          confirmButton: "bg-gray-700 text-black rounded-md font-kanit",
        },
      });
      return;
    }

    // Validate store
    // if (haveOtherStore) {
    //   if (!otherStoreName.trim()) {
    //     Swal.fire({
    //       icon: "error",
    //       text: "กรณีเลือกร้านค้าอื่นๆ กรุณากรอกชื่อร้านค้า",
    //       confirmButtonText: "ยืนยัน",
    //       customClass: {
    //         htmlContainer: "font-kanit",
    //         confirmButton: "bg-gray-700 text-black rounded-md font-kanit",
    //       },
    //     });
    //     return;
    //   }
    // } else 
    if (!selectedStore) {
      Swal.fire({
        icon: "error",
        text: "กรุณาเลือกร้านค้า",
        confirmButtonText: "ยืนยัน",
        customClass: {
          htmlContainer: "font-kanit",
          confirmButton: "bg-gray-700 text-black rounded-md font-kanit",
        },
      });
      return;
    }

    const receiptDateString = calendarDateToJSString(date);
    const parsedAmount = parseFloat(amount.replace(/,/g, ""));

    try {
      setIsLoading(true);
      setUploadProgress(0); //init upload progress
      // Find the branch object
      const branchObj = branches.find((b) => b.branchName === branchName);
      if (!branchObj) {
        throw new Error("Selected branch not found");
      }

      // Check store
      // const store = branchObj.stores.find((s) => s.storeName === selectedStore);
      // const storeNameToSend = store ? store.storeName : otherStoreName;
      const storeNameToSend = selectedStore?.storeName || otherStoreName;

      // Build FormData
      const requestBody = new FormData();
      requestBody.append(
        "receipt",
        JSON.stringify({
          receiptNo,
          receiptDate: receiptDateString,
          lineId,
          branchName: branchObj.branchName,
          storeName: storeNameToSend,
          amount: parsedAmount,
        })
      );
      requestBody.append("file", receiptPhoto);

      // POST
      const response = await axiosInterceptor.post("/receipt/upload", requestBody, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${accessToken}`,
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          }
        },
      });

      if (response.status === 201) {
        navigate("/success-upload");
      }
    } catch (error: unknown) {
      setIsLoading(false);

      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message;

        Swal.fire({
          icon: "error",
          text: errorMessage,
          confirmButtonText: "ยืนยัน",
          customClass: {
            htmlContainer: "font-kanit",
            confirmButton: "bg-gray-700 text-black rounded-md font-kanit",
          },
        });
      } else if (error instanceof Error) {
        console.error("An error occurred:", error.message);
        Swal.fire({
          icon: "error",
          text: error.message,
          confirmButtonText: "ยืนยัน",
          customClass: {
            htmlContainer: "font-kanit",
            confirmButton: "bg-gray-700 text-black rounded-md font-kanit",
          },
        });
      } else {
        console.error("An unknown error occurred");
      }
    }
  };

  // 6) LIFECYCLE
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="font-kanit bg-[var(--bg)] w-full h-full min-h-screen flex flex-col justify-center items-center relative">
      {isLoading && <LoadingOverlay />}

      {/* Header */}
      <div className="w-full h-full min-h-[400px] md:w-96 relative bg-white">
        <img src="Poster.png" alt="header1page" className="w-full" />
      </div>

      <h1 className="text-3xl text-[var(--text)] pt-8 pb-12 relative">
        ส่งใบเสร็จ ลุ้นรางวัล
      </h1>
      <h1 className="text-2xl text-[var(--text)] pb-12 relative">
        รับสิทธิพิเศษ
      </h1>
      {/* Card Container */}
      <div className="flex flex-col justify-start items-center w-11/12 md:w-96 mb-10 text-center gap-5 text-black relative -top-8 bg-[var(--bg)]">
        <Form className="w-full flex flex-col items-center gap-3 mt-4 px-3">
          {/* Branch Combobox */}
          <section className="flex-col flex gap-5 w-full rounded-lg mt-2">
            <Combobox
              value={branchName}
              onChange={(val: string) => handleBranchChange(val)}
              onClose={() => setBranchQuery("")}
            >
              <Label className="text-start text-[var(--text)] text-[15px] ml-2">
                โรบินสันไลฟ์สไตล์ สาขา
              </Label>
              <div className="relative w-full -mt-4">
                <ComboboxInput
                  className="flex font-light relative w-full text-[0.98rem] cursor-default rounded-lg bg-white border-slate-300 border-[1px] h-10 data-[pressed]:bg-opacity-100 transition py-2 pl-5 pr-2 text-left text-gray-700 focus:outline-none data-[focus-visible]:border-indigo-500 data-[focus-visible]:ring-2 data-[focus-visible]:ring-black"
                  placeholder="*ศูนย์การค้าโรบินสันไลฟ์สไตล์ สาขา"
                  displayValue={(branch: string) => branch}
                  onChange={(event) => setBranchQuery(event.target.value)}
                />
                <ComboboxButton className="p-2 absolute right-2 top-0">
                  <MdKeyboardArrowDown size={24} className="text-black" />
                </ComboboxButton>
                <ComboboxOptions
                  anchor="bottom"
                  transition
                  className={clsx(
                    "w-[var(--input-width)] rounded-md border border-black/5 bg-white drop-shadow-md p-1 empty:invisible",
                    "transition duration-100 ease-in data-[leave]:data-[closed]:opacity-0 z-50"
                  )}
                >
                  {filteredBranchesForBranch.map((b) => (
                    <ComboboxOption
                      key={b.branchName}
                      value={b.branchName}
                      className="group flex items-center gap-2 rounded-md py-1.5 px-3 select-none data-[focus]:bg-white/3 cursor-pointer hover:bg-gray-300 duration-200 text-slate-600 hover:text-black font-kanit font-light"
                    >
                      <div className="p-1 pl-7">{b.branchName}</div>
                    </ComboboxOption>
                  ))}
                </ComboboxOptions>
              </div>
            </Combobox>
          </section>

          {/* Store Combobox */}
          {/* {branchName && (
            <section className="flex-col flex gap-5 w-full rounded-lg mt-2">
              <Combobox
                value={selectedStore}
                onChange={(key: string) => handleStoreChange(key)}
                onClose={() => setQuery("")}
              >
                <Label className="text-start text-sm ml-2 text-[var(--text)]">
                  *ร้านค้าที่ร่วมรายการ
                </Label>
                <div className="relative w-full -mt-4">
                  <ComboboxInput
                    className="flex font-light relative w-full text-sm cursor-default rounded-lg bg-white border-slate-300 border h-10 data-[pressed]:bg-opacity-100 transition py-2 pl-5 pr-2 text-left text-gray-700 focus:outline-none data-[focus-visible]:border-indigo-500 data-[focus-visible]:ring-2 data-[focus-visible]:ring-black"
                    placeholder="*ร้านค้าที่ร่วมรายการ"
                    displayValue={(store: string) => store}
                    onChange={(event) => setQuery(event.target.value)}
                  />
                  <ComboboxButton className="p-2 absolute right-2 top-0">
                    <MdKeyboardArrowDown size={24} className="text-black" />
                  </ComboboxButton>
                  <ComboboxOptions
                    anchor="bottom"
                    transition
                    className={clsx(
                      "w-[var(--input-width)] rounded-md border border-black/5 bg-white drop-shadow-md p-1 empty:invisible",
                      "transition duration-100 ease-in data-[leave]:data-[closed]:opacity-0 z-50"
                    )}
                  >
                    {filteredStores.map((store) => (
                      <ComboboxOption
                        key={store}
                        value={store}
                        className="group flex items-center gap-2 rounded-md py-1.5 px-3 select-none data-[focus]:bg-white/3 cursor-pointer hover:bg-gray-300 duration-200 text-slate-600 hover:text-black font-kanit font-light"
                      >
                        <div className="p-1 pl-7">{store}</div>
                      </ComboboxOption>
                    ))}
                  </ComboboxOptions>
                </div>
              </Combobox>

              {/* Other Store Name Field
              {haveOtherStore && (
                <TextField
                  isRequired
                  name="receiptNo"
                  className="relative w-full h-10 font-kanit mb-6"
                >
                  <Label className="text-start ml-2 text-sm w-full flex">
                    *กรอกชื่อร้านค้าที่ร่วมรายการ
                  </Label>
                  <Input
                    className="bg-white flex w-full h-full select-none font-light pl-5 transition-all border border-slate-300 rounded-md focus-within::border-teal-500 focus-within:border-2 text-slate-500 pr-3 py-1"
                    placeholder="*กรอกชื่อร้านค้าที่ร่วมรายการ"
                    value={otherStoreName}
                    onChange={(e) => {
                      const newValue = e.target.value.replace(
                        /[^a-zA-Z0-9ก-๙\s]/g,
                        ""
                      );
                      setOtherStoreName(newValue);
                    }}
                  />
                  <div className="text-yellow-300 text-start text-xs ml-2">
                    <FieldError>
                      {({ validationDetails }) =>
                        validationDetails.valueMissing
                          ? "กรุณากรอกชื่อร้านค้าอื่นๆ"
                          : ""
                      }
                    </FieldError>
                  </div>
                </TextField>
              )} 
            </section>
          )} */}
          {branchName && (
            <section className="flex-col flex gap-5 w-full rounded-lg mt-2">
              <Combobox
                value={selectedStore}
                onChange={(store: StoreOption | null) => handleStoreChange(store)}
                onClose={() => setQuery("")}
              >
                <Label className="text-start text-sm ml-2 text-[var(--text)]">
                  *ร้านค้าที่ร่วมรายการ
                </Label>
                <div className="relative w-full -mt-4">
                  <ComboboxInput
                    className="flex font-light relative w-full text-sm cursor-default rounded-lg bg-white border-slate-300 border h-10 data-[pressed]:bg-opacity-100 transition py-2 pl-5 pr-2 text-left text-gray-700 focus:outline-none data-[focus-visible]:border-indigo-500 data-[focus-visible]:ring-2 data-[focus-visible]:ring-black"
                    placeholder="*ร้านค้าที่ร่วมรายการ"
                    displayValue={(store: StoreOption | null) => store?.displayName || ""}
                    onChange={(event) => setQuery(event.target.value)}
                  />
                  <ComboboxButton className="p-2 absolute right-2 top-0">
                    <MdKeyboardArrowDown size={24} className="text-black" />
                  </ComboboxButton>
                  <ComboboxOptions
                    anchor="bottom"
                    transition
                    className={clsx(
                      "w-[var(--input-width)] rounded-md border border-black/5 bg-white drop-shadow-md p-1 empty:invisible",
                      "transition duration-100 ease-in data-[leave]:data-[closed]:opacity-0 z-50 max-h-60 overflow-y-auto"
                    )}
                  >
                    {filteredStores.map((store) => (
                      <ComboboxOption
                        key={store.displayName}
                        value={store}
                        className="group flex items-center gap-2 rounded-md py-1.5 px-3 select-none data-[focus]:bg-white/3 cursor-pointer hover:bg-gray-300 duration-200 text-slate-600 hover:text-black font-kanit font-light"
                      >
                        <div className="p-1 pl-7">{store.displayName}</div>
                      </ComboboxOption>
                    ))}
                  </ComboboxOptions>
                </div>
              </Combobox>
            </section>
          )}
          {/* Date Picker */}
          <DatePicker
            isRequired
            maxValue={today("Asia/Bangkok")}
            className="w-full flex flex-col mt-3"
            value={date}
            onChange={setDatePicked}
          >
            <Label className="text-start ml-2 text-sm text-[var(--text)]">
              *วัน/เดือน/ปี ที่ระบุในใบเสร็จ
            </Label>
            <Group className="flex items-center w-full border rounded-md border-slate-300 bg-white">
              <DateInput className="w-full flex ml-4 text-slate-500 font-light pl-1">
                {(segment) => <DateSegment segment={segment} />}
              </DateInput>
              <Button className="p-2 pr-3">
                <MdKeyboardArrowDown size={24} className="text-black" />
              </Button>
            </Group>
            <Popover>
              <div>
                <Calendar className="bg-white w-72 h-[19rem] rounded-md p-3 flex flex-col items-center justify-center drop-shadow-lg font-kanit font-light">
                  <header className="flex border-b w-full justify-between items-center pb-2">
                    <Button slot="previous">
                      <MdKeyboardArrowLeft size={26} />
                    </Button>
                    <Heading className="font-medium" />
                    <Button slot="next">
                      <MdKeyboardArrowRight size={26} />
                    </Button>
                  </header>
                  <CalendarGrid>
                    {(date) => (
                      <CalendarCell className={cellStyles} date={date} />
                    )}
                  </CalendarGrid>
                </Calendar>
              </div>
            </Popover>
          </DatePicker>

          {/* Receipt No */}
          <TextField
            isRequired
            name="receiptNo"
            className="mt-4 relative w-full h-10 font-kanit"
          >
            <Label className="text-start ml-2 text-sm w-full flex text-[var(--text)]">
              *เลขที่ใบเสร็จ
            </Label>
            <Input
              className="flex w-full h-full bg-white select-none rounded-md focus-within::border-teal-500 focus-within:border-2 text-slate-500 pl-5 pr-3 py-1"
              placeholder="*เลขที่ใบเสร็จ"
              value={receiptNo}
              onChange={(e) => {
                setReceiptNo(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === " ") {
                  e.preventDefault();
                }
              }}
            />
            <div className="text-yellow-300 text-start text-xs ml-2">
              <FieldError>
                {({ validationDetails }) =>
                  validationDetails.valueMissing ? "กรุณากรอกเลขที่ใบเสร็จ" : ""
                }
              </FieldError>
            </div>
          </TextField>

          {/* Amount */}
          <TextField
            isRequired
            name="amount"
            className="mt-8 relative w-full h-10 font-kanit mb-8"
          >
            <Label className="text-start ml-2 text-sm w-full flex text-[var(--text)]">
              *จำนวนเงิน
            </Label>
            <Input
              type="text"
              placeholder="เช่น 1,234.56"
              value={amount}
              onChange={handleAmountChange}
              onKeyDown={(e) => {
                if (e.key === " ") {
                  e.preventDefault();
                }
              }}
              className="flex w-full h-full bg-white select-none rounded-md focus-within::border-teal-500 focus-within:border-2 text-slate-500 pl-5 pr-3 py-1"
            />
            <div className="text-yellow-300 text-start text-xs ml-2">
              <FieldError>
                {({ validationDetails }) =>
                  validationDetails.valueMissing ? "กรุณากรอกจำนวนเงิน" : ""
                }
              </FieldError>
            </div>
            <div className="text-start text-xs text-black pt-2 relative">
              *กรณีจำนวนเงินมีจุดสตางค์ กรุณากรอกเป็นทศนิยม 2 ตำแหน่ง
            </div>
            <div className="absolute top-7 right-5 font-light text-slate-600">
              บาท
            </div>
          </TextField>

          {/* File Upload */}
          <FileTrigger
            acceptedFileTypes={["image/jpeg", "image/png", "image/webp", "image/heic"]}
            onSelect={(e) => {
              if (e) {
                handleFileSelect(Array.from(e));
              } else {
                setError((prevError) => ({
                  ...prevError,
                  file: "No file selected",
                }));
              }
            }}
          >
            <Button className="text-white bg-[var(--button)] flex w-full rounded-md gap-4 h-10 mt-3 justify-center items-center">
              <FiUpload />
              *อัพโหลดภาพใบเสร็จ
            </Button>
          </FileTrigger>
          <p className="w-full text-start text-sm mt-2 text-white">
            *อัพโหลด 1 ใบเสร็จ ต่อ 1 ร้านค้าเท่านั้น
          </p>
          <p className="w-full text-start text-xs text-white">
            *ไฟล์ภาพต้องมีขนาดไม่เกิน 10 MB
          </p>

          {/* Preview */}
          <FileTrigger
            acceptedFileTypes={["image/jpeg", "image/png", "image/webp", "image/heic"]}
            onSelect={(e) => {
              if (e) {
                handleFileSelect(Array.from(e));
              } else {
                setError((prevError) => ({
                  ...prevError,
                  file: "No file selected",
                }));
              }
            }}
          >
            <Button className="w-full">
              {imagePreviewUrl ? (
                <img
                  src={imagePreviewUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <p className="text-center w-full h-60 border-dashed text-slate-400 border-2 border-white rounded-lg flex items-center justify-center">
                  <IoCameraOutline color="white" size={40} />
                </p>
              )}
            </Button>
          </FileTrigger>
          <p className="text-yellow-300 text-sm">{error.file}</p>
        </Form>

        <p className="w-full text-center text-xs -mb-2 text-white">
          ดูข้อมูลเพิ่มเติมได้ที่{" "}
          <button
            onClick={handleRulesDialogOpen}
            className="text-blue-600 underline hover:text-blue-700 bg-transparent border-none p-0 cursor-pointer inline font-kanit"
          >
            ข้อกำหนดและเงื่อนไข
          </button>
        </p>

        {/* ADD: Step 3) Show the progress bar if > 0% */}
        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="w-4/5 bg-gray-200 rounded-full h-5 mt-3">
            <div
              className="bg-green-500 h-5 rounded-full"
              style={{ width: `${uploadProgress}%` }}
            />
            {/* Percent Text */}
            <p className="text-center text-base mt-1">{uploadProgress}%</p>
          </div>
        )}

        {uploadProgress === 100 && (
          <p className="text-sm text-green-600 mt-2">อัปโหลดเสร็จสมบูรณ์!</p>
        )}

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          className="w-[95%] mt-4 transition transform hover:scale-105 focus:outline-none bg-[var(--button)] text-white rounded-md p-2"
          type="submit"
        >
          ส่งใบเสร็จ
        </button>

        {/* Back Button */}
        <Link
          to="/menu"
          className="w-[95%] mt-3 transition transform hover:scale-105 focus:outline-none bg-white text-[var(--button)] border-1 border-[var(--button)]   rounded-md p-2 text-center no-underline flex items-center justify-center"
        >
          กลับหน้าหลัก
        </Link>
      </div>

      <RulesDialog
        isRulesOpen={isRulesOpen}
        handleRulesDialogClose={handleRulesDialogClose}
      />
    </div>
  );
};

export default FileUploadPage;

/**
 * Tailwind Variants for Calendar Cells
 */
const cellStyles = tv({
  base: "w-7 h-7 text-center font-light m-1 outline-none disabled:text-slate-400 rounded-md flex items-center justify-center outside-month:text-slate-300 duration-200 cursor-pointer",
  variants: {
    isSelected: {
      false: "text-zinc-900 ",
      true: "ring-2 ring-black",
    },
    isDisabled: {
      true: "text-zinc-300 bg-gray cursor-default",
    },
  },
});
