import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import ErrorBoundary from "./components/ErrorBoundary";
import NotFound from "./pages/NotFound";
import Login from './pages/login';
import SignUp from './pages/sign-up';
import ImageUpload from './pages/image-upload';
import NutritionResults from './pages/nutrition-results';
import Settings from './pages/settings';
import NutritionHistory from './pages/nutrition-history';
import ForgotPassword from './pages/forgot-password';
import CalorieTracker from './pages/calorie-tracker';
import BarcodeScanner from './pages/barcode-scanner';
import FoodCompare from './pages/food-compare';
import BodyGoals from './pages/body-goals';
import FoodBattle from './pages/food-battle';
const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/image-upload" element={<ImageUpload />} />
        <Route path="/nutrition-results" element={<NutritionResults />} />
        <Route path="/nutrition-history" element={<NutritionHistory />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/calorie-tracker" element={<CalorieTracker />} />
        <Route path="/barcode-scanner" element={<BarcodeScanner />} />
        <Route path="/food-compare" element={<FoodCompare />} />
        <Route path="/body-goals" element={<BodyGoals />} />
        <Route path="/food-battle" element={<FoodBattle />} />
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;