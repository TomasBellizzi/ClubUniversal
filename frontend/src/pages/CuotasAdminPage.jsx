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
  if (e === "EN_REVISION") return "En Revisión";
  if (e === "PAGADA" || e === "APROBADA") return "Aprobada";
  return "Pendiente";
};

function CuotasAdminPage() {
  const location = useLocation();
  const defId = location.state?.defId || "";
  const [busqueda, setBusqueda] = useState(defId.toString());
  const [filtro, setFiltro] = useState("Todas");
  const [loading, setLoading] = useState(false);
  const [cuotas, setCuotas] = useState([]);
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

    const fetchAll = async () => {
      try {
        setLoading(true);
        const res = await api.get("/api/cuotas/administrativo");
        const cuotasDb = Array.isArray(res.data?.cuotas)
          ? res.data.cuotas
          : Array.isArray(res.data)
          ? res.data
          : [];

        if (!cuotasDb?.length) {
          if (mounted) setCuotas([]);
          return;
        }

        const rows = cuotasDb.map((r) => ({
          id: r.id,
          nombre: r.socioNombre || (r.dni ? `Socio DNI ${r.dni}` : "Socio"),
          dni: r.dni ?? "",
          monto: r.monto,
          estadoUi: toUiEstado(r.estado),
          estadoDb: r.estado,
          comprobanteUrl:
            r.comprobanteUrl ??
            (Array.isArray(r.comprobantes)
              ? r.comprobantes.find((c) => c.activo)?.url ?? null
              : null),
          mes: r.mes,
          fotoCarnet: r.fotoCarnet ?? null,
        }));

        if (mounted) setCuotas(rows);
      } catch (err) {
        console.error("Error cargando cuotas:", err);
        alert("No se pudieron cargar las cuotas. Intentá nuevamente.");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
    return () => {
      mounted = false;
    };
  }, []);

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
        alert(`✅ Cuota ${estado === "Aprobada" ? "aprobada" : "rechazada"} correctamente.`);
      } else {
        alert("No se pudo actualizar el estado.");
      }
    } catch (err) {
      console.error("❌ Error al cambiar estado:", err);
      alert("No se pudo actualizar el estado.");
    }
  };

  const handleGenerarCuotas = () => {
    if (!canGenerateCuotas) {
      alert("Solo un administrador puede generar cuotas.");
      return;
    }
    navigate("/generar-cuota");
  };

  return (
    <div className="cuotas-page">
      <Header />

      <div className="container cuotas-admin-container">
        <div className="card shadow-sm border-0 rounded-4 p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="mb-0 text-success fw-bold">Cuotas</h4>
            <hr className="mt-2 mb-3" style={{ borderTop: '2px solid #198754', opacity: 0.3 }} />
            {loading && <Spinner animation="border" size="sm" />}
          </div>

          {/* Filtros */}
          <div className="d-flex flex-wrap align-items-center gap-3 mb-4">
            <Form.Control
              type="text"
              placeholder="Buscar por nombre o DNI..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={{ maxWidth: 280 }}
            />
            {["Todas", "Aprobada", "Pendiente", "En Revisión"].map((estado) => (
              <Button
                key={estado}
                variant={filtro === estado ? "success" : "outline-secondary"}
                onClick={() => setFiltro(estado)}
              >
                {estado}
              </Button>
            ))}
          </div>

          {/* Listado */}
          <div className="cuotas-list">
            {loading && <div className="text-center py-3 text-muted">Cargando cuotas...</div>}
            {!loading && cuotasFiltradas.length === 0 && (
              <div className="text-center py-3 text-muted">No hay resultados.</div>
            )}

            {!loading &&
              cuotasFiltradas.map((c) => (
                <div
                  key={c.id}
                  className="d-flex align-items-center justify-content-between p-3 mb-3 rounded-4 shadow-sm"
                  style={{ background: "#fafafa", border: "1px solid #e5e5e5" }}
                >
                  {/* Foto + nombre */}
                  <div className="d-flex align-items-center" style={{ gap: 12 }}>
                    <div
                      className="rounded-circle border border-secondary"
                      style={{
                        width: 50,
                        height: 50,
                        overflow: "hidden",
                        flexShrink: 0,
                      }}
                    >
                      <img
                        src={c.fotoCarnet || logoUniversal}
                        alt={`Foto de ${c.nombre}`}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={(e) => (e.target.src = logoUniversal)}
                      />
                    </div>

                    <div>
                      <div className="fw-semibold">{c.nombre}</div>
                      <div className="text-muted small">
                        DNI: {c.dni || "—"} · Mes: {c.mes || "—"}
                      </div>
                    </div>
                  </div>

                  {/* Monto, estado y acción */}
                  <div className="d-flex align-items-center gap-3">
                    <Badge bg="light" text="dark">
                      ${c.monto}
                    </Badge>
                    <Badge
                      bg={
                        c.estadoUi === "Aprobada"
                          ? "success"
                          : c.estadoUi === "En Revisión"
                          ? "warning"
                          : "secondary"
                      }
                      text={c.estadoUi === "En Revisión" ? "dark" : "white"}
                    >
                      {c.estadoUi}
                    </Badge>

                    {c.estadoUi === "En Revisión" && c.comprobanteUrl && (
                      <Button
                        size="sm"
                        style={{ backgroundColor: "#e9f7ef", color: "#198754", border: "none" }}
                        onClick={() => abrirModal(c)}
                      >
                        Ver comprobante
                      </Button>

                    )}
                  </div>
                </div>
              ))}
          </div>

          {/* Botón generar cuotas */}
          <div className="text-end mt-4">
            <Button variant="success" onClick={handleGenerarCuotas} className="px-4">
                Generar cuotas
            </Button>
          </div>
        </div>
      </div>

      {/* Modal comprobante */}
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
            <p className="text-muted">No se encontró el comprobante.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={cerrarModal}>
            Cerrar
          </Button>
          <Button variant="danger" onClick={() => cambiarEstado(selectedCuota.id, "Rechazada")}>
            Rechazar
          </Button>
          <Button variant="success" onClick={() => cambiarEstado(selectedCuota.id, "Aprobada")}>
            Aprobar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default CuotasAdminPage;
