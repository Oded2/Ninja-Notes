# Notes App

A simple note-taking web application built with **Next.js**, **React**, **Zustand** for state management, and **Framer Motion** for animations.

## Features

- Create, edit, and delete notes
- Notes are persisted in localStorage
- Responsive and modern UI
- Smooth animations with Framer Motion

## Tech Stack

- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [Zustand](https://zustand-demo.pmnd.rs/) (state management)
- [Framer Motion](https://www.framer.com/motion/) (animations)
- Tailwind CSS (styling)

## Getting Started

1. **Install dependencies:**

   ```sh
   npm install
   # or
   yarn install
   ```

2. **Run the development server:**

   ```sh
   npm run dev
   # or
   yarn dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
  app/
    layout.tsx         # Root layout and localStorage sync
  components/
    NoteViewer.tsx     # Displays notes, edit/delete actions
  lib/
    stores/
      noteStore.ts     # Zustand stores for notes and editing
```

## Notes

- All hooks are used at the top level of components, following React’s rules of hooks.
- Notes are loaded from `localStorage` on app start and synced to the Zustand store.
- UI is styled with Tailwind CSS and animated with Framer Motion.

## License

MIT
