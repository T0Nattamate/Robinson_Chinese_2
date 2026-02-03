import AdminSidebar from "../../components/AdminSidebar";
import { useEffect, useState } from "react";
import AdminSidebarSmall from "../../components/AdminSidebarSmall";
import { Outlet } from "react-router-dom";
import BasicOverlay from "../../components/overlay/BasicOverlay";
import { useAdminStore } from "../../store/AdminStore";
import useBranchStore from "../../store/BranchStore";
const AdminDashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  const { universalOverlay, setUniversalOverlayFalse } = useAdminStore();

  useEffect(() => {
    setUniversalOverlayFalse();
  }, []);

  const { fetchBranches } = useBranchStore();
  useEffect(() => {
    fetchBranches();
  }, []);

  return (
    <div className="min-h-screen w-full h-full font-kanit flex bg-slate-50">
      {!isSidebarOpen && (
        <div className="z-40">
          <AdminSidebarSmall
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
          ></AdminSidebarSmall>
        </div>
      )}
      <AdminSidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      {/* Dynamic content here */}

      <div
        className={` transition-all duration-300 ml-16 ${isSidebarOpen ? "xl:ml-64" : "xl:ml-20"
          } w-full h-full min-h-screen `}
      >
        {/*  */}
        <Outlet />
      </div>
      {universalOverlay && <BasicOverlay />}
    </div>
  );
};

export default AdminDashboardLayout;
