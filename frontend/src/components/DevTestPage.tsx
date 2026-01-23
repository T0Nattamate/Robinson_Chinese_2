import { useState } from "react";
import DatePicker from "react-datepicker";
import axios from "axios";
import "react-datepicker/dist/react-datepicker.css";
import { MdOutlineContentCopy } from "react-icons/md";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { handleError, showAlert } from "../data/functions";

const DevTestPage = () => {
  const [receiptNo, setReceiptNo] = useState<string>("");
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [userId, setUserId] = useState<string>("");
  const [branchName, setBranchName] = useState<string>("Centralworld");
  const [storeName, setstoreName] = useState<string>("Dior");
  const [amount, setAmount] = useState<number | "">(500);
  const [responseMessage, setResponseMessage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // File state
  const [jwtToken, setJwtToken] = useState<string>("");

  //console.log("startDate Date();", startDate);
  //console.log("startDate toISOString", startDate?.toISOString());

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setResponseMessage("Please select a file to upload.");
      return;
    }

    // Prepare the receipt data
    const receiptData = {
      receiptDate: startDate?.toISOString(), // Ensure the date is in ISO 8601 format
      receiptNo,
      userId,
      storeName,
      branchName,
      amount,
    };

    //console.log("Body receiptData", receiptData);

    // Create FormData to include both file and receipt data
    const formData = new FormData();
    formData.append("receipt", JSON.stringify(receiptData)); // Attach the receipt data as JSON string
    formData.append("file", selectedFile); // Attach the file

    try {
      const response = await axios.post("/receipt/upload", formData, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          "Content-Type": "multipart/form-data",
        },
      });
      showAlert("อัพโหลดใบเสร็จสำเร็จ", "success");
      setResponseMessage("Receipt uploaded successfully!");
      console.log("API Response:", response.data);
    } catch (error) {
      handleError(error);
      setResponseMessage("Failed to upload receipt. Please try again.");
      console.error("Error uploading receipt:", error);
    }
  };

  const jwtSuperAdmin =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZG1pbklkIjoiMmIzYTU1MzctZGEwYS00NjU0LThlMjYtMTYyMzhhYjkxNWIyIiwicm9sZSI6InN1cGVyQWRtaW4iLCJzdWIiOiIyYjNhNTUzNy1kYTBhLTQ2NTQtOGUyNi0xNjIzOGFiOTE1YjIiLCJpYXQiOjE3MzQ0OTAyODYsImV4cCI6MTczNDU3NjY4Nn0.noBAxM_-Pwa9K8CzxBnHrOun1-J0vi1XEaKYwznEen0";
  const jwtBranchAdmin =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZG1pbklkIjoiMWRkYjE3ZmEtMGM4OS00NjI4LTk1YzQtYzI4NTNlMWE4NzNmIiwicm9sZSI6ImJyYW5jaEFkbWluIiwic3ViIjoiMWRkYjE3ZmEtMGM4OS00NjI4LTk1YzQtYzI4NTNlMWE4NzNmIiwiaWF0IjoxNzM0NTAzMjYxLCJleHAiOjE3MzQ1ODk2NjF9.b6O4X2D2Ot6CobaNhWFVIGYJuEv1ri4-4cUnjRJV1i0";
  const jwtClient =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsaW5lSWQiOiJsaW5lMTIzIiwic3ViIjoiZjFiNDQ5MGUtZmMxNy00ZDU1LWFmMWQtZjY4NGU3ZGJlNGM2IiwiaWF0IjoxNzM0NjY2MTI5LCJleHAiOjE3MzQ3NTI1Mjl9.1PP5nD2Dx_EnRMqlixzzGnkzAfsNX-V_tk8bcs0VQbA";
  const jwtSecret = "";
  const [, setCopied] = useState(false);

  const handleDlReceipt = async (filters: any) => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await axios.get(
        `/admin/download/receipts?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
          responseType: "blob", // Important: Get the response as a blob
        }
      );

      // Step 2: Create a Blob URL and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "receipts.xlsx"); // File name for download
      document.body.appendChild(link);
      link.click();
      link.remove(); // Clean up the DOM

      //console.log("Receipt download success");
    } catch (error) {
      console.error("Failed to download receipts:", error);
    }
  };

  const handleDlCustomers = async (filters: any) => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await axios.get(
        `/admin/download/customers?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "customers.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();

      //console.log("Customers report download success");
    } catch (error) {
      console.error("Failed to download customers:", error);
    }
  };

  const handleDlCustomersLucky = async (filters: any) => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await axios.get(
        `/admin/download/luckydraw?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "customersLuckydraw.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();

      //console.log("customersLuckydraw report download success");
    } catch (error) {
      console.error("Failed to download customersLuckydraw:", error);
    }
  };

  const handleDlClaimedHist = async (filters: any) => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await axios.get(
        `/admin/download/claimed?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "claimedHistory.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();

      //console.log("claimedHistory report download success");
    } catch (error) {
      console.error("Failed to download claimedHistory:", error);
    }
  };

  return (
    <div className="w-full min-h-screen h-full flex flex-col items-center relative font-poppins gap-5">
      <section className="mt-5 bg-slate-200 w-[80%] h-full rounded-3xl flex flex-col items-start justify-center p-10">
        <h1 className="text-3xl font-medium">JWT</h1>
        <div className="mt-8  hover:text-blue-700 duration-200">
          <CopyToClipboard text={jwtSuperAdmin} onCopy={() => setCopied(true)}>
            <button className="cursor-pointer flex gap-3">
              <MdOutlineContentCopy />
              <p>superAdmin</p>
            </button>
          </CopyToClipboard>
        </div>
        <div className="mt-3 flex gap-3 hover:text-blue-700 duration-200">
          <CopyToClipboard text={jwtBranchAdmin} onCopy={() => setCopied(true)}>
            <button className="cursor-pointer flex gap-3">
              <MdOutlineContentCopy />
              <p>branchAdmin</p>
            </button>
          </CopyToClipboard>
        </div>
        <div className="mt-3 flex gap-3 hover:text-blue-700 duration-200">
          <CopyToClipboard text={jwtClient} onCopy={() => setCopied(true)}>
            <button className="cursor-pointer flex gap-3">
              <MdOutlineContentCopy />
              <p>client</p>
            </button>
          </CopyToClipboard>
        </div>
        <div className="mt-3 flex gap-3 hover:text-blue-700 duration-200">
          <CopyToClipboard text={jwtSecret} onCopy={() => setCopied(true)}>
            <button className="cursor-pointer flex gap-3">
              <MdOutlineContentCopy />

              <p>secretAdmin</p>
            </button>
          </CopyToClipboard>
        </div>
        <div className="w-[30rem] lg:w-[44rem] flex flex-col gap-3 mt-10 relative">
          <textarea
            value={jwtToken}
            onChange={(e) => setJwtToken(e.target.value)}
            placeholder="Enter jwt"
            className="border p-2 rounded-md mb-2 w-full h-[10rem] lg:h-[8rem]"
          />
          <button
            onClick={() => setJwtToken("")}
            className="bg-black text-white p-2 rounded-md mt-4 absolute -right-20 -top-3"
          >
            clear
          </button>
        </div>
      </section>
      <section className="bg-slate-200 w-[80%] h-full rounded-3xl flex flex-col items-start justify-center p-10">
        <h1 className="text-3xl font-medium">Download excel</h1>
        <div className="flex items-center justify-center gap-5">
          <button
            className="ring-2 p-2 rounded-md ring-black mt-5 "
            onClick={() =>
              handleDlReceipt({
                //branchId: "25a4d5c8-da9e-4bdd-8fbc-24f2a7365a91",
                // startDate: "2024-01-01",
                // endDate: "2024-01-31",
                //status: "approved",
                phone: "098",
                //receiptNo: "RCPT12345",
              })
            }
          >
            Download receipts
          </button>
          <p className="mt-4 text-slate-500">
            branchId,startDate,endDate,status,phone,receiptNo
          </p>
        </div>
        <div className="flex items-center justify-center gap-5">
          <button
            className="ring-2 p-2 rounded-md ring-black mt-5 "
            onClick={() =>
              handleDlCustomers({
                //branchId: "25a4d5c8-da9e-4bdd-8fbc-24f2a7365a91",
                // startDate: "2024-01-01",
                // endDate: "2024-01-31",
                //status: "approved",
                //phone: "098",
                //receiptNo: "RCPT12345",
              })
            }
          >
            Download customers
          </button>
          <p className="mt-4 text-slate-500">
            startDate,endDate,phone,theOne,orderBy
          </p>
        </div>
        <div className="flex items-center justify-center gap-5">
          <button
            className="ring-2 p-2 rounded-md ring-black mt-5 "
            onClick={() =>
              handleDlCustomersLucky({
                //branchId: "25a4d5c8-da9e-4bdd-8fbc-24f2a7365a91",
                // startDate: "2024-01-01",
                // endDate: "2024-01-31",
                //status: "approved",
                //phone: "098",
                //receiptNo: "RCPT12345",
              })
            }
          >
            Download customers luckydraw
          </button>
          <p className="mt-4 text-slate-500">
            startDate,endDate,phone,theOne,orderBy
          </p>
        </div>
        <div className="flex items-center justify-center gap-5">
          <button
            className="ring-2 p-2 rounded-md ring-black mt-5 "
            onClick={() =>
              handleDlClaimedHist({
                //branchId: "25a4d5c8-da9e-4bdd-8fbc-24f2a7365a91",
                // startDate: "2024-01-01",
                // endDate: "2024-01-31",
                //status: "approved",
                phone: "098",
                //receiptNo: "RCPT12345",
              })
            }
          >
            Download claimed history
          </button>
          <p className="mt-4 text-slate-500">
            branchId,startDate,endDate,phone
          </p>
        </div>
      </section>

      <section className="bg-slate-200 w-[80%] h-full rounded-3xl flex flex-col items-start justify-center p-10">
        {/* Dynamic Inputs */}
        <h1 className="text-3xl mb-10 font-medium">Receipt Upload</h1>
        <div className="w-[30rem] flex flex-col gap-3 ">
          <label>Receipt No:</label>
          <input
            type="text"
            value={receiptNo}
            onChange={(e) => setReceiptNo(e.target.value)}
            placeholder="Enter receiptNo"
            className="border p-2 rounded-md mb-2 w-full"
          />
        </div>
        <div className="w-[30rem] flex flex-col gap-3 ">
          <label>User ID:</label>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="Enter User ID"
            className="border p-2 rounded-md mb-2 w-full"
          />
        </div>
        <div className="w-[30rem] flex flex-col gap-3 ">
          <label>Branch Name:</label>
          <input
            type="text"
            value={branchName}
            onChange={(e) => setBranchName(e.target.value)}
            placeholder="Enter Branch Name"
            className="border p-2 rounded-md mb-2 w-full"
          />
        </div>

        <div className="w-[30rem] flex flex-col gap-3 ">
          <label>Store Name:</label>
          <input
            type="text"
            value={storeName}
            onChange={(e) => setstoreName(e.target.value)}
            placeholder="Enter Store Name"
            className="border p-2 rounded-md mb-2 w-full"
          />
        </div>

        <div className="w-[30rem] flex flex-col gap-3 ">
          <label>Amount:</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            placeholder="Enter Amount"
            className="border p-2 rounded-md mb-2 w-full"
          />
        </div>

        {/* DatePicker Component */}
        <div className="w-[30rem] flex flex-col gap-3 ">
          <label>Receipt Date:</label>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            dateFormat="Pp"
            className="border p-2 rounded-md mb-2 w-full"
          />
        </div>

        {/* File Input */}
        <div className="w-[30rem] flex flex-col gap-3 ">
          <label>Upload File:</label>
          <input
            type="file"
            onChange={handleFileChange}
            className="border p-2 rounded-md mb-2 w-full"
          />
        </div>

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          className="bg-black text-white p-2 rounded-md mt-4 w-44"
        >
          Upload Receipt
        </button>

        {/* Response Message */}
        {responseMessage && (
          <div
            style={{
              marginTop: "20px",
              color: responseMessage.includes("Failed") ? "red" : "green",
            }}
          >
            {responseMessage}
          </div>
        )}
      </section>
    </div>
  );
};

export default DevTestPage;
