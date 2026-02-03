import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// Mock data interface
interface Winner {
  lineId: string;
  week: number;
  fullname: string;
  phone: string;
  mostBranchName: string;
  mostBranchId: string;
}

// // Example mock data for demonstration
// const mockWinners: Winner[] = [
//   {
//     lineId: "user001",
//     week: 1,
//     fullname: "สมชาย ใจดี",
//     phone: "0812345678",
//     mostBranchName: "สาขาบางนา",
//     mostBranchId: "R001",
//   },
//   {
//     lineId: "user002",
//     week: 1,
//     fullname: "สมนึก ตั้งใจ",
//     phone: "0898765432",
//     mostBranchName: "สาขาพระราม 9",
//     mostBranchId: "R009",
//   },
//   {
//     lineId: "user003",
//     week: 1,
//     fullname: "กมล ชื่นใจ",
//     phone: "0855551234",
//     mostBranchName: "สาขาเชียงใหม่",
//     mostBranchId: "R123",
//   },
//   // ... Add more items as needed
// ];

// Optional: Example function to mask parts of a string
// e.g., "สมชาย ใจดี" => "สมช*** ***ดี" or "0812345678" => "081****678"
function censorString(str: string) {
  if (!str) return "";
  // Simple example: If it's a phone number, mask the middle digits
  if (/^\d+$/.test(str)) {
    // For phone numbers, mask the middle 4 digits
    return str.replace(/(\d{3})(\d{4})(\d{2})/, "$1****$3");
  } else {
    // For names, just mask the middle
    if (str.length <= 3) return str; // if very short, do nothing
    const half = Math.floor(str.length / 2);
    return str.slice(0, half) + "*".repeat(str.length - half);
  }
}

const AnnouncementPage = () => {
  const [announcements] = useState<Winner[]>([]);

  // On component mount, use the mock data
  useEffect(() => {
    //setAnnouncements(mockWinners);
  }, []);

  return (
    <div className="font-kanit bg-[var(--bg)] w-full min-h-screen h-full flex flex-col justify-start items-center relative animate-in fade-in duration-700">
      <div className="w-full h-full bg-white md:w-96 ">
        <img src="/header.png" alt="header1page" className="w-full" />
      </div>
      <h1 className="text-3xl pt-10 relative text-[var(--text)] text-center">ประกาศรายชื่อผู้โชคดี<br></br>

      </h1>
      <h2 className="text-xl pb-10 relative text-[var(--text)] text-center">
        รับคะแนนเดอะวัน รวม 1 ล้านคะแนน <br></br>
        (รางวัลละ 250,000 คะแนน, จำนวน 4 รางวัล)
      </h2>
      {/* Winners Table */}
      <div className="rounded-t-lg rounded-b-lg w-[90%] overflow-hidden bg-white text-black">
        {/* Top bar (black) */}
        <div className="bg-[var(--button)] h-10 flex flex-col items-center text-center text-white pt-2">
          ประกาศรายชื่อ วันที่ 19 พ.ค. 2568
        </div>

        <table className="w-full border-collapse text-sm ">
          <thead>
            <tr className="bg-gray-100 border-b border-black  text-center">
              <th className="py-2 border-black border-b">อันดับ</th>
              <th className="py-2 border-black border-l">ชื่อ-นามสกุล</th>
              <th className="py-2 border-black border-l">หมายเลขโทรศัพท์</th>
              <th className="py-2 border-black border-l">โรบินไลฟ์สไตล์สาขา</th>
            </tr>
          </thead>
          <tbody>
            {announcements.length > 0 ? (
              announcements.map((winner, index) => (
                <tr
                  key={winner.lineId}
                  className="border-b border-black text-center"
                >
                  <td className="py-2 border-black border-l-0">{index + 1}</td>
                  <td className="py-2 border-black border-l">
                    {censorString(winner.fullname)}
                  </td>
                  <td className="py-2 border-black border-l">
                    {censorString(winner.phone)}
                  </td>
                  <td className="py-2 border-black border-l">
                    {winner.mostBranchName}
                  </td>
                </tr>
              ))
            ) : (
              <tr className="border-b border-black">
                <td colSpan={4} className="py-4 text-gray-500 text-center">
                  ยังไม่ถึงกำหนดประกาศรายชื่อผู้โชคดี
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>


      {/* Back to Main Button */}
      <div className="mt-8 mb-8">
        <Link to="/menu">
          <button className="bg-[var(--button)] text-[var(--text)] px-6 py-2 rounded-md hover:bg-gray-800 transition">
            กลับหน้าหลัก
          </button>
        </Link>
      </div>

      <p className="text-base text-[var(--text)]">หมายเหตุ : <br></br>กำหนดเพิ่มคะแนนเดอะวัน ภายในวันที่ 15 มิ.ย. 68 </p>
    </div>
  );
};

export default AnnouncementPage;
