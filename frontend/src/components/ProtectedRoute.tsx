import { Navigate } from "react-router-dom";
import { ReactElement } from "react";

interface ProtectedRouteProps {
  element: ReactElement;
  condition: boolean;
  redirectTo: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  element,
  condition,
  redirectTo,
}) => {
  return condition ? element : <Navigate to={redirectTo} />;
};

export default ProtectedRoute;
