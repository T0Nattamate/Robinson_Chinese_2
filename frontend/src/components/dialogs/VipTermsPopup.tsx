import React from 'react';

interface VipTermsPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const VipTermsPopup: React.FC<VipTermsPopupProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center font-kanit">
      {/* Overlay */}
      <div 
        className="fixed inset-0  bg-opacity-40 backdrop-blur-xs flex items-center justify-center z-50"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className="relative z-50 w-[90%] max-w-lg bg-white rounded-lg shadow-xl mx-4 border border-black">
        {/* Header with Logo */}
        <div className="p-4 flex flex-col items-center border-b">
          <div className="w-full bg-[var(--button)] py-3 flex items-center justify-center mb-2">
          <div className="w-4/5 flex justify-center pl-3">
            <img
              src="/logo_pop.png"
              alt="robinsonLogoWhite"
              className="w-full h-auto object-contain pl-5"
            />
          </div>
          </div>
          <h2 className="text-xl bg-gray-300 rounded-lg border border-black w-full text-center p-1">ข้อกำหนด เงื่อนไข รายละเอียด</h2>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <div className="space-y-4">
            <h3 className="font-medium">เงื่อนไข Exclusive VIP:</h3>
            <div className="space-y-3 text-gray-500">
              <p>1. สะสมยอดใช้จ่ายทั้งศูนย์ และห้าง </p>
              <div className="ml-4 space-y-2">
                <p>1.1 ครบ 70,000 บาทขึ้นไป เฉพาะสาขาชลบุรี, แม่สอด, สระบุรี, ร้อยเอ็ด, ศรีสมาน, กำแพงเพชร, ตรัง, สุรินทร์, บ้านฉาง, สมุทรปราการ, สกลนคร, มุกดาหาร, บ่อวิน, เพชรบุรี, ปราจีนบุรี</p>
                <p>1.2 ครบ 55,000 บาทขึ้นไป เฉพาะสาขาถลาง, ชัยภูมิ, กาญจนบุรี, ราชพฤกษ์, ฉลอง, บุรีรัมย์, ลาดกระบัง, ฉะเชิงเทรา, สุพรรณบุรี, ลพบุรี, ราชบุรี</p>
              </div>
              
              <p>2. สะสมยอดใช้จ่ายระหว่างวันที่ 6 มี.ค. 68 - 30 เม.ย. 68 มีสิทธิ์เป็นสมาชิก VIP Parking 6 เดือน</p>
              
              <p>3. สะสมยอด ณ วันที่มีการใช้จ่าย ที่เคาน์เตอร์ประชาสัมพันธ์ หรือจุด Redemption โรบินสันไลฟ์สไตล์ทุกสาขา (ไม่สามารถนำใบเสร็จสะสมย้อนหลังได้) </p>
              <p>4. สงวนสิทธิ์ไม่รวมใบเสร็จจากการซื้อเพชร จิวเวลรี่ ทองคำ บัตรโทรศัพท์ บัตรกำนัล บัตรเงินสด บัตรของขวัญ บัตรเติมเงินทุกประเภท การชำระเบี้ยประกันและกองทุน การชำระค่าสาธารณูปโภค การทำธุรกรรมทางการเงินทุกประเภท รวมถึงการซื้อเพื่อลงทุน การค้าขายส่ง ใบจองสินค้า ใบมัดจำค่าสินค้า การใช้บริการขนส่งทุกประเภท</p>
              <p>5. เจ้าหน้าที่จะติดต่อกลับไปยังลูกค้า VIP เพื่อยืนยันการรับรางวัลภายในวันที่ 9 พ.ค. 68 เพื่อนัดรับรางวัลในลำดับต่อไป</p>
              <p>6. สงวนสิทธิ์ยกเว้นลูกค้าที่ได้รับสิทธิ์ The1 Exclusive ในปีเดียวกัน ที่มีชื่อและทะเบียนรถเดียวกัน</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t text-center">
          <button
            onClick={onClose}
            className="w-[30%] rounded-xl bg-[var(--button)] hover:bg-gray-800 text-white py-2 px-4 transition-colors"
          >
            ตกลง
          </button>
        </div>
      </div>
    </div>
  );
};

export default VipTermsPopup;