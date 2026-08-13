import React, { useEffect, useState } from "react";
import { Table, Button, Alert, Spinner, Card, Modal, Form, InputGroup } from "react-bootstrap"; // 👈 agregado InputGroup
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";

function ListSocios() {
  const [socios, setSocios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const usuarioStr = localStorage.getItem("usuario");
  const usuario = usuarioStr ? JSON.parse(usuarioStr) : null;
  const role = usuario?.rol || usuario?.role || null;

  const fetchSocios = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/socios`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSocios(response.data.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Error al cargar socios");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSocios();
  }, []);

  // Dar de baja/alta
  const toggleEstado = async (socio) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/users/${socio.id}`,
        { socio: { estado: socio.socio.estado === "ACTIVO" ? "INACTIVO" : "ACTIVO" } },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchSocios();
    } catch (err) {
      console.error(err);
      alert("Error al actualizar estado");
    }
  };

  // Eliminar
  const deleteSocio = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este socio?")) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchSocios();
    } catch (err) {
      console.error(err);
      alert("Error al eliminar socio");
    }
  };

  const verSusCuotas = (socio) => {
    navigate(`/cuotas-admin`, {
      state: {
        socioId: socio.socio.id,
        socioNombre: `${socio.socio.nombre} ${socio.socio.apellido}`,
        socioDni: socio.socio.dni,
      },
    });
  };

  // Ver detalles
  const handleVerDetalles = (socio) => {
    setModalData(socio);
    setIsEdit(false);
    setShowModal(true);
  };

  // Editar socio
  const handleEditar = (socio) => {
    setModalData(socio);
    setIsEdit(true);
    setShowModal(true);
  };

  // Guardar cambios desde modal
  const handleGuardarCambios = async () => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/users/${modalData.id}`,
        { socio: modalData.socio },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowModal(false);
      fetchSocios();
    } catch (err) {
      console.error(err);
      alert("Error al guardar cambios");
    }
  };

  // Filtro búsqueda
  const sociosFiltrados = socios.filter((s) =>
    `${s.socio?.nombre} ${s.socio?.apellido} ${s.socio?.dni}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <>
      <Header />
      <div className="container mt-4">
        <Card className="p-4 shadow-sm border-0 rounded-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="text-success fw-bold">Gestión de Socios</h2>
            <Button variant="success" onClick={() => navigate("/registro")}>
              Registrar Socio
            </Button>
          </div>

          {/* Buscador */}
          <InputGroup className="mb-4">
            <Form.Control
              type="text"
              placeholder="Buscar socio por nombre, apellido o DNI..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button variant="outline-secondary" onClick={() => setSearch("")}>
              Limpiar
            </Button>
          </InputGroup>

          {error && <Alert variant="danger">{error}</Alert>}

          {loading ? (
            <div className="d-flex justify-content-center py-5">
              <Spinner animation="border" />
            </div>
          ) : (
            <Table striped bordered hover responsive>
              <thead className="table-success">
                <tr>
                  <th>#</th>
                  <th>Nombre</th>
                  <th>Apellido</th>
                  <th>DNI</th>
                  <th>Email</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {sociosFiltrados.length > 0 ? (
                  sociosFiltrados.map((s, index) => (
                    <tr key={s.id}>
                      <td>{index + 1}</td>
                      <td>{s.socio?.nombre}</td>
                      <td>{s.socio?.apellido}</td>
                      <td>{s.socio?.dni}</td>
                      <td>{s.email}</td>
                      <td>
                        {s.socio?.estado === "ACTIVO" ? (
                          <span className="text-success fw-semibold">Activo</span>
                        ) : (
                          <span className="text-danger fw-semibold">Inactivo</span>
                        )}
                      </td>
                      <td className="d-flex flex-wrap gap-2">
                        <Button
                          variant="outline-info"
                          size="sm"
                          onClick={() => handleVerDetalles(s)}
                        >
                          Ver
                        </Button>

                        <Button
                          variant="outline-warning"
                          size="sm"
                          onClick={() => handleEditar(s)}
                        >
                          Editar
                        </Button>

                        <Button
                          variant={s.socio?.estado === "ACTIVO" ? "outline-danger" : "outline-success"}
                          size="sm"
                          onClick={() => toggleEstado(s)}
                        >
                          {s.socio?.estado === "ACTIVO"
                            ? "Dar de Baja"
                            : "Reactivar"}
                        </Button>
                        <Button
                          variant="outline-success"
                          size="sm"
                          onClick={() => verSusCuotas(s)}
                        >
                          Ver Cuotas
                        </Button>
                        {role === "ADMIN" && (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => deleteSocio(s.id)}
                          >
                            Eliminar
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center text-muted py-4">
                      No se encontraron socios registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </Card>
      </div>

      {/* Modal Detalles / Editar */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold text-success">
            {isEdit ? "Editar Socio" : "Detalles del Socio"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalData && (
            <>
              {isEdit ? (
                <Form>
                  <Form.Group className="mb-2">
                    <Form.Label>Nombre</Form.Label>
                    <Form.Control
                      value={modalData.socio.nombre}
                      onChange={(e) =>
                        setModalData({
                          ...modalData,
                          socio: { ...modalData.socio, nombre: e.target.value },
                        })
                      }
                    />
                  </Form.Group>
                  <Form.Group className="mb-2">
                    <Form.Label>Apellido</Form.Label>
                    <Form.Control
                      value={modalData.socio.apellido}
                      onChange={(e) =>
                        setModalData({
                          ...modalData,
                          socio: { ...modalData.socio, apellido: e.target.value },
                        })
                      }
                    />
                  </Form.Group>
                  <Form.Group className="mb-2">
                    <Form.Label>DNI</Form.Label>
                    <Form.Control
                      value={modalData.socio.dni}
                      onChange={(e) =>
                        setModalData({
                          ...modalData,
                          socio: { ...modalData.socio, dni: e.target.value },
                        })
                      }
                    />
                  </Form.Group>
                  <Form.Group className="mb-2">
                    <Form.Label>País</Form.Label>
                    <Form.Control
                      value={modalData.socio.pais}
                      onChange={(e) =>
                        setModalData({
                          ...modalData,
                          socio: { ...modalData.socio, pais: e.target.value },
                        })
                      }
                    />
                  </Form.Group>
                  <Form.Group className="mb-2">
                    <Form.Label>Sexo</Form.Label>
                    <Form.Control
                      value={modalData.socio.sexo}
                      onChange={(e) =>
                        setModalData({
                          ...modalData,
                          socio: { ...modalData.socio, sexo: e.target.value },
                        })
                      }
                    />
                  </Form.Group>
                </Form>
              ) : (
                <div className="text-dark">
                  <p><b>Nombre:</b> {modalData.socio.nombre}</p>
                  <p><b>Apellido:</b> {modalData.socio.apellido}</p>
                  <p><b>DNI:</b> {modalData.socio.dni}</p>
                  <p><b>Email:</b> {modalData.email}</p>
                  <p><b>Fecha Nacimiento:</b> {modalData.socio.fechaNacimiento?.split("T")[0]}</p>
                  <p><b>País:</b> {modalData.socio.pais}</p>
                  <p><b>Sexo:</b> {modalData.socio.sexo}</p>
                  <p><b>Estado:</b> {modalData.socio.estado}</p>
                </div>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          {isEdit && (
            <Button variant="success" onClick={handleGuardarCambios}>
              Guardar Cambios
            </Button>
          )}
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default ListSocios;
