import "../styles/CuotasAdmin.css";
import React, { useEffect, useMemo, useState } from "react";
import { Form, Button, Modal, Spinner, Badge } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../components/Header";
import { api } from "../service/api";
import { useAuth } from "../hooks/useAuth";
import { getRole, getUser } from "../helpers/auth";
import logoUniversal from "../assets/logoUniversal.png";

const DEFAULT_API_BASE_URL = import.meta.env.DEV ? "http://localhost:3000" : "";
const API_BASE_URL = (import.meta.env.VITE_API_URL || DEFAULT_API_BASE_URL).replace(/\/$/, "");

const resolveComprobanteUrl = (url) => {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith("/")) return `${API_BASE_URL}${url}`;
  return `${API_BASE_URL}/${url}`;
};

const isPdfComprobante = (url) =>
  String(url || "")
    .split(/[?#]/)[0]
    .toLowerCase()
    .endsWith(".pdf");

const toUiEstado = (estadoDb) => {
  const e = String(estadoDb || "").toUpperCase();
  if (e === "EN_REVISION") return "En Revision";
  if (e === "PAGADA" || e === "APROBADA") return "Aprobada";
  if (e === "VENCIDA") return "Vencida";
  return "Pendiente";
};

const mapCuotaToRow = (r) => ({
  id: r.id,
  socioId: r.socioId,
  nombre: r.socioNombre,
  dni: r.dni,
  mes: r.mes,
  monto: r.monto,
  estadoDb: r.estado,
  estadoUi: toUiEstado(r.estado),
  comprobanteUrl: r.comprobanteUrl,
  fotoCarnet: r.fotoCarnet,
  actividades: r.actividades || [],
});

function CuotasAdminPage() {
  const location = useLocation();
  const socioInicial = useMemo(() => {
    const socioInicialId = location.state?.socioId || location.state?.defId || "";
    if (!socioInicialId) return null;

    return {
      id: socioInicialId,
      nombre: location.state?.socioNombre || "Socio",
      dni: location.state?.socioDni || "",
    };
  }, [location.state]);
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState("Todas");
  const [loading, setLoading] = useState(false);
  const [loadingActividades, setLoadingActividades] = useState(false);
  const [cuotas, setCuotas] = useState([]);
  const [actividades, setActividades] = useState([]);
  const [actividadSeleccionada, setActividadSeleccionada] = useState(null);
  const [socioSeleccionado, setSocioSeleccionado] = useState(socioInicial);
  const [showModal, setShowModal] = useState(false);
  const [selectedCuota, setSelectedCuota] = useState(null);
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const storedUser = getUser();
  const currentRole = getRole() || storedUser?.role || storedUser?.rol;
  const canGenerateCuotas =
    hasRole(["ADMIN", "ADMINISTRATIVO"]) ||
    ["ADMIN", "ADMINISTRATIVO"].includes(String(currentRole || "").toUpperCase());

  useEffect(() => {
    let mounted = true;

    const fetchActividades = async () => {
      try {
        setLoadingActividades(true);
        const res = await api.get("/api/cuotas/administrativo/actividades");
        const actividadesDb = Array.isArray(res.data?.actividades)
          ? res.data.actividades
          : Array.isArray(res.data)
          ? res.data
          : [];

        if (mounted) setActividades(actividadesDb);
      } catch (err) {
        console.error("Error cargando resumen de cuotas por actividad:", err);
        alert("No se pudieron cargar las actividades. Intenta nuevamente.");
      } finally {
        if (mounted) setLoadingActividades(false);
      }
    };

    if (!socioInicial) {
      fetchActividades();
    }

    return () => {
      mounted = false;
    };
  }, [socioInicial]);

  useEffect(() => {
    if (!socioInicial) return;
    fetchCuotasSocio(socioInicial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCuotasActividad = async (actividad) => {
    try {
      setActividadSeleccionada(actividad);
      setBusqueda("");
      setFiltro("Todas");
      setCuotas([]);
      setLoading(true);

      const res = await api.get("/api/cuotas/administrativo", {
        params: { actividadId: actividad.id },
      });
      const cuotasDb = Array.isArray(res.data?.cuotas)
        ? res.data.cuotas
        : Array.isArray(res.data)
        ? res.data
        : [];

      setCuotas(cuotasDb.map(mapCuotaToRow));
    } catch (err) {
      console.error("Error cargando cuotas de la actividad:", err);
      alert("No se pudieron cargar las cuotas de esta actividad.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCuotasSocio = async (socio) => {
    try {
      setSocioSeleccionado(socio);
      setActividadSeleccionada(null);
      setBusqueda("");
      setFiltro("Todas");
      setCuotas([]);
      setLoading(true);

      const res = await api.get("/api/cuotas/administrativo", {
        params: { socioId: socio.id },
      });
      const cuotasDb = Array.isArray(res.data?.cuotas)
        ? res.data.cuotas
        : Array.isArray(res.data)
        ? res.data
        : [];

      setCuotas(cuotasDb.map(mapCuotaToRow));
    } catch (err) {
      console.error("Error cargando cuotas del socio:", err);
      alert("No se pudieron cargar las cuotas de este socio.");
    } finally {
      setLoading(false);
    }
  };

  const volverAActividades = () => {
    if (socioSeleccionado) {
      navigate("/socios");
      return;
    }

    setActividadSeleccionada(null);
    setCuotas([]);
    setBusqueda("");
    setFiltro("Todas");
  };

  const cuotasFiltradas = useMemo(() => {
    const q = (busqueda || "").toLowerCase().trim();
    return cuotas.filter((c) => {
      const coincideEstado = filtro === "Todas" || c.estadoUi === filtro;
      const nombre = (c.nombre || "").toLowerCase();
      const dni = String(c.dni || "").toLowerCase();
      const coincideBusqueda = !q || nombre.includes(q) || dni.includes(q);
      return coincideEstado && coincideBusqueda;
    });
  }, [cuotas, filtro, busqueda]);

  const abrirModal = (cuota) => {
    setSelectedCuota({
      ...cuota,
      comprobanteUrl: resolveComprobanteUrl(cuota.comprobanteUrl),
    });
    setShowModal(true);
  };

  const cerrarModal = () => {
    setSelectedCuota(null);
    setShowModal(false);
  };

  const cambiarEstado = async (cuotaId, estado) => {
    try {
      const res = await api.patch(`/api/cuotas/administrativo/${cuotaId}/estado`, { estado });

      if (res.status === 200 && res.data) {
        setCuotas((prev) =>
          prev.map((c) =>
            c.id === cuotaId
              ? {
                  ...c,
                  estadoUi: estado === "Aprobada" ? "Aprobada" : "Pendiente",
                  estadoDb: estado === "Aprobada" ? "PAGADA" : "PENDIENTE",
                  comprobanteUrl: estado === "Rechazada" ? null : c.comprobanteUrl,
                }
              : c
          )
        );
        cerrarModal();
        alert(`Cuota ${estado === "Aprobada" ? "aprobada" : "rechazada"} correctamente.`);
      } else {
        alert("No se pudo actualizar el estado.");
      }
    } catch (err) {
      console.error("Error al cambiar estado:", err);
      alert("No se pudo actualizar el estado.");
    }
  };

  const handleGenerarCuotas = (actividad) => {
    if (!canGenerateCuotas) {
      alert("Solo un administrador puede generar cuotas.");
      return;
    }

    navigate("/generar-cuota", {
      state: actividad
        ? {
            actividadId: actividad.id,
            actividadNombre: actividad.nombre,
          }
        : undefined,
    });
  };

  return (
    <div className="cuotas-page">
      <Header />

      <div className="container cuotas-admin-container">
        <div className="card shadow-sm border-0 rounded-4 p-4">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
            <div className="d-flex align-items-center gap-3">
              {(actividadSeleccionada || socioSeleccionado) && (
                <Button variant="outline-secondary" size="sm" onClick={volverAActividades}>
                  Volver
                </Button>
              )}
              <h4 className="mb-0 text-success fw-bold">
                {socioSeleccionado
                  ? `Cuotas - ${socioSeleccionado.nombre}`
                  : actividadSeleccionada
                  ? `Cuotas - ${actividadSeleccionada.nombre}`
                  : "Cuotas por Actividad"}
              </h4>
            </div>
            {(loading || loadingActividades) && <Spinner animation="border" size="sm" />}
          </div>

          {!actividadSeleccionada && !socioSeleccionado ? (
            <>
              <div className="actividades-cuotas-grid">
                {loadingActividades && (
                  <div className="text-center py-3 text-muted">Cargando actividades...</div>
                )}
                {!loadingActividades && actividades.length === 0 && (
                  <div className="text-center py-3 text-muted">No hay actividades para mostrar.</div>
                )}
                {!loadingActividades &&
                  actividades.map((actividad) => (
                    <div key={actividad.id} className="actividad-cuota-card">
                      <div>
                        <div className="d-flex justify-content-between align-items-start gap-3">
                          <h5 className="mb-1 fw-bold">{actividad.nombre}</h5>
                          <Badge bg="light" text="dark">
                            ${actividad.monto}
                          </Badge>
                        </div>
                        <div className="text-muted small">
                          {actividad.sociosInscriptos} socios inscriptos
                        </div>
                      </div>

                      <div className="actividad-cuota-stats">
                        <span>Total: {actividad.cuotasTotales}</span>
                        <span>Pendientes: {actividad.cuotasPendientes}</span>
                        <span>En revision: {actividad.cuotasEnRevision}</span>
                        <span>Pagadas: {actividad.cuotasPagadas}</span>
                        <span>Vencidas: {actividad.cuotasVencidas}</span>
                      </div>

                      <div className="d-flex flex-wrap gap-2 justify-content-end">
                        <Button
                          variant="outline-success"
                          size="sm"
                          onClick={() => fetchCuotasActividad(actividad)}
                        >
                          Ver cuotas
                        </Button>
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleGenerarCuotas(actividad)}
                        >
                          Generar cuotas
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </>
          ) : (
            <>
              {socioSeleccionado?.dni && (
                <div className="text-muted small mb-3">DNI: {socioSeleccionado.dni}</div>
              )}
              <div className="d-flex flex-wrap align-items-center gap-3 mb-4">
                <Form.Control
                  type="text"
                  placeholder="Buscar por nombre o DNI..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  style={{ maxWidth: 280 }}
                />
                {["Todas", "Aprobada", "Pendiente", "En Revision", "Vencida"].map((estado) => (
                  <Button
                    key={estado}
                    variant={filtro === estado ? "success" : "outline-secondary"}
                    onClick={() => setFiltro(estado)}
                  >
                    {estado}
                  </Button>
                ))}
              </div>

              <div className="cuotas-list">
                {loading && <div className="text-center py-3 text-muted">Cargando cuotas...</div>}
                {!loading && cuotasFiltradas.length === 0 && (
                  <div className="text-center py-3 text-muted">No hay resultados.</div>
                )}

                {!loading &&
                  cuotasFiltradas.map((c) => (
                    <div key={c.id} className="cuota-admin-row">
                      <div className="d-flex align-items-center cuota-admin-persona">
                        <div className="cuota-admin-avatar">
                          <img
                            src={c.fotoCarnet || logoUniversal}
                            alt={`Foto de ${c.nombre}`}
                            onError={(e) => {
                              e.currentTarget.src = logoUniversal;
                            }}
                          />
                        </div>

                        <div>
                          <div className="fw-semibold">{c.nombre}</div>
                          <div className="text-muted small">
                            DNI: {c.dni || "-"} - Mes: {c.mes || "-"}
                          </div>
                        </div>
                      </div>

                      <div className="d-flex align-items-center gap-3 cuota-admin-actions">
                        <Badge bg="light" text="dark">
                          ${c.monto}
                        </Badge>
                        <Badge
                          bg={
                            c.estadoUi === "Aprobada"
                              ? "success"
                              : c.estadoUi === "En Revision"
                              ? "warning"
                              : c.estadoUi === "Vencida"
                              ? "danger"
                              : "secondary"
                          }
                          text={c.estadoUi === "En Revision" ? "dark" : "white"}
                        >
                          {c.estadoUi}
                        </Badge>

                        {c.estadoUi === "En Revision" && c.comprobanteUrl && (
                          <Button
                            size="sm"
                            style={{
                              backgroundColor: "#e9f7ef",
                              color: "#198754",
                              border: "none",
                            }}
                            onClick={() => abrirModal(c)}
                          >
                            Ver comprobante
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </>
          )}
        </div>
      </div>

      <Modal show={showModal} onHide={cerrarModal} size="lg" centered>
        <Modal.Header closeButton className="bg-success text-white">
          <Modal.Title>Comprobante de {selectedCuota?.nombre}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          {selectedCuota?.comprobanteUrl ? (
            isPdfComprobante(selectedCuota.comprobanteUrl) ? (
              <embed
                src={selectedCuota.comprobanteUrl}
                type="application/pdf"
                width="100%"
                height="600px"
              />
            ) : (
              <img
                src={selectedCuota.comprobanteUrl}
                alt="Comprobante"
                style={{ maxWidth: "100%", borderRadius: 8 }}
              />
            )
          ) : (
            <p className="text-muted">No se encontro el comprobante.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={cerrarModal}>
            Cerrar
          </Button>
          <Button
            variant="danger"
            onClick={() => selectedCuota && cambiarEstado(selectedCuota.id, "Rechazada")}
          >
            Rechazar
          </Button>
          <Button
            variant="success"
            onClick={() => selectedCuota && cambiarEstado(selectedCuota.id, "Aprobada")}
          >
            Aprobar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default CuotasAdminPage;
