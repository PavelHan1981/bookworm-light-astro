# Excerpts Component Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a React-based carousel component `Excerpts.tsx` that displays three literary quotes with a smooth fade-in/out transition.

**Architecture:** A functional React component using `useState` for the current index and `useEffect` with `setInterval` to cycle through the quotes. Tailwind CSS classes will handle the styling and transitions.

**Tech Stack:** React (Astro), Tailwind CSS.

---

### Task 1: Create the Excerpts Component

**Files:**
- Create: `src/layouts/helpers/Excerpts.tsx`

- [ ] **Step 1: Implement the Excerpts component**

```tsx
import React, { useState, useEffect } from "react";

const excerpts = [
  {
    quote: "当我沉默着的时候，我觉得充实；我将开口，同时感到空虚。",
    author: "鲁迅",
  },
  {
    quote: "凡事都有偶然的凑巧，结果却又若有宿命的必然。",
    author: "沈从文",
  },
  {
    quote: "从前的日色变得慢，车，马，邮件都慢，一生只够爱一个人。",
    author: "木心",
  },
];

const Excerpts: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % excerpts.length);
        setIsVisible(true);
      }, 1000); // Wait for fade-out
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 bg-light dark:bg-dark-light rounded-lg shadow-sm">
      <div
        className={`text-center transition-opacity duration-1000 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <p className="text-xl md:text-2xl font-primary italic text-text-dark dark:text-white mb-4">
          " {excerpts[currentIndex].quote} "
        </p>
        <p className="text-lg text-text dark:text-text-light">
          —— {excerpts[currentIndex].author}
        </p>
      </div>
    </div>
  );
};

export default Excerpts;
```

- [ ] **Step 2: Commit the change**

```bash
git add src/layouts/helpers/Excerpts.tsx
git commit -m "feat: add Excerpts component for literary quotes"
```

### Task 2: Verify the Component

- [ ] **Step 1: Create a temporary test page or integrate into index**

Modify `src/pages/index.astro` to include the `Excerpts` component.

```astro
---
import Excerpts from "@/helpers/Excerpts";
// ... other imports
---

<Base>
  <section class="section">
    <div class="container">
      <Excerpts client:load />
    </div>
  </section>
  <!-- ... existing content -->
</Base>
```

- [ ] **Step 2: Run dev server and verify**

Run: `npm run dev`
Expected: The carousel appears and transitions every 5 seconds.

- [ ] **Step 3: Cleanup or final commit**

If integrated into index, keep it. Otherwise, remove from index after verification.
