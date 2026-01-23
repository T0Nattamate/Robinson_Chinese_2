import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { animated, useTransition, useSpring } from "@react-spring/web";
import { useEffect, useState } from "react";

interface RulesDialogProps {
  isRulesOpen: boolean;
  handleRulesDialogClose: () => void;
}

const RulesDialog: React.FC<RulesDialogProps> = ({
  isRulesOpen,
  handleRulesDialogClose,
}) => {
  const [isVisible, setIsVisible] = useState(isRulesOpen);

  // Spring for scale animation
  const springProps = useSpring({
    transform: isRulesOpen ? "scale(1)" : "scale(0.6)",
    config: { tension: 170, friction: 16 },
  });

  // Transition for fade in/out
  const transitions = useTransition(isRulesOpen, {
    from: { opacity: 0, transform: "scale(0.9)" },
    enter: { opacity: 1, transform: "scale(1)" },
    leave: { opacity: 0, transform: "scale(0.9)" },
    config: { duration: 200 },
    onRest: () => {
      if (!isRulesOpen) setIsVisible(false); 
    },
  });

  useEffect(() => {
    if (isRulesOpen) setIsVisible(true);
  }, [isRulesOpen]);

  return (
    <Dialog
      open={isVisible}
      as="div"
      className="relative z-20 focus:outline-none"
      onClose={handleRulesDialogClose}
    >
      <div className="fixed inset-0 z-20 w-screen overflow-y-auto font-kanit">
        {/* Background overlay */}
        <div className="fixed inset-0 bg-black opacity-50" />
        <div className="flex min-h-full items-center justify-center p-4">
          {transitions(
            (styles, item) =>
              item && (
                <animated.div style={{ ...styles, ...springProps }}>
                  <DialogPanel className="w-full text-center p-6 max-w-2xl rounded-xl bg-white drop-shadow-lg max-h-[90vh] overflow-y-auto">
                    <DialogTitle
                      as="h3"
                      className="text-lg font-medium text-black mb-4"
                    >
                      กติกาการร่วมสนุก
                    </DialogTitle>

                    {/* Main Content */}
                    <div className="text-sm text-gray-700 text-left leading-relaxed space-y-6">
                      
                      {/* Section 1: Lucky Draw */}
                      <div>
                        <p className="font-bold text-base mb-2 text-gray-800">
                          รับสิทธิ์ลุ้นรางวัลใหญ่ รวมมูลค่ากว่า 5 ล้านบาท
                        </p>
                        <p className="mb-2">เมื่อกิน-ช้อปครบทุก 1,000 บาท</p>
                        <p className="font-medium mb-2">เงื่อนไข:</p>
                        <ul className="list-decimal list-outside ml-5 space-y-2">
                          <li>สินค้าทั้งศูนย์ฯ ทั้งห้างฯ ลดสูงสุด 80% เฉพาะสินค้าที่เข้าร่วมรายการ / เงื่อนไขเป็นไปตามที่แต่ละร้านค้ากำหนด เมื่อกิน-ช้อปรวบรวมใบเสร็จภายในศูนย์ฯ และห้างฯ สะสมครบทุก 1,000 บาท รับ 1 สิทธิ์ลุ้นรางวัลใหญ่</li>
                          <li>รถยนต์ BYD SEALION 6 DM-i จำนวน 1 รางวัล มูลค่า 1,099,900 บาท</li>
                          <li>สร้อยคอทองคำ หนัก 1 บาท จำนวน 10 รางวัล รวมมูลค่า 468,200 บาท (มูลค่าทองคำ ณ วันที่ 4 ก.พ. 68)</li>
                          <li>ตั๋วเครื่องบินไป-กลับ (ระหว่างประเทศ) จำนวน 5 รางวัล (รางวัลละ 2 ที่นั่ง) รวมมูลค่าสูงสุด 250,000 บาท / มูลค่ารางวัลอ้างอิง ณ วันที่สำรองบัตรโดยสาร / เงื่อนไขเป็นไปตามที่สายการบินกำหนด / โปรดตรวจสอบเงื่อนไขเพิ่มเติมกับสายการบิน</li>
                          <li>OPPO Reno 13 Series จำนวน 6 รางวัล, OPPO Watch X Series จำนวน 4 รางวัล รวมมูลค่า 165,990 บาท</li>
                          <li>แพ็คเกจเที่ยวฟรี เซี่ยงไฮ้ ดิสนีย์แลนด์ พร้อมตั๋วเครื่องบินไป-กลับ จำนวน 3 รางวัล (รางวัลละ 2 ท่าน) รวมมูลค่า 150,000 บาท</li>
                          <li>พิเศษสำหรับสมาชิกเดอะวัน, ห้างทองพรีเมี่ยมโกลด์ เยาวราช, เวียตเจ็ท, OPPO, gother รับสิทธิ์ลุ้น X2 / สงวนสิทธิ์เฉพาะลูกค้าที่ให้ข้อมูลครบถ้วนและสามารถติดต่อได้เท่านั้น / สามารถรวมใบเสร็จตลอดรายการที่โรบินสันไลฟ์สไตล์ทุกสาขา (ยกเว้นสาขาจันทบุรี) / สงวนสิทธิ์ไม่รวมใบเสร็จจากการซื้อเพื่อลงทุน, การค้า, ขายส่ง, ใบจองสินค้า, ใบมัดจำสินค้า, การชำระค่าสาธารณูปโภค, การทำธุรกรรมทางการเงินทุกประเภท, การชำระเบี้ยประกัน, การเติมเงินในบัตรเติมเงินทุกชนิด, การใช้บริการบริษัทขนส่งทุกประเภท / ขอสงวนสิทธิ์ในการเปลี่ยนแปลงเงื่อนไข, สินค้า และ/หรือสิทธิพิเศษ ตามที่บริษัทเห็นสมควรและเป็นไปตามที่กฎหมายกำหนด โดยไม่ต้องแจ้งให้ทราบล่วงหน้า / ขอสงวนสิทธิ์ในการให้รางวัลแก่ผู้โชคดีลำดับถัดไป กรณีที่ตรวจสอบพบว่าผู้โชคดีไม่สามารถติดต่อได้ / ผู้โชคดีที่ได้รับรางวัลมูลค่า 1,000 บาทขึ้นไป ต้องชำระภาษี ณ ที่จ่าย 5% ของมูลค่าของรางวัล / ของรางวัลไม่สามารถแลกเปลี่ยนเป็นเงินสด หรือรางวัลอื่นได้ / ผู้โชคดีมีสิทธิ์ได้รับรางวัลสูงสุดเพียงรางวัลเดียวเท่านั้น / พนักงานโรบินสัน, พนักงานในเครือเซ็นทรัลกรุ๊ป, พนักงานของบริษัทคู่ค้า, หรือญาติของพนักงาน และคณะกรรมการในการตัดสิน ไม่มีสิทธิ์เข้าร่วมรายการ </li>
                        </ul>
                      </div>
                      
                      {/* Section 2: Draw Date */}
                      <div className="border-t pt-4">
                        <p className="font-bold text-base mb-2 text-gray-800">
                          กำหนดจับรางวัล
                        </p>
                        <p className="mb-2">
                          วันที่ 9 ม.ค. 69 ณ ศูนย์การค้าโรบินสันไลฟ์สไตล์ ราชพฤกษ์ / ประกาศรายชื่อผู้โชคดีวันที่ 15 ม.ค. 69 ที่ Facebook Page: Robinson Lifestyle
                        </p>
                      </div>
                      {/* Section 3 : Top Spenders */}
                      <div className="border-t pt-4">
                        <p className="font-bold text-base mb-2 text-gray-800">
                          ผู้มียอดช้อปสูงสุด 27 สาขา
                        </p>
                        <p className="mb-2">
                          ผู้มียอดช้อปสูงสุด 27 สาขา (สะสมยอดช้อปตลอดรายการ 50,000 บาทขึ้นไป) รับตั๋วเครื่องบินไป-กลับภายในประเทศ สาขาละ 1 รางวัล (รางวัลละ 1 ที่นั่ง) มูลค่ารางวัลละ 15,000 บาท
                        </p>
                        <p className="text-xs mt-2">
                          เงื่อนไขเป็นไปตามที่กำหนด / 
                          โปรดตรวจสอบเงื่อนไขเพิ่มเติม ณ จุดลงทะเบียนภายในศูนย์ฯ / 
                          ขอสงวนสิทธิ์ในการเปลี่ยนแปลงเงื่อนไขโดยมิต้องแจ้งให้ทราบล่วงหน้า / 
                          บริษัทฯสงวนสิทธิ์ในการเปลี่ยนแปลงเงื่อนไขหรือสิทธิประโยชน์ต่างๆตามที่บริษัทฯเห็นสมควร และเป็นไปตามที่กฎหมายกำหนด รวมถึงความผิดพลาดในการพิมพ์โดยไม่ต้องแจ้งให้ทราบล่วงหน้า
                        </p>
                      </div>

                      {/* Section 4: End of Month Shopping */}
                      <div className="border-t pt-4">
                        <p className="font-bold text-base mb-2 text-gray-800">
                          ช้อปสุดมันส์ วันสิ้นเดือน (25 พ.ย. - 3 ธ.ค. 68)
                        </p>
                        <p className="mb-2">เมื่อกิน-ช้อปครบ 3,000 บาทขึ้นไป (เฉพาะร้านค้าในศูนย์ฯ)</p>
                        <p className="mb-2">
                          <span className="font-medium">เฉพาะวันเสาร์-อาทิตย์ที่ 29-30 พ.ย. 68:</span> รับฟรี GIFT VOUCHER มูลค่า 100 บาท จากร้านค้าในเครือ Central Group (จำกัด 100 สิทธิ์ต่อสาขา ตลอดรายการ)
                        </p>
                        <p className="text-xs">
                          <span className="font-medium">เฉพาะวันจันทร์-ศุกร์ที่ 25-28 พ.ย., 1-3 ธ.ค. 68:</span> เมื่อกิน-ช้อปรวบรวมใบเสร็จภายในศูนย์ฯ และห้างฯ ครบ 3,000 บาทขึ้นไป 
                          รับตั๋วหนัง 1 ฟรี 1 จากเอสเอฟ ซีเนม่า (จำกัด 350 สิทธิ์ต่อสาขา ตลอดรายการ) หรือ 
                          รับฟรีตั๋วหนังจากเมเจอร์ ซีนีเพล็กซ์ 1 ใบ (จำกัด 100 สิทธิ์แรก/สาขา ตลอดรายการ) / 
                          ส่วนลดตั๋วหนัง 100 บาท (จำกัด 250 สิทธิ์/สาขา ตลอดรายการ) รวมทั้งสิ้น 350 สิทธิ์/สาขา ตลอดรายการ
                        </p>
                      </div>

                    </div>

                    <div className="mt-8">
                      <button
                        className="w-50 inline-flex justify-center items-center gap-2 rounded-md bg-[var(--button)] py-2 px-10 text-sm text-white shadow-inner shadow-white/10 focus:outline-none hover:bg-gray-700 transition-colors text-center"
                        onClick={handleRulesDialogClose}
                      >
                        ฉันยอมรับข้อตกลง
                      </button>
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

export default RulesDialog;