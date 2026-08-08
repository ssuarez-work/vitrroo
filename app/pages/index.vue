<template>
  <div class="min-h-screen bg-[#f8f8fa] text-gray-900 font-sans selection:bg-brand-100 selection:text-brand-700">
    <nav class="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-sm">
      <div class="pt-safe">
        <div class="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-3">
          <NuxtLink to="/" class="flex items-center gap-2 min-h-11" aria-label="Vitrroo">
            <div class="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center shadow-md shadow-brand-500/30">
              <Icon name="lucide:shopping-bag" class="w-4 h-4 text-white" />
            </div>
            <span class="text-xl font-extrabold tracking-tight">Vitrroo<span class="text-brand-500">.</span></span>
          </NuxtLink>

          <div class="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-600">
            <a href="#caracteristicas" class="hover:text-gray-900 transition-colors">Características</a>
            <a href="#como-funciona" class="hover:text-gray-900 transition-colors">Cómo funciona</a>
            <a href="#precios" class="hover:text-gray-900 transition-colors">Precios</a>
            <a href="#preguntas" class="hover:text-gray-900 transition-colors">Preguntas</a>
          </div>

          <div class="flex items-center gap-2 md:gap-4">
            <NuxtLink to="/login" class="hidden md:inline-block text-sm font-bold text-gray-700 hover:text-gray-900 px-2 py-2">
              Entrar
            </NuxtLink>
            <NuxtLink
              to="/register"
              class="hidden md:inline-flex px-5 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-colors shadow-md btn-press"
            >
              Crear catálogo
            </NuxtLink>

            <NuxtLink
              to="/register"
              class="md:hidden px-4 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl active:bg-gray-800 transition-colors shadow-md"
            >
              Crear
            </NuxtLink>
            <button
              class="md:hidden min-w-11 min-h-11 -mr-2 flex items-center justify-center text-gray-700 active:text-gray-900 transition-colors"
              aria-label="Abrir menú"
              @click="isMobileMenuOpen = true"
            >
              <Icon name="lucide:menu" class="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </nav>

    <LandingMobileMenu v-model="isMobileMenuOpen" />

    <section class="pt-[calc(env(safe-area-inset-top)+6rem)] md:pt-32 pb-16 md:pb-20 px-5 md:px-6 relative overflow-hidden">
      <div class="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] md:w-[800px] h-[300px] md:h-[400px] bg-brand-400/20 rounded-full mix-blend-multiply filter blur-[80px] md:blur-[100px] opacity-70 pointer-events-none"></div>

      <div class="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-10 md:gap-16 relative z-10">
        <div class="flex-1 text-center lg:text-left">
          <h1 class="text-[2.5rem] sm:text-5xl lg:text-7xl font-extrabold tracking-tight text-gray-900 mb-5 md:mb-6 leading-[1.05]">
            Tu catálogo digital para vender por
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-emerald-400">WhatsApp.</span>
          </h1>
          <p class="text-base sm:text-lg lg:text-xl text-gray-500 mb-6 md:mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
            Sube tus productos, comparte tu enlace y recibe pedidos directos en WhatsApp.
          </p>
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 justify-center lg:justify-start">
            <NuxtLink
              to="/register"
              class="w-full sm:w-auto px-6 md:px-8 py-4 bg-brand-500 text-white text-base md:text-lg font-bold rounded-2xl hover:bg-brand-600 active:bg-brand-700 transition-colors shadow-lg shadow-brand-500/30 btn-press flex items-center justify-center gap-2 min-h-14"
            >
              Comenzar gratis
              <Icon name="lucide:arrow-right" class="w-5 h-5" />
            </NuxtLink>
            <a
              href="#como-funciona"
              class="w-full sm:w-auto px-6 md:px-8 py-4 bg-white text-gray-900 text-base md:text-lg font-bold rounded-2xl hover:bg-gray-50 active:bg-gray-100 border border-gray-200 transition-colors shadow-sm btn-press flex items-center justify-center gap-2 min-h-14"
            >
              <Icon name="lucide:play-circle" class="w-5 h-5 text-gray-400" />
              Ver cómo funciona
            </a>
          </div>
          <div class="mt-6 md:mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-2 text-xs sm:text-sm font-medium text-gray-500">
            <div class="flex items-center gap-1.5"><Icon name="lucide:check-circle-2" class="w-4 h-4 text-brand-500" /> Listo en 2 minutos</div>
            <div class="flex items-center gap-1.5"><Icon name="lucide:check-circle-2" class="w-4 h-4 text-brand-500" /> Sin comisiones por venta</div>
            <div class="flex items-center gap-1.5"><Icon name="lucide:check-circle-2" class="w-4 h-4 text-brand-500" /> Gratis para empezar</div>
          </div>
        </div>

        <div class="w-full lg:flex-1 max-w-md flex justify-center">
          <LandingHeroStorefrontMockup />
        </div>
      </div>
    </section>

    <section class="py-8 md:py-10 border-y border-[#f0f0f2] bg-white">
      <div class="max-w-7xl mx-auto px-5 md:px-6 text-center">
        <p class="text-xs sm:text-sm font-bold text-gray-400 mb-5 md:mb-6 uppercase tracking-wider">Hecho para vendedores de</p>
        <div class="grid grid-cols-2 md:flex md:flex-wrap md:justify-center items-center gap-4 md:gap-12">
          <div class="flex items-center justify-center gap-2 text-sm sm:text-base md:text-xl font-extrabold text-gray-700 opacity-70">
            <Icon name="lucide:shirt" class="w-5 h-5 md:w-6 md:h-6" /> Ropa y Moda
          </div>
          <div class="flex items-center justify-center gap-2 text-sm sm:text-base md:text-xl font-extrabold text-gray-700 opacity-70">
            <Icon name="lucide:utensils" class="w-5 h-5 md:w-6 md:h-6" /> Comida Local
          </div>
          <div class="flex items-center justify-center gap-2 text-sm sm:text-base md:text-xl font-extrabold text-gray-700 opacity-70">
            <Icon name="lucide:watch" class="w-5 h-5 md:w-6 md:h-6" /> Accesorios
          </div>
          <div class="flex items-center justify-center gap-2 text-sm sm:text-base md:text-xl font-extrabold text-gray-700 opacity-70">
            <Icon name="lucide:sparkles" class="w-5 h-5 md:w-6 md:h-6" /> Belleza
          </div>
          <div class="col-span-2 md:col-span-1 flex items-center justify-center gap-2 text-sm sm:text-base md:text-xl font-extrabold text-brand-600">
            <Icon name="lucide:plus-circle" class="w-5 h-5 md:w-6 md:h-6" /> y muchos más
          </div>
        </div>
        <p class="text-xs sm:text-sm md:text-base text-gray-500 mt-6 md:mt-8 max-w-xl mx-auto leading-relaxed">
          Si lo vendes por WhatsApp, lo vendes con Vitrroo.
        </p>
      </div>
    </section>

    <section id="caracteristicas" class="py-16 md:py-24 px-5 md:px-6 bg-white">
      <div class="max-w-7xl mx-auto">
        <div class="text-center max-w-2xl mx-auto mb-10 md:mb-16">
          <h2 class="text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-3 md:mb-4">El catálogo más rápido entre tu cliente y WhatsApp</h2>
          <p class="text-base md:text-lg text-gray-500">Sin plataforma de e-commerce. Sin carrito. Sin métodos de pago configurando. Solo tu producto y un botón verde.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-8">
          <article class="bg-[#f8f8fa] rounded-3xl md:rounded-[2rem] p-6 md:p-8 border border-[#f0f0f2] md:hover:shadow-xl md:hover:-translate-y-1 transition-all duration-300">
            <div class="w-12 h-12 md:w-14 md:h-14 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mb-4 md:mb-6">
              <Icon name="lucide:smartphone" class="w-6 h-6 md:w-7 md:h-7 text-gray-900" />
            </div>
            <h3 class="text-lg md:text-xl font-bold text-gray-900 mb-2 md:mb-3">Se ve como una app</h3>
            <p class="text-gray-500 leading-relaxed text-sm md:text-base">Tu enlace abre una mini-app móvil con tu logo, fotos y precios. Tus clientes ven productos como en Instagram, no como en una tienda online de los 2000.</p>
          </article>
          <article class="bg-[#f8f8fa] rounded-3xl md:rounded-[2rem] p-6 md:p-8 border border-[#f0f0f2] md:hover:shadow-xl md:hover:-translate-y-1 transition-all duration-300">
            <div class="w-12 h-12 md:w-14 md:h-14 bg-brand-500 rounded-2xl shadow-md shadow-brand-500/30 flex items-center justify-center mb-4 md:mb-6">
              <Icon name="bi:whatsapp" class="w-6 h-6 md:w-7 md:h-7 text-white" />
            </div>
            <h3 class="text-lg md:text-xl font-bold text-gray-900 mb-2 md:mb-3">Pedidos por WhatsApp</h3>
            <p class="text-gray-500 leading-relaxed text-sm md:text-base">El cliente elige producto, talla o sabor y pulsa el botón. Le abre WhatsApp con el mensaje ya escrito. Tú confirmas y cobras como siempre.</p>
          </article>
          <article class="bg-[#f8f8fa] rounded-3xl md:rounded-[2rem] p-6 md:p-8 border border-[#f0f0f2] md:hover:shadow-xl md:hover:-translate-y-1 transition-all duration-300">
            <div class="w-12 h-12 md:w-14 md:h-14 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mb-4 md:mb-6">
              <Icon name="lucide:zap" class="w-6 h-6 md:w-7 md:h-7 text-yellow-500" />
            </div>
            <h3 class="text-lg md:text-xl font-bold text-gray-900 mb-2 md:mb-3">Un solo enlace para todo</h3>
            <p class="text-gray-500 leading-relaxed text-sm md:text-base">Pégalo en tu bio de Instagram, TikTok o estado de WhatsApp. Carga al instante en cualquier teléfono y siempre muestra tu catálogo más actualizado.</p>
          </article>
        </div>
      </div>
    </section>

    <section id="como-funciona" class="py-16 md:py-24 px-5 md:px-6 bg-gray-900 text-white overflow-hidden">
      <div class="max-w-7xl mx-auto">
        <div class="text-center max-w-2xl mx-auto mb-10 md:mb-16">
          <h2 class="text-3xl md:text-5xl font-extrabold tracking-tight mb-3 md:mb-4 text-white">De cero a vendiendo, en tres pasos</h2>
          <p class="text-base md:text-lg text-gray-400">Sin diseñadores, sin programadores, sin tutoriales largos. Lo terminas antes de que se enfríe tu café.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 relative">
          <div class="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-gray-800 via-gray-600 to-gray-800"></div>

          <div class="text-center relative z-10">
            <div class="w-20 h-20 md:w-24 md:h-24 mx-auto bg-gray-800 rounded-full flex items-center justify-center mb-4 md:mb-6 border-[6px] md:border-8 border-gray-900 shadow-xl">
              <span class="text-2xl md:text-3xl font-black text-white">1</span>
            </div>
            <h3 class="text-lg md:text-xl font-bold mb-2">Configura tu tienda</h3>
            <p class="text-gray-400 text-sm md:text-base px-2 md:px-0">Pon nombre, logo y tu número de WhatsApp. Te damos tu enlace tipo vitrroo.com/tu-marca.</p>
          </div>

          <div class="text-center relative z-10">
            <div class="w-20 h-20 md:w-24 md:h-24 mx-auto bg-brand-500 rounded-full flex items-center justify-center mb-4 md:mb-6 border-[6px] md:border-8 border-gray-900 shadow-xl shadow-brand-500/20">
              <span class="text-2xl md:text-3xl font-black text-white">2</span>
            </div>
            <h3 class="text-lg md:text-xl font-bold mb-2">Sube tus productos</h3>
            <p class="text-gray-400 text-sm md:text-base px-2 md:px-0">Foto, precio y variantes (tallas, sabores o colores) con su stock. En segundos están en tu catálogo.</p>
          </div>

          <div class="text-center relative z-10">
            <div class="w-20 h-20 md:w-24 md:h-24 mx-auto bg-gray-800 rounded-full flex items-center justify-center mb-4 md:mb-6 border-[6px] md:border-8 border-gray-900 shadow-xl">
              <span class="text-2xl md:text-3xl font-black text-white">3</span>
            </div>
            <h3 class="text-lg md:text-xl font-bold mb-2">Recibe pedidos</h3>
            <p class="text-gray-400 text-sm md:text-base px-2 md:px-0">Comparte tu enlace en bio o stories. Cada pedido llega a tu WhatsApp con producto, variante y precio listos.</p>
          </div>
        </div>
      </div>
    </section>

    <section id="precios" class="py-16 md:py-24 px-5 md:px-6 bg-[#f8f8fa]">
      <div class="max-w-7xl mx-auto">
        <div class="text-center max-w-2xl mx-auto mb-10 md:mb-16">
          <h2 class="text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-3 md:mb-4">Empieza gratis, paga cuando vendas más</h2>
          <p class="text-base md:text-lg text-gray-500">Cero comisiones por venta. Tu enlace, tus clientes, tu WhatsApp.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8 max-w-4xl mx-auto">
          <article class="bg-white rounded-3xl md:rounded-[2.5rem] p-6 md:p-10 border border-[#f0f0f2] shadow-sm">
            <h3 class="text-xl md:text-2xl font-bold text-gray-900 mb-2">Básico</h3>
            <p class="text-gray-500 mb-5 md:mb-6">Para validar tu negocio sin invertir.</p>
            <div class="mb-6 md:mb-8">
              <span class="text-4xl md:text-5xl font-extrabold text-gray-900">$0</span>
              <span class="text-base md:text-lg text-gray-500 font-medium">/mes</span>
            </div>
            <ul class="space-y-3 md:space-y-4 mb-6 md:mb-8">
              <li class="flex items-center gap-3 text-gray-600 font-medium"><Icon name="lucide:check" class="w-5 h-5 text-green-500" /> Hasta 15 productos</li>
              <li class="flex items-center gap-3 text-gray-600 font-medium"><Icon name="lucide:check" class="w-5 h-5 text-green-500" /> Pedidos por WhatsApp ilimitados</li>
              <li class="flex items-center gap-3 text-gray-600 font-medium"><Icon name="lucide:check" class="w-5 h-5 text-green-500" /> Enlace público vitrroo.com/tu-marca</li>
              <li class="flex items-center gap-3 text-gray-600 font-medium"><Icon name="lucide:check" class="w-5 h-5 text-green-500" /> Panel para administrar desde el móvil</li>
            </ul>
            <NuxtLink
              to="/register"
              class="block text-center w-full py-3.5 md:py-4 bg-gray-100 text-gray-900 font-bold rounded-2xl hover:bg-gray-200 active:bg-gray-300 transition-colors btn-press min-h-12"
            >
              Empezar gratis
            </NuxtLink>
          </article>

          <article class="bg-gray-900 rounded-3xl md:rounded-[2.5rem] p-6 md:p-10 border border-gray-800 shadow-2xl relative overflow-hidden">
            <div class="absolute top-0 right-0 w-32 h-32 bg-brand-500 rounded-bl-full opacity-20 filter blur-xl"></div>
            <div class="inline-flex items-center px-3 py-1 rounded-full bg-brand-500/20 text-brand-400 text-xs font-bold mb-3 md:mb-4 uppercase tracking-wider">Más popular</div>
            <h3 class="text-xl md:text-2xl font-bold text-white mb-2">Pro</h3>
            <p class="text-gray-400 mb-5 md:mb-6">Para vendedores con catálogo grande.</p>
            <div class="mb-6 md:mb-8">
              <span class="text-4xl md:text-5xl font-extrabold text-white">$99</span>
              <span class="text-base md:text-lg text-gray-400 font-medium"> MXN/mes</span>
              <p class="text-xs text-brand-400 font-semibold mt-2">o $890 MXN/año (ahorra 25%)</p>
            </div>
            <ul class="space-y-3 md:space-y-4 mb-6 md:mb-8">
              <li class="flex items-center gap-3 text-gray-300 font-medium"><Icon name="lucide:check" class="w-5 h-5 text-brand-400" /> Productos ilimitados</li>
              <li class="flex items-center gap-3 text-gray-300 font-medium"><Icon name="lucide:check" class="w-5 h-5 text-brand-400" /> Categorías y variantes con stock</li>
              <li class="flex items-center gap-3 text-gray-300 font-medium"><Icon name="lucide:check" class="w-5 h-5 text-brand-400" /> Estadísticas de visitas y clics</li>
              <li class="flex items-center gap-3 text-gray-300 font-medium"><Icon name="lucide:check" class="w-5 h-5 text-brand-400" /> Soporte prioritario por WhatsApp</li>
            </ul>
            <NuxtLink
              to="/register"
              class="block text-center w-full py-3.5 md:py-4 bg-brand-500 text-white font-bold rounded-2xl hover:bg-brand-600 active:bg-brand-700 transition-colors shadow-lg shadow-brand-500/30 btn-press min-h-12"
            >
              Obtener Pro
            </NuxtLink>
          </article>
        </div>
      </div>
    </section>

    <section id="preguntas" class="py-16 md:py-24 px-5 md:px-6 bg-[#f8f8fa] border-t border-[#f0f0f2]">
      <div class="max-w-3xl mx-auto">
        <div class="text-center mb-10 md:mb-14">
          <h2 class="text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-3 md:mb-4">Preguntas frecuentes</h2>
          <p class="text-base md:text-lg text-gray-500">Lo que más nos preguntan antes de empezar.</p>
        </div>
        <div class="space-y-3 md:space-y-4">
          <details
            v-for="(item, index) in faqItems"
            :key="item.question"
            class="group bg-white rounded-2xl md:rounded-3xl border border-[#f0f0f2] shadow-sm overflow-hidden"
            :open="index === 0"
          >
            <summary class="flex items-center justify-between gap-3 cursor-pointer p-5 md:p-6 list-none">
              <h3 class="text-base md:text-lg font-bold text-gray-900 leading-snug">{{ item.question }}</h3>
              <Icon name="lucide:chevron-down" class="w-5 h-5 text-gray-400 flex-shrink-0 transition-transform group-open:rotate-180" />
            </summary>
            <div class="px-5 pb-5 md:px-6 md:pb-6 text-gray-600 leading-relaxed">
              {{ item.answer }}
            </div>
          </details>
        </div>
      </div>
    </section>

    <section class="py-16 md:py-24 px-5 md:px-6 bg-white border-t border-[#f0f0f2]">
      <div class="max-w-4xl mx-auto text-center">
        <h2 class="text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-4 md:mb-6">Tu catálogo, listo en 5 minutos</h2>
        <p class="text-base md:text-xl text-gray-500 mb-8 md:mb-10">Cuenta gratis, sin tarjeta. Sube tus primeros productos y comparte tu enlace hoy mismo.</p>
        <NuxtLink
          to="/register"
          class="inline-flex w-full sm:w-auto justify-center px-8 md:px-10 py-4 md:py-5 bg-gray-900 text-white text-base md:text-lg font-bold rounded-2xl hover:bg-gray-800 active:bg-gray-700 transition-all shadow-xl md:hover:-translate-y-1 btn-press min-h-14"
        >
          Crear mi catálogo gratis
        </NuxtLink>
      </div>
    </section>

    <footer class="bg-gray-50 py-10 md:py-12 px-5 md:px-6 border-t border-gray-200 pb-[calc(env(safe-area-inset-bottom)+2.5rem)]">
      <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5">
        <div class="flex items-center gap-2">
          <Icon name="lucide:shopping-bag" class="w-5 h-5 text-gray-400" />
          <span class="text-lg font-bold text-gray-900">Vitrroo.</span>
        </div>
        <div class="text-center">
          <p class="text-gray-500 text-xs md:text-sm font-medium">
            © {{ currentYear }} Vitrroo Inc. Todos los derechos reservados.
          </p>
          <div class="flex justify-center gap-4 mt-2 text-xs">
            <NuxtLink to="/terms" class="text-gray-500 hover:text-gray-900 transition-colors">Términos</NuxtLink>
            <NuxtLink to="/privacy" class="text-gray-500 hover:text-gray-900 transition-colors">Privacidad</NuxtLink>
          </div>
        </div>
        <div class="flex items-center gap-1">
          <a
            href="#"
            class="min-w-11 min-h-11 flex items-center justify-center text-gray-400 hover:text-gray-900 active:text-gray-900 transition-colors rounded-full"
            aria-label="Instagram"
          >
            <Icon name="bi:instagram" class="w-5 h-5" />
          </a>
          <a
            href="#"
            class="min-w-11 min-h-11 flex items-center justify-center text-gray-400 hover:text-gray-900 active:text-gray-900 transition-colors rounded-full"
            aria-label="X"
          >
            <Icon name="bi:twitter-x" class="w-5 h-5" />
          </a>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

