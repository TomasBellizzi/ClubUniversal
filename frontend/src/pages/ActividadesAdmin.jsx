import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Modal, Form, Card, Spinner, Alert, } from "react-bootstrap";
import { PlusCircle, Pencil, PersonPlus, InfoCircle, } from "react-bootstrap-icons";
import Header from "../components/Header";
import axios from "axios";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { ACTIVIDAD_MONTO_MAXIMO, actividadSchema } from "../validations/actividadSchema";

const formatCurrency = (value) =>
  Number(value).toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  });

const getErrorMessage = (err, fallback) =>
  err?.response?.data?.error || err?.response?.data?.message || fallback;

function ActividadesAdmin() {
  const [actividades, setActividades] = useState([]);
  const [socios, setSocios] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalEditar, setMostrarModalEditar] = useState(false);
  const [mostrarModalInscribir, setMostrarModalInscribir] = useState(false);
  const [mostrarModalDetalles, setMostrarModalDetalles] = useState(false);
  const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);

  const [actividadSeleccionada, setActividadSeleccionada] = useState(null);
  const [socioSeleccionado, setSocioSeleccionado] = useState(null);
  const [sociosActividad, setSociosActividad] = useState([]);

  const [mostrarInactivas, setMostrarInactivas] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [accionActividadId, setAccionActividadId] = useState(null);

  const token = localStorage.getItem("token");

  const BACKURL = import.meta.env.VITE_API_URL

  // Obtener rol desde localStorage
  const usuarioStr = localStorage.getItem("usuario");
  const rol = usuarioStr
    ? JSON.parse(usuarioStr)?.rol || JSON.parse(usuarioStr)?.role || null
    : null;
  const puedeEliminarActividades = ["ADMIN", "ADMINISTRATIVO"].includes(rol);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(actividadSchema),
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resActividades, resSocios] = await Promise.all([
          axios.get(`${BACKURL}/api/actividades`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${BACKURL}/api/socios`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setActividades(resActividades.data.actividades || []);
        setSocios(resSocios.data.socios || []);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar las actividades o socios.");
      } finally {
        setCargando(false);
      }
    };
    fetchData();
  }, [token]);

  // Agregar actividad
  const onSubmitAgregar = async (data) => {
    try {
      setError(null);
      const response = await axios.post(
        `${BACKURL}/api/actividades`,
        {
          nombre: data.nombre.trim(),
          monto: Number(data.monto),
          activo: true,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const nueva = response?.data?.actividad;
      if (nueva) setActividades((prev) => [...prev, nueva]);

      reset();
      setMostrarModal(false);
    } catch (err) {
      console.error(err);
      setError(getErrorMessage(err, "No se pudo crear la actividad."));
    }
  };

  // Editar actividad
  const onSubmitEditar = async (data) => {
    if (!actividadSeleccionada) return;
    try {
      setError(null);
      const res = await axios.put(
        `${BACKURL}/api/actividades/${actividadSeleccionada.id}`,
        {
          nombre: data.nombre.trim(),
          monto: Number(data.monto),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setActividades((prev) =>
        prev.map((a) =>
          a.id === actividadSeleccionada.id ? res.data.actividad : a
        )
      );

      setMostrarModalEditar(false);
      reset();
    } catch (err) {
      console.error(err);
      setError(getErrorMessage(err, "No se pudo editar la actividad."));
    }
  };

  // 🔻 Dar de baja
  const handleDarDeBaja = async (id) => {
    try {
      setError(null);
      setAccionActividadId(id);
      const res = await axios.put(`${BACKURL}/api/actividades/${id}`,
        { activo: false },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const actualizada = res.data.actividad;
      setActividades((prev) =>
        prev.map((a) => (a.id === id ? actualizada ?? { ...a, activo: false } : a))
      );
    } catch (err) {
      console.error(err);
      setError(getErrorMessage(err, "No se pudo dar de baja la actividad."));
    } finally {
      setAccionActividadId(null);
    }
  };

  // Dar de alta
  const handleDarDeAlta = async (id) => {
    try {
      setError(null);
      setAccionActividadId(id);
      const res = await axios.put(
        `${BACKURL}/api/actividades/${id}`,
        { activo: true },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const actualizada = res.data.actividad;
      setActividades((prev) =>
        prev.map((a) => (a.id === id ? actualizada ?? { ...a, activo: true } : a))
      );
    } catch (err) {
      console.error(err);
      setError(getErrorMessage(err, "No se pudo dar de alta la actividad."));
    } finally {
      setAccionActividadId(null);
    }
  };

  // Eliminar de forma definitiva
  const handleEliminarActividad = async () => {
    if (!actividadSeleccionada) return;
    try {
      setError(null);
      setAccionActividadId(actividadSeleccionada.id);
      await axios.delete(
       `${BACKURL}/api/actividades/${actividadSeleccionada.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setActividades((prev) =>
        prev.filter((a) => a.id !== actividadSeleccionada.id)
      );
      setMostrarModalEliminar(false);
      setActividadSeleccionada(null);
    } catch (err) {
      console.error(err);
      setError(getErrorMessage(err, "No se pudo eliminar la actividad."));
    } finally {
      setAccionActividadId(null);
    }
  };

  // Inscribir socio
  const handleInscribirSocio = async () => {
    if (!actividadSeleccionada || !socioSeleccionado) return;
    try {
      await axios.post(
        `${BACKURL}/api/actividadSocio`,
        {
          actividadId: actividadSeleccionada.id,
          socioId: socioSeleccionado,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMostrarModalInscribir(false);
      setSocioSeleccionado(null);
      if (mostrarModalDetalles && actividadSeleccionada) {
        await handleVerDetalles(actividadSeleccionada);
      }
    } catch (err) {
      console.error(err);
      alert("Error al inscribir socio");
    }
  };

  // Ver detalles (socios)
  const handleVerDetalles = async (actividad) => {
    try {
      setActividadSeleccionada(actividad);
      const res = await axios.get(
        `${BACKURL}/api/actividadSocio/actividad/${actividad.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const lista =
        res.data.actividadSocios || res.data.actividadesSocio || [];
      setSociosActividad(lista);
      setMostrarModalDetalles(true);
    } catch (err) {
      console.error(err);
      alert("No se pudieron cargar los socios de la actividad");
    }
  };

  const actividadesFiltradas = actividades.filter((a) =>
    mostrarInactivas ? !a.activo : a.activo
  );

  return (
    <>
      <Header />
      <Container className="mt-5 d-flex justify-content-center">
        <div
          className="w-100 p-4"
          style={{
            maxWidth: "1000px",
            backgroundColor: "white",
            borderRadius: "15px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          {/* Encabezado */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 style={{ color: "#198754", fontWeight: "700" }}>Actividades</h2>
            <div className="d-flex gap-2">
              <Button
                variant={mostrarInactivas ? "outline-secondary" : "secondary"}
                onClick={() => setMostrarInactivas(false)}
              >
                Ver activas
              </Button>
              <Button
                variant={mostrarInactivas ? "secondary" : "outline-secondary"}
                onClick={() => setMostrarInactivas(true)}
              >
                Ver inactivas
              </Button>
              <Button
                variant="success"
                className="d-flex align-items-center"
                onClick={() => {
                  reset();
                  setMostrarModal(true);
                }}
              >
                <PlusCircle className="me-2" /> Agregar
              </Button>
            </div>
          </div>

          {/* Listado */}
          {cargando ? (
            <div className="d-flex justify-content-center py-5">
              <Spinner animation="border" />
            </div>
          ) : error ? (
            <Alert variant="danger">{error}</Alert>
          ) : actividadesFiltradas.length === 0 ? (
            <Alert variant="info">
              {mostrarInactivas
                ? "No hay actividades inactivas."
                : "No hay actividades activas."}
            </Alert>
          ) : (
            <Row className="gy-4">
              {actividadesFiltradas.map((actividad) => (
                <Col xs={12} key={actividad.id}>
                  <Card className="shadow-sm border-0 rounded-4 p-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="fw-semibold fs-5">
                        {actividad.nombre}
                      </span>
                      <div className="d-flex flex-wrap gap-2">
                        <Button
                          variant="outline-info"
                          onClick={() => handleVerDetalles(actividad)}
                        >
                          <InfoCircle /> Socios
                        </Button>

                        {actividad.activo ? (
                          <>
                            <Button
                              variant="outline-success"
                              className="d-flex align-items-center gap-1"
                              onClick={() => {
                                setActividadSeleccionada(actividad);
                                setValue("nombre", actividad.nombre);
                                setValue("monto", actividad.monto);
                                setMostrarModalEditar(true);
                              }}
                            >
                              <Pencil /> Editar
                            </Button>

                            <Button
                              variant="outline-primary"
                              className="d-flex align-items-center gap-1"
                              onClick={() => {
                                setActividadSeleccionada(actividad);
                                setMostrarModalInscribir(true);
                              }}
                            >
                              <PersonPlus /> Inscribir
                            </Button>

                            <Button
                              variant="outline-warning"
                              className="d-flex align-items-center gap-1"
                              onClick={() => handleDarDeBaja(actividad.id)}
                              disabled={accionActividadId === actividad.id}
                            >
                              <i className="bi bi-dash-circle"></i> Dar de baja
                            </Button>

                            {puedeEliminarActividades && (
                              <Button
                                variant="outline-danger"
                                className="d-flex align-items-center gap-1"
                                onClick={() => {
                                  setActividadSeleccionada(actividad);
                                  setMostrarModalEliminar(true);
                                }}
                                disabled={accionActividadId === actividad.id}
                              >
                                <i className="bi bi-trash3-fill"></i> Eliminar
                              </Button>
                            )}
                          </>
                        ) : (
                          <>
                            <Button
                              variant="success"
                              className="d-flex align-items-center gap-1"
                              onClick={() => handleDarDeAlta(actividad.id)}
                              disabled={accionActividadId === actividad.id}
                            >
                              <i className="bi bi-arrow-up-circle"></i> Dar de alta
                            </Button>

                            {puedeEliminarActividades && (
                              <Button
                                variant="outline-danger"
                                className="d-flex align-items-center gap-1"
                                onClick={() => {
                                  setActividadSeleccionada(actividad);
                                  setMostrarModalEliminar(true);
                                }}
                                disabled={accionActividadId === actividad.id}
                              >
                                <i className="bi bi-trash3-fill"></i> Eliminar
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          )}

          {/* Modal eliminar */}
          <Modal
            show={mostrarModalEliminar}
            onHide={() => setMostrarModalEliminar(false)}
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title>Eliminar actividad</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>
                ¿Seguro que querés eliminar la actividad{" "}
                <strong>{actividadSeleccionada?.nombre}</strong>?
                <br />
                Esta acción no se puede deshacer.
              </p>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setMostrarModalEliminar(false)}>
                Cancelar
              </Button>
              <Button
                variant="danger"
                onClick={handleEliminarActividad}
                disabled={accionActividadId === actividadSeleccionada?.id}
              >
                {accionActividadId === actividadSeleccionada?.id ? "Eliminando..." : "Eliminar"}
              </Button>
            </Modal.Footer>
          </Modal>

          {/* Modal crear */}
          <Modal show={mostrarModal} onHide={() => setMostrarModal(false)} centered>
            <Modal.Header closeButton>
              <Modal.Title>Agregar actividad</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form onSubmit={handleSubmit(onSubmitAgregar)}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre</Form.Label>
                  <Form.Control {...register("nombre")} />
                  {errors.nombre && (
                    <p className="text-danger">{errors.nombre.message}</p>
                  )}
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Monto</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    max={ACTIVIDAD_MONTO_MAXIMO}
                    step="1"
                    {...register("monto")}
                  />
                  {errors.monto && (
                    <p className="text-danger">{errors.monto.message}</p>
                  )}
                  <Form.Text muted>
                    Monto maximo: {formatCurrency(ACTIVIDAD_MONTO_MAXIMO)}
                  </Form.Text>
                </Form.Group>
                <Button variant="success" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creando..." : "Confirmar"}
                </Button>
              </Form>
            </Modal.Body>
          </Modal>

          {/* Modal editar */}
          <Modal
            show={mostrarModalEditar}
            onHide={() => setMostrarModalEditar(false)}
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title>Editar actividad</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form onSubmit={handleSubmit(onSubmitEditar)}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre</Form.Label>
                  <Form.Control {...register("nombre")} />
                  {errors.nombre && (
                    <p className="text-danger">{errors.nombre.message}</p>
                  )}
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Monto</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    max={ACTIVIDAD_MONTO_MAXIMO}
                    step="1"
                    {...register("monto")}
                  />
                  {errors.monto && (
                    <p className="text-danger">{errors.monto.message}</p>
                  )}
                  <Form.Text muted>
                    Monto maximo: {formatCurrency(ACTIVIDAD_MONTO_MAXIMO)}
                  </Form.Text>
                </Form.Group>
                <Button variant="success" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Guardando..." : "Guardar cambios"}
                </Button>
              </Form>
            </Modal.Body>
          </Modal>

          {/* Modal inscribir socio */}
          <Modal
            show={mostrarModalInscribir}
            onHide={() => setMostrarModalInscribir(false)}
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title>Inscribir socio</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form.Group>
                <Form.Label>Seleccionar socio</Form.Label>
                <Form.Select
                  value={socioSeleccionado || ""}
                  onChange={(e) => setSocioSeleccionado(Number(e.target.value))}
                >
                  <option value="">Seleccione un socio</option>
                  {socios.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nombre} {s.apellido}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="success" onClick={handleInscribirSocio}>
                Inscribir
              </Button>
            </Modal.Footer>
          </Modal>

          {/* Modal socios inscriptos */}
          <Modal
            show={mostrarModalDetalles}
            onHide={() => setMostrarModalDetalles(false)}
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title>Socios inscriptos</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {sociosActividad.length === 0 ? (
                <p>No hay socios inscriptos.</p>
              ) : (
                <ul>
                  {sociosActividad.map((as) => {
                    const socio = as.socio || as.Socio;
                    return (
                      <li key={as.id}>
                        {socio
                          ? `${socio.nombre} ${socio.apellido}`
                          : "Socio no disponible"}
                      </li>
                    );
                  })}
                </ul>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => setMostrarModalDetalles(false)}
              >
                Cerrar
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      </Container>
    </>
  );
}

export default ActividadesAdmin;
