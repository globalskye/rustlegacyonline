# 🎨 Design Guide - Rust Legacy Website

## Цветовая палитра

### Основные цвета

```
🔵 Primary Blue (#0ea5e9)
├─ Основной цвет интерфейса
├─ Кнопки, заголовки, акценты
└─ Используется для hover эффектов

🔷 Accent Cyan (#06b6d4)
├─ Дополнительный акцент
├─ Градиенты вместе с Primary Blue
└─ Подсветка элементов

🌊 Accent Teal (#14b8a6)
└─ Дополнительный акцент для разнообразия
```

### Фоновые цвета

```
⬛ Darkest Background (#030712)
├─ Основной фон сайта
└─ Самый темный слой

🌑 Dark Background (#0a1628)
├─ Фон секций
└─ Градиент фона

🌃 Card Background (#0f172a)
├─ Фон карточек
└─ Фон модальных окон

🌆 Card Hover (#1e293b)
└─ Фон карточек при наведении
```

### Цвета текста

```
⚪ Primary Text (#f8fafc)
├─ Основной текст
└─ Заголовки

⚫ Secondary Text (#cbd5e1)
├─ Вторичный текст
└─ Описания

⬜ Muted Text (#94a3b8)
└─ Приглушенный текст
```

### Эффекты свечения

```
✨ Blue Glow (rgba(14, 165, 233, 0.5))
├─ Тени от кнопок
└─ Эффект свечения элементов

💫 Cyan Glow (rgba(6, 182, 212, 0.5))
└─ Дополнительное свечение

⭐ Bright Glow (rgba(56, 189, 248, 0.8))
└─ Яркое свечение при hover
```

## Типографика

### Шрифты

**Orbitron** - Заголовки
- Font Weight: 400, 600, 700, 900
- Использование: H1, H2, Navigation Logo, Section Titles
- Стиль: Футуристический, игровой, технологичный

**Exo 2** - Основной текст
- Font Weight: 300, 400, 600, 700
- Использование: Body text, кнопки, описания
- Стиль: Современный, читабельный, игровой

### Размеры заголовков

```
H1 (Hero Title): clamp(3rem, 10vw, 7rem)
├─ Desktop: 7rem (112px)
├─ Tablet: ~6rem (96px)
└─ Mobile: ~3rem (48px)

H2 (Section Title): clamp(2.5rem, 6vw, 4rem)
├─ Desktop: 4rem (64px)
├─ Tablet: ~3rem (48px)
└─ Mobile: 2.5rem (40px)

H3 (Card Title): 1.5rem - 1.8rem
Body Text: 1rem - 1.05rem
Small Text: 0.9rem - 0.95rem
```

## Компоненты

### Кнопки

**Primary Button**
```
Background: Linear gradient (Primary Blue → Accent Cyan)
Padding: 1rem 2rem
Border Radius: 8px
Font: Exo 2, 700 weight
Shadow: 0 10px 30px rgba(14, 165, 233, 0.3)
Hover: Усиленное свечение + translateY(-3px)
```

**Secondary Button**
```
Background: Transparent
Border: 1px solid Border Bright
Color: Primary Blue
Hover: Background rgba(14, 165, 233, 0.1)
```

### Карточки

**Card**
```
Background: Linear gradient 135deg
  ├─ rgba(15, 23, 42, 0.8)
  └─ rgba(10, 22, 40, 0.9)
Border: 1px solid Border Color
Border Radius: 12px
Padding: 2rem
Hover: 
  ├─ Border → Border Bright
  ├─ Shadow: 0 10px 40px rgba(14, 165, 233, 0.2)
  └─ Transform: translateY(-5px)
```

### Навигация

**Fixed Navigation Bar**
```
Position: Fixed top
Background: rgba(10, 22, 40, 0.95) + blur(20px)
Border Bottom: 1px solid Border Color
Shadow: 0 4px 30px rgba(0, 0, 0, 0.3)
Height: ~80px
```

**Navigation Links**
```
Padding: 0.6rem 1.2rem
Font: Exo 2, 600 weight
Border Radius: 8px
Active State:
  ├─ Background: rgba(14, 165, 233, 0.1)
  ├─ Border: 1px solid Border Bright
  └─ Shadow: Glow effect
```

## Эффекты и Анимации

### Фоновые эффекты

**Scanlines Animation**
```css
@keyframes scanlines {
  0% { transform: translateY(0); }
  100% { transform: translateY(10px); }
}
Duration: 8s
Iteration: Infinite
```

