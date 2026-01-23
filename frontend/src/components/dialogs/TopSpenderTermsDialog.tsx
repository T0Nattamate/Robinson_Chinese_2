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
                    
                    <div className="w-full text-left text-sm font-light mt-6 px-2">
                      <p className="leading-relaxed text-gray-700">
                        ผู้มียอดช้อปสูงสุด 27 สาขา (สะสมยอดช้อปตลอดรายการ <span className="font-medium">50,000 บาทขึ้นไป</span>) รับตั๋วเครื่องบินไป-กลับภายในประเทศ สาขาละ 1 รางวัล (รางวัลละ 1 ที่นั่ง) มูลค่ารางวัลละ 15,000 บาท
                      </p>
                      <p className="mt-4 leading-relaxed text-gray-600 text-xs">
                        *เงื่อนไขเป็นไปตามที่กำหนด / โปรดตรวจสอบเงื่อนไขเพิ่มเติม ณ จุดลงทะเบียนภายในศูนย์ฯ / ขอสงวนสิทธิ์ในการเปลี่ยนแปลงเงื่อนไขโดยมิต้องแจ้งให้ทราบล่วงหน้า / บริษัทฯสงวนสิทธิ์ในการเปลี่ยนแปลงเงื่อนไขหรือสิทธิประโยชน์ต่างๆตามที่บริษัทฯเห็นสมควร และเป็นไปตามที่กฎหมายกำหนด รวมถึงความผิดพลาดในการพิมพ์โดยไม่ต้องแจ้งให้ทราบล่วงหน้า
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