definePageMeta({ layout: false })

const isMobileMenuOpen = ref(false)
const currentYear = new Date().getFullYear()

const siteUrl = useSiteUrl()
const ogImageUrl = `${siteUrl}/og-image.svg`

useCanonical()

useSeoMeta({
  title: 'Vitrroo · Catálogo digital para vender por WhatsApp en México',
  description: 'Crea tu catálogo móvil en 5 minutos, comparte tu enlace y recibe pedidos directos en WhatsApp. Sin comisiones, sin sitio web, gratis para empezar.',
  ogTitle: 'Vitrroo · Catálogo digital para vender por WhatsApp',
  ogDescription: 'Sube tus productos, comparte tu enlace y vende por WhatsApp con un mensaje precargado. Pro desde $99 MXN/mes. Sin comisiones.',
  ogType: 'website',
  ogUrl: siteUrl,
  ogImage: ogImageUrl,
  ogImageWidth: 1200,
  ogImageHeight: 630,
  twitterCard: 'summary_large_image',
  twitterTitle: 'Vitrroo · Catálogo digital para vender por WhatsApp',
  twitterDescription: 'Tu catálogo móvil listo en 5 minutos. Pedidos directos por WhatsApp. Pro desde $99 MXN/mes.',
  twitterImage: ogImageUrl
})

