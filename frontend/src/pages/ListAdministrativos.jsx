import React, { useEffect, useState } from "react";
import { Table, Button, Alert, Spinner, Card, Form, InputGroup, Modal, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";

function AdministrativosList() {
  const [administrativos, setAdministrativos] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAdm, setEditingAdm] = useState(null);
  const [editForm, setEditForm] = useState({
    nombre: "",
    apellido: "",
    dni: "",
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const fetchAdministrativos = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/administrativos`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAdministrativos(response.data.data);
      setFiltered(response.data.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Error al cargar administrativos");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdministrativos();
  }, []);

  // 🔹 Búsqueda
  useEffect(() => {
    if (!search) {
      setFiltered(administrativos);
    } else {
      const lower = search.toLowerCase();
      setFiltered(
        administrativos.filter(
          (adm) =>
            adm.administrativo?.nombre?.toLowerCase().includes(lower) ||
            adm.administrativo?.apellido?.toLowerCase().includes(lower) ||
            adm.administrativo?.dni?.toString().includes(lower)
        )
      );
    }
  }, [search, administrativos]);

  const toggleActivo = async (adm) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/users/${adm.id}`,
        { administrativo: { activo: !adm.administrativo.activo } },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchAdministrativos();
    } catch (err) {
      console.error(err);
      alert("Error al actualizar estado");
    }
  };

  const openEditModal = (adm) => {
    setEditingAdm(adm);
    setEditForm({
      nombre: adm.administrativo?.nombre || "",
      apellido: adm.administrativo?.apellido || "",
      dni: adm.administrativo?.dni?.toString() || "",
      email: adm.email || "",
      password: "",
    });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingAdm(null);
    setEditForm({
      nombre: "",
      apellido: "",
      dni: "",
      email: "",
      password: "",
    });
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const saveAdministrativo = async (event) => {
    event.preventDefault();
    if (!editingAdm) return;

    const payload = {
      email: editForm.email.trim(),
      administrativo: {
        nombre: editForm.nombre.trim(),
        apellido: editForm.apellido.trim(),
        dni: Number(editForm.dni),
      },
    };

    if (editForm.password.trim()) {
      payload.password = editForm.password.trim();
    }

    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/users/${editingAdm.id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      closeEditModal();
      fetchAdministrativos();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error al modificar administrativo");
    }
  };

  const deleteAdministrativo = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este administrativo?")) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAdministrativos();
    } catch (err) {
      console.error(err);
      alert("Error al eliminar administrativo");
    }
  };

  return (
    <>
      <Header />
      <div className="container mt-4">
        <Card className="p-4 shadow">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2>Administrativos</h2>
            <Button variant="success" onClick={() => navigate("/crear-administrativo")}>
              Registrar Administrativo
            </Button>
          </div>

          {/* Buscador */}
          <InputGroup className="mb-3">
            <Form.Control
              type="text"
              placeholder="Buscar por nombre, apellido o DNI..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </InputGroup>

          {error && <Alert variant="danger">{error}</Alert>}
          {loading ? (
            <div className="d-flex justify-content-center">
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
                  <th>Activo</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? (
                  filtered.map((adm, index) => (
                    <tr key={adm.id}>
                      <td>{index + 1}</td>
                      <td>{adm.administrativo?.nombre}</td>
                      <td>{adm.administrativo?.apellido}</td>
                      <td>{adm.administrativo?.dni}</td>
                      <td>{adm.email}</td>
                      <td>
                        {adm.administrativo?.activo ? (
                          <span className="text-success">Activo</span>
                        ) : (
                          <span className="text-danger">Inactivo</span>
                        )}
                      </td>
                      <td>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => openEditModal(adm)}
                        >
                          Editar
                        </Button>{" "}
                        <Button
                          variant={adm.administrativo?.activo ? "warning" : "success"}
                          size="sm"
                          onClick={() => toggleActivo(adm)}
                        >
                          {adm.administrativo?.activo ? "Dar de baja" : "Reactivar"}
                        </Button>{" "}
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => deleteAdministrativo(adm.id)}
                        >
                          Eliminar
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center">
                      No hay administrativos registrados
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </Card>
      </div>

      <Modal show={showEditModal} onHide={closeEditModal} centered>
        <Modal.Header closeButton className="bg-success text-white">
          <Modal.Title>Modificar Administrativo</Modal.Title>
        </Modal.Header>
        <Form onSubmit={saveAdministrativo}>
          <Modal.Body>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Nombre</Form.Label>
                  <Form.Control
                    name="nombre"
                    value={editForm.nombre}
                    onChange={handleEditChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Apellido</Form.Label>
                  <Form.Control
                    name="apellido"
                    value={editForm.apellido}
                    onChange={handleEditChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>DNI</Form.Label>
                  <Form.Control
                    name="dni"
                    type="number"
                    value={editForm.dni}
                    onChange={handleEditChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    name="email"
                    type="email"
                    value={editForm.email}
                    onChange={handleEditChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Nueva contraseña</Form.Label>
                  <Form.Control
                    name="password"
                    type="password"
                    value={editForm.password}
                    onChange={handleEditChange}
                    placeholder="Dejar vacio para no cambiarla"
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={closeEditModal}>
              Cancelar
            </Button>
            <Button variant="success" type="submit">
              Guardar cambios
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}

export default AdministrativosList;
