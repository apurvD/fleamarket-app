import { Navigate } from "react-router-dom";
import { useVendor } from "../context/VendorContext";
import { ReactNode } from "react";

interface VendorOnlyRouteProps {
  children: ReactNode;
}

const VendorOnlyRoute = ({ children }: VendorOnlyRouteProps) => {
  const { loggedInVendor } = useVendor();

  if (!loggedInVendor) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default VendorOnlyRoute;
