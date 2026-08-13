import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import { useForm } from "react-hook-form";
import { useLocation } from "react-router-dom";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { api } from "../service/api";
import "../styles/generarCuotas.css";

const MESES = [
  "ENERO","FEBRERO","MARZO","ABRIL","MAYO","JUNIO",
  "JULIO","AGOSTO","SEPTIEMBRE","OCTUBRE","NOVIEMBRE","DICIEMBRE"
];

const TODAY = new Date().toISOString().slice(0, 10);

const schema = yup.object({
  actividadId: yup.string().trim().required("Seleccioná una actividad"),
  montoBase: yup
    .number()
    .typeError("Debe ser un número")
    .min(0, "No puede ser negativo")
    .max(1000000, "Demasiado alto")
    .nullable()
    .transform((v, o) => (o === "" || o === null ? 0 : v)),
  mes: yup.string().oneOf(MESES, "Mes inválido").required(),
  fechaVenc: yup
    .string()
    .required("Seleccioná una fecha")
    .test("no-pasado", "No puede ser una fecha pasada", (v) => v && v >= TODAY),
});

function CuotasAdmin() {
  const location = useLocation();
  const actividadInicialId = location.state?.actividadId ? String(location.state.actividadId) : "";
  const actividadInicialNombre = location.state?.actividadNombre || "";
  const actividadFija = Boolean(actividadInicialId);
  const [loading, setLoading] = useState(false);
  const [actividades, setActividades] = useState([]);
  const [socios, setSocios] = useState([]);
  const [preview, setPreview] = useState([]);

  // Determinar mes actual y su último día
  const ahora = new Date();
  const mesActual = MESES[ahora.getMonth()];
  const añoActual = ahora.getFullYear();
  const ultimoDiaDelMesActual = new Date(añoActual, ahora.getMonth() + 1, 0)
    .toISOString()
    .slice(0, 10);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      actividadId: actividadInicialId,
      montoBase: "",
      mes: mesActual,
      fechaVenc: ultimoDiaDelMesActual,
    },
  });

  const watchActividadId = watch("actividadId");
  const watchMes = watch("mes");
  const watchFecha = watch("fechaVenc");
  const actividadActual = actividades.find((a) => String(a.id) === String(watchActividadId));
  const actividadActualNombre = actividadActual?.nombre || actividadInicialNombre || "Actividad seleccionada";

  // Función auxiliar para calcular último día del mes
  function getUltimoDiaDelMes(nombreMes, año = new Date().getFullYear()) {
    const indiceMes = MESES.indexOf(nombreMes.toUpperCase());
    if (indiceMes === -1) return null;
    const ultimoDia = new Date(año, indiceMes + 1, 0);
    return ultimoDia.toISOString().slice(0, 10);
  }

  // Actualiza fechaVenc cuando cambia el mes
  useEffect(() => {
    const mesSeleccionado = watchMes;
    if (!mesSeleccionado) return;
    const nuevaFecha = getUltimoDiaDelMes(mesSeleccionado, añoActual);
    if (nuevaFecha) setValue("fechaVenc", nuevaFecha);
  }, [watchMes, setValue, añoActual]);

  // Cargar actividades
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

  // Cargar socios de la actividad seleccionada
  useEffect(() => {
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
  }, [watchActividadId]);

  // Previsualizar
  const onPreviewSubmit = async (values) => {
    if (!socios.length) {
      alert("No hay socios inscriptos para esta actividad");
      return;
    }
    try {
      setLoading(true);
      const { data } = await api.post("/api/cuotas/admin/generar", {
        actividadId: Number(values.actividadId),
        mes: values.mes,
        montoBase: Number(values.montoBase || 0),
        fechaVencimiento: values.fechaVenc,
        preview: true,
      });

      setPreview(Array.isArray(data?.previewItems) ? data.previewItems : []);
    } catch (err) {
      console.error(err);
      alert("No se pudo generar la previsualización.");
    } finally {
      setLoading(false);
    }
  };

  // Generar 
  const onGenerar = async () => {
    try {
      setLoading(true);
      const { data } = await api.post("/api/cuotas/admin/generar", {
        actividadId: Number(watchActividadId || 0),
        mes: watchMes,
        montoBase: Number(watch("montoBase") || 0),
        preview: false,
      });

      setPreview([]);
      alert(
        `Procesados: ${data?.processedSocios || 0} · Creadas: ${data?.created || 0} · Actualizadas: ${
          data?.updated || 0
        } · Sin actividad: ${data?.skips || 0}`
      );
    } catch (err) {
      console.error(err);
      alert("No se pudieron generar las cuotas.");
    } finally {
      setLoading(false);
    }
  };

  const getSocioApellidoNombre = (id) => {
    const item = socios.find(
      (s) => String(s?.socio?.id ?? s?.Socio?.id) === String(id)
    );
    const data = item?.socio || item?.Socio;
    return data ? `${data.apellido} ${data.nombre}` : `Socio #${id}`;
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
              <label className="form-label fw-semibold">Actividad</label>
              {actividadFija ? (
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
                Previsualización ({preview.length} cuotas)
              </h5>
              <div className="table-responsive shadow-sm">
                <table className="table table-striped align-middle">
                  <thead className="table-success">
                    <tr>
                      <th>Socio</th>
                      <th>Mes</th>
                      <th>Monto</th>
                      <th>Estado</th>
                      <th>Vencimiento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((c, i) => (
                      <tr key={i}>
                        <td>{getSocioApellidoNombre(c.socioId)}</td>
                        <td>{watchMes}</td>
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
