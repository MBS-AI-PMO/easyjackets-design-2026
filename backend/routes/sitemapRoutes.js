import express from "express";
import {
  productSitemapController,
  pageSitemapController,
  blogSitemapController,
  filterSitemapController,
  sitemapIndexController,
  FILTER_TYPES,
} from "../controllers/sitemapController.js";

const router = express.Router();

// Both path shapes are registered for every sitemap. Nginx currently proxies the
// bare `/sitemap.xml` and `/product-sitemap.xml` from the site root; the
// `/sitemap/...` forms let the remaining five be proxied the same way without
// having to guess which convention the server config uses.
router.get("/sitemap.xml", sitemapIndexController);
router.get("/sitemap/sitemap.xml", sitemapIndexController);

router.get("/page-sitemap.xml", pageSitemapController);
router.get("/sitemap/page-sitemap.xml", pageSitemapController);

router.get("/product-sitemap.xml", productSitemapController);
router.get("/sitemap/product-sitemap.xml", productSitemapController);

router.get("/blog-sitemap.xml", blogSitemapController);
router.get("/sitemap/blog-sitemap.xml", blogSitemapController);

FILTER_TYPES.forEach((type) => {
  router.get(`/${type}-sitemap.xml`, filterSitemapController(type));
  router.get(`/sitemap/${type}-sitemap.xml`, filterSitemapController(type));
});

export default router;
