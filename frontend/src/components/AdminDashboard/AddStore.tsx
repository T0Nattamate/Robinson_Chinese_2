import React, { useState } from "react";
import { useAdminStore } from "../../store/AdminStore";
import { FiUpload, FiDownload, FiPlus, FiTrash2 } from "react-icons/fi";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";

const categoryOptions = [
    { label: "ทั่วไป (General)", value: "GENERAL" },
    { label: "Business Unit (BU)", value: "BU" },
    { label: "ทองและอัญมณี (Gold)", value: "GOLD_JEWELRY" },
    { label: "คลินิกและความงาม (Beauty)", value: "BEAUTY_CLINIC" },
    { label: "การศึกษา (Education)", value: "EDUCATION" },
    { label: "ไอทีและแกดเจ็ต (IT)", value: "IT_GADGET" },
    { label: "อาหารและเครื่องดื่ม (Food)", value: "FOOD" },
];

const AddStore = () => {
    const { adminData, addStoresBulkAction, uploadStoresExcelAction } = useAdminStore();
    const [activeTab, setActiveTab] = useState<"manual" | "excel">("manual");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Manual Entry State
    const [manualStores, setManualStores] = useState([
        { storeName: "", category: "GENERAL", isParticipating: true },
    ]);

    const handleAddRow = () => {
        setManualStores([...manualStores, { storeName: "", category: "GENERAL", isParticipating: true }]);
    };

    const handleRemoveRow = (index: number) => {
        if (manualStores.length === 1) {
            setManualStores([{ storeName: "", category: "GENERAL", isParticipating: true }]);
            return;
        }
        setManualStores(manualStores.filter((_, i) => i !== index));
    };

    const handleManualChange = (index: number, field: string, value: any) => {
        const updated = [...manualStores];
        (updated[index] as any)[field] = value;
        setManualStores(updated);
    };

    const handleManualSubmit = async () => {
        const validStores = manualStores.filter((s) => s.storeName.trim() !== "");
        if (validStores.length === 0) {
            Swal.fire("ข้อผิดพลาด", "กรุณาระบุชื่อร้านค้าอย่างน้อย 1 ร้าน", "error");
            return;
        }

        setIsSubmitting(true);
        try {
            await addStoresBulkAction(adminData.branch!, validStores);
            Swal.fire("สำเร็จ", `เพิ่มข้อมูลร้านค้า ${validStores.length} รายการเรียบร้อยแล้ว`, "success");
            setManualStores([{ storeName: "", category: "GENERAL", isParticipating: true }]);
        } catch (error: any) {
            Swal.fire("ข้อผิดพลาด", error.response?.data?.message || "ไม่สามารถเพิ่มข้อมูลได้", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Excel Upload State
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleExcelSubmit = async () => {
        if (!selectedFile) {
            Swal.fire("ข้อผิดพลาด", "กรุณาเลือกไฟล์ Excel", "error");
            return;
        }

        setIsSubmitting(true);
        try {
            await uploadStoresExcelAction(adminData.branch!, selectedFile);
            Swal.fire("สำเร็จ", "อัพโหลดข้อมูลร้านค้าจากไฟล์ Excel เรียบร้อยแล้ว", "success");
            setSelectedFile(null);
        } catch (error: any) {
            Swal.fire("ข้อผิดพลาด", error.response?.data?.message || "ไม่สามารถอัพโหลดไฟล์ได้", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const downloadTemplate = () => {
        const templateData = [
            { "Store Name": "ร้านตัวอย่าง 1", "Category": "GENERAL", "isParticipating": true },
            { "Store Name": "ร้านตัวอย่าง 2", "Category": "FOOD", "isParticipating": true },
        ];
        const ws = XLSX.utils.json_to_sheet(templateData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Stores");
        XLSX.writeFile(wb, "Store_Template.xlsx");
    };

    return (
        <div className="p-8 font-kanit">
            <h1 className="text-3xl text-[var(--text)] mb-8">จัดการรายชื่อร้านค้า</h1>

            {/* Tabs */}
            <div className="flex gap-4 mb-8">
                <button
                    onClick={() => setActiveTab("manual")}
                    className={`px-6 py-2 rounded-lg transition-all ${activeTab === "manual" ? "bg-[var(--button)] text-white shadow-lg" : "bg-white text-gray-500 hover:bg-gray-50"
                        }`}
                >
                    เพิ่มด้วยตนเอง
                </button>
                <button
                    onClick={() => setActiveTab("excel")}
                    className={`px-6 py-2 rounded-lg transition-all ${activeTab === "excel" ? "bg-[var(--button)] text-white shadow-lg" : "bg-white text-gray-500 hover:bg-gray-50"
                        }`}
                >
                    อัพโหลดไฟล์ Excel
                </button>
            </div>

            {/* Manual Content */}
            {activeTab === "manual" && (
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left mb-6">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="pb-4 font-medium text-gray-600">ชื่อร้าน</th>
                                    <th className="pb-4 font-medium text-gray-600">หมวดหมู่</th>
                                    <th className="pb-4 font-medium text-gray-600 text-center">เข้าร่วมรายการ</th>
                                    <th className="pb-4 font-medium text-gray-600 text-center">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {manualStores.map((store, index) => (
                                    <tr key={index} className="group">
                                        <td className="py-4 pr-4">
                                            <input
                                                type="text"
                                                value={store.storeName}
                                                onChange={(e) => handleManualChange(index, "storeName", e.target.value)}
                                                placeholder="กรอกชื่อร้านค้า"
                                                className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--button)] outline-none"
                                            />
                                        </td>
                                        <td className="py-4 pr-4">
                                            <select
                                                value={store.category}
                                                onChange={(e) => handleManualChange(index, "category", e.target.value)}
                                                className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--button)] outline-none bg-white"
                                            >
                                                {categoryOptions.map((opt) => (
                                                    <option key={opt.value} value={opt.value}>
                                                        {opt.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="py-4 text-center">
                                            <input
                                                type="checkbox"
                                                checked={store.isParticipating}
                                                onChange={(e) => handleManualChange(index, "isParticipating", e.target.checked)}
                                                className="w-5 h-5 accent-[var(--button)] cursor-pointer"
                                            />
                                        </td>
                                        <td className="py-4 text-center">
                                            <button
                                                onClick={() => handleRemoveRow(index)}
                                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <FiTrash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-between items-center">
                        <button
                            onClick={handleAddRow}
                            className="flex items-center gap-2 text-[var(--button)] hover:text-green-800 font-medium px-4 py-2 rounded-lg hover:bg-green-50 transition-colors"
                        >
                            <FiPlus /> เพิ่มแถวใหม่
                        </button>
                        <button
                            onClick={handleManualSubmit}
                            disabled={isSubmitting}
                            className="px-10 py-3 bg-[var(--button)] text-white rounded-xl shadow-lg hover:opacity-90 transition-all disabled:opacity-50"
                        >
                            {isSubmitting ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
                        </button>
                    </div>
                </div>
            )}

            {/* Excel Content */}
            {activeTab === "excel" && (
                <div className="bg-white rounded-2xl p-12 shadow-sm text-center">
                    <div className="max-w-md mx-auto">
                        <div
                            className={`border-2 border-dashed rounded-3xl p-12 mb-8 transition-colors ${selectedFile ? "border-[var(--button)] bg-green-50" : "border-gray-200 hover:border-gray-300"
                                }`}
                        >
                            <FiUpload size={48} className={`mx-auto mb-4 ${selectedFile ? "text-[var(--button)]" : "text-gray-300"}`} />
                            {selectedFile ? (
                                <p className="text-[var(--button)] font-medium">{selectedFile.name}</p>
                            ) : (
                                <>
                                    <p className="text-gray-500 mb-2">ลากไฟล์มาวาง หรือ</p>
                                    <label className="text-[var(--button)] font-semibold cursor-pointer hover:underline">
                                        คลิกเพื่อเลือกไฟล์
                                        <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleFileChange} />
                                    </label>
                                </>
                            )}
                        </div>

                        <div className="flex flex-col gap-4">
                            <button
                                onClick={handleExcelSubmit}
                                disabled={!selectedFile || isSubmitting}
                                className="w-full py-4 bg-[var(--button)] text-white rounded-2xl shadow-lg hover:opacity-90 transition-all disabled:opacity-50 font-semibold"
                            >
                                {isSubmitting ? "กำลังอัพโหลด..." : "อัพโหลดไฟล์"}
                            </button>
                            <button
                                onClick={downloadTemplate}
                                className="flex items-center justify-center gap-2 text-gray-500 hover:text-gray-700 font-medium py-2 transition-colors"
                            >
                                <FiDownload /> ดาวน์โหลดไฟล์ตัวอย่าง (.xlsx)
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddStore;
