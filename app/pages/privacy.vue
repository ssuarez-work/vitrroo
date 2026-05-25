<template>
  <LegalLayout title="Política de Privacidad" :last-updated="lastUpdated">
    <p>
      Esta política explica qué datos recolectamos cuando usas Vitrroo, cómo los usamos y qué derechos tienes sobre ellos.
      Vitrroo cumple con la Ley Federal de Protección de Datos Personales en Posesión de Particulares (LFPDPPP) de México.
    </p>

    <h2>1. Responsable del tratamiento</h2>
    <p>
      Vitrroo es responsable de los datos personales que recibe de los dueños de tienda registrados. Para ejercer tus derechos, escribe a <a href="mailto:hola@vitrroo.com">hola@vitrroo.com</a>.
    </p>

    <h2>2. Datos que recolectamos</h2>
    <ul>
      <li><strong>De ti como dueño de tienda:</strong> correo electrónico, nombre de tienda, número de WhatsApp, logo y cualquier información de pago que proceses con Stripe.</li>
      <li><strong>De tus clientes visitantes:</strong> registramos eventos anónimos (visita al catálogo, clic en WhatsApp) sin información personal identificable.</li>
      <li><strong>Técnicos:</strong> dirección IP, tipo de navegador y referrer para protección contra abuso y análisis básico.</li>
    </ul>

    <h2>3. Cómo usamos tus datos</h2>
    <ul>
      <li>Operar y mejorar el servicio.</li>
      <li>Procesar pagos a través de Stripe (no almacenamos números completos de tarjeta).</li>
      <li>Enviar correos transaccionales: bienvenida, resúmenes semanales, recordatorios de trial.</li>
      <li>Detectar y prevenir abuso o fraude.</li>
    </ul>

    <h2>4. Con quién compartimos</h2>
    <p>
      Compartimos datos estrictamente con los proveedores que nos ayudan a operar el servicio:
    </p>
    <ul>
      <li><strong>Supabase</strong> (Estados Unidos) — almacenamiento de base de datos y autenticación.</li>
      <li><strong>Stripe</strong> (Estados Unidos) — procesamiento de pagos.</li>
      <li><strong>Resend</strong> (Estados Unidos) — envío de correos transaccionales.</li>
    </ul>
    <p>
      No vendemos tus datos a terceros. No compartimos tu información con anunciantes.
    </p>

    <h2>5. Cookies y almacenamiento local</h2>
    <p>
      Usamos almacenamiento local del navegador para mantener tu sesión activa y recordar tus preferencias del panel.
      No usamos cookies de seguimiento publicitario.
    </p>

    <h2>6. Tus derechos (ARCO)</h2>
    <p>
      Tienes derecho a Acceder, Rectificar, Cancelar u Oponerte al tratamiento de tus datos personales.
      Puedes ejercerlos desde tu panel ("Mi cuenta") o escribiendo a <a href="mailto:hola@vitrroo.com">hola@vitrroo.com</a>.
      Si eliminas tu cuenta, borramos tus datos permanentemente en un plazo de 30 días.
    </p>

    <h2>7. Seguridad</h2>
    <p>
      Usamos cifrado en tránsito (HTTPS) y en reposo. Los pagos son procesados por Stripe, certificado PCI DSS Level 1.
      Aun así, ningún sistema es 100% seguro: te recomendamos contraseñas únicas y fuertes.
    </p>

    <h2>8. Menores de edad</h2>
    <p>
      Vitrroo no está dirigido a menores de 18 años. Si descubrimos una cuenta de un menor sin autorización, la eliminamos.
    </p>

    <h2>9. Cambios a esta política</h2>
    <p>
      Podemos actualizar esta política. Te notificaremos por correo si los cambios son significativos. La fecha de última actualización aparece al inicio del documento.
    </p>
  </LegalLayout>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const lastUpdated = '21 de mayo de 2026'

useSeoMeta({
  title: 'Política de Privacidad | Vitrroo',
  description: 'Cómo Vitrroo recolecta y protege tus datos personales.'
})
</script>
