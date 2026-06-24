# Vitrroo — Paleta de colores y design tokens

Sistema visual derivado directo del código (`tailwind.config.ts`, `app/assets/css/tailwind.css`, `app/themes/index.ts`). Esta es la fuente de verdad — si tocas la paleta, se actualiza primero en código y luego este documento.

---

## 1. Identidad de marca

El color primario de Vitrroo es **verde brand-500** (`#22c55e`). Inspirado en el verde WhatsApp pero distinto: más vibrante, más saturado, menos teal. Es la palanca emocional que conecta el producto con el canal de venta.

### Escala primaria (verde)

| Token | Hex | RGB | Uso |
|---|---|---|---|
| `brand-50` | `#f0fdf4` | `240 253 244` | Fondos de chips, success light bg, hover sutil |
| `brand-100` | `#dcfce7` | `220 252 231` | Tags, badges, fondos de iconos pequeños |
| `brand-400` | `#4ade80` | `74 222 128` | Hover de elementos secundarios, gradientes |
| **`brand-500`** | **`#22c55e`** | **`34 197 94`** | **Primario. CTAs, links, focus rings, marca** |
| `brand-600` | `#16a34a` | `22 163 74` | Hover sobre brand-500, texto sobre brand-50 |
| `brand-700` | `#15803d` | `21 128 61` | Active state, texto pequeño sobre fondos claros |

```css
:root {
  --brand-50:  240 253 244;
  --brand-100: 220 252 231;
  --brand-400: 74 222 128;
  --brand-500: 34 197 94;
  --brand-600: 22 163 74;
  --brand-700: 21 128 61;
}
```

**Tailwind:** `bg-brand-500`, `text-brand-600`, `border-brand-100`, `ring-brand-500/20`.

Cuando un dueño de tienda Pro personaliza su color de marca, `useThemeColor.ts` regenera estos 6 tokens dinámicamente (mezclas con blanco para los claros, con negro para los oscuros) y se aplican como CSS vars en `:root` del storefront.

---

## 2. Neutrales — superficie, texto, bordes

La capa estructural. Genera la sensación "limpia y mobile-first" que define el look de Vitrroo.

| Token CSS | Hex | Tailwind | Uso |
|---|---|---|---|
| `--color-bg` | `#f8f8fa` | `bg-[#f8f8fa]` | Fondo de página, fuera de cards |
| `--color-surface` | `#ffffff` | `bg-white` | Cards, modales, sheets, inputs |
| `--color-border` | `#f0f0f2` | `border-[#f0f0f2]` | Divisores, bordes de cards y formularios |
| `--color-text` | `#0f0f10` | `text-gray-900` | Texto primario (casi negro, no puro) |
| `--color-muted` | `#8e8ea0` | `text-gray-500` | Texto secundario, placeholders, labels |

Notas:
- **No usamos negro puro `#000000`**: el casi-negro `#0f0f10` produce menos fatiga visual y mejor contraste percibido.
- **No usamos blanco puro fuera de las cards**: el bg gris `#f8f8fa` separa visualmente las cards del lienzo.

---

## 3. WhatsApp — el acento del canal

Vitrroo respeta los colores oficiales de WhatsApp para que el botón "Pedir por WhatsApp" sea **inmediatamente reconocible** en cualquier tienda. Es el único color que **no se sobrescribe** cuando el dueño cambia su tema.

| Token | Hex | Uso |
|---|---|---|
| `wa` (default) | `#25D366` | Botón principal "Pedir por WhatsApp" |
| `wa-dark` | `#128C7E` | Hover, active state |
| `wa-light` | `#dcfce7` | Backgrounds de chips/badges relacionados |

**Tailwind:** `bg-wa`, `hover:bg-wa-dark`, `text-wa`.

**Sombra de afinidad:** `shadow-wa` (`0 4px 24px 0 rgba(37,211,102,0.35)`) — un glow verde que destaca el CTA.

---

## 4. Status colors (semánticos)

Usados puntualmente para feedback. No tienen tokens custom; usamos Tailwind puro porque ya están bien calibrados.

| Estado | Tailwind | Hex | Dónde se usa |
|---|---|---|---|
| Success | `bg-brand-500` / `text-brand-700` | `#22c55e` | Toast success, badges activos |
| Warning | `bg-yellow-50` / `text-yellow-600` | `#fefce8` / `#ca8a04` | Trial badge, advertencias suaves |
| Error | `bg-red-50` / `text-red-600` | `#fef2f2` / `#dc2626` | Validaciones, zona peligrosa |
| Info | `bg-blue-50` / `text-blue-600` | `#eff6ff` / `#2563eb` | Toast info, mensajes neutrales |

---

## 5. Sombras

Tres niveles de profundidad — más allá rompe el look "flat-but-soft" del producto.

| Token | Valor | Uso |
|---|---|---|
| `shadow-card` | `0 2px 12px 0 rgba(0,0,0,0.06)` | Cards de productos, panels admin |
| `shadow-modal` | `0 24px 80px 0 rgba(0,0,0,0.18)` | Modales, bottom sheets |
| `shadow-wa` | `0 4px 24px 0 rgba(37,211,102,0.35)` | CTA WhatsApp |

---

## 6. Border radius

Suaves pero distinguibles — el lenguaje de formas de Vitrroo es **redondeado sin ser infantil**.

