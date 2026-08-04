import '../styles/HomePage.css';
import { Row, Col, Button } from 'react-bootstrap';
import { ArrowRight } from 'react-bootstrap-icons';
import Header from '../components/Header';

function HomePageAdmin() {
  const usuarioStr = localStorage.getItem("usuario");
  const usuario = usuarioStr ? JSON.parse(usuarioStr) : null;
  const role = usuario?.rol || usuario?.role || null;
  // Lista base de opciones (todas)
  const opcionesBase = [
    { texto: 'Cuotas', ruta: '/cuotas-admin' },
    { texto: 'Eventos', ruta: '/eventos' },
    { texto: 'Actividades', ruta: '/actividades' },
    { texto: 'Administrativos', ruta: '/administrativos', requiereAdmin: true },
    { texto: 'Socios', ruta: '/socios' },
  ];

  // Filtrar según rol
  const opcionesVisibles = opcionesBase.filter(opcion => {
    // Si requiere ser admin, solo lo ve si el rol es ADMIN
    if (opcion.requiereAdmin && role !== "ADMIN") return false;
    return true;
  });

  return (
    <div>
      <Header />

      <div className="home-triangle"></div>

      <div className="home-container">
        <h3 className="home-title" style={{ color: 'red' }}>
          Home
        </h3>

        <Row className="g-3">
          {opcionesVisibles.map(opcion => (
            <Col key={opcion.texto} xs={12}>
              <div className="home-card">
                <strong>{opcion.texto}</strong>
                <Button variant="dark" className="rounded-circle" href={opcion.ruta}>
                  <ArrowRight size={20} />
                </Button>
              </div>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
}

export default HomePageAdmin;
