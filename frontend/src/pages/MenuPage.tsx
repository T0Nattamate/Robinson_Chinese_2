import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useUserStore } from "../store/userStore";
import useAuthStore from "../store/AuthStore";

const MenuPage = () => {
  const { resetUserProtect, setCanAccessTermsRedeem, setCanAccessTermsUpload } = useAuthStore();
  const { rights, fetchUserRights } = useUserStore();
  const [myRights, setMyRights] = useState(0);
  //const [showAnnouncePopup, setShowAnnouncePopup] = useState(false);

  // Define promotion periods (Bangkok timezone)
  const PROMOTION_PERIODS = [
    { start: new Date('2026-02-02T00:00:00+07:00'), end: new Date('2026-02-24T23:59:59+07:00') }, //prod
    //{ start: new Date('2026-01-20T00:00:00+07:00'), end: new Date('2026-02-02T23:59:59+07:00') }, //test
  ];

  // Check if current date is within promotion period
  const isInPromotionPeriod = () => {
    const now = new Date();
    return PROMOTION_PERIODS.some(period =>
      now >= period.start && now <= period.end
    );
  };

  useEffect(() => {
    resetUserProtect();
  }, []);

  useEffect(() => {
    fetchUserRights();
  }, [fetchUserRights]);

  useEffect(() => {
    setMyRights(rights);
  }, [rights]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Check if current date is on or after January 15, 2026
  // const isAfterAnnounceDate = () => {
  //   const currentDate = new Date();
  //   const announceDate = new Date(2026, 0, 15);
  //   return currentDate >= announceDate;
  // };

  // const handleAnnounceClick = () => {
  //   setShowAnnouncePopup(true);
  // };

  // const closePopup = () => {
  //   setShowAnnouncePopup(false);
  // };

  const isRedeemActive = isInPromotionPeriod();
  const isUploadActive = isInPromotionPeriod();
  const handleTermsUploadClick = () => {
    setCanAccessTermsUpload();
  };

  const handleTermsRedeemClick = () => {
    setCanAccessTermsRedeem();
  };

  return (
    <div className="font-kanit bg-[var(--bg)] w-full min-h-screen md:h-full flex flex-col justify-center items-center relative">
      <div className="w-full h-full min-h-[400px] md:w-96 relative bg-white">
        <img src="Poster.png" alt="header1page" className="w-full" />
      </div>
      <div className="flex flex-col justify-center items-center w-[90%] md:w-96 md:h-full text-center gap-5 py-5">
        <h1 className="text-3xl text-[var(--text)]">Home</h1>

        <h2 className="text-xl text-[var(--text)] pt-10 ">รับสิทธิพิเศษ</h2>
        {/* <div className="w-full flex justify-center relative">
          <Link
            to="/terms-upload"
            onClick={handleTermsUploadClick}
            className="w-[90%] transition transform hover:scale-105"
          >
            <img
              src="btn_1.png"
              alt="ลุ้นรางวัล"
              className="w-full rounded-md drop-shadow-md"
            />
          </Link>
        </div> */}
        <div className="w-full flex justify-center relative">
          {isUploadActive ? (
            <Link
              to="/terms-upload"
              onClick={handleTermsUploadClick}
              className="w-[90%] transition transform hover:scale-105"
            >
              <img
                src="อัปโหลดใบเสร็จ.png"
                alt="ลุ้นรางวัล"
                className="w-full rounded-md drop-shadow-md"
              />
            </Link>
          ) : (
            <div className="w-[90%] opacity-60 cursor-not-allowed">
              <img
                src="btn_1.png"
                alt="ลุ้นรางวัล"
                className="w-full rounded-md drop-shadow-md filter grayscale"
              />
            </div>
          )}
        </div>

        <div className="w-full flex justify-center relative">
          {isRedeemActive ? (
            <Link
              to="/terms-redeem"
              onClick={handleTermsRedeemClick}
              className="w-[90%] transition transform hover:scale-105"
            >
              <img
                src="แลกรับของสมนาคุณ.png"
                alt="แลกรับของสมนาคุณ"
                className="w-full rounded-md drop-shadow-md"
              />
              {myRights > 0 && (
                <div className="absolute -top-2 right-3 rounded-full w-7 h-7 bg-red-500 text-white flex justify-center items-center">
                  {myRights}
                </div>
              )}
            </Link>
          ) : (
            <div className="w-[90%] opacity-60 cursor-not-allowed relative">
              <img
                src="แลกรับของสมนาคุณ.png"
                alt="แลกรับของสมนาคุณ"
                className="w-full rounded-md drop-shadow-md filter grayscale"
              />
              {myRights > 0 && (
                <div className="absolute -top-2 right-3 rounded-full w-7 h-7 bg-red-500 text-white flex justify-center items-center">
                  {myRights}
                </div>
              )}
            </div>
          )}
          {/* <Link
              to="/terms-redeem"
              onClick={handleTermsRedeemClick}
              className="w-[90%] transition transform hover:scale-105"
            >
              <img 
                src="btn_2.png" 
                alt="แลกรับของสมนาคุณ" 
                className="w-full rounded-md drop-shadow-md" 
              />
              {myRights > 0 && (
                <div className="absolute -top-2 right-3 rounded-full w-7 h-7 bg-red-500 text-white flex justify-center items-center">
                  {myRights}
                </div>
              )}
            </Link>  */}
        </div>

        <h2 className="text-xl mt-10 text-[var(--text)] ">เช็คสถานะ</h2>

        <Link
          to="/history"
          className="w-[90%] transition transform hover:scale-105"
        >
          <img
            src="ประวัติการเข้าร่วมกิจกรรม.png"
            alt="ประวัติการร่วมกิจกรรม"
            className="w-full rounded-md drop-shadow-md"
          />
        </Link>

        <Link
          to="/redeem-history"
          className="w-[90%] transition transform hover:scale-105"
        >
          <img
            src="ประวัติแลกรับ.png"
            alt="ประวัติการแลกรับของสมนาคุณ"
            className="w-full rounded-md drop-shadow-md"
          />
        </Link>
        <Link
          to="/top-spender"
          className="w-[90%] transition transform hover:scale-105"
        >
          <img
            src="ตรวจสอบรายชื่อ Top.png"
            alt="ตรวจสอบรายชื่อ Top spender"
            className="w-full rounded-md drop-shadow-md"
          />
        </Link>
        {/* <button
          onClick={handleAnnounceClick}
          className="w-[90%] transition transform hover:scale-105 border-0 p-0 bg-transparent"
        >
          <img
            src=" btn_5.png"
            alt="ประกาศรางวัล"
            className="w-full rounded-md drop-shadow-md"
          />
        </button> */}
      </div>

      <div className="w-full h-32 md:w-96 relative">
        {/* Footer space */}
      </div>

      {/* Announce Popup */}
      {/* {showAnnouncePopup && (
        <div
          onClick={closePopup}
          className="fixed inset-0 backdrop-blur-md flex justify-center items-center z-50 px-4"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)' }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-lg p-6 max-w-md w-full relative shadow-xl"
          >
            <button
              onClick={closePopup}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ×
            </button>
            <div className="text-center mt-2">
              {isAfterAnnounceDate() ? (
                <div>
                  <h2 className="text-xl font-medium text-gray-800 mb-4">
                    ประกาศรายชื่อผู้โชคดีแล้วที่{" "}
                    <a
                      href="https://www.facebook.com/RobinsonLifestyleMall/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      Robinson Lifestyle
                    </a>
                  </h2>
                </div>
              ) : (
                <div>
                  <h2 className="text-xl font-medium text-gray-800 mb-2">
                    ประกาศรายชื่อผู้โชคดีในวันที่
                  </h2>
                  <p className="text-lg text-gray-700 mb-2">15 ม.ค. 69</p>
                  <p className="text-lg text-gray-700">
                    ที่ Facebook Page: Robinson Lifestyle
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default MenuPage;