import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import ToolCatalog from './pages/ToolCatalog';
import ToolDetail from './pages/ToolDetail';
import Categories from './pages/Categories';
import RequestTool from './pages/RequestTool';
import Blog from './pages/Blog';
import About from './pages/About';
import Contact from './pages/Contact';
import Support from './pages/Support';
import Advertise from './pages/Advertise';
import Legal from './pages/Legal';
import LegalPage from './pages/LegalPage';
import AppDetail from './pages/AppDetail';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminApps from './pages/admin/AdminApps';
import AdminCategories from './pages/admin/AdminCategories';

// Wrapper to conditionally show Navbar/Footer only on public routes
function PublicLayout({ children }) {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  return (
    <>
      {!isAdmin && <Navbar />}
      {children}
      {!isAdmin && <Footer />}
    </>
  );
}

function App() {
  return (
    <Router>
      <PublicLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tools" element={<ToolCatalog />} />
          <Route path="/tool/:id" element={<ToolDetail />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/request" element={<RequestTool />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/support" element={<Support />} />
          <Route path="/advertise" element={<Advertise />} />
          <Route path="/privacy" element={<Legal title="Privacy Policy" />} />
          <Route path="/terms" element={<Legal title="Terms of Service" />} />
          <Route path="/disclaimer" element={<Legal title="Disclaimer" />} />
          <Route path="/legal/:appSlug/:docSlug" element={<LegalPage />} />
          <Route path="/app/:appSlug" element={<AppDetail />} />

          {/* Admin Routes — no Navbar/Footer */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="websites" element={<AdminApps section="Website" />} />
            <Route path="android-apps" element={<AdminApps section="Android App" />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="users" element={<AdminUsers />} />
          </Route>
        </Routes>
      </PublicLayout>
    </Router>
  );
}

export default App;
