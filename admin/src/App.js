import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import axios from 'axios';
import Auth from "./Pages/Auth"
import { useAuth } from './Context/authContext'
import { BASE_URL } from './constant/url';
import DashboardAdmin from './Pages/DashboardAdmin';
import Products from './Components/products';
import Orders from './Components/order'
import Collars from './Components/collars';
import Sleeves from './Components/sleeves';
import Closures from './Components/closure';
import Pockets from './Components/pockets';
import Linings from './Components/lining';
import DesignType from './Components/designType';
import Material from './Components/materials';
import Size from './Components/size';
import Categories from './Components/category';
import FeatureForm from './Components/features';
import OrderDetails from './Components/orderDetails';
import BulkOrder from './Components/bulkOrder';
import OrderBulkTable from './Components/bulkOrderTable';
import WebsiteDetails from './Components/websitedetail';
import BlogManager from './Components/blogs';
import UserTable from './Components/user';
import Subscribers from './Components/Subscribers';
import AdminTable from './Components/admin';
import MetadataManager from './Components/metadata';
import Colors from './Components/color';
import ChangePassword from './Components/ChangePassword';
import GalleryUpload from './Components/galleryUpload';
import PatchPhotos from './Components/patchPhotos';
import DeletedOrders from './Components/deletedOrder';
import AnalyticsDashboard from './Components/AnalyticsDashboard';
import EngineConfiguration from './Components/EngineConfiguration';
import EmailConfiguration from './Components/EmailConfiguration';
import PaymentConfiguration from './Components/PaymentConfiguration';
import ShippingRates from './Components/ShippingRates';
import FontsManager from './Components/fonts';
import ProductReviews from './Components/ProductReviews';
import FabricColors from './Components/FabricColors';
import StorefrontFaqs from './Components/StorefrontFaqs';
import TopBar from './Components/TopBar';
import SeoHealth from './Components/SeoHealth';
import IndexControl from './Components/IndexControl';
import VisitorAnalytics from './Components/VisitorAnalytics';
import SiteStatus from './Components/SiteStatus';
import AdminGate from './Components/UnderConstruction';

import { applyFavicons } from './utils/favicon';
const getStoredAuthToken = () => {
   try {
      return JSON.parse(sessionStorage.getItem("auth"))?.token || "";
   } catch {
      return "";
   }
};




export default function App() {
   const [data, setData] = useState(getStoredAuthToken)

   const { isAuthenticated } = useAuth()

   useEffect(() => {
      setData(getStoredAuthToken())
   }, [isAuthenticated])

   useEffect(() => {
      const fetchGlobalFavicon = async () => {
         try {
            const { data } = await axios.get(`${BASE_URL}/metadata/global-settings`);
            const metadata = data?.metadata;
            applyFavicons(metadata || {}, metadata?.updatedAt || metadata?._id);
         } catch (error) {
            console.error('Error fetching global favicon:', error);
         }
      };

      fetchGlobalFavicon();
   }, []);

   return (
      <Router>
         <Routes>
            {data ?
               <Route path='/' element={<DashboardAdmin />} >
                  <Route index element={<Navigate to="/products" replace />} />
                  <Route path="/features" element={<FeatureForm />} />
                  <Route path="/top-bar" element={<TopBar />} />
                  <Route path="/blogs" element={<BlogManager />} />
                  <Route path="/storefront-faqs" element={<StorefrontFaqs />} />
                  {/* The old single-page FAQ screen was replaced by Storefront FAQs,
                      which manages the jacket builder's FAQs alongside every other
                      page's. Kept as a redirect so old bookmarks still land somewhere. */}
                  <Route path="/custom-jacket-faqs" element={<StorefrontFaqs />} />
                  <Route path="/category" element={<Categories />} />
                  <Route path="/users" element={<UserTable />} />
                  <Route path="/subscribers" element={<Subscribers />} />
                  <Route path="/admin" element={<AdminTable />} />
                  <Route path="/insights" element={<AnalyticsDashboard />} />
                  <Route path="/analytics-configuration" element={<EngineConfiguration />} />
                  <Route path="/email-configuration" element={<EmailConfiguration />} />
                  <Route path="/payment-configuration" element={<PaymentConfiguration />} />
                  <Route path="/shipping-rates" element={<ShippingRates />} />
                  <Route path="/engine-configuration" element={<Navigate to="/analytics-configuration" replace />} />


                  <Route path="/bulkorder/:id" element={<BulkOrder />} />
                  <Route path="/website" element={<WebsiteDetails />} />
                  <Route path="/bulkorder" element={<OrderBulkTable />} />
                  <Route path="/metadata" element={<MetadataManager />} />
                  <Route path="/seo-health" element={<SeoHealth />} />
                  <Route path="/index-control" element={<IndexControl />} />
                  <Route path="/visitor-analytics" element={<VisitorAnalytics />} />
                  <Route path="/products" element={<Products section="jackets" />} />
                  <Route path="/sports-products" element={<Products section="sports" />} />
                  <Route path="/reviews" element={<ProductReviews />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/deleted-orders" element={<DeletedOrders />} />
                  <Route path="/colors" element={<Colors />} />
                  <Route path="/collar" element={<Collars />} />
                  <Route path="/sleeves" element={<Sleeves />} />
                  <Route path="/closure" element={<Closures />} />
                  <Route path="/pockets" element={<Pockets />} />
                  <Route path="/linings" element={<Linings />} />
                  <Route path="/orders/:id" element={<OrderDetails />} />
                  <Route path="/design" element={<DesignType />} />
                  <Route path="/material" element={<Material />} />
                  <Route path="/size" element={<Size />} />
                  <Route path="/fonts" element={<FontsManager />} />
                  <Route path="/gallery" element={<GalleryUpload />} />
                  <Route path="/patches" element={<PatchPhotos />} />
                  <Route path="/fabric-colors" element={<FabricColors />} />
                  <Route path="/change-password" element={<ChangePassword />} />
                  <Route path="/site-status" element={<SiteStatus />} />
               </Route> :
               <>
                  {/* the holding page first while the site is under construction ("Team sign in" leads on) */}
                  <Route path="/" element={<AdminGate><Auth /></AdminGate>} />
                  <Route path="*" element={<Navigate to="/" replace />} />
               </>
            }
         </Routes>
      </Router>
   );
}
