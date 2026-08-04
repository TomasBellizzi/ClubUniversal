import '../styles/HomePageUser.css';
import { Row, Col, Button } from 'react-bootstrap';
import { ArrowRight } from 'react-bootstrap-icons';
import Header from '../components/Header';
import '../styles/HomePageUser.css';

function HomePageUser() {
  const opciones = [
    {
      texto: 'Mis entradas',
      ruta: '/entradasSocio',
      subtitulo: '(ver mis entradas, comprar entradas, ver próximos eventos)',
    },
    
    { 
      texto: 'Modificar perfil',
      ruta: '/modDatos',
      subtitulo: '(actualizar mis datos personales y de contacto)',
    },
    {
      texto: 'Pagar cuota',
      ruta: '/cuotas-table',
      subtitulo: '(ver mis cuotas, subir comprobante o pagar online)',
    },
    {
      texto: 'Actividades',
      ruta: '/actividadesSocio',
      subtitulo: '(ver actividades e inscribirme)',
    },
  ];
  const nom = localStorage.getItem("usuario") ? JSON.parse(localStorage.getItem("usuario")).socio.nombre : "";
  return (
    <>
    <Header></Header>
    <div className="home-background">
      <div className="home-container">
        <h3 className="home-title">¡Hola {nom}!</h3>
        <Row className="g-3">
          {opciones.map((opcion) => (
            <Col key={opcion.texto} xs={12}>
              <div className="home-card">
                <div>
                  <strong>{opcion.texto}</strong>
                  {opcion.subtitulo && (
                    <div className="home-subtitle">{opcion.subtitulo}</div>
                  )}
                </div>
                <Button variant="dark" className="rounded-circle" href={opcion.ruta}>
                  <ArrowRight size={20} />
                </Button>
              </div>
            </Col>
          ))}
        </Row>
      </div>
    </div>
    </>
  );
}

export default HomePageUser;
