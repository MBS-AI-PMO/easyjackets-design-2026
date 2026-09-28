import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from '@mui/material/styles';
import theme  from './theme';
import "./styles.css";
import App from "./App";
import {ToastContainer} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from "./Context/authContext";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);


root.render(
  <StrictMode>
    <ThemeProvider theme = {theme}>
      <ToastContainer/>
       <AuthProvider>
       <App />
       </AuthProvider>
    </ThemeProvider>
  </StrictMode>
);
