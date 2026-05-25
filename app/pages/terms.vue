<template>
  <LegalLayout title="Términos y Condiciones" :last-updated="lastUpdated">
    <p>
      Bienvenido a Vitrroo. Estos Términos rigen el uso de nuestro servicio de catálogos digitales para vender por WhatsApp.
      Al crear una cuenta aceptas estos Términos. Si no estás de acuerdo, no uses el servicio.
    </p>

    <h2>1. El servicio</h2>
    <p>
      Vitrroo te permite crear un catálogo público alojado en <code>vitrroo.com/tu-marca</code> y conectar pedidos a tu WhatsApp.
      Ofrecemos un plan Free con límites y un plan Pro de pago con funciones adicionales.
    </p>

    <h2>2. Tu cuenta</h2>
    <ul>
      <li>Eres responsable de mantener segura tu contraseña.</li>
      <li>Una persona o negocio puede tener una cuenta. Las cuentas no se transfieren entre dueños.</li>
      <li>Debes ser mayor de edad o tener autorización de un tutor legal.</li>
    </ul>

    <h2>3. Contenido que publicas</h2>
    <p>
      Tú eres el único responsable de la información, fotos y precios que publicas en tu catálogo.
      No puedes publicar contenido que sea ilegal, ofensivo, infrinja derechos de terceros o promocione productos prohibidos
      (drogas, armas, contenido sexual explícito, productos falsificados).
    </p>
    <p>
      Conservas la propiedad intelectual de tu contenido. Nos otorgas una licencia limitada para mostrarlo en tu catálogo público mientras tengas cuenta activa.
    </p>

    <h2>4. Pagos y suscripciones</h2>
    <ul>
      <li>El plan Pro se cobra mensual o anual a través de Stripe.</li>
      <li>Las suscripciones se renuevan automáticamente hasta que las canceles desde el portal de cliente.</li>
      <li>No hay reembolsos parciales por períodos no usados, salvo que la ley lo exija.</li>
      <li>Si tu pago falla, podemos suspender funciones Pro hasta que actualices tu método de pago.</li>
    </ul>

    <h2>5. Cancelación y eliminación</h2>
    <p>
      Puedes cancelar tu suscripción en cualquier momento; conservas Pro hasta el final del período pagado.
      Puedes eliminar tu cuenta y todos tus datos desde la sección "Mi cuenta" del panel. El borrado es permanente.
    </p>

    <h2>6. Disponibilidad y responsabilidad</h2>
    <p>
      Trabajamos para mantener el servicio disponible, pero no garantizamos cero downtime ni que el servicio esté libre de errores.
      Vitrroo no es responsable por ventas perdidas debido a interrupciones temporales del servicio.
    </p>
    <p>
      Vitrroo no procesa pagos entre tú y tus clientes. Eres responsable de cumplir con las obligaciones fiscales y legales de tu actividad comercial.
    </p>

    <h2>7. Cambios al servicio</h2>
    <p>
      Podemos modificar funciones, planes o precios con aviso razonable. Si un cambio te afecta como suscriptor Pro,
      te notificaremos por correo antes de aplicarlo.
    </p>

    <h2>8. Ley aplicable</h2>
    <p>
      Estos Términos se rigen por las leyes de los Estados Unidos Mexicanos. Cualquier controversia será resuelta en los tribunales de la Ciudad de México.
    </p>

    <h2>9. Contacto</h2>
    <p>
      ¿Dudas? Escríbenos a <a href="mailto:hola@vitrroo.com">hola@vitrroo.com</a>.
    </p>
  </LegalLayout>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const lastUpdated = '21 de mayo de 2026'

useSeoMeta({
  title: 'Términos y Condiciones | Vitrroo',
  description: 'Términos y condiciones del servicio Vitrroo.'
})
</script>
