import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { animated, useTransition, useSpring } from "@react-spring/web";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface TermsDialogProps {
  isTermsOpen: boolean;
  handleTermsDialogClose: () => void;
}

const TermsDialog: React.FC<TermsDialogProps> = ({
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
                  <DialogPanel className="w-[22rem] text-center p-6 max-w-md rounded-xl bg-white drop-shadow-lg text-black pl-8">
                    <DialogTitle as="h3" className="text-base/7 font-medium ">
                      ยอมรับเงื่อนไข นโยบายการให้ข้อมูลส่วนตัว
                    </DialogTitle>
                    <p className="mt-7 text-xs font-light text-start text-slate-700">
                      ท่านรับทราบว่าบริษัท โรบินสัน จำกัด (มหาชน) (“บริษัทฯ”)
                      เก็บรวบรวม ใช้ และเปิดเผยข้อมูลส่วนบุคคลของท่านข้างต้น
                    </p>
                    <p className="mt-2 text-xs font-light text-start text-slate-700">
                      เพื่อวัตถุประสงค์ในการลงทะเบียนและตรวจสอบยืนยันตัวตนของผู้เข้าร่วมกิจกรรมกรณีเป็นผู้ชนะรางวัล
                      เพื่อติดต่อสื่อสารกับท่านเกี่ยวกับกิจกรรม
                      รวมถึงเพื่อทำการวิเคราะห์และพัฒนาผลิตภัณฑ์และบริการให้เหมาะสมกับท่านมากขึ้นในอนาคต
                    </p>

                    <p className="mt-2 text-xs font-light text-start text-slate-700">
                      ทั้งนี้ บริษัทฯ จะเก็บรักษาข้อมูลดังกล่าวไว้เป็นระยะเวลา
                      30 วันหลังจากวันที่กิจกรรมสิ้นสุดลง
                      ท่านสามารถศึกษารายละเอียดเพิ่มเติมเกี่ยวกับวิธีการจัดการข้อมูลส่วนบุคคลได้ที่
                      <Link
                        to="https://www.central.co.th/th/pdpa/privacy-policy"
                        className="mt-8 text-xs font-light  text-blue-700 underline cursor-pointer"
                      >
                        นโยบายความเป็นส่วนตัว
                      </Link>
                      ของบริษัทฯ{" "}
                    </p>

                    <div className="mt-8">
                    <button
                      className="w-50 inline-flex justify-center items-center gap-2 rounded-md bg-[var(--button)] py-2 px-10 text-sm text-white shadow-inner shadow-white/10 focus:outline-none hover:bg-gray-700 transition-colors text-center"
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

export default TermsDialog;
