import { lazy, Suspense } from 'react';
import { createBrowserRouter, createRoutesFromElements, Outlet, Route, RouterProvider } from 'react-router-dom';
import './globals.css';

// Home loads with the first request; every other page is its own chunk, fetched on first visit.
import HomePage from '../pages/HomePage';
const ShopPage = lazy(() => import('../pages/ShopPage'));
const ShopDirectoryPage = lazy(() => import('../pages/ShopDirectoryPage'));
const DinePage = lazy(() => import('../pages/DinePage'));
const EntertainPage = lazy(() => import('../pages/EntertainPage'));
const ServicesPage = lazy(() => import('../pages/ServicesPage'));
const ShopDetailPage = lazy(() => import('../pages/ShopDetailPage'));
const LatestPage = lazy(() => import('../pages/LatestPage'));
const BlogDetailPage = lazy(() => import('../pages/BlogDetailPage'));
const ContactPage = lazy(() => import('../pages/ContactPage'));
const ContentPage = lazy(() => import('../pages/ContentPage'));
const MallMapPage = lazy(() => import('../pages/MallMapPage'));
const QrScanRedirect = lazy(() => import('../pages/MallMapPage').then((m) => ({ default: m.QrScanRedirect })));
const AboutPage = lazy(() => import('../pages/AboutPage'));
const PrivacyPolicyPage = lazy(() => import('../pages/PrivacyPolicyPage'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));
import { SeoManager } from '../content/seo';
import { ContentNotice } from '../content/ContentNotice';
import AnnouncementBar from './components/AnnouncementBar';
import PromoPopup from './components/PromoPopup';

function PageLoading() {
  return <div className="min-h-screen bg-white" aria-busy="true" />;
}

// Staff-only shortcut; its code is only downloaded on a browser that has signed in to the admin.
const StaffEditButton = lazy(() => import('../content/StaffEditButton'));
const isStaffBrowser = (() => { try { return localStorage.getItem('ptm-staff') === '1'; } catch { return false; } })();

// The admin panel is split into its own chunk so visitors never download it.
const AdminApp = lazy(() => import('../admin/AdminApp'));

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      <Route path="/admin/*" element={<Suspense fallback={null}><AdminApp /></Suspense>} />
      <Route element={<div className="App"><SeoManager /><ContentNotice /><AnnouncementBar /><PromoPopup />{isStaffBrowser && <Suspense fallback={null}><StaffEditButton /></Suspense>}<Suspense fallback={<PageLoading />}><Outlet /></Suspense></div>}>
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
        <Route path="/q/:code" element={<QrScanRedirect />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Route>,
  ),
);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
