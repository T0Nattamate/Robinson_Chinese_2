import { Menu, MenuItem } from "react-pro-sidebar";
import { LuLogOut } from "react-icons/lu";
import { IoReceiptOutline } from "react-icons/io5";
import { IoBarChartOutline } from "react-icons/io5";
import { GoPencil } from "react-icons/go";
import { BsTruck } from "react-icons/bs";
import { PiGear, PiUserListLight, PiStorefront } from "react-icons/pi";
import { MdOutlineKeyboardDoubleArrowRight } from "react-icons/md";
import { Link } from "react-router-dom";
import { useAdminStore } from "../store/AdminStore";
import useAuthStore from "../store/AuthStore";

interface AdminSidebarSmallProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const AdminSidebarSmall: React.FC<AdminSidebarSmallProps> = ({
  isSidebarOpen,
  setIsSidebarOpen,
}) => {
  const { clearAuth } = useAuthStore();
  const { adminData, clearAdminData } = useAdminStore();
  const { role } = adminData;

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
      margin: '4px 8px',
      transition: 'all 0.3s ease',
      height: '45px',
      width: '45px',
      display: 'flex',
      justifyContent: 'center',
      '&:hover': {
        backgroundColor: '#fef2f2 !important',
        color: 'var(--red) !important',
      },
    },
    '.ps-active .ps-menu-button': {
      backgroundColor: '#fef2f2 !important',
      color: 'var(--red) !important',
    }
  };

  return (
    <div
      className={`fixed top-0 left-0 h-full bg-white border-r border-gray-100 shadow-xl transition-all duration-300 z-50 ${isSidebarOpen ? "-translate-x-full" : "translate-x-0 w-[4.5rem]"
        }`}
    >
      <div className="flex flex-col h-full items-center py-6">
        {/* Toggle Button */}
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 mb-8 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600 shadow-sm border border-gray-50"
        >
          <MdOutlineKeyboardDoubleArrowRight size={24} />
        </button>

        {/* Logo Icon */}
        <div className="mb-8 px-2 cursor-pointer" onClick={() => setIsSidebarOpen(true)}>
          <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-lg overflow-hidden">
            <img src="/logo 1.png" alt="R" className="w-8 object-contain scale-150" />
          </div>
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          <Menu rootStyles={menuButtonStyles}>
            {(isSuperAdmin === true || isSuperAdmin === false) && (
              <MenuItem
                component={<Link to="/admin/dashboard/receipts" />}
                icon={<IoBarChartOutline size={22} />}
              />
            )}

            {isSuperAdmin === false && (
              <MenuItem
                icon={<BsTruck size={22} />}
                component={<Link to="/admin/dashboard/stock" />}
              />
            )}

            {(isSuperAdmin === true || isSuperAdmin === false) && (
              <MenuItem
                icon={<IoReceiptOutline size={22} />}
                component={<Link to="/admin/dashboard/redeem" />}
              />
            )}

            {isSuperAdmin === false && (
              <MenuItem
                icon={<PiStorefront size={22} />}
                component={<Link to="/admin/dashboard/add-store" />}
              />
            )}

            {isSuperAdmin === true && (
              <>
                <MenuItem
                  component={<Link to="/admin/dashboard/customers" />}
                  icon={<PiUserListLight size={24} />}
                />
                <MenuItem
                  icon={<GoPencil size={22} />}
                  component={<Link to="/admin/dashboard/create" />}
                />
              </>
            )}

            {isSecretAdmin === true && (
              <MenuItem
                component={<Link to="/admin/dashboard/secret" />}
                icon={<PiGear size={24} />}
              />
            )}
          </Menu>
        </div>

        {/* Logout */}
        <div className="mt-auto px-2 border-t border-gray-50 pt-4">
          <Menu rootStyles={{
            '.ps-menu-button': {
              borderRadius: '12px',
              transition: 'all 0.3s ease',
              color: '#dc2626 !important',
              '&:hover': {
                backgroundColor: '#fef2f2 !important',
                transform: 'scale(1.1)',
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
            />
          </Menu>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebarSmall;
