<template>
  <div
    aria-hidden="true"
    class="relative w-[240px] sm:w-[280px] lg:w-[320px] aspect-[320/650] bg-white rounded-[2.5rem] sm:rounded-[3rem] shadow-2xl border-[6px] sm:border-[8px] border-gray-900 overflow-hidden ring-4 ring-gray-900/10"
  >
    <div class="absolute top-0 inset-x-0 h-5 sm:h-6 bg-gray-900 rounded-b-3xl w-28 sm:w-40 mx-auto z-20" />

    <Transition name="mockup-fade">
      <section
        :key="theme.id"
        class="absolute inset-0 pt-7 sm:pt-9 pb-24 overflow-hidden"
        :style="screenStyle"
      >
        <header class="px-4 text-center mb-3">
          <div
            class="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-2 overflow-hidden shadow-sm border-2 border-white/80 relative"
            :style="logoStyle"
          >
            <Icon
              v-if="hasImageFailed(sample.logoImage)"
              :name="sample.logoIcon"
              class="absolute inset-0 m-auto w-6 h-6 sm:w-7 sm:h-7 text-white"
            />
            <img
              v-else
              :src="sample.logoImage"
              :alt="sample.storeName"
              class="w-full h-full object-cover"
              loading="lazy"
              referrerpolicy="no-referrer"
              @error="onImageError(sample.logoImage)"
            >
          </div>
          <h3 class="text-sm sm:text-base leading-tight" :style="headingStyle">
            {{ sample.storeName }}
          </h3>
          <p class="text-[10px] sm:text-[11px] mt-0.5" :style="mutedTextStyle">
            {{ sample.tagline }}
          </p>
        </header>

        <div :class="['px-3', gridClass]">
          <article
            v-for="product in visibleProducts"
            :key="product.name"
            :class="cardClass"
            :style="cardStyle"
          >
            <div :class="mediaClass" :style="mediaStyle">
              <Icon
                v-if="hasImageFailed(product.image)"
                :name="product.icon"
                class="absolute inset-0 m-auto w-5 h-5 sm:w-6 sm:h-6"
                :style="iconStyle"
              />
              <img
                v-else
                :src="product.image"
                :alt="product.name"
                class="w-full h-full object-cover"
                loading="lazy"
                referrerpolicy="no-referrer"
                @error="onImageError(product.image)"
              >
            </div>
            <div :class="cardTextWrapperClass">
              <p class="text-[10px] sm:text-[11px] font-semibold leading-tight line-clamp-1" :style="productNameStyle">
                {{ product.name }}
              </p>
              <p class="text-[11px] sm:text-xs font-bold mt-0.5" :style="priceStyle">
                {{ formatPrice(product.price) }}
              </p>
            </div>
          </article>
        </div>
      </section>
    </Transition>

    <div
      class="absolute bottom-4 sm:bottom-5 left-1/2 -translate-x-1/2 w-11/12 backdrop-blur-md py-2 px-3 border flex items-center gap-2 shadow-xl z-10 transition-colors duration-500"
      :style="bottomBarStyle"
    >
      <div
        class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-500"
        :style="whatsappBubbleStyle"
      >
        <Icon name="bi:whatsapp" class="w-4 h-4 text-white" />
      </div>
      <div class="min-w-0">
        <p class="text-[10px] font-semibold truncate transition-colors duration-500" :style="mutedTextStyle">
          Recibiendo pedidos
        </p>
        <p class="text-xs font-bold transition-colors duration-500" :style="headingStyle">
          En línea ahora
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  buildGoogleFontsUrl,
  FONT_DEFINITIONS,
  STORE_THEMES,
  type ThemeFontKey
} from '~/themes'

interface MockupProduct {
  name: string
  price: number
  icon: string
  image: string
}

interface MockupSample {
  storeName: string
  tagline: string
  logoIcon: string
  logoImage: string
  products: MockupProduct[]
}

