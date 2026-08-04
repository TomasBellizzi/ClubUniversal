import React, { useState, useEffect, useCallback } from "react";
import Header from "../components/Header";
import AdjuntarComprobante from "../components/AdjuntarComprobante";
import { Modal, Button } from "react-bootstrap";
import { api } from "../service/api";

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

const CuotasTable = () => {
  const [cuotas, setCuotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdjuntarModal, setShowAdjuntarModal] = useState(false);
  const [showVerModal, setShowVerModal] = useState(false);
  const [cuotaSeleccionada, setCuotaSeleccionada] = useState(null);
  const [comprobanteUrl, setComprobanteUrl] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // 🔹 Formato de moneda
  const formatCurrency = (amount) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(Number(amount || 0));

  // 🔹 Formato de fecha
  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // 🔹 Badge por estado
  const getEstadoBadge = (estadoDb) => {
    const key = String(estadoDb || "").toUpperCase();
    const map = {
      PAGADA: { bg: "success", text: "Pagada" },
      EN_REVISION: { bg: "secondary", text: "En revisión" },
      PENDIENTE: { bg: "warning", text: "Pendiente" },
      VENCIDA: { bg: "danger", text: "Vencida" },
    };
    const cfg = map[key] || { bg: "light", text: key || "—" };
    return <span className={`badge bg-${cfg.bg}`}>{cfg.text}</span>;
  };

  // 🔹 Obtener cuotas del socio
  const fetchCuotas = useCallback(async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const { data } = await api.get("/api/cuotas/socio");
      const lista = Array.isArray(data?.cuotas)
        ? data.cuotas
        : Array.isArray(data)
        ? data
        : [];

      const adaptadas = lista.map((r, i) => ({
        id: r.id,
        nroCuota: i + 1,
        mes: r.mes || "—",
        fechaVencimiento: r.fechaVencimiento || r.createdAt || r.created_at,
        monto: r.monto,
        estadoDb: r.estado,
        comprobanteUrl: r.comprobanteUrl || null,
      }));

      setCuotas(adaptadas);
    } catch (e) {
      console.error("Error al obtener cuotas:", e);
      setErrorMsg("No se pudieron cargar tus cuotas. Probá nuevamente.");
      setCuotas([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCuotas();
  }, [fetchCuotas]);

  // 🔹 Subida de comprobante
  const handleAdjuntar = async (cuotaId, archivo) => {
    try {
      setErrorMsg("");
      const formData = new FormData();
      formData.append("comprobante", archivo);

      await api.post(`/api/cuotas/socio/${cuotaId}/comprobante`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("✅ Comprobante enviado correctamente.");
      await fetchCuotas();
      cerrarModalAdjuntar();
    } catch (error) {
      console.error("Error al adjuntar comprobante:", error);
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "No se pudo adjuntar el comprobante. Revisá el archivo y probá de nuevo.";
      setErrorMsg(message);
    }
  };

  const abrirModalAdjuntar = (cuotaId) => {
    setCuotaSeleccionada(cuotaId);
    setShowAdjuntarModal(true);
  };

  const cerrarModalAdjuntar = () => {
    setShowAdjuntarModal(false);
    setCuotaSeleccionada(null);
  };

  const abrirModalVer = (url) => {
    setComprobanteUrl(resolveComprobanteUrl(url));
    setShowVerModal(true);
  };

  const cerrarModalVer = () => {
    setComprobanteUrl("");
    setShowVerModal(false);
  };

  const puedePagar = (estadoDb) => {
    const key = String(estadoDb || "").toUpperCase();
    return key === "PENDIENTE" || key === "VENCIDA";
  };

  return (
    <>
      <Header />
      <div className="container mt-5 mb-5">
        <div className="card shadow-lg border-0 rounded-4 px-4 py-3">
          <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
            <h3 className="fw-bold text-success mb-0">Mis Cuotas</h3>
            {loading && (
              <div className="spinner-border spinner-border-sm text-success" role="status" />
            )}
          </div>

          <div className="card-body px-0">
            {errorMsg && (
              <div className="alert alert-danger text-center fw-semibold" role="alert">
                {errorMsg}
              </div>
            )}

            <div className="table-responsive">
              <table className="table align-middle table-hover">
                <thead className="table-success">
                  <tr>
                    <th>#</th>
                    <th>Mes</th>
                    <th>Vencimiento</th>
                    <th>Monto</th>
                    <th>Estado</th>
                    <th className="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {!loading && cuotas.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-muted text-center py-4">
                        No hay cuotas para mostrar.
                      </td>
                    </tr>
                  )}

                  {cuotas.map((cuota) => (
                    <tr key={cuota.id}>
                      <td className="fw-semibold">{cuota.nroCuota}</td>
                      <td>{cuota.mes}</td>
                      <td>{formatDate(cuota.fechaVencimiento)}</td>
                      <td>{formatCurrency(cuota.monto)}</td>
                      <td>{getEstadoBadge(cuota.estadoDb)}</td>
                      <td className="text-end">
                        {cuota.comprobanteUrl ? (
                          <button
                            className="btn btn-outline-success btn-sm me-2"
                            onClick={() => abrirModalVer(cuota.comprobanteUrl)}
                          >
                            Ver comprobante
                          </button>
                        ) : puedePagar(cuota.estadoDb) ? (
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => abrirModalAdjuntar(cuota.id)}
                          >
                            Adjuntar comprobante
                          </button>
                        ) : (
                          <button className="btn btn-outline-secondary btn-sm" disabled>
                            Sin acciones
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}

                  {loading && (
                    <tr>
                      <td colSpan="6" className="text-center py-4">
                        <div className="spinner-border text-success" role="status" />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Adjuntar */}
      <AdjuntarComprobante
        show={showAdjuntarModal}
        onHide={cerrarModalAdjuntar}
        cuotaId={cuotaSeleccionada}
        onAdjuntar={handleAdjuntar}
      />

      {/* Modal Ver comprobante */}
      <Modal show={showVerModal} onHide={cerrarModalVer} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">Comprobante de pago</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ textAlign: "center" }}>
          {!comprobanteUrl ? (
            <p className="text-muted mb-0">No se encontro el comprobante.</p>
          ) : isPdfComprobante(comprobanteUrl) ? (
            <embed
              src={comprobanteUrl}
              type="application/pdf"
              width="100%"
              height="600px"
            />
          ) : (
            <img
              src={comprobanteUrl}
              alt="Comprobante"
              style={{ maxWidth: "100%", borderRadius: "8px" }}
            />
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="success" onClick={cerrarModalVer}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default CuotasTable;
