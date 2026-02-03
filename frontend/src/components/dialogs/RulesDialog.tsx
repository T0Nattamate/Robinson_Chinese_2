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

                      <div className="text-center">
                        <p className="font-bold text-base text-gray-800">
                          กติกาและเงื่อนไขการร่วมสนุกจากกิจกรรมที่
                        </p>
                        <p className="font-bold text-base text-gray-800">
                          โรบินสันไลฟ์สไตล์ (2 - 24 ก.พ. 69)
                        </p>
                      </div>

                      {/* Rule 1 */}
                      <div className="flex gap-2">
                        <span className="font-bold">1.</span>
                        <div>
                          <p>
                            เมื่อกิน และ ช้อปสะสมใบเสร็จ (ภายในวัน) ครบ 3,500 บาทขึ้นไป รับส่วนลดค่ากำเหน็จ 40% สำหรับซื้อทองรูปพรรณครึ่งสลึงขึ้นไป จากห้างทองหวังโต๊ะกังเยาวราช / จำกัด 100 สิทธิ์ ตลอดแคมเปญ; จำกัด 1 คน / 1 สิทธิ์ / ยกเว้นสาขาสุรินทร์, สมุทรปราการ, สระบุรี, ฉะเชิงเทรา, มุกดาหาร และสกลนคร / รับส่วนลดค่ากำเหน็จ 500 บาท สำหรับซื้อทองรูปพรรณน้ำหนัก 1 บาทขึ้นไป จากห้างทองบางกอกโกลด์ / จำกัด 50 สิทธิ์ ตลอดแคมเปญ; จำกัด 1 คน / 1 สิทธิ์ / เฉพาะสาขาสุรินทร์, ราชบุรี, บ่อวิน, มุกดาหาร, ชลบุรี และปราจีนบุรี / ไม่รวมใบเสร็จ จากห้างสรรพสินค้าโรบินสัน, ร้านค้าในเครือเซ็นทรัล รีเทล, การซื้อทองหรือเพชร, ร้านค้าหมวดเสริมความงาม (Beauty Clinic), Education, IT Gadget / จำกัดใบเสร็จที่นำมาสะสมไม่เกิน 3 ใบเสร็จ / วัน
                          </p>
                        </div>
                      </div>

                      {/* Rule 2 */}
                      <div className="flex gap-2">
                        <span className="font-bold">2.</span>
                        <div>
                          <p>
                            เมื่อช้อปสะสมยอด และรวบรวมใบเสร็จภายในวันครบ 2,500 บาท รับคูปองซื้อบัตรชมภาพยนตร์ 1 ที่นั่ง ฟรี 1 ที่นั่ง จาก เอสเอฟ ซีเนม่า / จำกัด 175 สิทธิ์ /สาขา รวม 5,250 ใบตลอดแคมเปญ หรือ รับฟรีบัตรชมภาพยนตร์ 2 ใบ จาก เมเจอร์ ซีนีเพล็ก / จำกัด 150 สิทธิ์ /สาขา รวม 3,300 ใบตลอดแคมเปญ; จำกัด 1 คน ต่อ 1 สิทธิ์ / พิเศษเฉพาะ ยอดใช้จ่ายสะสมต่อวันผ่านบัตรเครดิต เซ็นทรัล เดอะวัน ทั้งยอดรูดเต็มและแบ่งจ่าย 2,500 บาทขึ้นไปต่อวัน รับบัตรชมภาพยนตร์เพิ่มอีก 1 ใบ / ไม่รวมใบเสร็จ จากห้างสรรพสินค้าโรบินสัน, ร้านค้าในเครือเซ็นทรัล รีเทล, การซื้อทองหรือเพชร, ร้านค้าหมวดอาหาร, ร้านค้าหมวดเสริมความงาม (Beauty Clinic), Education, IT Gadget / จำกัดใบเสร็จที่นำมาสะสมไม่เกิน 3 ใบเสร็จ / วัน
                          </p>
                        </div>
                      </div>

                      {/* Rule 3 */}
                      <div className="flex gap-2">
                        <span className="font-bold">3.</span>
                        <div>
                          <p>
                            ผู้มียอดช้อปสะสมตลอดรายการ 20,000 บาทขึ้นไป สูงสูด 14 ท่านแรก รับสิทธิ์ดู ดวงออนไลน์กับ อ.คฑา / พิเศษเฉพาะ ยอดใช้จ่ายสะสมต่อวันผ่านบัตรเครดิต เซ็นทรัล เดอะวัน ทั้งยอดรูดเต็มและแบ่งจ่าย สะสมตลอดรายการ 15,000 บาทขึ้นไป และเป็นผู้ที่มียอดช้อปสะสมสูงสุด 14 ท่านแรก ของโรบินสันไลฟ์สไตล์ทุกสาขาที่ร่วมรายการ รับสิทธิ์ดูดวงออนไลน์กับ อ.คฑา / รวมยอดช้อปจาก BU (Tops, Supersports, Auto1, Power Buy, Officemate, B2S) แต่ไม่เกิน 5,000.- / ยกเว้นยอดช้อป จาก Gold & Jewelry, หมวดเสริมความงาม (Beauty Clinic), Education, IT Gadget / จำกัดใบเสร็จที่นำมาสะสมไม่เกิน 10 ใบเสร็จ ตลอดแคมเปญ / ประกาศผลผู้ที่ได้รับรางวัล Top Spender 14 ท่าน ในวันที่ 10 มี.ค. 69 ทาง Robinson Lifestyle Facebook Page
                          </p>
                        </div>
                      </div>

                      <div className="pt-4 border-t italic text-xs">
                        หมายเหตุ: สิทธิ์มีจำนวนจำกัด และเงื่อนไขเป็นไปตามที่บริษัทกำหนด ควรตรวจสอบรายละเอียดเพิ่มเติม ณ จุดประชาสัมพันธ์ของศูนย์การค้าอีกครั้งครับ
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