const EMAIL_API_URL = "https://api.emailjs.com/api/v1.0/email/send";

const EMAIL_SERVICE_ID = "service_8e7xygb";
const EMAIL_TEMPLATE_ID = "template_ldz3u8e";
const EMAIL_USER_ID = "EBpmz_ArrnXBPi-aJ";

export const emailService = {
  async enviarEmailCompra(entrada, usuario, evento) {
    try {
      const templateParams = {
        to_email: usuario.email || usuario.socio?.email || "",
        to_name: `${usuario.socio?.nombre || ""} ${usuario.socio?.apellido || ""}`,
        evento_nombre: evento.nombre,
        evento_fecha: evento.fecha,
        evento_hora: `${evento.horaInicio} - ${evento.horaFin}`,
        evento_ubicacion: evento.ubicacion || "No especificada",
        cantidad_entradas: entrada.cantidad,
        precio_unitario: evento.precioEntrada,
        precio_total: entrada.total || entrada.cantidad * evento.precioEntrada,
        codigo_entrada: entrada.codigoEntrada || entrada.id,
        comprador_dni: usuario.socio?.dni || usuario.dni,
        comprador_telefono: usuario.telefono || "No especificado",
      };

      if (!templateParams.to_email) {
        throw new Error("El destinatario esta vacio. No se puede enviar el correo.");
      }

      const response = await fetch(EMAIL_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: EMAIL_SERVICE_ID,
          template_id: EMAIL_TEMPLATE_ID,
          user_id: EMAIL_USER_ID,
          template_params: templateParams,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error al enviar el email: ${response.status} ${response.statusText} - ${errorText}`);
      }

      return { success: true, message: "Email enviado exitosamente" };
    } catch (error) {
      console.error("Error enviando email:", error);
      return { success: false, message: `Error al enviar el email: ${error.message}` };
    }
  },
};
