import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { createStore, applyMiddleware, compose } from "redux";
import thunk from "redux-thunk";

import { isLocalhost } from "./utils";

import rootReducer from "./store/reducers";
import { getProduct, getSetProduct, setProduct } from "./store/actions";

import "./css/index.scss";
import "./css/scrollbars.css";
import App from "./App";
import { loadSiteFavicon } from "./utils/favicon";

// the admin's favicon, requested before the builder itself loads
loadSiteFavicon();

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
export const store = createStore(
  rootReducer,
  /* preloadedState, */ composeEnhancers(applyMiddleware(thunk))
);

// Dev
// Varsity Jackets 953
// Bomber Jackets 942
// Hoodies 936
// Coach Jackets 928
// Varsity/Bomber Jacket 3002 With colors

// Production
// Varsity Jackets 5893
// Bomber Jackets 5944
// Hoodies 5995
// Coach Jackets 6046
// Varsity/Bomber Jacket 3002 With colors

let search = window.location.search;
let params = new URLSearchParams(search);
let id = params.get("id");
// let Token = params.get("token")
let designId = params.get("design") 
let designedit = params.get("designedit")
let madeProduct = params.get("product")

window.mount = (
  productId = id,
  // token = Token,
  data = false,
  design = designId,
  edit = designedit,
  product = madeProduct
) => {
  const target = document.getElementById("cjd-root");
  if (design) {
    store.dispatch(getSetProduct(design));
  } 
  else if (edit) {
    store.dispatch(setProduct(edit));
  }
  else if(product){
    store.dispatch(getProduct(productId, product));
  }
  else {
    store.dispatch(getProduct(productId));
  }

  if (target) {
    const root = createRoot(target);
    root.render(
      <React.StrictMode>
        <Provider store={store}>
          <App />
        </Provider>
      </React.StrictMode>
    );
  }
};

if (true) {
  window.mount();
}
