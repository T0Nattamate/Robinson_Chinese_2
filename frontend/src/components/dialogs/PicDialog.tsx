import { Dialog, DialogPanel } from "@headlessui/react";
import { animated, useTransition, useSpring } from "@react-spring/web";
import { useEffect, useState } from "react";
import { IoMdCloseCircleOutline } from "react-icons/io";
import Viewer from "react-viewer";

interface PicDialogProps {
  isPicOpen: boolean;
  handlePicDialogClose: () => void;
  image: string | null;
}

const PicDialog: React.FC<PicDialogProps> = ({
  isPicOpen,
  handlePicDialogClose,
  image,
}) => {
  const [isVisible, setIsVisible] = useState(isPicOpen);
  const [view, setView] = useState(false);

  const springProps = useSpring({
    transform: isPicOpen ? "scale(1)" : "scale(0.6)",
    config: { tension: 170, friction: 16 },
  });
  const transitions = useTransition(isPicOpen, {
    from: { opacity: 0, transform: "scale(0.9)" },
    enter: { opacity: 1, transform: "scale(1)" },
    leave: { opacity: 0, transform: "scale(0.9)" },
    config: { duration: 200 },
    onRest: () => {
      if (!isPicOpen) setIsVisible(false);
    },
  });

  useEffect(() => {
    if (isPicOpen) setIsVisible(true);
  }, [isPicOpen]);

  return (
    <Dialog
      open={isVisible}
      as="div"
      className="relative z-20 focus:outline-none"
      onClose={handlePicDialogClose}
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
                    <button
                      onClick={handlePicDialogClose}
                      className=" absolute top-2 right-2"
                    >
                      <IoMdCloseCircleOutline size={20} />
                    </button>

                    {image && (
                      <Viewer
                        visible={view}
                        onClose={() => {
                          setView(false);
                        }}
                        images={[{ src: image, alt: "" }]}
                      />
                    )}

                    <div className="w-full h-full mt-2">
                      {image && (
                        <img
                          onClick={() => {
                            setView(true);
                          }}
                          src={image}
                          alt="Receipt"
                          className="w-full h-auto"
                        />
                      )}
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

export default PicDialog;
