import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import ScrollManager from './components/ScrollManager';

// Each page is its own chunk, so a phone opening the landing page downloads
// only the landing page.
const Home = lazy(() => import('./pages/Home'));
const Shop = lazy(() => import('./pages/Shop'));
const Product = lazy(() => import('./pages/Product'));
const Design = lazy(() => import('./pages/Design'));
const HowToDesign = lazy(() => import('./pages/HowToDesign'));
const BulkOrders = lazy(() => import('./pages/BulkOrders'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const Faq = lazy(() => import('./pages/Faq'));
const SizeChart = lazy(() => import('./pages/SizeChart'));
const MaterialColors = lazy(() => import('./pages/MaterialColors'));
const Fabrics = lazy(() => import('./pages/Fabrics'));
const Gallery = lazy(() => import('./pages/Gallery'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Reviews = lazy(() => import('./pages/Reviews'));
const ShippingReturns = lazy(() => import('./pages/ShippingReturns'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const Terms = lazy(() => import('./pages/Terms'));
const TrackOrder = lazy(() => import('./pages/TrackOrder'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const OrderConfirmation = lazy(() => import('./pages/OrderConfirmation'));
const Account = lazy(() => import('./pages/Account'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const UnitedStates = lazy(() => import('./pages/UnitedStates'));
const StatePage = lazy(() => import('./pages/StatePage'));
const StyleGuide = lazy(() => import('./pages/StyleGuide'));
const NotFound = lazy(() => import('./pages/NotFound'));

export default function App() {
  return (
    <>
      <ScrollManager />
      <Suspense fallback={<div style={{ minHeight: '100vh' }} />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product" element={<Product />} />
          <Route path="/design" element={<Design />} />
          <Route path="/how-to-design" element={<HowToDesign />} />
          <Route path="/bulk-orders" element={<BulkOrders />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/size-chart" element={<SizeChart />} />
          <Route path="/material-colors" element={<MaterialColors />} />
          <Route path="/fabrics" element={<Fabrics />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/shipping-returns" element={<ShippingReturns />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/track-order" element={<TrackOrder />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-confirmation" element={<OrderConfirmation />} />
          <Route path="/account" element={<Account />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/united-states" element={<UnitedStates />} />
          <Route path="/united-states/:state" element={<StatePage />} />
          <Route path="/style-guide" element={<StyleGuide />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
}
