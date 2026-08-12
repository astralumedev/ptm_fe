import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './globals.css';

// Import pages
import HomePage from '../pages/HomePage';
import ShopTypePage from '../pages/ShopTypePage';
import ShopDetailPage from '../pages/ShopDetailPage';
import BlogListPage from '../pages/BlogListPage';
import BlogDetailPage from '../pages/BlogDetailPage';
import ContactPage from '../pages/ContactPage';
import ContentPage from '../pages/ContentPage';
import MallMapPage from '../pages/MallMapPage';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shops/:type" element={<ShopTypePage />} />
          <Route path="/shops/details/:slug" element={<ShopDetailPage />} />
          <Route path="/blogs" element={<BlogListPage />} />
          <Route path="/blogs/:slug" element={<BlogDetailPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/page/:slug" element={<ContentPage />} />
          <Route path="/mall-map" element={<MallMapPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
