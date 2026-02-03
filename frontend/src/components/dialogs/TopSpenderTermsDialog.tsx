import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { animated, useTransition, useSpring } from "@react-spring/web";
import { useEffect, useState } from "react";

interface TopSpenderTermsDialogProps {
  isTermsOpen: boolean;
  handleTermsDialogClose: () => void;
}

const TopSpenderTermsDialog: React.FC<TopSpenderTermsDialogProps> = ({
  isTermsOpen,
  handleTermsDialogClose,
}) => {
  const [isVisible, setIsVisible] = useState(isTermsOpen);

  const springProps = useSpring({
    transform: isTermsOpen ? "scale(1)" : "scale(0.6)",
    config: { tension: 170, friction: 16 },
  });
  const transitions = useTransition(isTermsOpen, {
    from: { opacity: 0, transform: "scale(0.9)" },
    enter: { opacity: 1, transform: "scale(1)" },
    leave: { opacity: 0, transform: "scale(0.9)" },
    config: { duration: 200 },
    onRest: () => {
      if (!isTermsOpen) setIsVisible(false);
    },
  });

  useEffect(() => {
    if (isTermsOpen) setIsVisible(true);
  }, [isTermsOpen]);

  return (
    <Dialog
      open={isVisible}
      as="div"
      className="relative z-20 focus:outline-none"
      onClose={handleTermsDialogClose}
    >
      <div className="fixed inset-0 z-20 w-screen overflow-y-auto font-kanit">
        {/* Background overlay with opacity */}
        <div className="fixed inset-0 bg-black opacity-50" />
        <div className="flex min-h-full items-center justify-center p-4">
          {transitions(
            (styles, item) =>
              item && (
                <animated.div style={{ ...styles, ...springProps }}>
                  <DialogPanel className="w-full text-center p-6 max-w-md rounded-xl bg-white drop-shadow-lg">
                    <DialogTitle
                      as="h3"
                      className="text-lg font-medium text-black"
                    >
                      เงื่อนไข TOP SPENDER
                    </DialogTitle>

                    <div className="w-full text-left text-sm font-light mt-6 px-2 max-h-[60vh] overflow-y-auto space-y-4">
                      <div className="space-y-4 text-gray-700 leading-relaxed">
                        <p>
                          <span className="font-bold underline">ผู้มียอดช้อปสะสมตลอดรายการ 20,000 บาทขึ้นไป สูงสูด 14 ท่านแรก</span> รับสิทธิ์ดูดวงออนไลน์กับ <span className="font-medium">อ.คฑา ชินบัญชร</span>
                        </p>

                        <div className="bg-gray-50 p-3 rounded-md border-l-4 border-[var(--button)]">
                          <p className="font-medium text-[var(--button)]">สิทธิพิเศษเฉพาะบัตรเครดิต เซ็นทรัล เดอะวัน:</p>
                          <p className="mt-1">
                            ยอดใช้จ่ายสะสมสะสมตลอดรายการ <span className="font-bold">15,000 บาทขึ้นไป</span> มียอดช้อปสะสมสูงสุด 14 ท่านแรก รับสิทธิ์ดูดวงออนไลน์เช่นกัน
                          </p>
                        </div>

                        <ul className="list-disc list-outside ml-4 space-y-2">
                          <li>
                            รวมยอดช้อปจาก BU (Tops, Supersports, Auto1, Power Buy, Officemate, B2S) <span className="font-medium">แต่ไม่เกิน 5,000.-</span>
                          </li>
                          <li className="text-red-600">
                            ยกเว้นยอดช้อป จาก Gold & Jewelry, หมวดเสริมความงาม (Beauty Clinic), Education, IT Gadget
                          </li>
                          <li>
                            จำกัดใบเสร็จที่นำมาสะสมไม่เกิน 10 ใบเสร็จ ตลอดแคมเปญ
                          </li>
                          <li className="font-medium">
                            ประกาศผลผู้ที่ได้รับรางวัล Top Spender 14 ท่าน ในวันที่ 10 มี.ค. 69 ทาง Robinson Lifestyle Facebook Page
                          </li>
                        </ul>
                      </div>

                      <p className="mt-6 text-gray-500 text-[10px] italic border-t pt-4">
                        *เงื่อนไขเป็นไปตามที่กำหนด / โปรดตรวจสอบเงื่อนไขเพิ่มเติม ณ จุดลงทะเบียน / บริษัทฯขอสงวนสิทธิ์ในการเปลี่ยนแปลงเงื่อนไขโดยมิต้องแจ้งให้ทราบล่วงหน้า
                      </p>
                    </div>

                    <div className="mt-8">
                      <button
                        className="inline-flex items-center gap-2 rounded-md bg-[var(--button)] py-2 px-6 text-sm text-white shadow-inner shadow-white/10 focus:outline-none hover:bg-gray-600 transition-colors"
                        onClick={handleTermsDialogClose}
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

export default TopSpenderTermsDialog;