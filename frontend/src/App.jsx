import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom';
import { productPath } from './lib/urls';
import { CUSTOMIZER } from './lib/catalog';
import ErrorBoundary from './components/ErrorBoundary';
import ScrollManager from './components/ScrollManager';
import Seo from './components/Seo';

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
const EmbroideryPatches = lazy(() => import('./pages/EmbroideryPatches'));
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

/** Redirect built from the matched route's parameters (keeps the query string). */
function ParamRedirect({ to }) {
  const params = useParams();
  const { search } = useLocation();
  const target = to(params);
  return <Navigate to={target.includes('?') ? target : `${target}${search}`} replace />;
}

/** The live site's /Design/<id> links open that design in the jacket builder. */
function DesignLabRedirect() {
  const { id } = useParams();
  window.location.replace(`${CUSTOMIZER}/?design=${encodeURIComponent(id)}`);
  return null;
}

export default function App() {
  const { pathname } = useLocation();
  return (
    <>
      <ScrollManager />
      <Seo />
      <ErrorBoundary key={pathname}>
      <Suspense fallback={<div style={{ minHeight: '100vh' }} />}>
        <Routes>
          {/* Canonical routes: the live site's URL scheme (lib/urls.js), so every indexed address keeps working */}
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/shop/:type/:value" element={<Shop />} />
          <Route path="/shop/filter/*" element={<Shop />} />
          <Route path="/product/:slug" element={<Product />} />
          <Route path="/design-custom-jacket" element={<Design />} />
          <Route path="/how-to-design-jacket" element={<HowToDesign />} />
          <Route path="/bulk-order" element={<BulkOrders />} />
          <Route path="/new-blog" element={<Blog />} />
          <Route path="/new-blog/:slug" element={<BlogPost />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/sizechart" element={<SizeChart />} />
          <Route path="/material-colors" element={<MaterialColors />} />
          <Route path="/fabrics" element={<Fabrics />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/embroidery-and-patches" element={<EmbroideryPatches />} />
          <Route path="/about-us" element={<About />} />
          <Route path="/contact-us" element={<Contact />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/shipping" element={<ShippingReturns />} />
          <Route path="/privacypolicy" element={<PrivacyPolicy />} />
          <Route path="/terms-and-conditions" element={<Terms />} />
          <Route path="/track-order" element={<TrackOrder />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-confirmation" element={<OrderConfirmation />} />
          <Route path="/success/:sessionId" element={<OrderConfirmation />} />
          <Route path="/cancel" element={<Navigate to="/cart?cancelled=1" replace />} />
          <Route path="/account" element={<Account />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/united-states" element={<UnitedStates />} />
          <Route path="/united-states/:state" element={<StatePage />} />
          <Route path="/style-guide" element={<StyleGuide />} />

          {/* Other addresses for the same pages: the live site's aliases and the first 2026 paths */}
          <Route path="/product" element={<Navigate to="/shop" replace />} />
          <Route path="/products" element={<Navigate to="/shop" replace />} />
          <Route path="/products/:slug" element={<ParamRedirect to={(p) => productPath(p.slug)} />} />
          <Route path="/design" element={<Navigate to="/design-custom-jacket" replace />} />
          <Route path="/design/:id" element={<DesignLabRedirect />} />
          <Route path="/how-to-design" element={<Navigate to="/how-to-design-jacket" replace />} />
          <Route path="/guide" element={<Navigate to="/how-to-design-jacket" replace />} />
          <Route path="/bulk-orders" element={<Navigate to="/bulk-order" replace />} />
          <Route path="/bulkorder" element={<Navigate to="/bulk-order" replace />} />
          <Route path="/blog" element={<Navigate to="/new-blog" replace />} />
          <Route path="/blog/:slug" element={<ParamRedirect to={(p) => `/new-blog/${encodeURIComponent(p.slug)}`} />} />
          <Route path="/size-chart" element={<Navigate to="/sizechart" replace />} />
          <Route path="/photo-gallery" element={<Navigate to="/gallery" replace />} />
          <Route path="/about" element={<Navigate to="/about-us" replace />} />
          <Route path="/aboutus" element={<Navigate to="/about-us" replace />} />
          <Route path="/contact" element={<Navigate to="/contact-us" replace />} />
          <Route path="/contactus" element={<Navigate to="/contact-us" replace />} />
          <Route path="/shipping-returns" element={<Navigate to="/shipping" replace />} />
          <Route path="/return-policy" element={<Navigate to="/shipping#exchanges" replace />} />
          <Route path="/privacy-policy" element={<Navigate to="/privacypolicy" replace />} />
          <Route path="/terms" element={<Navigate to="/terms-and-conditions" replace />} />
          <Route path="/order-confirmation/:orderId" element={<ParamRedirect to={(p) => `/order-confirmation?order=${encodeURIComponent(p.orderId)}`} />} />
          <Route path="/payment-success" element={<Navigate to="/order-confirmation" replace />} />
          <Route path="/login" element={<Navigate to="/account" replace />} />
          <Route path="/sign-up" element={<Navigate to="/account" replace />} />
          <Route path="/user/*" element={<Navigate to="/dashboard" replace />} />
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="/home/index2.html" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      </ErrorBoundary>
    </>
  );
}