| Token CSS | Valor | Tailwind | Uso |
|---|---|---|---|
| `--radius-card` | `1.25rem` | `rounded-2xl` | Cards, panels |
| `--radius-modal` | `1.5rem` | `rounded-3xl` | Modales, bottom sheets |
| `--radius-btn` | `9999px` | `rounded-full` | Botones pill (WhatsApp CTA) |

Tailwind extras: `rounded-xl` (`0.75rem`) para inputs, `rounded-4xl` (`2rem`) custom para hero cards.

---

## 7. Tipografía

**Familia principal:** Plus Jakarta Sans (300, 400, 500, 600, 700, 800).
Cargada desde Google Fonts en `nuxt.config.ts`. Geométrica humanista, redondeada como nuestros radius — refuerza el tono mobile-friendly y aproximable.

**Familias secundarias** (solo en storefronts cuando el dueño elige un tema premium): Inter, Playfair Display, Cormorant Garamond, DM Serif Display, Fredoka, Space Grotesk.

**Tamaños guía:**
- H1 landing: `text-5xl` a `text-7xl` (`3rem`–`4.5rem`)
- H2 sección: `text-3xl` a `text-5xl`
- H3 card: `text-base` a `text-lg`
- Body: `text-base` (`1rem`)
- Small/label: `text-xs` (`0.75rem`) o `text-[10px]`
- Pesos comunes: 500 (medium), 600 (semibold), 700 (bold), 800 (extrabold)

---

## 8. Themes del storefront (catálogo del cliente)

Cada dueño Pro elige uno de **10 temas** para su tienda pública. Cada uno tiene su propia paleta — son parte del producto y por eso forman parte del sistema visual de Vitrroo aunque no sean los colores de marca corporativos.

| Theme | Brand | Background | Surface | Vibe |
|---|---|---|---|---|
| **Soft** (default) | `#22c55e` 🟢 | `#f8f8fa` | `#ffffff` | Limpio, neutral, cualquier negocio |
| **Editorial** | `#0f0f10` ⚫ | `#fafaf9` | `#ffffff` | Revista premium, slow fashion |
| **Brutalist** | `#0a0a0a` ⚫ | `#ffffff` | `#ffffff` | Streetwear, sin sombras, alto contraste |
| **Bubble Pop** | `#ec4899` 🩷 | `#fdf2f8` | `#ffffff` | Kawaii, juguetes, anime |
| **Luxury** | `#92400e` 🟤 | `#fdf6e3` | `#fffaef` | Joyería, perfumería, regalos premium |
| **Bazaar** | `#dc2626` 🔴 | `#fef2f2` | `#ffffff` | Comida callejera, abarrotes |
| **Story** | `#a855f7` 🟣 | `#0f0a14` ⚫ | `#1a121f` ⚫ | **Dark theme** — pastelería, eventos |
| **List** | `#0ea5e9` 🔵 | `#f0f9ff` | `#ffffff` | Restaurantes, menús, servicios |
| **Polaroid** | `#f59e0b` 🟠 | `#fffbeb` | `#ffffff` | Vintage, artesanal, manualidades |
| **Boutique** | `#1c1917` ⚫ | `#fafaf9` | `#ffffff` | Ropa curada, deco minimalista |

Cada theme define además: `cardRadius`, `buttonRadius`, `headingFont`, `bodyFont`, `density`, `layout` (grid-2 / grid-3 / single / list), y `headerVariant`. Definición completa en `app/themes/index.ts`.

---

## 9. Reglas de oro

1. **Brand-500 es sagrado** en todo el producto Vitrroo (landing, admin, emails). Los themes del storefront pueden sobrescribirlo solo dentro de `/[slug]`.
2. **El verde de WhatsApp (`#25D366`) nunca cambia** — ni siquiera por theme. Es marca de canal.
3. **Casi-negro `#0f0f10`** en lugar de negro puro, siempre.
4. **Fondos en gris `#f8f8fa`**, cards en blanco. Esa separación es clave.
5. **Máximo 3 sombras** (`card`, `modal`, `wa`). Nada más profundo.
6. **Radius consistente**: 0.75rem (inputs) / 1.25rem (cards) / 1.5rem (modales) / pill (CTAs WhatsApp).
7. **Tipografía única en admin**: Plus Jakarta Sans en pesos 400–800. Variar familias rompe la identidad.
8. **No introducir nuevos colores semánticos** sin actualizar este documento.

---

## 10. Tokens listos para diseño (Figma / Sketch)

```
# PRIMARIO
Brand 50    #f0fdf4
Brand 100   #dcfce7
Brand 400   #4ade80
Brand 500   #22c55e   ← primary
Brand 600   #16a34a
Brand 700   #15803d

# WHATSAPP
WA          #25D366
WA Dark     #128C7E
WA Light    #dcfce7

# NEUTRALES
Background  #f8f8fa
Surface     #ffffff
Border      #f0f0f2
Text        #0f0f10
Muted       #8e8ea0

# STATUS
Warning     #eab308
Error       #dc2626
Info        #3b82f6
```

---

## Quick reference para devs

```ts
// Importar color de marca en cualquier componente:
class="bg-brand-500 text-white hover:bg-brand-600"

// Usar variable CSS (themeable):
style="color: var(--brand-500); background: var(--color-surface)"

// Texto secundario consistente:
class="text-gray-500"  // = #6b7280, Tailwind default que casa con --color-muted

// WhatsApp CTA estándar:
class="btn-wa"  // Componente definido en tailwind.css
```
