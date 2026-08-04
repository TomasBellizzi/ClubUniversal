import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookIcon from '@mui/icons-material/Facebook';
import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt';
import '../styles/Footer.css';

function Footer() {
  return (
    <footer className="app-footer">
      <a
        className="footer-link"
        href="https://www.instagram.com/acyduniversal/"
        target="_blank"
        rel="noreferrer"
        aria-label="Instagram del club"
      >
        <InstagramIcon fontSize="small" />
        Instagram
      </a>

      <strong className="footer-title">Asociación Cultural y Deportiva Universal</strong>

      <div className="footer-side-links">
        <a
          className="footer-link"
          href="https://www.facebook.com/ACyDUniversal/?locale=es_LA"
          target="_blank"
          rel="noreferrer"
          aria-label="Facebook del club"
        >
          <FacebookIcon fontSize="small" />
          Facebook
        </a>
        <a
          className="footer-link"
          href="https://www.google.com/maps/search/?api=1&query=Asociaci%C3%B3n%20Cultural%20y%20Deportiva%20Universal%20La%20Plata"
          target="_blank"
          rel="noreferrer"
          aria-label="Ubicación del club"
        >
          <AddLocationAltIcon fontSize="small" />
          Maps
        </a>
      </div>
    </footer>
  );
}

export default Footer;
