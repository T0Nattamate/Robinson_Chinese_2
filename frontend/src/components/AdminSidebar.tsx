import { Sidebar, Menu, MenuItem } from "react-pro-sidebar";
import { FaUserCircle } from "react-icons/fa";
import { LuLogOut } from "react-icons/lu";
import { IoReceiptOutline } from "react-icons/io5";
import { IoBarChartOutline } from "react-icons/io5";
import { GoPencil } from "react-icons/go";
import { BsTruck } from "react-icons/bs";
import { PiGear, PiUserListLight, PiStorefront } from "react-icons/pi";
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
  const { findBranchNameByBranchId } = useBranchStore();
  const { clearAuth } = useAuthStore();
  const { adminData, clearAdminData } = useAdminStore();
  const { username, role, branch } = adminData;

  let isSuperAdmin = null;
  let isSecretAdmin = false;
  if (role === "superAdmin") {
    isSuperAdmin = true;
    isSecretAdmin = false;
  } else if (role === "branchAdmin") {
    isSuperAdmin = false;
    isSecretAdmin = false;
  } else if (role === "secretAdmin") {
    isSuperAdmin = null;
    isSecretAdmin = true;
  }

  const menuButtonStyles = {
    '.ps-menu-button': {
      borderRadius: '12px',
      margin: '4px 12px',
      transition: 'all 0.3s ease',
      height: '45px',
      '&:hover': {
        backgroundColor: '#fef2f2 !important',
        color: 'var(--red) !important',
        transform: 'translateX(4px)',
      },
    },
    '.ps-active .ps-menu-button': {
      backgroundColor: '#fef2f2 !important',
      color: 'var(--red) !important',
      fontWeight: '600',
    }
  };

  return (
    <div
      className={`fixed top-0 left-0 h-full transition-all duration-300 z-50 ${isSidebarOpen ? "translate-x-0 w-64" : "-translate-x-full"
        }`}
    >
      <Sidebar className="h-full w-full bg-white border-r border-gray-100 shadow-2xl">
        <div className="flex flex-col h-full">
          {/* Header & Logo */}
          <div className="relative pt-12 pb-6 px-6 border-b border-gray-50 bg-white">
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
            >
              <MdOutlineKeyboardDoubleArrowLeft size={24} />
            </button>
            <div className="w-full flex items-center justify-center h-16">
              <img
                src="/logo 1.png"
                alt="Robinson Logo"
                className="max-h-full object-contain filter drop-shadow-sm"
              />
            </div>
          </div>

          {/* User Profile Section */}
          <div className="px-6 py-6 border-b border-gray-50 bg-gray-50/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-[var(--red)] shadow-sm">
                <FaUserCircle size={28} />
              </div>
              <div className="flex flex-col min-w-0">
                <h4 className="text-sm font-bold text-gray-800 truncate leading-tight">
                  {username || (isSecretAdmin ? "Secret Admin" : "ไม่พบรายชื่อ")}
                </h4>
                <div className="flex items-center mt-1">
                  <span className="text-[6px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded tracking-wider uppercase">
                    {isSuperAdmin ? "Super Admin" : isSecretAdmin ? "System" : "Branch Admin"}
                  </span>
                  {!isSuperAdmin && !isSecretAdmin && branch && (
                    <span className="text-[10px] text-gray-400 font-medium ml-2 truncate max-w-[80px]">
                      สาขา {findBranchNameByBranchId(branch)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="flex-1 overflow-y-auto py-4">
            <Menu rootStyles={menuButtonStyles}>
              {(isSuperAdmin === true || isSuperAdmin === false) && (
                <MenuItem
                  component={<Link to="/admin/dashboard/receipts" />}
                  icon={<IoBarChartOutline size={22} />}
                >
                  <span className="text-[13px] font-medium">รายการใบเสร็จ</span>
                </MenuItem>
              )}

              {isSuperAdmin === false && (
                <MenuItem
                  icon={<BsTruck size={22} />}
                  component={<Link to="/admin/dashboard/stock" />}
                >
                  <span className="text-[13px] font-medium">จัดการสินค้าสมนาคุณ</span>
                </MenuItem>
              )}

              {(isSuperAdmin === true || isSuperAdmin === false) && (
                <MenuItem
                  icon={<IoReceiptOutline size={22} />}
                  component={<Link to="/admin/dashboard/redeem" />}
                >
                  <span className="text-[13px] font-medium">ประวัติการแลก</span>
                </MenuItem>
              )}

              {isSuperAdmin === false && (
                <MenuItem
                  icon={<PiStorefront size={22} />}
                  component={<Link to="/admin/dashboard/add-store" />}
                >
                  <span className="text-[13px] font-medium">จัดการร้านค้า</span>
                </MenuItem>
              )}

              {isSuperAdmin === true && (
                <>
                  <MenuItem
                    component={<Link to="/admin/dashboard/customers" />}
                    icon={<PiUserListLight size={24} />}
                  >
                    <span className="text-[13px] font-medium">รายชื่อลูกค้าทั้งหมด</span>
                  </MenuItem>
                  <MenuItem
                    icon={<GoPencil size={22} />}
                    component={<Link to="/admin/dashboard/create" />}
                  >
                    <span className="text-[13px] font-medium">จัดการแอดมิน</span>
                  </MenuItem>
                </>
              )}

              {isSecretAdmin === true && (
                <MenuItem
                  component={<Link to="/admin/dashboard/secret" />}
                  icon={<PiGear size={24} />}
                >
                  <span className="text-[13px] font-medium">Database Edit</span>
                </MenuItem>
              )}
            </Menu>
          </div>

          {/* Logout Section */}
          <div className="p-4 mt-auto border-t border-gray-50">
            <Menu rootStyles={{
              '.ps-menu-button': {
                borderRadius: '12px',
                margin: '0',
                transition: 'all 0.3s ease',
                color: '#dc2626 !important',
                '&:hover': {
                  backgroundColor: '#fef2f2 !important',
                  transform: 'scale(1.02)',
                },
              }
            }}>
              <MenuItem
                icon={<LuLogOut size={22} />}
                component={<Link to="/admin/login" />}
                onClick={() => {
                  clearAdminData();
                  clearAuth();
                }}
              >
                <span className="text-[13px] font-bold">ออกจากระบบ</span>
              </MenuItem>
            </Menu>
          </div>
        </div>
      </Sidebar>
    </div>
  );
};

export default AdminSidebar;
