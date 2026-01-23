import { Sidebar, Menu, MenuItem } from "react-pro-sidebar";
import { FaUserCircle } from "react-icons/fa";
import { LuLogOut } from "react-icons/lu";
import { IoReceiptOutline } from "react-icons/io5";
import { IoBarChartOutline } from "react-icons/io5";
//import { GoTrophy } from "react-icons/go";
import { GoPencil } from "react-icons/go";
import { BsTruck } from "react-icons/bs";
import { PiGear, PiUserListLight } from "react-icons/pi";
import { MdOutlineKeyboardDoubleArrowLeft } from "react-icons/md";
import { Link } from "react-router-dom";
import { useAdminStore } from "../store/AdminStore";
import useBranchStore from "../store/BranchStore";
import useAuthStore from "../store/AuthStore";

interface AdminSidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({
  isSidebarOpen,
  setIsSidebarOpen,
}) => {
  //role from adminStore
  const { findBranchNameByBranchId } = useBranchStore();
  const { clearAuth } = useAuthStore();
  const { adminData, clearAdminData } = useAdminStore();
  const { username, role, branch } = adminData;

  let isSuperAdmin = null;
  let isSecretAdmin = false;
  if (role == "superAdmin") {
    isSuperAdmin = true;
    isSecretAdmin = false;
  } else if (role == "branchAdmin") {
    isSuperAdmin = false;
    isSecretAdmin = false;
  } else if (role == "secretAdmin") {
    isSuperAdmin = null;
    isSecretAdmin = true;
  }

  //console.log("isSuperadmin", isSuperAdmin);
  return (
    <div
      className={`fixed top-0 left-0 h-full w-64  transition-transform duration-300 z-40 ${
        isSidebarOpen ? "translate-x-0 w-64" : "-translate-x-80"
      }`}
    >
      <Sidebar className="h-[calc(100vh-2rem)] min-h-screen w-full max-w-[16rem] shadow-xl shadow-blue-gray-900/5 bg-[white]">
        <div
          onClick={() => {
            setIsSidebarOpen(false);
          }}
          className="hover:bg-slate-100  border-b-slate-200 border-b w-full flex justify-end p-3 absolute cursor-pointer md:text-white md:hover:text-black duration-200"
        >
          <MdOutlineKeyboardDoubleArrowLeft size={25} />
        </div>
        <div className="w-full  h-32 mt-14 relative flex items-center justify-center">
        <img
            src="/logo.png"
            alt="robinson campaign logo"
            className="w-[89%]"
          />
        </div>
        <Menu className="bg-white font-light">
          <div className="p-8 flex flex-col justify-center gap-1 items-start border-b-slate-200 border-b">
            <section className="flex items-center  gap-2 -pl-3">
              <FaUserCircle size={25} />

              {/* Regular Admin */}
              {isSuperAdmin === false &&
                (username ? (
                  <h4 className="text-[0.85rem] break-words w-[11rem]">
                    {username}
                  </h4>
                ) : (
                  <h4 className="text-[1rem]">ไม่พบรายชื่อแอดมิน</h4>
                ))}

              {/* Super Admin */}
              {isSuperAdmin === true &&
                (username ? (
                  <h4 className="text-[0.85rem] break-words w-[11rem]">
                    {username}
                  </h4>
                ) : (
                  <h4 className="text-[1rem]">Super Admin</h4>
                ))}

              {/* Secret Admin */}
              {isSuperAdmin === null && isSecretAdmin === true && (
                <h4 className="text-[1rem]">secret admin</h4>
              )}

              {/* No admin found */}
              {isSuperAdmin === null && isSecretAdmin === false && (
                <h4 className="text-[1rem]">ไม่พบรายชื่อแอดมิน</h4>
              )}
            </section>

            {isSuperAdmin === true ? (
              <p className="text-slate-400 text-sm font-light mt-2">
                Super Admin
              </p>
            ) : isSecretAdmin ? (
              <p className="text-slate-400 text-sm font-light mt-2">
                Secret Admin
              </p>
            ) : (
              <>
                {branch ? (
                  <p className="text-slate-400 text-sm font-light mt-2">
                    โรบินสันสาขา {findBranchNameByBranchId(branch)}
                  </p>
                ) : (
                  <p className="text-slate-400 text-sm font-light mt-2">
                    ไม่พบสาขาของแอดมิน
                  </p>
                )}
              </>
            )}
          </div>

          {(isSuperAdmin === true || isSuperAdmin === false) && (
            <MenuItem
              component={<Link to="/admin/dashboard/receipts" />}
              icon={<IoBarChartOutline />}
            >
              {isSidebarOpen && "รายการใบเสร็จ"}
            </MenuItem>
          )}

          {isSuperAdmin === false && (
            <>
              <MenuItem
                icon={<BsTruck />}
                component={<Link to="/admin/dashboard/stock" />}
              >
                {" "}
                {isSidebarOpen && "จัดการสินค้าสมนาคุณ"}{" "}
              </MenuItem>
            </>
          )}

          {(isSuperAdmin === true || isSuperAdmin === false) && (
            <MenuItem
              icon={<IoReceiptOutline />}
              component={<Link to="/admin/dashboard/redeem" />}
            >
              {" "}
              {isSidebarOpen && "ประวัติการแลกของสมนาคุณ"}
            </MenuItem>
          )}

          {isSuperAdmin === true && (
            <>
              <MenuItem
                component={<Link to="/admin/dashboard/customers" />}
                icon={<PiUserListLight size={20} />}
              >
                {" "}
                {isSidebarOpen && "รายชื่อลูกค้าทั้งหมด"}
              </MenuItem>
              <MenuItem
                icon={<GoPencil />}
                component={<Link to="/admin/dashboard/create" />}
              >
                {" "}
                {isSidebarOpen && "จัดการรายชื่อแอดมิน"}{" "}
              </MenuItem>
              {/* <MenuItem
                icon={<GoTrophy />}
                component={<Link to="/admin/dashboard/lucky" />}
              >
                {" "}
                {isSidebarOpen && "ส่งรายชื่อผู้โชคดี"}{" "}
              </MenuItem> */}
            </>
          )}

          {isSecretAdmin === true && (
            <>
              <MenuItem
                component={<Link to="/admin/dashboard/secret" />}
                icon={<PiGear size={20} />}
              >
                {" "}
                {isSidebarOpen && "แก้ไขdb"}
              </MenuItem>
            </>
          )}

          <MenuItem
            className="text-red-700"
            icon={<LuLogOut />}
            component={<Link to="/admin/login" />}
            onClick={() => {
              clearAdminData();
              clearAuth();
            }}
          >
            {isSidebarOpen && "ออกจากระบบ"}
          </MenuItem>
        </Menu>
      </Sidebar>
    </div>
  );
};

export default AdminSidebar;
