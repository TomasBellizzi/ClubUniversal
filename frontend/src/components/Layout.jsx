import 'bootstrap/dist/css/bootstrap.min.css';
import fondo from '../assets/fondo.jpg';
import Footer from './Footer';

function Layout({ children, withBackground = false }) {
  if (withBackground) {
    return (
      <div 
        style={{
          backgroundImage: `url(${fondo})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          minHeight: '100vh',
          width: '100%',
          margin: 0,
          padding: 0,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <main className="app-main">
          {children}
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <>
      
      <main className="app-main">
        {children}
      </main>
      <Footer />
    </>
  );
}

export default Layout;
