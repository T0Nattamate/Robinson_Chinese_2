import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./index.css";
import MenuPage from "./pages/MenuPage";
import LoadingAfterLogin from "./pages/LoadingAfterLogin";
import RegisterPage from "./pages/RegisterPage";
import SuccessPage from "./pages/SuccessPage";
import TermsFileUpload from "./pages/TermsFileUpload";
import TermsRedeem from "./pages/TermsRedeem";
import SuccessRedeem from "./pages/SuccessRedeem";
import SuccessUpload from "./pages/SuccessUpload";
import FileUploadPage from "./pages/FileUploadPage";
import axios from "axios";
//import DevTestPage from "./components/DevTestPage";
import ReceiptHistory from "./pages/ReceiptHistory";
import TopspenderPage from "./pages/TopSpenderPage";
//import AvailableRedeemPage from "./pages/AvailableRedeemPage";
import RedeemPage from "./pages/RedeemPage";
import AnnouncementPage from "./pages/AnnouncementPage";
import AdminLoginPage from "./pages/Admin/AdminLoginPage";
import MfaPage from "./pages/Admin/MfaPage";
import ReceiptDashboard from "./components/AdminDashboard/ReceiptDashboard";
import CreateAdmin from "./components/AdminDashboard/CreateAdmin";
import RedeemHistoryAdmin from "./components/AdminDashboard/RedeemHistoryAdmin";
import CustomerAdmin from "./components/AdminDashboard/CustomerAdmin";
import StockDashboard from "./components/AdminDashboard/StockDashboard";
import SecretAdminEdit from "./components/AdminDashboard/SecretAdminEdit";
import AdminDashboardLayout from "./pages/Admin/AdminsDashboardLayout";
import LoginPage from "./pages/LoginPage";
import ClearPage from "./pages/ClearPage";
import CreateLucky from "./components/AdminDashboard/CreateLucky";
import AddStore from "./components/AdminDashboard/AddStore";
import RedeemHistoryPage from "./pages/RedeemHistoryPage";
import NotFoundPage from "./pages/NotFoundPage";
import ProtectedRoute from "./components/ProtectedRoute";
import useAuthStore from "./store/AuthStore";

function App() {
  axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;
  const { accessToken, isAcceptUpload, isAcceptRedeem, isMfa, canAccessTermsRedeem, canAccessTermsUpload } =
    useAuthStore();
  return (
    <Router>
      <Routes>
        {/* Public User */}
        <Route path="/" element={<ClearPage />} />
        {/* <Route path="/test" element={<DevTestPage />} /> */}
        <Route path="/secret-login" element={<LoginPage />} />
        <Route path="/loading" element={<LoadingAfterLogin />} />
        <Route path="/register" element={<RegisterPage />} />
        {/* using jwt */}

        {/* <Route path="/terms-upload" element={<TermsFileUpload />} /> */}
        <Route
          path="/terms-upload"
          element={
            <ProtectedRoute
              condition={!!accessToken && canAccessTermsUpload}
              redirectTo="/menu"
              element={<TermsFileUpload />}
            />
          }
        />
        {/* <Route path="/menu" element={<MenuPage />} /> */}
        <Route
          path="/menu"
          element={
            <ProtectedRoute
              condition={!!accessToken}
              redirectTo="/"
              element={<MenuPage />}
            />
          }
        />
        {/* <Route path="/success" element={<SuccessPage />} /> */}
        <Route
          path="/success"
          element={
            <ProtectedRoute
              condition={!!accessToken}
              redirectTo="/"
              element={<SuccessPage />}
            />
          }
        />

        {/* <Route path="/success-upload" element={<SuccessUpload />} /> */}
        <Route
          path="/success-upload"
          element={
            <ProtectedRoute
              condition={!!accessToken}
              redirectTo="/"
              element={<SuccessUpload />}
            />
          }
        />

        {/* <Route path="/history" element={<ReceiptHistory />} /> */}
        <Route
          path="/history"
          element={
            <ProtectedRoute
              condition={!!accessToken}
              redirectTo="/"
              element={<ReceiptHistory />}
            />
          }
        />
        {/* <Route path="/top-spender" element={<TopspenderPage />} /> */}
        <Route
          path="/top-spender"
          element={
            <ProtectedRoute
              condition={!!accessToken}
              redirectTo="/"
              element={<TopspenderPage />}
            />
          }
        />
        {/* <Route path="/terms-redeem" element={<TermsRedeem />} /> */}
        <Route
          path="/terms-redeem"
          element={
            <ProtectedRoute
              condition={!!accessToken && canAccessTermsRedeem}
              redirectTo="/menu"
              element={<TermsRedeem />}
            />
          }
        />
        {/* <Route path="/announce" element={<AnnouncementPage />} /> */}
        <Route
          path="/announce"
          element={
            <ProtectedRoute
              condition={!!accessToken}
              redirectTo="/"
              element={<AnnouncementPage />}
            />
          }
        />

        <Route
          path="/redeem-history"
          element={
            <ProtectedRoute
              condition={!!accessToken}
              redirectTo="/"
              element={<RedeemHistoryPage />}
            />
          }
        />

        {/* using jwt + isAcceptUpload */}
        {/* <Route path="/upload" element={<FileUploadPage />} /> */}
        <Route
          path="/upload"
          element={
            <ProtectedRoute
              condition={!!accessToken && isAcceptUpload}
              redirectTo="/terms-upload"
              element={<FileUploadPage />}
            />
          }
        />

        {/* using jwt + isAcceptRedeem */}
        {/* <Route path="/redeem" element={<RedeemPage />} /> */}
        <Route
          path="/redeem"
          element={
            <ProtectedRoute
              condition={!!accessToken && isAcceptRedeem}
              redirectTo="/terms-redeem"
              element={<RedeemPage />}
            />
          }
        />

        {/* using jwt + isScanQr */}
        {/* <Route path="/redeem/:branchId" element={<AvailableRedeemPage />} /> */}
        {/* <Route path="/success-redeem/:branchId" element={<SuccessRedeem />} /> */}
        {/* <Route
          path="/redeem/:branchId"
          element={
            <ProtectedRoute
              condition={!!accessToken && isScanQR}
              redirectTo="/terms-redeem"
              element={<AvailableRedeemPage />}
            />
          }
        /> */}

        <Route
          path="/success-redeem/:branchId"
          element={
            <ProtectedRoute
              condition={!!accessToken}
              redirectTo="/"
              element={<SuccessRedeem />}
            />
          }
        />
        {/* <Route path="/redeem-history" element={<RedeemHistoryPage />} /> */}
        {/*Public Admin */}
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* using jwt */}
        {/* <Route path="/admin/mfa" element={<MfaPage />} /> */}
        <Route path="/admin/mfa" element={<MfaPage />} />

        {/* using jwt + isMfa */}
        {/* <Route path="/admin/dashboard" element={<AdminDashboardLayout />}> */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute
              condition={!!accessToken && isMfa}
              redirectTo="/admin/login"
              element={<AdminDashboardLayout />}
            />
          }
        >
          <Route path="receipts" element={<ReceiptDashboard />} />
          <Route path="create" element={<CreateAdmin />} />
          <Route path="redeem" element={<RedeemHistoryAdmin />} />
          <Route path="customers" element={<CustomerAdmin />} />
          <Route path="lucky" element={<CreateLucky />} />
          <Route path="stock" element={<StockDashboard />} />
          <Route path="add-store" element={<AddStore />} />
          <Route path="secret" element={<SecretAdminEdit />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
