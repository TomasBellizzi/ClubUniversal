import React, { useState, useEffect } from "react";
import { Navbar, Nav, NavDropdown, Image, Container } from "react-bootstrap";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logoUniversal from "../assets/logoUniversal.png";
import { useAuth } from "../hooks/useAuth";
import { clearAuth, getRole, getUser } from "../helpers/auth";

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { role, logout } = useAuth();

  const [fotoPerfil, setFotoPerfil] = useState(logoUniversal);
  const [rol, setRol] = useState(null);

  useEffect(() => {
    const usuario = getUser();
    setRol(getRole() || usuario?.role || usuario?.rol || role || null);
  }, [role]);

  const actualizarFoto = () => {
    const usuarioStr = localStorage.getItem("usuario");
    if (usuarioStr) {
      const usuario = JSON.parse(usuarioStr);
      const fotoPath = usuario?.socio?.fotoCarnet;
      setFotoPerfil(fotoPath || logoUniversal);
    } else {
      setFotoPerfil(logoUniversal);
    }
  };

  useEffect(() => {
    actualizarFoto();
    window.addEventListener("profileUpdated", actualizarFoto);
    return () => window.removeEventListener("profileUpdated", actualizarFoto);
  }, []);

  const handleInicio = () => {
    if (rol === "SOCIO") navigate("/inicioSocio");
    else navigate("/inicio");
  };

  const handleLogout = () => {
    logout?.();
    clearAuth();
    navigate("/");
  };

  const enLogin = location.pathname === "/";

  return (
    <Navbar className="navbar-custom" expand="lg" collapseOnSelect>
      <Container fluid>
        <Navbar.Brand
          className="d-flex align-items-center"
          onClick={() => {
            if (!enLogin) handleInicio();
          }}
          style={{ cursor: enLogin ? "default" : "pointer" }}
        >
          <Image src={logoUniversal} height="70" className="me-2" />
          <span className="d-none d-lg-inline">
            Asociación Cultural y Deportiva Universal
          </span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto gap-3 align-items-center">
            {rol === "SOCIO" && !enLogin && (
              <>
                <Nav.Link as={Link} to="/perfil">
                  Ver mi perfil
                </Nav.Link>
              </>
            )}

            {rol === "ADMINISTRATIVO" && !enLogin && (
              <>
                <Nav.Link as={Link} to="/perfil">
                  Ver mi perfil
                </Nav.Link>
              </>
            )}

            {!enLogin && (
              <NavDropdown
                title={
                  <Image
                    src={fotoPerfil}
                    alt="Perfil"
                    roundedCircle
                    style={{ width: "40px", height: "40px", objectFit: "cover" }}
                  />
                }
                id="basic-nav-dropdown"
                align="end"
              >
                <NavDropdown.Item
                  onClick={handleLogout}
                  className="text-danger fw-bold"
                >
                  Cerrar Sesión
                </NavDropdown.Item>
              </NavDropdown>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Header;
