# AI Rules and Project Guidelines

This document outlines the core technologies used in this project and provides clear rules for library usage to ensure consistency, maintainability, and adherence to best practices.

## 1. Tech Stack Overview

This application is built using a modern, component-based architecture:

*   **Frontend Framework:** React (with Vite/SWC for fast development).
*   **Language:** TypeScript for strong typing and improved code quality.
*   **Styling:** Tailwind CSS for utility-first, responsive design.
*   **UI Library:** shadcn/ui (built on Radix UI primitives) for accessible and customizable components.
*   **Routing:** React Router DOM for client-side navigation.
*   **Backend & Database:** Supabase for database, authentication, and file storage.
*   **State Management (Server):** React Query (`@tanstack/react-query`) for data fetching, caching, and synchronization.
*   **Forms & Validation:** React Hook Form for form state management, paired with Zod for schema validation.
*   **Icons:** Lucide React.

## 2. Library Usage Rules

To maintain a clean and consistent codebase, follow these rules when implementing new features or modifying existing ones:

| Feature Area | Primary Library/Tool | Rule |
| :--- | :--- | :--- |
| **UI Components** | `shadcn/ui` (Radix UI) | Always use existing components from `src/components/ui/` or create new components in `src/components/` that utilize Tailwind CSS. Avoid introducing new UI libraries. |
| **Styling** | `Tailwind CSS` | All styling must be done using Tailwind utility classes. Ensure designs are responsive by default. |
| **Data Fetching / Caching** | `React Query` | Use `useQuery` and `useMutation` from `@tanstack/react-query` for all asynchronous data operations involving Supabase. |
| **Database / Auth** | `Supabase` | All backend interactions (CRUD, Auth, Storage) must use the client exported from `src/integrations/supabase/client.ts`. |
| **Routing** | `react-router-dom` | Use `BrowserRouter`, `Routes`, and `Route` for defining application paths. Keep main routes in `src/App.tsx`. |
| **Forms** | `react-hook-form` & `zod` | Use `react-hook-form` for managing form state and validation logic. Use `zod` for defining validation schemas. |
| **Notifications** | `src/hooks/use-toast.ts` | Use the custom `useToast` hook for displaying transient notifications to the user. |
| **Icons** | `lucide-react` | Use icons exclusively from the `lucide-react` package. |