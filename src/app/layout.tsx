import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './globals.css';

// Import pages
import HomePage from '../pages/HomePage';
import ShopPage from '../pages/ShopPage';
import ShopDirectoryPage from '../pages/ShopDirectoryPage';
import DinePage from '../pages/DinePage';
import EntertainPage from '../pages/EntertainPage';
import ServicesPage from '../pages/ServicesPage';
import ShopDetailPage from '../pages/ShopDetailPage';
import LatestPage from '../pages/LatestPage';
import BlogDetailPage from '../pages/BlogDetailPage';
import ContactPage from '../pages/ContactPage';
import ContentPage from '../pages/ContentPage';
import MallMapPage from '../pages/MallMapPage';
import AboutPage from '../pages/AboutPage';
import PrivacyPolicyPage from '../pages/PrivacyPolicyPage';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/shops" element={<ShopPage />} />
          <Route path="/shops/directory" element={<ShopDirectoryPage />} />
          <Route path="/shop/directory" element={<ShopDirectoryPage />} />
          <Route path="/shops/retail" element={<ShopDirectoryPage />} />
          <Route path="/dine" element={<DinePage />} />
          <Route path="/shops/eatery" element={<DinePage />} />
          <Route path="/entertain" element={<EntertainPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/shops/service" element={<ServicesPage />} />
          <Route path="/shops/details/:slug" element={<ShopDetailPage />} />
          <Route path="/shop/details/:slug" element={<ShopDetailPage />} />
          <Route path="/store/:slug" element={<ShopDetailPage />} />
          <Route path="/stores/:slug" element={<ShopDetailPage />} />
          <Route path="/latest" element={<LatestPage />} />
          <Route path="/blogs" element={<LatestPage />} />
          <Route path="/blogs/:slug" element={<BlogDetailPage />} />
          <Route path="/events" element={<LatestPage />} />
          <Route path="/offers" element={<LatestPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/about-us" element={<AboutPage />} />
          <Route path="/page/about_us" element={<AboutPage />} />
          <Route path="/page/about-us" element={<AboutPage />} />
          <Route path="/page/about" element={<AboutPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/page/privacy_policy" element={<PrivacyPolicyPage />} />
          <Route path="/page/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/page/:slug" element={<ContentPage />} />
          <Route path="/mall-map" element={<MallMapPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
