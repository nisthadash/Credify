import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from './components/layout/Header.jsx';
import Footer from './components/layout/Footer.jsx';
import AppRoutes from './routes/AppRoutes.jsx';

function App() {
  const { pathname } = useLocation();
  const isLanding = pathname === '/';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {!isLanding && <Header />}
      <main style={{ flex: 1 }}>
        <AppRoutes />
      </main>
      {!isLanding && <Footer />}
    </div>
  );
}

export default App;
