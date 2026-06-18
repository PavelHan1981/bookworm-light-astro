# Design Specification: Excerpts.tsx Component

## Overview
A React-based carousel component for displaying literary excerpts on the home page. The component should switch between quotes automatically with a smooth fade-in/out transition.

## Data
The component will use the following excerpts:
1. "当我沉默着的时候，我觉得充实；我将开口，同时感到空虚。" —— 鲁迅
2. "凡事都有偶然的凑巧，结果却又若有宿命的必然。" —— 沈从文
3. "从前的日色变得慢，车，马，邮件都慢，一生只够爱一个人。" —— 木心

## Implementation Details
- **Location:** `src/layouts/helpers/Excerpts.tsx`
- **Component:** `Excerpts` (React functional component)
- **State:** `currentIndex` (integer)
- **Transitions:** `transition-opacity` with `duration-1000` (1 second fade).
- **Interval:** 5000ms (5 seconds).
- **Styling:**
  - Container: Minimalist, centered, maybe light background.
  - Quote: Italicized or distinct typography, large enough for readability.
  - Author: Smaller font, aligned or following the quote.
  - Responsive: Text size should be optimized for mobile and desktop.

## Testing Strategy
- Manual verification on the home page or a temporary test page.
- Ensure the interval works and the transition is smooth.