const faqItems = [
  {
    question: '¿Cuánto cuesta usar Vitrroo?',
    answer: 'El plan Free es gratis para siempre con hasta 15 productos. El plan Pro cuesta $99 MXN al mes o $890 MXN al año (ahorra 25%) e incluye productos ilimitados, categorías, variantes con stock y estadísticas avanzadas.'
  },
  {
    question: '¿Cómo cobro a mis clientes?',
    answer: 'Los pedidos llegan directo a tu WhatsApp con un mensaje precargado. Tú cobras como ya lo haces: efectivo, transferencia o terminal Clip. Vitrroo no cobra comisión por venta.'
  },
  {
    question: '¿Necesito tener página web o conocimientos técnicos?',
    answer: 'No. En 5 minutos creas tu catálogo, agregas productos con fotos y compartes tu enlace personalizado vitrroo.com/tu-marca en Instagram, TikTok o tu estado de WhatsApp.'
  },
  {
    question: '¿Funciona en celular?',
    answer: 'Sí, está diseñado mobile-first. Tu catálogo se ve como una mini-app en el teléfono de tu cliente y tú lo administras también desde tu celular.'
  },
  {
    question: '¿Puedo cancelar mi suscripción cuando quiera?',
    answer: 'Sí, sin penalización. Cancelas desde el panel y mantienes Pro hasta el final del periodo pagado. Tus datos se conservan en caso de que quieras reactivar.'
  },
  {
    question: '¿Para qué tipo de negocios sirve Vitrroo?',
    answer: 'Para cualquier negocio pequeño que vende por WhatsApp: ropa, comida casera, repostería, accesorios, joyería, productos artesanales, plantas, libros y más.'
  }
]

