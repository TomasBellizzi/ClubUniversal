import React, { useCallback, useEffect, useState } from "react";
import { Alert, Badge, Button, Card, Col, Form, Modal, Row } from "react-bootstrap";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Header from "../components/Header";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../styles/SocioEntradas.css";
import fondo from "../assets/fondo.jpg";
import { emailService } from "../service/emailService";
import { entradaSchema } from "../validations/entradasSchema";

const MP_PENDING_KEY = "mercadoPagoEntradaPendiente";
const DEFAULT_API_BASE_URL = import.meta.env.DEV ? "http://localhost:3000" : "";
const API_BASE_URL = (import.meta.env.VITE_API_URL || DEFAULT_API_BASE_URL).replace(/\/$/, "");

function buildApiUrl(path) {
  if (!API_BASE_URL) return `/api${path}`;
  return `${API_BASE_URL}/api${path}`;
}

export default function SocioEntradas() {
  const [eventos, setEventos] = useState([]);
  const [misEntradas, setMisEntradas] = useState([]);
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filtroEntradas, setFiltroEntradas] = useState("todas");
  const [usuario, setUsuario] = useState(null);
  const location = useLocation();

  const token = localStorage.getItem("token");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm({
    resolver: yupResolver(entradaSchema),
    defaultValues: { cantidad: 1 },
  });

  const fetchEventos = useCallback(async () => {
    try {
      const res = await fetch(buildApiUrl("/eventos"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error al cargar eventos");
      const data = await res.json();
      setEventos(Array.isArray(data?.eventos) ? data.eventos : Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  }, [token]);

  const fetchMisEntradas = useCallback(async (socioId) => {
    try {
      const res = await fetch(buildApiUrl(`/entradas?socioId=${socioId}`), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error al cargar entradas");
      const data = await res.json();
      setMisEntradas(Array.isArray(data?.entradas) ? data.entradas : Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  }, [token]);

  const handlePagoAprobado = useCallback(async (entradaId) => {
    try {
      const usuarioData = JSON.parse(localStorage.getItem("usuario"));
      if (!usuarioData?.socio) return;

      await fetchMisEntradas(usuarioData.socio.id);

      const res = await fetch(buildApiUrl(`/entradas/${entradaId}`), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("No se pudo recuperar la entrada pagada");

      const data = await res.json();
      const entrada = data.entrada;
      const emailKey = `emailEntradaMercadoPago:${entradaId}`;

      if (!localStorage.getItem(emailKey)) {
        const emailResult = await emailService.enviarEmailCompra(
          entrada,
          usuarioData,
          entrada.evento
        );

        if (emailResult.success) {
          localStorage.setItem(emailKey, "sent");
        } else {
          console.warn("Error email:", emailResult.message);
        }
      }

      alert(`Pago aprobado. Entrada #${entrada.id} registrada correctamente.`);
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  }, [fetchMisEntradas, token]);

  const conciliarPagoPendiente = useCallback(async () => {
    const pendingRaw = localStorage.getItem(MP_PENDING_KEY);
    if (!pendingRaw) return;

    try {
      const pending = JSON.parse(pendingRaw);
      if (!pending?.entradaId) return;

      const res = await axios.post(
        buildApiUrl(`/eventos/mercadopago/entradas/${pending.entradaId}/conciliar`),
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const entrada = res.data?.entrada;
      if (entrada?.estado === "PAGADA") {
        localStorage.removeItem(MP_PENDING_KEY);
        await handlePagoAprobado(entrada.id);
      } else if (entrada?.estado === "CANCELADA") {
        localStorage.removeItem(MP_PENDING_KEY);
        alert("El pago fue rechazado por Mercado Pago.");
      }
    } catch (error) {
      console.error(error);
    }
  }, [handlePagoAprobado, token]);

  useEffect(() => {
    const usuarioData = JSON.parse(localStorage.getItem("usuario"));
    if (usuarioData?.socio) {
      setUsuario(usuarioData);
      fetchMisEntradas(usuarioData.socio.id);
    }
    fetchEventos();
    conciliarPagoPendiente();
  }, [conciliarPagoPendiente, fetchEventos, fetchMisEntradas]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const mpStatus = params.get("mpStatus");
    const entradaId = params.get("entradaId");

    if (!mpStatus) return;

    if (mpStatus === "success" && entradaId) {
      handlePagoAprobado(Number(entradaId));
    } else if (mpStatus === "pending") {
      alert("El pago quedo pendiente de confirmacion en Mercado Pago.");
    } else if (mpStatus === "failure" || mpStatus === "error") {
      alert("No se pudo completar el pago con Mercado Pago.");
    }

    window.history.replaceState({}, "", window.location.pathname);
  }, [handlePagoAprobado, location.search]);

  const handleAbrirCompra = (evento) => {
    setEventoSeleccionado(evento);
    reset({ cantidad: 1 });
    setShowModal(true);
  };

  const onSubmit = async (data) => {
    if (!eventoSeleccionado || !usuario?.socio) return;

    setLoading(true);
    try {
      const res = await axios.post(
        buildApiUrl(`/eventos/${eventoSeleccionado.id}/mercadopago/preferencia`),
        { cantidad: Number(data.cantidad) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const redirectUrl = res.data?.redirectUrl;
      if (!redirectUrl) throw new Error("Mercado Pago no devolvio una URL de pago");

      localStorage.setItem(
        MP_PENDING_KEY,
        JSON.stringify({
          entradaId: res.data?.entrada?.id,
          preferenceId: res.data?.preferenceId,
          createdAt: Date.now(),
        })
      );

      window.location.href = redirectUrl;
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.error || error.response?.data?.message || error.message);
      setLoading(false);
    }
  };

  const formatearFecha = (fecha) =>
    new Date(fecha).toLocaleDateString("es-AR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const getDatePart = (fechaStr) => {
    if (!fechaStr) return "";
    return String(fechaStr).split("T")[0];
  };

  const esFuturo = (fechaStr) => {
    const fechaEvento = getDatePart(fechaStr);
    const hoy = new Date().toISOString().split("T")[0];
    return fechaEvento >= hoy;
  };

  const eventosDisponibles = eventos.filter((e) => {
    const entradasVendidas = Number(e.entradasVendidas ?? 0);
    const capacidad = Number(e.capacidad ?? 0);
    return esFuturo(e.fecha) && capacidad > 0 && entradasVendidas < capacidad;
  });

  const entradasFiltradas = misEntradas.filter((entrada) => {
    const fechaEvento = entrada.evento?.fecha || entrada.fecha;
    const enFuturo = esFuturo(fechaEvento);

    switch (filtroEntradas) {
      case "activas":
        return enFuturo;
      case "pasadas":
        return !enFuturo;
      default:
        return true;
    }
  });

  const getEstadoBadge = (entrada) => {
    if (entrada.estado === "CANCELADA") return <Badge bg="danger">Cancelada</Badge>;
    return esFuturo(entrada.evento?.fecha || entrada.fecha)
      ? <Badge bg="success">Activa</Badge>
      : <Badge bg="secondary">Pasada</Badge>;
  };

  return (
    <>
      <Header />
      <div
        className="background-container"
        style={{
          backgroundImage: `url(${fondo})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          minHeight: "100vh",
          width: "100%",
          paddingTop: "2rem",
          paddingLeft: "1rem",
          paddingRight: "1rem",
        }}
      >
        <div className="contenido-cuadro container">
          {!usuario ? (
            <Alert variant="warning">
              Debes iniciar sesion para ver tus entradas.
            </Alert>
          ) : (
            <>
              <section className="mb-5">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4 className="mb-0">
                    <i className="bi bi-ticket-detailed me-2 text-success"></i>
                    Mis Entradas
                  </h4>
                  <div className="btn-group" role="group">
                    <Button
                      variant={filtroEntradas === "todas" ? "success" : "outline-success"}
                      size="sm"
                      onClick={() => setFiltroEntradas("todas")}
                    >
                      Todas
                    </Button>
                    <Button
                      variant={filtroEntradas === "activas" ? "success" : "outline-success"}
                      size="sm"
                      onClick={() => setFiltroEntradas("activas")}
                    >
                      Activas
                    </Button>
                    <Button
                      variant={filtroEntradas === "pasadas" ? "success" : "outline-success"}
                      size="sm"
                      onClick={() => setFiltroEntradas("pasadas")}
                    >
                      Pasadas
                    </Button>
                  </div>
                </div>

                {entradasFiltradas.length === 0 ? (
                  <Alert variant="info" className="text-center">
                    <i className="bi bi-info-circle me-2"></i>
                    No tenes entradas.
                  </Alert>
                ) : (
                  <Row className="g-3">
                    {entradasFiltradas.map((entrada) => (
                      <Col key={entrada.id} xs={12} md={6} lg={4}>
                        <Card className="h-100 entrada-card shadow-sm">
                          <Card.Body className="d-flex flex-column">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <h6 className="card-title mb-0">
                                {entrada.evento.nombre}
                              </h6>
                              {getEstadoBadge(entrada)}
                            </div>
                            <div className="mb-3">
                              <small className="text-muted d-block">
                                <i className="bi bi-calendar3 me-1"></i>
                                {formatearFecha(entrada.evento.fecha)}
                              </small>
                              {entrada.evento?.horaInicio && entrada.evento?.horaFin && (
                                <small className="text-muted d-block">
                                  <i className="bi bi-clock me-1"></i>
                                  {entrada.evento.horaInicio}hs a {entrada.evento.horaFin}hs
                                </small>
                              )}
                              <small className="text-muted d-block">
                                <i className="bi bi-geo-alt me-1"></i>
                                {entrada.evento?.actividad
                                  ? `${entrada.evento.actividad.nombre}${entrada.evento.ubicacion ? ` - ${entrada.evento.ubicacion}` : ""}`
                                  : "Sin actividad asignada"}
                              </small>
                            </div>
                            <div className="mt-auto">
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <span className="fw-bold">${entrada.total}</span>
                                <small className="text-muted">
                                  x{entrada.cantidad} - {entrada.formaDePago}
                                </small>
                              </div>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                )}
              </section>

              <section>
                <h4 className="mb-4">
                  <i className="bi bi-calendar-event me-2 text-success"></i>
                  Proximos Eventos
                </h4>
                <Row className="g-3">
                  {eventosDisponibles.map((evento) => (
                    <Col key={evento.id} xs={12} md={6} lg={4}>
                      <Card className="h-100 evento-card shadow-sm">
                        <Card.Body className="d-flex flex-column">
                          <h6 className="mb-2">{evento.nombre}</h6>
                          <small className="text-muted d-block">
                            <i className="bi bi-calendar3 me-1"></i>
                            {formatearFecha(evento.fecha)}
                          </small>
                          <small className="text-muted d-block">
                            <i className="bi bi-clock me-1"></i>
                            {evento.horaInicio}hs a {evento.horaFin}hs
                          </small>
                          <small className="text-muted d-block">
                            <i className="bi bi-geo-alt me-1"></i>
                            {evento.actividad
                              ? `${evento.actividad.nombre}${evento.ubicacion ? ` - ${evento.ubicacion}` : ""}`
                              : "Sin actividad asignada"}
                          </small>
                          <small className="text-muted d-block">
                            <i className="bi bi-people me-1"></i>
                            Entradas disponibles:{" "}
                            {Number(evento.capacidad ?? 0) - Number(evento.entradasVendidas ?? 0)}
                          </small>
                          {evento.descripcion && (
                            <small className="text-muted d-block mt-2">
                              <strong>Descripcion:</strong> {evento.descripcion}
                            </small>
                          )}
                          <Button
                            variant="success"
                            className="mt-auto"
                            onClick={() => handleAbrirCompra(evento)}
                          >
                            Comprar
                          </Button>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </section>
            </>
          )}
        </div>

        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
          <Modal.Header closeButton className="bg-success text-white">
            <Modal.Title>Comprar Entrada</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Modal.Body>
              {eventoSeleccionado && (
                <>
                  <Form.Group className="mb-3">
                    <Form.Label>Cantidad</Form.Label>
                    <Form.Control type="number" min={1} {...register("cantidad")} />
                    {errors.cantidad && (
                      <small className="text-danger">{errors.cantidad.message}</small>
                    )}
                  </Form.Group>

                  <div className="mb-3 p-2 bg-light border rounded">
                    <strong>Monto a pagar:</strong>
                    <p className="mb-0">
                      ${eventoSeleccionado.precioEntrada} x {watch("cantidad") || 1} = $
                      {(watch("cantidad") || 1) * eventoSeleccionado.precioEntrada}
                    </p>
                  </div>

                  <Alert variant="info" className="mb-0">
                    Al confirmar, vas a ser redirigido a Mercado Pago para completar el pago con una cuenta de prueba.
                  </Alert>
                </>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => setShowModal(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                variant="success"
                type="submit"
                disabled={loading || isSubmitting}
              >
                {loading ? "Redirigiendo..." : "Pagar con Mercado Pago"}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      </div>
    </>
  );
}