const unsplashPhoto = (id: string, size = 320): string =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&q=80&w=${size}&h=${size}`

const SAMPLES: Record<string, MockupSample> = {
  soft: {
    storeName: 'Kuki Apparel',
    tagline: 'Streetwear & anime clothing 🚀',
    logoIcon: 'lucide:shirt',
    logoImage: unsplashPhoto('1523381210434-271e8be1f52b', 160),
    products: [
      { name: 'Playera Oversize Anime', price: 35000, icon: 'lucide:shirt', image: unsplashPhoto('1576566588028-4147f3842f27') },
      { name: 'Hoodie Essential Negro', price: 65000, icon: 'lucide:shirt', image: unsplashPhoto('1556821840-3a63f95609a7') },
      { name: 'Sneakers Box Logo', price: 145000, icon: 'lucide:footprints', image: unsplashPhoto('1551028719-00167b16eac5') },
      { name: 'Gorra Snapback', price: 28000, icon: 'lucide:shopping-bag', image: unsplashPhoto('1521369909029-2afed882baee') }
    ]
  },
  editorial: {
    storeName: 'Maison Lúa',
    tagline: 'Slow fashion · edición limitada',
    logoIcon: 'lucide:scissors',
    logoImage: unsplashPhoto('1490481651871-ab68de25d43d', 160),
    products: [
      { name: 'Blusa de lino crudo', price: 89000, icon: 'lucide:shirt', image: unsplashPhoto('1485518882345-15568b007407') },
      { name: 'Vestido midi seda', price: 178000, icon: 'lucide:shirt', image: unsplashPhoto('1539109136881-3be0616acf4b') },
      { name: 'Pantalón sastre lana', price: 134000, icon: 'lucide:shirt', image: unsplashPhoto('1594633312681-425c7b97ccd1') },
      { name: 'Saco oversize beige', price: 215000, icon: 'lucide:shirt', image: unsplashPhoto('1591047139829-d91aecb6caea') }
    ]
  },
  brutalist: {
    storeName: 'RAW / STUDIO',
    tagline: 'STREETWEAR · MX',
    logoIcon: 'lucide:zap',
    logoImage: unsplashPhoto('1542838132-92c53300491e', 160),
    products: [
      { name: 'TEE BLACK 001', price: 45000, icon: 'lucide:shirt', image: unsplashPhoto('1583743814966-8936f5b7be1a') },
      { name: 'CARGO PANT 003', price: 92000, icon: 'lucide:footprints', image: unsplashPhoto('1542272604-787c3835535d') },
      { name: 'SNEAKER BLACK 02', price: 165000, icon: 'lucide:footprints', image: unsplashPhoto('1552346154-21d32810aba3') },
      { name: 'HOODIE RAW EDITION', price: 78000, icon: 'lucide:shirt', image: unsplashPhoto('1556821840-3a63f95609a7') }
    ]
  },
  bubble: {
    storeName: 'Mochi Mochi',
    tagline: 'Plushies y kawaii goods 🍡',
    logoIcon: 'lucide:heart',
    logoImage: unsplashPhoto('1535982330050-f1c2fb79ff78', 160),
    products: [
      { name: 'Peluche conejo Mochi', price: 24000, icon: 'lucide:heart', image: unsplashPhoto('1576765608535-5f04d1e3f289') },
      { name: 'Pack stickers kawaii', price: 8000, icon: 'lucide:sparkles', image: unsplashPhoto('1583394293214-28ded15ee548') },
      { name: 'Llavero gatito', price: 12000, icon: 'lucide:heart', image: unsplashPhoto('1564631027894-5bdb17618445') },
      { name: 'Set pines anime', price: 9500, icon: 'lucide:sparkles', image: unsplashPhoto('1607344645866-009c320b63e0') }
    ]
  },
  luxury: {
    storeName: 'Ámbar Joyería',
    tagline: 'Piezas únicas en plata 925',
    logoIcon: 'lucide:gem',
    logoImage: unsplashPhoto('1599643477877-530eb83abc8e', 160),
    products: [
      { name: 'Anillo Solitario plata', price: 250000, icon: 'lucide:gem', image: unsplashPhoto('1605100804763-247f67b3557e') },
      { name: 'Collar Luna llena', price: 180000, icon: 'lucide:sparkles', image: unsplashPhoto('1611591437281-460bfbe1220a') },
      { name: 'Aretes minimal duo', price: 95000, icon: 'lucide:gem', image: unsplashPhoto('1573408301185-9146fe634ad0') },
      { name: 'Pulsera trenzada', price: 145000, icon: 'lucide:gem', image: unsplashPhoto('1602173574767-37ac01994b2a') }
    ]
  },
  bazaar: {
    storeName: 'Doña Mati',
    tagline: 'Antojitos y comida casera',
    logoIcon: 'lucide:utensils',
    logoImage: unsplashPhoto('1551218808-94e220e084d2', 160),
    products: [
      { name: 'Tacos al pastor (3)', price: 6500, icon: 'lucide:pizza', image: unsplashPhoto('1599974579688-8dbdd335c77f') },
      { name: 'Pozole rojo', price: 9500, icon: 'lucide:utensils', image: unsplashPhoto('1565299624946-b28f40a0ae38') },
      { name: 'Agua fresca 1L', price: 3500, icon: 'lucide:coffee', image: unsplashPhoto('1556679343-c7306c1976bc') },
      { name: 'Quesadillas (2)', price: 5500, icon: 'lucide:pizza', image: unsplashPhoto('1551782450-a2132b4ba21d') },
      { name: 'Tamales (2)', price: 4500, icon: 'lucide:utensils', image: unsplashPhoto('1551024506-0bccd828d307') },
      { name: 'Flan casero', price: 4000, icon: 'lucide:cake-slice', image: unsplashPhoto('1565958011703-44f9829ba187') }
    ]
  },
  story: {
    storeName: 'Noir Pastelería',
    tagline: 'Pasteles de autor por encargo',
    logoIcon: 'lucide:cake-slice',
    logoImage: unsplashPhoto('1486427944299-d1955d23e34d', 160),
    products: [
      { name: 'Pastel chocolate belga', price: 75000, icon: 'lucide:cake-slice', image: unsplashPhoto('1565958011703-44f9829ba187') },
      { name: 'Cheesecake fresas', price: 65000, icon: 'lucide:cake-slice', image: unsplashPhoto('1499636136210-6f4ee915583e') },
      { name: 'Macarons (caja 6)', price: 18000, icon: 'lucide:cookie', image: unsplashPhoto('1569864358642-9d1684040f43') },
      { name: 'Croissants artesanales', price: 12500, icon: 'lucide:croissant', image: unsplashPhoto('1568901346375-23c9450c58cd') }
    ]
  },
  list: {
    storeName: 'Cocina Verde',
    tagline: 'Menú del día · comida casera',
    logoIcon: 'lucide:salad',
    logoImage: unsplashPhoto('1546069901-ba9599a7e63c', 160),
    products: [
      { name: 'Ensalada César', price: 14500, icon: 'lucide:salad', image: unsplashPhoto('1546793665-c74683f339c1') },
      { name: 'Pasta primavera', price: 16500, icon: 'lucide:utensils', image: unsplashPhoto('1551183053-bf91a1d81141') },
      { name: 'Bowl mediterráneo', price: 17000, icon: 'lucide:salad', image: unsplashPhoto('1546069901-ba9599a7e63c') },
      { name: 'Pollo a la parrilla', price: 19500, icon: 'lucide:utensils', image: unsplashPhoto('1532550907401-a500c9a57435') }
    ]
  },
  polaroid: {
    storeName: 'Taller Lirio',
    tagline: 'Velas y cerámica artesanal',
    logoIcon: 'lucide:flame',
    logoImage: unsplashPhoto('1601042879364-f3947d3f9c16', 160),
    products: [
      { name: 'Vela soya · Lavanda', price: 22000, icon: 'lucide:flame', image: unsplashPhoto('1572177812156-58036aae439c') },
      { name: 'Maceta de barro', price: 18000, icon: 'lucide:droplet', image: unsplashPhoto('1578749556568-bc2c40e68b61') },
      { name: 'Vela bergamota', price: 24000, icon: 'lucide:flame', image: unsplashPhoto('1603006905003-be475563bc59') },
      { name: 'Plato cerámico', price: 28000, icon: 'lucide:droplet', image: unsplashPhoto('1610701596007-11502861dcfa') }
    ]
  },
  boutique: {
    storeName: 'Lina Studio',
    tagline: 'Curated for the modern wardrobe',
    logoIcon: 'lucide:shopping-bag',
    logoImage: unsplashPhoto('1490481651871-ab68de25d43d', 160),
    products: [
      { name: 'Bolso de cuero', price: 175000, icon: 'lucide:shopping-bag', image: unsplashPhoto('1591561954557-26941169b49e') },
      { name: 'Vestido midi', price: 142000, icon: 'lucide:shirt', image: unsplashPhoto('1539109136881-3be0616acf4b') },
      { name: 'Botines piel', price: 198000, icon: 'lucide:footprints', image: unsplashPhoto('1543163521-1bf539c55dd2') },
      { name: 'Blazer estructurado', price: 165000, icon: 'lucide:shirt', image: unsplashPhoto('1591047139829-d91aecb6caea') },
      { name: 'Falda plisada', price: 89000, icon: 'lucide:shirt', image: unsplashPhoto('1571513722275-4b41940f54b8') },
      { name: 'Camisa de seda', price: 112000, icon: 'lucide:shirt', image: unsplashPhoto('1485518882345-15568b007407') }
    ]
  }
}

const FALLBACK_SAMPLE = SAMPLES.soft

const { currentTheme: theme } = useThemeCarousel()

const sample = computed<MockupSample>(() => SAMPLES[theme.value.id] ?? FALLBACK_SAMPLE)

const failedImages = ref(new Set<string>())

const onImageError = (url: string): void => {
  failedImages.value.add(url)
}

const hasImageFailed = (url: string): boolean => failedImages.value.has(url)

const fontFamily = (key: ThemeFontKey): string => FONT_DEFINITIONS[key].fontFamilyCss

const formatPrice = (cents: number): string => `$${(cents / 100).toFixed(2)}`

const visibleProducts = computed<MockupProduct[]>(() => {
  const products = sample.value.products
  switch (theme.value.layout) {
    case 'single':
      return products.slice(0, 2)
    case 'grid-3':
      return products.slice(0, 6)
    case 'list':
      return products.slice(0, 3)
    case 'grid-2':
    default:
      return products.slice(0, 4)
  }
})

const isListLayout = computed(() => theme.value.layout === 'list')

const gridClass = computed(() => {
  switch (theme.value.layout) {
    case 'grid-3':
      return 'grid grid-cols-3 gap-1.5'
    case 'single':
      return 'flex flex-col gap-2'
    case 'list':
      return 'flex flex-col gap-1.5'
    case 'grid-2':
    default:
      return 'grid grid-cols-2 gap-2'
  }
})

const cardClass = computed(() => {
  const base = 'p-1.5 border overflow-hidden shadow-sm'
  return isListLayout.value ? `${base} flex flex-row items-center gap-2` : `${base} flex flex-col`
})

const cardTextWrapperClass = computed(() => (isListLayout.value ? 'flex-1 min-w-0' : 'mt-1'))

const mediaClass = computed(() => {
  const base = 'relative overflow-hidden flex items-center justify-center'
  if (isListLayout.value) return `${base} w-12 h-12 flex-shrink-0`
  return `${base} aspect-square w-full`
})

const brandTint = (hex: string, alphaHex: string): string => `${hex}${alphaHex}`

const screenStyle = computed(() => ({
  backgroundColor: theme.value.background,
  fontFamily: fontFamily(theme.value.bodyFont)
}))

const logoStyle = computed(() => ({
  backgroundColor: theme.value.brandColor,
  borderRadius: theme.value.headerVariant === 'centered-square' ? theme.value.cardRadius : '9999px'
}))

const headingStyle = computed(() => ({
  fontFamily: fontFamily(theme.value.headingFont),
  color: theme.value.textPrimary,
  letterSpacing: theme.value.letterSpacing,
  textTransform: theme.value.uppercaseHeadings ? ('uppercase' as const) : ('none' as const),
  fontWeight: theme.value.uppercaseHeadings ? 700 : 800
}))

const mutedTextStyle = computed(() => ({
  color: theme.value.textMuted,
  fontFamily: fontFamily(theme.value.bodyFont)
}))

const cardStyle = computed(() => ({
  backgroundColor: theme.value.surface,
  borderColor: theme.value.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
  borderRadius: theme.value.cardRadius
}))

const mediaStyle = computed(() => ({
  backgroundColor: brandTint(theme.value.brandColor, '1f'),
  borderRadius: theme.value.cardRadius
}))

const iconStyle = computed(() => ({ color: theme.value.brandColor }))

const productNameStyle = computed(() => ({
  color: theme.value.textPrimary,
  fontFamily: fontFamily(theme.value.bodyFont)
}))

const priceStyle = computed(() => ({
  color: theme.value.brandColor,
  fontFamily: fontFamily(theme.value.bodyFont)
}))

const bottomBarStyle = computed(() => ({
  backgroundColor: theme.value.isDark ? 'rgba(20,20,22,0.88)' : 'rgba(255,255,255,0.88)',
  borderColor: theme.value.isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,1)',
  borderRadius: theme.value.buttonRadius === '0rem' ? '0.5rem' : theme.value.buttonRadius
}))

const whatsappBubbleStyle = computed(() => ({
  backgroundColor: theme.value.brandColor
}))

const fontStylesheetHref = computed(() => {
  const keys = new Set<ThemeFontKey>()
  for (const item of STORE_THEMES) {
    keys.add(item.headingFont)
    keys.add(item.bodyFont)
  }
  return buildGoogleFontsUrl(Array.from(keys))
})

useHead({
  link: [{ rel: 'stylesheet', href: fontStylesheetHref.value }]
})
</script>

<style scoped>
.mockup-fade-enter-active,
.mockup-fade-leave-active {
  transition: opacity 0.55s ease, transform 0.55s ease;
}

.mockup-fade-enter-from {
  opacity: 0;
  transform: scale(0.97);
}

.mockup-fade-leave-to {
  opacity: 0;
  transform: scale(1.03);
}
</style>
