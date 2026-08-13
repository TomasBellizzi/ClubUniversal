import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import { useForm } from "react-hook-form";
import { useLocation } from "react-router-dom";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { api } from "../service/api";
import "../styles/generarCuotas.css";

const MESES = [
  "ENERO",
  "FEBRERO",
  "MARZO",
  "ABRIL",
  "MAYO",
  "JUNIO",
  "JULIO",
  "AGOSTO",
  "SEPTIEMBRE",
  "OCTUBRE",
  "NOVIEMBRE",
  "DICIEMBRE",
];

const TODAY = new Date().toISOString().slice(0, 10);

const schema = yup.object({
  actividadId: yup
    .string()
    .trim()
    .nullable()
    .transform((value) => value || ""),
  montoBase: yup
    .number()
    .typeError("Debe ser un numero")
    .min(0, "No puede ser negativo")
    .max(1000000, "Demasiado alto")
    .nullable()
    .transform((v, o) => (o === "" || o === null ? 0 : v)),
  mes: yup.string().oneOf(MESES, "Mes invalido").required(),
  fechaVenc: yup
    .string()
    .required("Selecciona una fecha")
    .test("no-pasado", "No puede ser una fecha pasada", (v) => v && v >= TODAY),
});

function CuotasAdmin() {
  const location = useLocation();
  const sinActividad = Boolean(location.state?.sinActividad);
  const actividadInicialId = location.state?.actividadId ? String(location.state.actividadId) : "";
  const actividadInicialNombre = location.state?.actividadNombre || "";
  const actividadInicialMonto = Number(location.state?.actividadMonto || 0);
  const actividadFija = Boolean(actividadInicialId);
  const [loading, setLoading] = useState(false);
  const [actividades, setActividades] = useState([]);
  const [socios, setSocios] = useState([]);
  const [preview, setPreview] = useState([]);

  const ahora = new Date();
  const mesActual = MESES[ahora.getMonth()];
  const anioActual = ahora.getFullYear();
  const ultimoDiaDelMesActual = new Date(anioActual, ahora.getMonth() + 1, 0)
    .toISOString()
    .slice(0, 10);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      actividadId: sinActividad ? "" : actividadInicialId,
      montoBase: "",
      mes: mesActual,
      fechaVenc: ultimoDiaDelMesActual,
    },
  });

  const watchActividadId = watch("actividadId");
  const watchMes = watch("mes");
  const watchFecha = watch("fechaVenc");
  const watchMontoBase = watch("montoBase");
  const actividadActual = actividades.find((a) => String(a.id) === String(watchActividadId));
  const actividadActualNombre =
    actividadActual?.nombre || actividadInicialNombre || "Actividad seleccionada";
  const montoExtraActividad = sinActividad
    ? 0
    : Number(actividadActual?.monto ?? actividadInicialMonto ?? 0);
  const montoBaseActual = Number(watchMontoBase || 0);
  const totalEstimado = montoBaseActual + montoExtraActividad;

  function getUltimoDiaDelMes(nombreMes, anio = new Date().getFullYear()) {
    const indiceMes = MESES.indexOf(String(nombreMes || "").toUpperCase());
    if (indiceMes === -1) return null;
    const ultimoDia = new Date(anio, indiceMes + 1, 0);
    return ultimoDia.toISOString().slice(0, 10);
  }

  useEffect(() => {
    const mesSeleccionado = watchMes;
    if (!mesSeleccionado) return;
    const nuevaFecha = getUltimoDiaDelMes(mesSeleccionado, anioActual);
    if (nuevaFecha) setValue("fechaVenc", nuevaFecha);
  }, [watchMes, setValue, anioActual]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/api/actividades");
        const lista = Array.isArray(data?.actividades)
          ? data.actividades
          : Array.isArray(data)
          ? data
          : [];
        setActividades(lista.filter((a) => a?.activo !== false));
      } catch (err) {
        console.error(err);
        alert("No se pudieron cargar las actividades.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (sinActividad) {
      setSocios([]);
      setPreview([]);
      return;
    }

    if (!watchActividadId) {
      setSocios([]);
      setPreview([]);
      return;
    }

    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get(
          "/api/actividadSocio/actividad/" + String(watchActividadId)
        );
        const arr = Array.isArray(data?.actividadSocios)
          ? data.actividadSocios
          : Array.isArray(data)
          ? data
          : [];
        setSocios(arr);
      } catch (e) {
        console.error(e);
        alert("No se pudieron cargar los socios de la actividad.");
      } finally {
        setLoading(false);
      }
    })();
  }, [watchActividadId, sinActividad]);

  const buildPayload = (values, previewMode) => ({
    actividadId: sinActividad ? 0 : Number(values.actividadId || 0),
    soloSinActividad: sinActividad,
    mes: values.mes,
    montoBase: Number(values.montoBase || 0),
    fechaVencimiento: values.fechaVenc,
    preview: previewMode,
  });

  const onPreviewSubmit = async (values) => {
    if (!sinActividad && !values.actividadId) {
      alert("Selecciona una actividad.");
      return;
    }

    if (!sinActividad && !socios.length) {
      alert("No hay socios inscriptos para esta actividad");
      return;
    }

    try {
      setLoading(true);
      const { data } = await api.post("/api/cuotas/admin/generar", buildPayload(values, true));
      const previewItems = Array.isArray(data?.previewItems) ? data.previewItems : [];

      if (!previewItems.length) {
        alert(
          sinActividad
            ? "No hay socios activos sin actividad para generar cuotas."
            : "No hay socios para generar cuotas."
        );
      }

      setPreview(previewItems);
    } catch (err) {
      console.error(err);
      alert("No se pudo generar la previsualizacion.");
    } finally {
      setLoading(false);
    }
  };

  const onGenerar = async () => {
    try {
      setLoading(true);
      const { data } = await api.post(
        "/api/cuotas/admin/generar",
        buildPayload(
          {
            actividadId: watchActividadId,
            mes: watchMes,
            montoBase: watchMontoBase,
            fechaVenc: watchFecha,
          },
          false
        )
      );

      setPreview([]);
      alert(
        `Procesados: ${data?.processedSocios || 0} - Creadas: ${data?.created || 0} - Actualizadas: ${
          data?.updated || 0
        } - Omitidas: ${data?.skips || 0}`
      );
    } catch (err) {
      console.error(err);
      alert("No se pudieron generar las cuotas.");
    } finally {
      setLoading(false);
    }
  };

  const getSocioApellidoNombre = (previewItem) => {
    if (previewItem?.socioNombre) return previewItem.socioNombre;

    const item = socios.find(
      (s) => String(s?.socio?.id ?? s?.Socio?.id) === String(previewItem?.socioId)
    );
    const data = item?.socio || item?.Socio;
    return data ? `${data.apellido} ${data.nombre}` : `Socio #${previewItem?.socioId}`;
  };

  const getDetalleCuota = (detalle = []) => {
    if (!detalle.length) return "-";
    return detalle
      .map((d) => {
        if (d.tipo === "base") return `Base $${d.monto}`;
        return `${d.nombre || "Actividad"} $${d.monto}`;
      })
      .join(" + ");
  };

  return (
    <>
      <Header />
      <div className="container mt-5 mb-5">
        <div className="card shadow-sm border-0 p-4 rounded-4">
          <h3 className="fw-bold mb-4 text-center text-success">
            Generar Cuotas
          </h3>

          <form onSubmit={handleSubmit(onPreviewSubmit)} noValidate className="row g-4">
            <div className="col-md-6">
              <label className="form-label fw-semibold">Destino</label>
              {sinActividad ? (
                <>
                  <input type="hidden" {...register("actividadId")} />
                  <div className="form-control bg-light">Socios sin actividad</div>
                </>
              ) : actividadFija ? (
                <>
                  <input type="hidden" {...register("actividadId")} />
                  <div className="form-control bg-light">{actividadActualNombre}</div>
                </>
              ) : (
                <select
                  className={`form-select ${errors.actividadId ? "is-invalid" : ""}`}
                  {...register("actividadId")}
                  onChange={(e) =>
                    setValue("actividadId", e.target.value, { shouldValidate: true })
                  }
                >
                  <option value="">Seleccionar actividad</option>
                  {actividades.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nombre}
                    </option>
                  ))}
                </select>
              )}
              <div className="invalid-feedback">{errors.actividadId?.message}</div>
            </div>

            <div className="col-md-3">
              <label className="form-label fw-semibold">Monto Base</label>
              <input
                type="number"
                placeholder="Monto base"
                className={`form-control ${errors.montoBase ? "is-invalid" : ""}`}
                {...register("montoBase")}
              />
              <div className="invalid-feedback">{errors.montoBase?.message}</div>
            </div>

            <div className="col-md-3">
              <label className="form-label fw-semibold">Monto Extra Actividad</label>
              <input
                type="text"
                className="form-control bg-light"
                value={`$${montoExtraActividad}`}
                readOnly
              />
            </div>

            <div className="col-md-3">
              <label className="form-label fw-semibold">Total estimado</label>
              <input
                type="text"
                className="form-control bg-light"
                value={`$${totalEstimado}`}
                readOnly
              />
            </div>

            <div className="col-md-3">
              <label className="form-label fw-semibold">Mes</label>
              <select className="form-select" {...register("mes")}>
                {MESES.map((m) => (
                  <option key={m} value={m}>
                    {m[0] + m.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-3">
              <label className="form-label fw-semibold">Vencimiento</label>
              <input
                type="date"
                className={`form-control ${errors.fechaVenc ? "is-invalid" : ""}`}
                {...register("fechaVenc")}
              />
              <div className="invalid-feedback">{errors.fechaVenc?.message}</div>
            </div>

            <div className="col-12 d-flex justify-content-center gap-3 mt-3">
              <button
                type="submit"
                className="btn btn-outline-success px-4"
                disabled={isSubmitting || loading}
              >
                {loading ? "Generando..." : "Previsualizar Cuotas"}
              </button>
              <button
                type="button"
                className="btn btn-success px-4"
                onClick={onGenerar}
                disabled={!preview.length || loading}
              >
                Generar
              </button>
            </div>
          </form>

          {!!preview.length && (
            <div className="mt-5">
              <h5 className="fw-bold text-secondary mb-3">
                Previsualizacion ({preview.length} cuotas)
              </h5>
              <div className="table-responsive shadow-sm">
                <table className="table table-striped align-middle">
                  <thead className="table-success">
                    <tr>
                      <th>Socio</th>
                      <th>Mes</th>
                      <th>Detalle</th>
                      <th>Monto</th>
                      <th>Estado</th>
                      <th>Vencimiento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((c, i) => (
                      <tr key={i}>
                        <td>{getSocioApellidoNombre(c)}</td>
                        <td>{watchMes}</td>
                        <td>{getDetalleCuota(c.detalle)}</td>
                        <td>${c.total}</td>
                        <td>Pendiente</td>
                        <td>{watchFecha}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default CuotasAdmin;
