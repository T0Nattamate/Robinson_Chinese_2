import { Menu, MenuItem } from "react-pro-sidebar";
import { LuLogOut } from "react-icons/lu";
import { IoReceiptOutline } from "react-icons/io5";
import { IoBarChartOutline } from "react-icons/io5";
//import { GoTrophy } from "react-icons/go";
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
  //role from adminStore
  const { adminData, clearAdminData } = useAdminStore();
  const { role } = adminData;

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
  return (
    <div
      className={`fixed top-0 left-0 h-full bg-white  shadow-xl transition-all duration-300 z-40 ${isSidebarOpen ? "-translate-x-full" : "translate-x-0"
        }`}
    >
      <div className="h-[calc(100vh-2rem)] w-[4.5rem] bg-white min-h-screen shadow-xl shadow-blue-gray-900/5">
        <Menu className="font-light mt-2 ">
          <div
            onClick={() => {
              setIsSidebarOpen(true);
            }}
            className=" border-b-slate-200 border-b w-full flex justify-end p-3 absolute cursor-pointer md:text-white md:hover:text-black duration-200"
          >
            <MdOutlineKeyboardDoubleArrowRight size={25} />
          </div>
          <div className="p-1 flex flex-col justify-center gap-1 items-start border-b-slate-200 border-b pb-[1rem]">
            <section
              className="flex items-center gap-5 cursor-pointer mt-16"
              onClick={() => {
                setIsSidebarOpen(true);
              }}
            >
              <div className="flex flex-col items-center">
                <img src="/logo 1.png" alt="robinsonlogo" />
              </div>
            </section>
          </div>

          {(isSuperAdmin === true || isSuperAdmin === false) && (
            <MenuItem
              component={<Link to="/admin/dashboard/receipts" />}
              icon={<IoBarChartOutline />}
            ></MenuItem>
          )}

          {isSuperAdmin === false && (
            <MenuItem
              icon={<BsTruck />}
              component={<Link to="/admin/dashboard/stock" />}
            >
              {" "}
            </MenuItem>
          )}

          {(isSuperAdmin === true || isSuperAdmin === false) && (
            <MenuItem
              icon={<IoReceiptOutline />}
              component={<Link to="/admin/dashboard/redeem" />}
            ></MenuItem>
          )}

          {(isSuperAdmin === false) && (
            <MenuItem
              icon={<PiStorefront />}
              component={<Link to="/admin/dashboard/add-store" />}
            ></MenuItem>
          )}

          {isSuperAdmin === true && (
            <>
              <MenuItem
                component={<Link to="/admin/dashboard/customers" />}
                icon={<PiUserListLight size={20} />}
              ></MenuItem>
              <MenuItem
                component={<Link to="/admin/dashboard/create" />}
                icon={<GoPencil />}
              >
                {" "}
              </MenuItem>
              {/* <MenuItem
                icon={<GoTrophy />}
                component={<Link to="/admin/dashboard/lucky" />}
              >
                {" "}
              </MenuItem> */}
            </>
          )}

          {isSecretAdmin === true && (
            <>
              <MenuItem
                component={<Link to="/admin/dashboard/secret" />}
                icon={<PiGear size={20} />}
              ></MenuItem>
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
          ></MenuItem>
        </Menu>
      </div>
    </div>
  );
};

export default AdminSidebarSmall;