const structuredData = computed(() => ({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: 'Vitrroo',
      url: siteUrl,
      logo: `${siteUrl}/apple-touch-icon.svg`,
      sameAs: [] as string[],
      contactPoint: {
        '@type': 'ContactPoint',
        email: 'hola@vitrroo.com',
        contactType: 'customer support',
        availableLanguage: ['Spanish']
      }
    },
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      url: siteUrl,
      name: 'Vitrroo',
      description: 'Catálogo digital para vender por WhatsApp en México.',
      publisher: { '@id': `${siteUrl}/#organization` },
      inLanguage: 'es-MX'
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Vitrroo',
      operatingSystem: 'Web, iOS, Android',
      applicationCategory: 'BusinessApplication',
      description: 'SaaS de catálogos digitales mobile-first con pedidos por WhatsApp.',
      offers: [
        {
          '@type': 'Offer',
          name: 'Plan Free',
          price: '0',
          priceCurrency: 'MXN'
        },
        {
          '@type': 'Offer',
          name: 'Plan Pro Mensual',
          price: '99',
          priceCurrency: 'MXN',
          priceSpecification: {
            '@type': 'UnitPriceSpecification',
            price: '99',
            priceCurrency: 'MXN',
            referenceQuantity: { '@type': 'QuantitativeValue', value: '1', unitCode: 'MON' }
          }
        },
        {
          '@type': 'Offer',
          name: 'Plan Pro Anual',
          price: '890',
          priceCurrency: 'MXN'
        }
      ],
      aggregateRating: undefined
    },
    {
      '@type': 'FAQPage',
      mainEntity: faqItems.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer
        }
      }))
    }
  ]
}))

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: () => JSON.stringify(structuredData.value)
    }
  ]
})
</script>

<style scoped>
.pt-safe {
  padding-top: env(safe-area-inset-top);
}
</style>
