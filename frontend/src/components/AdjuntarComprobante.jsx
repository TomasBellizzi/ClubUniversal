// src/components/AdjuntarComprobante.jsx
import React, { useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

const MAX_MB = 2;
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'pdf'];

function isAllowedFile(file) {
  if (!file) return false;
  const extension = file.name?.split('.').pop()?.toLowerCase();
  return ALLOWED_TYPES.includes(file.type) || ALLOWED_EXTENSIONS.includes(extension);
}

const schema = yup.object({
  archivo: yup
    .mixed()
    .test('required', 'Seleccioná un archivo', (value) => {
      // value es un FileList
      return value && value.length > 0;
    })
    .test('size', `El archivo debe pesar ≤ ${MAX_MB}MB`, (value) => {
      if (!value || !value[0]) return false;
      return value[0].size <= MAX_MB * 1024 * 1024;
    })
    .test('type', 'Formato permitido: JPG, PNG o PDF', (value) => {
      if (!value || !value[0]) return false;
      return isAllowedFile(value[0]);
    }),
});

export default function AdjuntarComprobante({ show, onHide, cuotaId, onAdjuntar }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { archivo: null },
  });

  // al cerrar modal, limpiar el form
  useEffect(() => {
    if (!show) reset({ archivo: null });
  }, [show, reset]);

  const onSubmit = async (data) => {
    const file = data.archivo?.[0];
    if (!file) return; // no debería pasar por el schema

    // delegamos la subida/actualización a la función que ya tenés en CuotasTable
    await onAdjuntar(cuotaId, file);

    // si todo fue bien, cierro y limpio
    reset({ archivo: null });
    onHide?.();
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Modal.Header closeButton>
          <Modal.Title>Adjuntar comprobante</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Group controlId="archivo">
            <Form.Label>Archivo (JPG, PNG o PDF · máx. {MAX_MB}MB)</Form.Label>
            <Form.Control
              type="file"
              accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
              {...register('archivo')}
              isInvalid={!!errors.archivo}
            />
            {errors.archivo && (
              <Form.Control.Feedback type="invalid">
                {errors.archivo.message}
              </Form.Control.Feedback>
            )}
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Subiendo…' : 'Adjuntar'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
