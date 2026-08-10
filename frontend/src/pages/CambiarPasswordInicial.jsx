import React, { useState } from "react";
import { Alert, Button, Card, Col, Container, Form, InputGroup, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Header from "../components/HeaderIni";
import { getToken } from "../helpers/auth";
import { useAuth } from "../hooks/useAuth";

function CambiarPasswordInicial() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Las contrasenas no coinciden.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/change-initial-password`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({ newPassword, confirmPassword }),
        }
      );

      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.message || "No se pudo cambiar la contrasena.");

      logout();
      alert("Contrasena actualizada. Inicia sesion nuevamente.");
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "No se pudo cambiar la contrasena.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <Container fluid className="login-page px-3">
        <Row className="justify-content-center mt-5 mx-0">
          <Col xs={12} sm={10} md={8} lg={6} className="px-0 px-sm-2">
            <Card className="p-4 shadow" style={{ borderRadius: "15px", borderColor: "#198754" }}>
              <h3 className="text-center mb-3 text-success">Cambiar contrasena</h3>
              <p className="text-muted text-center mb-4">
                Por seguridad, cambia la contrasena inicial antes de continuar.
              </p>

              {error && <Alert variant="danger">{error}</Alert>}

              <Form noValidate onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Nueva contrasena</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type={mostrarPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      minLength={8}
                      required
                    />
                    <Button
                      variant="outline-secondary"
                      type="button"
                      onClick={() => setMostrarPassword((value) => !value)}
                    >
                      {mostrarPassword ? "Ocultar" : "Mostrar"}
                    </Button>
                  </InputGroup>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Repetir contrasena</Form.Label>
                  <Form.Control
                    type={mostrarPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    minLength={8}
                    required
                  />
                </Form.Group>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-100"
                  style={{ backgroundColor: "#198754" }}
                >
                  {loading ? "Guardando..." : "Guardar contrasena"}
                </Button>
              </Form>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default CambiarPasswordInicial;
