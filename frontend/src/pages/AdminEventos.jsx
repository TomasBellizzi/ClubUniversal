import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Badge, Row, Col, Card, ProgressBar } from 'react-bootstrap';
import '../styles/SocioEntradas.css';
import '../styles/HomePage.css';
import Header from '../components/Header';
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { eventoSchema } from '../validations/eventosSchema';

export default function AdminEventos() {
  const [actividades, setActividades] = useState([]);
  const [actividadSeleccionada, setActividadSeleccionada] = useState(""); // string en el select

  const [eventos, setEventos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [modoAgregar, setModoAgregar] = useState(false);
  const [modoEditar, setModoEditar] = useState(false);
  const [mostrarDetalle, setMostrarDetalle] = useState(false);
  const [mostrarVenta, setMostrarVenta] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [dniSocio, setDniSocio] = useState('');
  const [formaPago, setFormaPago] = useState('EFECTIVO');
  const [comprobanteFile, setComprobanteFile] = useState(null);

  const token = localStorage.getItem("token");
  const usuarioStr = localStorage.getItem("usuario");
  const usuario = usuarioStr ? JSON.parse(usuarioStr) : null;
  const role = usuario?.rol || usuario?.role || null;
  const BACKURL = import.meta.env.VITE_API_URL

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(eventoSchema),
  });

  // ====== Fetchers ======
  const fetchEventos = async () => {
    try {
      const res = await fetch(`${BACKURL}/api/eventos`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error al cargar eventos");
      const data = await res.json();
      setEventos(Array.isArray(data.eventos) ? data.eventos : []);
    } catch (error) {
      console.error(error);
      alert("No se pudieron cargar los eventos desde el servidor");
    }
  };

  const fetchActividades = async () => {
    try {
      const res = await fetch(`${BACKURL}/api/actividades`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setActividades(data.data || data.actividades || []);
    } catch (error) {
      console.error("Error cargando actividades:", error);
    }
  };

  useEffect(() => {
    fetchEventos();
    fetchActividades();
  }, []);

  // ====== Helpers ======
  const esFuturo = (fechaStr) => {
    const hoy = new Date().toISOString().split("T")[0];
    return fechaStr >= hoy;
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "";
    const datePart = fecha.toString().split("T")[0];
    const [year, month, day] = datePart.split("-").map(Number);
    const dateObj = new Date(year, month - 1, day);
    return dateObj.toLocaleDateString("es-AR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // ====== Ventas ======
  const handleConfirmarCompra = async () => {
    if (!eventoSeleccionado?.id) {
      alert("No se ha seleccionado un evento");
      return;
    }
    if (!cantidad || cantidad <= 0) {
      alert("Cantidad de entradas inválida");
      return;
    }
    try {
      let socioId = null;
      if (dniSocio.trim() !== "") {
        const response = await fetch(
          `${BACKURL}/api/socios/dni/${dniSocio}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!response.ok) throw new Error("Socio no encontrado");
        const socio = await response.json();
        socioId = socio.id;
      }
      const formData = new FormData();
      formData.append("eventoId", String(eventoSeleccionado.id));
      formData.append("cantidad", String(cantidad));
      formData.append("formaDePago", formaPago);
      if (socioId) formData.append("socioId", String(socioId));
      if (formaPago === "CBU" && comprobanteFile) {
        formData.append("comprobante", comprobanteFile);
      }
      const res = await fetch(
        `${BACKURL}/api/eventos/${eventoSeleccionado.id}/venta`,
        { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: formData }
      );
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error al registrar la venta");
      }
      alert("Venta registrada correctamente");
      setMostrarVenta(false);
      setCantidad(1);
      setDniSocio("");
      setFormaPago("EFECTIVO");
      setComprobanteFile(null);
      await fetchEventos();
    } catch (error) {
      console.error("Error al registrar venta:", error);
      alert(`Error al registrar venta: ${error.message}`);
    }
  };

  // ====== CRUD Eventos ======
  const handleEliminarEvento = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este evento?")) return;
    try {
      const res = await fetch(`${BACKURL}/api/eventos/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error al eliminar evento");
      setEventos((prev) => prev.filter((e) => e.id !== id));
    } catch (error) {
      console.error(error);
      alert("Error al eliminar el evento");
    }
  };

  const handleAgregarEvento = async (data) => {
    try {
      if (!actividadSeleccionada) {
        alert("Debe seleccionar una actividad");
        return;
      }

      const payload = {
        ...data,
        actividadId: Number(actividadSeleccionada),
      };

      const res = await fetch(`${BACKURL}/api/eventos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || result.error || "Error al crear evento");
      }

      // mejor recargar para traer relaciones y totales
      await fetchEventos();
      setShowModal(false);
      reset();
      setActividadSeleccionada("");
      alert("Evento creado correctamente!");
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  const handleGuardarEdicion = async (data) => {
    if (!eventoSeleccionado?.id) {
      alert("No se ha seleccionado un evento válido para editar");
      return;
    }
    try {
      const actividadIdNum =
        actividadSeleccionada
          ? Number(actividadSeleccionada)
          : Number(eventoSeleccionado.actividadId);

      if (!actividadIdNum) {
        alert("Debe seleccionar una actividad");
        return;
      }

      const payload = {
        ...data,
        actividadId: actividadIdNum,
      };

      const res = await fetch(
        `${BACKURL}/api/eventos/${eventoSeleccionado.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Error al editar evento");

      await fetchEventos();
      setShowModal(false);
      reset();
      setActividadSeleccionada("");
    } catch (error) {
      console.error(error);
      alert(error.message || "Error al guardar cambios");
    }
  };

  const eventosFiltrados = eventos.filter((evento) => {
    const coincideBusqueda = evento.nombre
      .toLowerCase()
      .includes(busqueda.toLowerCase());
    const esActivo = esFuturo(evento.fecha);
    const coincideEstado =
      filtroEstado === "todos" ||
      (filtroEstado === "activos" && esActivo) ||
      (filtroEstado === "completados" && !esActivo);
    return coincideBusqueda && coincideEstado;
  });

  const handleAbrirAgregar = () => {
    setModoAgregar(true);
    setModoEditar(false);
    setActividadSeleccionada("");
    reset({
      nombre: "",
      fecha: "",
      horaInicio: "",
      horaFin: "",
      capacidad: "",
      precioEntrada: "",
      descripcion: "",
      ubicacion: "",
    });
    setShowModal(true);
  };

  const handleEditarEvento = (evento) => {
    setModoEditar(true);
    setModoAgregar(false);
    setEventoSeleccionado(evento);
    // setear actividad seleccionada para editar el evento
    setActividadSeleccionada(String(evento.actividadId || ""));
    reset({
      nombre: evento.nombre,
      fecha: evento.fecha ? new Date(evento.fecha).toISOString().split("T")[0] : "",
      horaInicio: evento.horaInicio,
      horaFin: evento.horaFin,
      capacidad: evento.capacidad,
      precioEntrada: evento.precioEntrada,
      descripcion: evento.descripcion,
      ubicacion: evento.ubicacion || "",
    });
    setShowModal(true);
  };

  const handleMostrarDetalle = (evento) => {
    setEventoSeleccionado(evento);
    setMostrarDetalle(true);
    setMostrarVenta(false);
  };

  const handleMostrarVenta = (evento) => {
    setEventoSeleccionado(evento);
    setCantidad(1);
    setDniSocio("");
    setComprobanteFile(null);
    setFormaPago("EFECTIVO");
    setMostrarVenta(true);
    setMostrarDetalle(false);
  };

  const getEstadoBadge = (evento) => {
    if (!esFuturo(evento.fecha)) return <Badge bg="secondary">Completado</Badge>;
    if ((evento.entradasVendidas || 0) >= evento.capacidad)
      return <Badge bg="danger">Agotado</Badge>;
    return <Badge bg="success">Activo</Badge>;
  };

  const getPorcentajeOcupacion = (evento) => {
    return evento.capacidad
      ? ((evento.entradasVendidas || 0) / evento.capacidad) * 100
      : 0;
  };

  const estadisticas = {
    totalEventos: eventos.length,
    eventosActivos: eventos.filter((e) => esFuturo(e.fecha)).length,
    eventosCompletados: eventos.filter((e) => !esFuturo(e.fecha)).length,
    totalVentas: eventos.reduce((sum, e) => sum + (e.montoTotal || 0), 0),
    totalEntradasVendidas: eventos.reduce(
      (sum, e) => sum + (e.entradasVendidas || 0),
      0
    ),
    promedioOcupacion:
      eventos.length > 0
        ? (
            (eventos.reduce(
              (sum, e) => sum + ((e.entradasVendidas || 0) / e.capacidad),
              0
            ) / eventos.length) *
            100
          ).toFixed(1)
        : 0,
  };

  return (
    <>
      <Header />
      <div className="home-container">
        <div className="home-triangle"></div>
        <div className="contenido-cuadro">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="home-title mb-0">
              <i className="bi bi-calendar-event me-2 text-success"></i>
              Administración de Eventos
            </h2>
            <Button
              onClick={handleAbrirAgregar}
              variant="success"
              className="d-flex align-items-center gap-2"
            >
              <i className="bi bi-plus-circle"></i>
              Nuevo Evento
            </Button>
          </div>

          {/* Estadísticas */}
          <Row className="mb-4 g-3">
            <Col xs={12} sm={6} md={3}>
              <Card className="text-center border-success">
                <Card.Body>
                  <h4 className="text-success mb-1">{estadisticas.totalEventos}</h4>
                  <small className="text-muted">Total Eventos</small>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} sm={6} md={3}>
              <Card className="text-center border-primary">
                <Card.Body>
                  <h4 className="text-primary mb-1">{estadisticas.eventosActivos}</h4>
                  <small className="text-muted">Eventos Activos</small>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} sm={6} md={3}>
              <Card className="text-center border-warning">
                <Card.Body>
                  <h4 className="text-warning mb-1">
                    ${(estadisticas.totalVentas ?? 0).toLocaleString()}
                  </h4>
                  <small className="text-muted">Total Ventas</small>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} sm={6} md={3}>
              <Card className="text-center border-info">
                <Card.Body>
                  <h4 className="text-info mb-1">{estadisticas.promedioOcupacion}%</h4>
                  <small className="text-muted">Ocupación Promedio</small>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Filtros */}
          <Row className="mb-4 g-3">
            <Col md={6}>
              <Form.Control
                type="text"
                placeholder="Buscar evento por nombre o id..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </Col>
            <Col md={6}>
              <div className="btn-group w-100" role="group">
                <Button
                  variant={filtroEstado === "todos" ? "success" : "outline-success"}
                  onClick={() => setFiltroEstado("todos")}
                >
                  Todos
                </Button>
                <Button
                  variant={filtroEstado === "activos" ? "success" : "outline-success"}
                  onClick={() => setFiltroEstado("activos")}
                >
                  Activos
                </Button>
                <Button
                  variant={filtroEstado === "completados" ? "success" : "outline-success"}
                  onClick={() => setFiltroEstado("completados")}
                >
                  Completados
                </Button>
              </div>
            </Col>
          </Row>

          {/* Listado de eventos */}
          <Row className="g-3">
            {eventosFiltrados.map((evento) => (
              <Col key={evento.id} xs={12} md={6} lg={4}>
                <Card className="h-100 evento-admin-card shadow-sm">
                  <Card.Body className="d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <h6 className="card-title mb-1">{evento.nombre}</h6>
                        {/* Mostrar actividad si viene */}
                        {evento.actividad?.nombre && (
                          <small className="text-muted d-block">
                            <i className="bi bi-collection me-1"></i>
                            {evento.actividad.nombre}
                          </small>
                        )}
                      </div>
                      {getEstadoBadge(evento)}
                    </div>
                    <div className="mb-3">
                      <small className="text-muted d-block">
                        <i className="bi bi-calendar3 me-1"></i>
                        {formatearFecha(evento.fecha)}
                      </small>
                      <small className="text-muted d-block">
                        <i className="bi bi-clock me-1"></i>
                        {evento.horaInicio}hs - {evento.horaFin}hs
                      </small>
                      {evento.ubicacion && (
                        <small className="text-muted d-block">
                          <i className="bi bi-geo-alt me-1"></i>
                          {evento.ubicacion}
                        </small>
                      )}
                    </div>
                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <small className="text-muted">Ocupación</small>
                        <small className="text-muted">
                          {(evento.entradasVendidas || 0)}/{evento.capacidad}
                        </small>
                      </div>
                      <ProgressBar
                        now={getPorcentajeOcupacion(evento)}
                        variant={
                          getPorcentajeOcupacion(evento) >= 90
                            ? "danger"
                            : getPorcentajeOcupacion(evento) >= 70
                            ? "warning"
                            : "success"
                        }
                        className="mb-2"
                      />
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="fw-bold text-success">
                          ${evento.precioEntrada}
                        </span>
                        <span className="text-muted">
                          Total: ${(evento.montoTotal ?? 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="mt-auto">
                      <div className="d-flex gap-2">
                        <Button
                          variant="outline-info"
                          size="sm"
                          onClick={() => handleMostrarDetalle(evento)}
                          title="Ver detalles"
                        >
                          <i className="bi bi-info-circle"></i>
                        </Button>
                        <Button
                          variant="outline-warning"
                          size="sm"
                          onClick={() => handleEditarEvento(evento)}
                          title="Editar evento"
                        >
                          <i className="bi bi-pencil"></i>
                        </Button>
                        <Button
                          variant="outline-success"
                          size="sm"
                          onClick={() => handleMostrarVenta(evento)}
                          disabled={(evento.entradasVendidas || 0) >= evento.capacidad}
                          title="Registrar venta"
                        >
                          <i className="bi bi-ticket-perforated"></i>
                        </Button>
                        { role === "ADMIN" && (
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleEliminarEvento(evento.id)}
                            title="Eliminar evento"
                          >
                            <i className="bi bi-trash"></i>
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Modal para Agregar/Editar Evento */}
          <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
            <Modal.Header closeButton className="bg-success text-white">
              <Modal.Title>
                {modoAgregar ? "Nuevo Evento" : modoEditar ? "Editar Evento" : ""}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form
                onSubmit={handleSubmit(
                  modoAgregar ? handleAgregarEvento : handleGuardarEdicion
                )}
              >
                <Row className="g-3">
                  {/* Nombre */}
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Nombre</Form.Label>
                      <Form.Control
                        type="text"
                        {...register("nombre")}
                        isInvalid={!!errors.nombre}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.nombre?.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  {/* Fecha */}
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Fecha</Form.Label>
                      <Form.Control
                        type="date"
                        {...register("fecha")}
                        isInvalid={!!errors.fecha}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.fecha?.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  {/* Hora inicio */}
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Hora Inicio</Form.Label>
                      <Form.Control
                        type="time"
                        {...register("horaInicio")}
                        isInvalid={!!errors.horaInicio}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.horaInicio?.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  {/* Hora fin */}
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Hora Fin</Form.Label>
                      <Form.Control
                        type="time"
                        {...register("horaFin")}
                        isInvalid={!!errors.horaFin}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.horaFin?.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  {/* Capacidad */}
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Capacidad</Form.Label>
                      <Form.Control
                        type="number"
                        {...register("capacidad")}
                        isInvalid={!!errors.capacidad}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.capacidad?.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  {/* Precio entrada */}
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Precio Entrada</Form.Label>
                      <Form.Control
                        type="number"
                        {...register("precioEntrada")}
                        isInvalid={!!errors.precioEntrada}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.precioEntrada?.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  {/* Actividad */}
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Actividad</Form.Label>
                      <Form.Select
                        {...register("actividadId", {
                          required: "Debe seleccionar una actividad",
                          onChange: (e) => setActividadSeleccionada(e.target.value),
                        })}
                        isInvalid={!!errors.actividadId}
                      >
                        <option value="">Seleccione una actividad</option>
                        {actividades.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.nombre}
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.actividadId?.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  {/* Ubicación */}
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Ubicación</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Salón, gimnasio, sede, etc."
                        {...register("ubicacion")}
                        isInvalid={!!errors.ubicacion}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.ubicacion?.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  {/* Descripción */}
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>Descripción</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        {...register("descripcion")}
                        isInvalid={!!errors.descripcion}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.descripcion?.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <div className="mt-3 d-flex justify-content-end">
                  <Button
                    variant="secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant={modoAgregar ? "success" : "warning"}
                    disabled={isSubmitting}
                  >
                    {modoAgregar ? "Crear" : "Guardar cambios"}
                  </Button>
                </div>
              </Form>
            </Modal.Body>

                
          </Modal>

          {/* Modal Detalle */}
          <Modal
            show={mostrarDetalle}
            onHide={() => setMostrarDetalle(false)}
            size="lg"
          >
            <Modal.Header closeButton className="bg-success text-white">
              <Modal.Title>Detalle del Evento</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {eventoSeleccionado && (
                <>
                  <h5>{eventoSeleccionado.nombre}</h5>
                  <p><strong>Fecha:</strong> {formatearFecha(eventoSeleccionado.fecha)}</p>
                  <p><strong>Horario:</strong> {eventoSeleccionado.horaInicio} - {eventoSeleccionado.horaFin}</p>
                  <p><strong>Actividad:</strong> {eventoSeleccionado.actividad?.nombre || '-'}</p>
                  <p><strong>Ubicación:</strong> {eventoSeleccionado.ubicacion || '-'}</p>
                  <p><strong>Capacidad:</strong> {eventoSeleccionado.capacidad}</p>
                  <p><strong>Entradas vendidas:</strong> {eventoSeleccionado.entradasVendidas || 0}</p>
                  <p><strong>Precio Entrada:</strong> ${eventoSeleccionado.precioEntrada}</p>
                  <p><strong>Descripción:</strong> {eventoSeleccionado.descripcion}</p>
                </>
              )}
            </Modal.Body>
          </Modal>

          {/* Modal Venta */}
          <Modal show={mostrarVenta} onHide={() => setMostrarVenta(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Registrar Venta - {eventoSeleccionado?.nombre}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Cantidad</Form.Label>
                  <Form.Control
                    type="number"
                    value={cantidad}
                    min={1}
                    max={(eventoSeleccionado?.capacidad || 0) - (eventoSeleccionado?.entradasVendidas || 0)}
                    onChange={(e) => setCantidad(Number(e.target.value))}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>DNI Socio (opcional)</Form.Label>
                  <Form.Control
                    type="text"
                    value={dniSocio}
                    onChange={(e) => setDniSocio(e.target.value)}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Forma de Pago</Form.Label>
                  <Form.Select
                    value={formaPago}
                    onChange={(e) => setFormaPago(e.target.value)}
                  >
                    <option value="EFECTIVO">EFECTIVO</option>
                    <option value="CBU">TRANSFERENCIA</option>
                  </Form.Select>
                </Form.Group>
                {formaPago === "CBU" && (
                  <Form.Group className="mb-3">
                    <Form.Label>Comprobante</Form.Label>
                    <Form.Control
                      type="file"
                      onChange={(e) => setComprobanteFile(e.target.files[0])}
                    />
                  </Form.Group>
                )}
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setMostrarVenta(false)}>
                Cancelar
              </Button>
              <Button variant="success" onClick={handleConfirmarCompra}>
                Confirmar
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      </div>
    </>
  );
}