**Grid Overlay**
```
Pattern: Linear gradient lines
Spacing: 50px x 50px
Opacity: 0.5
Color: rgba(14, 165, 233, 0.03)
```

**Radial Gradients**
```
Position 1: 20% 30% → Primary Blue 15% opacity
Position 2: 80% 70% → Accent Cyan 10% opacity
```

### Hover эффекты

**Card Hover**
- Transform: translateY(-5px)
- Shadow: Enhanced glow
- Border: Bright border
- Duration: 0.3s ease

**Button Hover**
- Transform: translateY(-3px)
- Shadow: Strong glow
- Shimmer effect (left to right gradient)

**Link Hover**
- Color: Text Primary
- Background: rgba(14, 165, 233, 0.1)

### Loading Animations

**Float Animation** (для иконок)
```css
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}
Duration: 2s
```

**Pulse Glow** (для заголовков)
```css
@keyframes pulse-glow {
  0%, 100% { box-shadow: normal glow; }
  50% { box-shadow: bright glow; }
}
Duration: 3s
```

## Адаптивность

### Breakpoints

```
Desktop:  > 1024px  ├─ Full navigation
                    ├─ Multi-column grids
                    └─ Large typography

Tablet:   768-1024px├─ Hamburger menu
                    ├─ 2-column grids
                    └─ Medium typography

Mobile:   < 768px   ├─ Hamburger menu
                    ├─ Single column
                    └─ Small typography
```

### Grid Layouts

**Features Grid**
```
Desktop: repeat(auto-fit, minmax(280px, 1fr))
Tablet:  repeat(auto-fit, minmax(250px, 1fr))
Mobile:  1 column
Gap: 2rem
```

**News Grid**
```
Desktop: repeat(auto-fill, minmax(350px, 1fr))
Tablet:  repeat(auto-fill, minmax(300px, 1fr))
Mobile:  1 column
Gap: 2rem
```

## Иконки

Используется библиотека **Lucide React**

### Основные иконки

```
⚡ Zap - Скорость, энергия
👥 Users - Сообщество
🛡️ Shield - Защита, безопасность
🌐 Globe - Глобальность
💻 Server - Сервер
🔧 Settings - Настройки
📊 BarChart - Статистика
🛒 ShoppingCart - Магазин
📜 FileText - Документы
🏢 Building - Компания
```

### Размеры иконок

```
Large Icons: 60-120px (герои, placeholder)
Medium Icons: 32-48px (секции, features)
Small Icons: 16-24px (навигация, кнопки)
```

## Spacing System

```
xs:   0.5rem (8px)
sm:   1rem   (16px)
md:   1.5rem (24px)
lg:   2rem   (32px)
xl:   3rem   (48px)
2xl:  4rem   (64px)
3xl:  6rem   (96px)
4xl:  8rem   (128px)
```

## Best Practices

### ✅ DO:
- Используйте CSS переменные для цветов
- Применяйте transitions для плавности
- Используйте clamp() для адаптивной типографики
- Добавляйте hover эффекты на интерактивные элементы
- Используйте backdrop-filter для глубины
- Применяйте box-shadow для объема

### ❌ DON'T:
- Не используйте чистый белый (#ffffff) для текста
- Не делайте слишком много анимаций одновременно
- Не используйте transitions > 0.5s
- Не забывайте про accessibility (focus states)
- Не используйте фиксированные размеры для текста

## Accessibility

### Контрастность

```
Text Primary on Dark Background: ✅ AAA rated
Text Secondary on Dark Background: ✅ AA rated
Primary Blue on Dark Background: ✅ AA rated
```

### Focus States

Все интерактивные элементы имеют:
- Visible focus outline
- Keyboard navigation support
- ARIA labels где необходимо

### Motion

Все анимации уважают `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Примеры использования

### Создание новой карточки

```tsx
<div className="card">
  <h3 style={{ 
    fontFamily: 'Orbitron, sans-serif',
    color: 'var(--primary-blue)' 
  }}>
    Title
  </h3>
  <p style={{ color: 'var(--text-secondary)' }}>
    Description
  </p>
</div>
```

### Создание кнопки

```tsx
<button className="btn">
  <Icon className="btn-icon" />
  Button Text
</button>

<button className="btn btn-secondary">
  Secondary Button
</button>
```

### Создание секции

```tsx
<section style={{ padding: '4rem 2rem' }}>
  <h2 className="section-title">Section Title</h2>
  <p className="section-subtitle">Subtitle text</p>
  {/* Content */}
</section>
```

---

**Этот дизайн создает современный, привлекательный и профессиональный вид, идеальный для игрового сервера!** 🎮✨
