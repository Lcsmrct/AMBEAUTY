# Design Guidelines for AM.BEAUTYY2 - Modern Beauty Services Website

## Design Approach
**Reference-Based Approach**: Drawing inspiration from modern beauty and wellness platforms like Glossier, Sephora, and premium service booking apps, emphasizing sleek aesthetics and emotional engagement through visual appeal.

## Core Design Elements

### A. Color Palette
**Primary Colors:**
- Brand Red: 0 85% 59% (vibrant, attention-grabbing)
- Accent Gold: 48 100% 52% (luxury, warmth)
- Dark Navy: 222 75% 10% (professional depth)
- Light Background: 0 0% 97% (clean, airy)

**Dark Mode:**
- Background: 222 75% 8%
- Surface: 222 50% 12%
- Text: 0 0% 95%

### B. Typography
- **Primary Font**: Inter or Poppins (Google Fonts)
- **Display Font**: Playfair Display for hero titles
- **Hierarchy**: 
  - Hero titles: 4xl-6xl, bold weight
  - Section headers: 2xl-3xl, semibold
  - Body text: base-lg, regular weight

### C. Layout System
**Tailwind Spacing Units**: Consistent use of 2, 4, 6, 8, 12, 16, 24 units
- Micro spacing: p-2, m-4
- Component spacing: p-6, gap-8
- Section spacing: py-12, my-16, py-24

### D. Component Library

**Navigation:**
- Clean header with logo, navigation links, and CTA button
- Mobile hamburger menu with slide-in animation
- Sticky header with background blur on scroll

**Buttons:**
- Primary: Rounded-full, gradient background (red to gold)
- Secondary: Outline variant with blur background when on images
- Sizes: sm, base, lg with consistent padding

**Cards:**
- Service cards: Rounded-2xl, soft shadows, hover scale effects
- Booking cards: Clean borders, organized information hierarchy
- Media cards: Aspect-ratio containers with overlay animations

**Forms:**
- Rounded inputs with focus states
- Floating labels or clear placeholders
- Error states with red accent
- Success states with green confirmation

**Modals:**
- Backdrop blur effect
- Smooth scale-in animations
- Gallery modal with zoom and navigation

### E. Animations (Framer Motion)
**Hero Section:**
- Fade-in title with staggered letter animation
- Slide-up CTA buttons with pulse effect
- Parallax background movement

**Page Transitions:**
- Fade-in-up for sections entering viewport
- Staggered animations for card grids
- Smooth hover scale (1.02-1.05) for interactive elements

**Gallery:**
- Grid items fade-in with delay
- Hover zoom effects (scale 1.1)
- Modal open with backdrop blur and content scale

## Visual Treatment

**Modern Flyer Aesthetic:**
- Bold, impactful typography with generous white space
- Strategic use of gradients (red to gold, dark gradients for overlays)
- Clean geometric shapes and rounded corners throughout
- High contrast for readability and visual hierarchy

**Background Treatments:**
- Hero: Subtle gradient overlay on beauty service imagery
- Sections: Alternating light/dark backgrounds for visual rhythm
- Cards: Soft drop shadows with subtle color tints

**Content Strategy:**
- Hero section with compelling value proposition
- Services showcase with visual cards
- Social proof section with testimonials
- Booking CTA section
- Gallery showcase
- Contact and footer

## Images
**Required Images:**
- **Large Hero Image**: High-quality beauty treatment photo (eyelashes, manicure) with gradient overlay
- **Service Images**: Professional photos for each service offering
- **Gallery Images**: Before/after shots, treatment process photos
- **Team Photos**: Professional headshots for about section
- **Background Textures**: Subtle beauty-themed patterns for section backgrounds

**Placement:**
- Hero: Full-width background image with overlay
- Services: Square/portrait images in card layouts
- Gallery: Masonry or grid layout with various aspect ratios
- Testimonials: Small circular profile images

This design system creates a premium, modern beauty service experience that feels both professional and approachable, with smooth animations enhancing user engagement without overwhelming the content.