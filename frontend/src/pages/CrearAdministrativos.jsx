import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Form, Col, Row, Card, InputGroup } from 'react-bootstrap';
import Header from '../components/Header';
import axios from 'axios';

function CrearAdministrativo() {
  const [validated, setValidated] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [dni, setDni] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const BACKURL = import.meta.env.VITE_API_URL
  const token = localStorage.getItem("token");

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;

    if (form.checkValidity() === false) {
      event.stopPropagation();
      setValidated(true);
      return;
    }

    try {
      await axios.post(`${BACKURL}/api/auth/register/administrativo`, {
        email,
        password,
        role: 'ADMINISTRATIVO',
        administrativo: {
          nombre,
          apellido,
          dni,
        },
      }, { headers: { Authorization: `Bearer ${token}` } });

      setSuccessMsg('✅ Administrativo registrado con éxito');
      setErrorMsg('');

      // limpiar formulario
      setNombre('');
      setApellido('');
      setDni('');
      setEmail('');
      setPassword('');
      setValidated(false);
    } catch (error) {
      console.error(error);
      setErrorMsg(error.response?.data?.message || '❌ Error al registrar administrativo');
      setSuccessMsg('');
    }
  };

  return (
    <>
      <Header />
      <Row className="justify-content-center mt-5">
        <Col xs={12} sm={10} md={8} lg={6}>
          <Card className="p-4 shadow" style={{ borderRadius: '15px' }}>
            <h3 className="text-center mb-4 text-success">Registrar Administrativo</h3>

            {errorMsg && (
              <div className="alert alert-danger" role="alert">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="alert alert-success" role="alert">
                {successMsg}
              </div>
            )}

            <Form noValidate validated={validated} onSubmit={handleSubmit}>
              <Row className="mb-3">
                <Form.Group as={Col} md="6" controlId="validationNombre">
                  <Form.Label>Nombre</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    placeholder="Ingrese el nombre"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                  />
                  <Form.Control.Feedback type="invalid">
                    Debe ingresar un nombre
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group as={Col} md="6" controlId="validationApellido">
                  <Form.Label>Apellido</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    placeholder="Ingrese el apellido"
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                  />
                  <Form.Control.Feedback type="invalid">
                    Debe ingresar un apellido
                  </Form.Control.Feedback>
                </Form.Group>
              </Row>

              <Row className="mb-3">
                <Form.Group as={Col} md="6" controlId="validationDNI">
                  <Form.Label>DNI</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    placeholder="Ingrese el DNI"
                    value={dni}
                    onChange={(e) => setDni(e.target.value)}
                  />
                  <Form.Control.Feedback type="invalid">
                    Debe ingresar un DNI válido
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group as={Col} md="6" controlId="validationEmail">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    required
                    type="email"
                    placeholder="Ingrese el email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Form.Control.Feedback type="invalid">
                    Debe ingresar un email válido
                  </Form.Control.Feedback>
                </Form.Group>
              </Row>

              <Row className="mb-3">
                <Form.Group as={Col} md="12" controlId="validationPassword">
                  <Form.Label>Contraseña</Form.Label>
                  <InputGroup>
                    <Form.Control
                      required
                      type={mostrarPassword ? 'text' : 'password'}
                      placeholder="Defina una contraseña"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button
                      variant="outline-secondary"
                      type="button"
                      onClick={() => setMostrarPassword(!mostrarPassword)}
                    >
                      {mostrarPassword ? 'Ocultar' : 'Mostrar'}
                    </Button>
                    <Form.Control.Feedback type="invalid">
                      Debe crear una contraseña
                    </Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>
              </Row>

              <Button type="submit" className="w-100 btn-success">
                Registrar Administrativo
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>
    </>
  );
}

export default CrearAdministrativo;
