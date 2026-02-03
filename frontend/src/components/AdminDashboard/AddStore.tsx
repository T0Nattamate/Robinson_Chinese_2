import React, { useState } from "react";
import { useAdminStore } from "../../store/AdminStore";
import { FiUpload, FiDownload, FiPlus, FiTrash2 } from "react-icons/fi";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import { HiOutlineBuildingStorefront } from "react-icons/hi2";

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
            Swal.fire({
                icon: "success",
                title: "สำเร็จ!",
                text: `เพิ่มข้อมูลร้านค้า ${validStores.length} รายการเรียบร้อยแล้ว`,
                confirmButtonText: "รับทราบ",
                customClass: { confirmButton: "bg-red-600 text-white rounded-md font-kanit px-8 py-2" }
            });
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
            Swal.fire({
                icon: "success",
                title: "สำเร็จ!",
                text: "อัพโหลดข้อมูลร้านค้าจากไฟล์ Excel เรียบร้อยแล้ว",
                confirmButtonText: "รับทราบ",
                customClass: { confirmButton: "bg-red-600 text-white rounded-md font-kanit px-8 py-2" }
            });
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
        <div className="p-6 lg:p-10 space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">จัดการร้านค้า</h1>
                    <p className="text-gray-500 mt-1">เพิ่มและแก้ไขรายชื่อร้านค้าที่เข้าร่วมแคมเปญในสาขาของคุณ</p>
                </div>

                <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-100">
                    <button
                        onClick={() => setActiveTab("manual")}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "manual" ? "bg-[var(--red)] text-white shadow-md shadow-red-100" : "text-gray-500 hover:bg-gray-50"
                            }`}
                    >
                        เพิ่มรายร้าน
                    </button>
                    <button
                        onClick={() => setActiveTab("excel")}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "excel" ? "bg-[var(--red)] text-white shadow-md shadow-red-100" : "text-gray-500 hover:bg-gray-50"
                            }`}
                    >
                        อัพโหลด Excel
                    </button>
                </div>
            </div>

            {activeTab === "manual" && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
                    <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-[var(--red)]">
                            <HiOutlineBuildingStorefront size={24} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">เพิ่มข้อมูลร้านค้าด้วยตนเอง</h2>
                            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Manual Store Registration</p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[700px]">
                            <thead>
                                <tr className="bg-white border-b border-gray-100">
                                    <th className="px-8 py-4 text-[11px] font-bold uppercase tracking-widest text-gray-400">ชื่อร้านค้า (Store Name)</th>
                                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-gray-400">หมวดหมู่ (Category)</th>
                                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-gray-400 text-center">เข้าร่วมรายการ</th>
                                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-gray-400 text-center">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {manualStores.map((store, index) => (
                                    <tr key={index} className="group hover:bg-gray-50/50 transition-colors">
                                        <td className="px-8 py-4">
                                            <input
                                                type="text"
                                                value={store.storeName}
                                                onChange={(e) => handleManualChange(index, "storeName", e.target.value)}
                                                placeholder="ระบุชื่อร้านค้า..."
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all font-medium"
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <select
                                                value={store.category}
                                                onChange={(e) => handleManualChange(index, "category", e.target.value)}
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all font-medium appearance-none cursor-pointer"
                                            >
                                                {categoryOptions.map((opt) => (
                                                    <option key={opt.value} value={opt.value}>
                                                        {opt.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex justify-center">
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={store.isParticipating}
                                                        onChange={(e) => handleManualChange(index, "isParticipating", e.target.checked)}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                                                </label>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => handleRemoveRow(index)}
                                                className="p-2.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                            >
                                                <FiTrash2 size={20} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-6 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-gray-100">
                        <button
                            onClick={handleAddRow}
                            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold text-sm px-6 py-2.5 rounded-xl bg-white border border-gray-100 shadow-sm transition-all"
                        >
                            <FiPlus size={18} /> เพิ่มรายการใหม่
                        </button>
                        <button
                            onClick={handleManualSubmit}
                            disabled={isSubmitting}
                            className="w-full sm:w-auto px-12 py-3 bg-[var(--red)] text-white rounded-xl shadow-lg shadow-red-100 hover:bg-red-700 active:scale-[0.98] transition-all disabled:opacity-50 font-bold"
                        >
                            {isSubmitting ? "กำลังบันทึกข้อมูล..." : "บันทึกข้อมูลทั้งหมด"}
                        </button>
                    </div>
                </div>
            )}

            {activeTab === "excel" && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 lg:p-16 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="max-w-xl mx-auto space-y-10">
                        <div className="text-center space-y-2">
                            <h2 className="text-2xl font-black text-gray-900">อัพโหลดไฟล์ Excel</h2>
                            <p className="text-gray-500 font-medium">เพิ่มข้อมูลร้านค้าจำนวนมากผ่านการนำเข้าไฟล์ (.xlsx, .xls)</p>
                        </div>

                        <div
                            className={`group border-2 border-dashed rounded-[2.5rem] p-12 transition-all cursor-pointer relative ${selectedFile ? "border-green-400 bg-green-50/30" : "border-gray-100 hover:border-red-200 hover:bg-red-50/30"
                                }`}
                        >
                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept=".xlsx, .xls" onChange={handleFileChange} />

                            <div className="text-center space-y-4">
                                <div className={`w-20 h-20 rounded-3xl mx-auto flex items-center justify-center transition-all ${selectedFile ? "bg-green-100 text-green-600 scale-110" : "bg-gray-50 text-gray-300 group-hover:bg-red-100 group-hover:text-red-500"
                                    }`}>
                                    <FiUpload size={32} />
                                </div>
                                {selectedFile ? (
                                    <div className="space-y-1">
                                        <p className="text-gray-900 font-bold text-lg">{selectedFile.name}</p>
                                        <p className="text-green-600 text-xs font-bold uppercase tracking-widest">File Ready to Upload</p>
                                    </div>
                                ) : (
                                    <div className="space-y-1">
                                        <p className="text-gray-400 font-medium">ลากไฟล์มาวาง หรือ <span className="text-red-600 font-bold underline underline-offset-4 decoration-red-600/30 group-hover:decoration-red-600">คลิกเพื่อเลือกไฟล์</span></p>
                                        <p className="text-[10px] text-gray-300 uppercase tracking-widest pt-2">Maximum file size: 5MB</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4 pt-4">
                            <button
                                onClick={handleExcelSubmit}
                                disabled={!selectedFile || isSubmitting}
                                className="w-full py-4 bg-gray-900 text-white rounded-2xl shadow-xl shadow-gray-200 hover:bg-black active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed font-bold tracking-wide"
                            >
                                {isSubmitting ? "กำลังอัพโหลดข้อมูล..." : "เริ่มการอัพโหลดข้อมูล"}
                            </button>
                            <button
                                onClick={downloadTemplate}
                                className="w-full flex items-center justify-center gap-2 text-gray-400 hover:text-red-600 font-bold text-xs uppercase tracking-widest py-4 transition-all"
                            >
                                <FiDownload size={16} /> ดาวน์โหลดไฟล์ตัวอย่าง (.xlsx Template)
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddStore;
