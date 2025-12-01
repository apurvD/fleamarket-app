import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { VendorProvider } from "./context/VendorContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import VendorList from "./pages/VendorList";
import VendorLogin from "./pages/VendorLogin";
import ForgotPassword from "./pages/ForgotPassword";
import VendorDetails from "./pages/VendorDetails";
import VendorDashboard from "./pages/VendorDashboard";
import ProductDetails from "./pages/ProductDetails";
import BoothListingPage from "./pages/BoothListingPage";
import VendorReservationPage from "./pages/VendorReservationPage";
import VendorRegistration from "./pages/VendorRegistration";
import VendorOnlyRoute from "./routes/VendorOnlyRoute";

function App() {
  return (
    <div>
      <VendorProvider>
        <Navbar />
        <Router>
          <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/vendors" element={<VendorList />} />
          <Route path="/login" element={<VendorLogin />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/register" element={<VendorRegistration />} />
          <Route path="/vendor/:id" element={<VendorDetails />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/booths" element={<BoothListingPage />} />

          {/* vendor restricted routes */}
          <Route path="/stats" element={
              <VendorOnlyRoute>
                <VendorDashboard />
              </VendorOnlyRoute>
            }
          />
          <Route path="/reserve"element={
              <VendorOnlyRoute>
                <VendorReservationPage />
              </VendorOnlyRoute>
            }
          />

        </Routes>
        </Router>
      </VendorProvider>
    </div>
  );
}

export default App;
