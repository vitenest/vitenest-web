import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminApps from './pages/admin/AdminApps';
import AdminCategories from './pages/admin/AdminCategories';

function App() {
  return (
    <Router>
      <Navbar />
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
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="apps" element={<AdminApps />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="users" element={<AdminUsers />} />
        </Route>
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
