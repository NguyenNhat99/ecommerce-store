import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import 'bootstrap/dist/css/bootstrap.min.css';
import './assets/eshopper-ui/lib/owlcarousel/assets/owl.carousel.min.css';
import './assets/eshopper-ui/css/style.css';

import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
