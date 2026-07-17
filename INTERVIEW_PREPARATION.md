# Music Library Project: Technical Interview Preparation Guide

This guide is designed to prepare you for technical discussions, system design interviews, and case study reviews specifically regarding this Module Federation micro-frontend implementation.

---

## 1. Project Architecture

The application is structured using a **Micro Frontend (MFE) Architecture** via **Vite Plugin Federation**. 

- **Host (Shell)**: Mounts the main layout, handles mock JWT authentication, sets up route guards, maintains the navigation sidebar, and acts as the orchestrator.
- **Remote (Music MFE)**: Houses the music library catalog, search filters, grouping logic, form registration, and mutation queries. It is compiled as an independent bundle and exposed as an ESM module loaded at runtime by the Host.

---

## 2. Folder Structure Explanation

We follow a modular, domain-driven architecture to keep files cohesive and scalable:

- **`/host`**: Contains layouts, pages, and components related to the shell context (authentication, side navs, errors, MFE loaders).
- **`/music-library`**: Grouped by features (`/features/music`), separating components (such as `SongCard`, `FilterBar`, and `AddSongModal`) from services and custom hooks. This isolates the music domain so it can be deployed, tested, and maintained independently.

---

## 3. Data Flow

```
[UI Component] 
     │ (User types search / clicks delete)
     ▼
[Custom Hook: useSongsQuery / mutations]
     │ (Triggers query state / onMutate cache update)
     ▼
[Service Layer: songService.ts (Axios)]
     │ (HTTP Request to iTunes / local endpoint)
     ▼
[Mock Service Worker (MSW) Interceptor]
     ├─► /songs & /songs/:id (Mutates LocalStorage Cache)
     └─► iTunes Search (Fetches real iTunes API, normalizes shape, 
                        merges LocalStorage edits, filters deleted ids)
     ▼
[UI Component Render] (Updated React Query cache state feeds into UI)
```

---

## 4. Authentication Flow

- **Mock JWT approach**: When a user inputs credentials on the Login page, a 800ms network latency is simulated.
- **Role Assignment**: Credentials match `admin/admin123` (role: `admin`) or `user/user123` (role: `user`). On success, a mock JWT token is encoded using standard `btoa` enclosing the user metadata.
- **Persistence**: The token and metadata are written to `localStorage` and synchronized in React's `AuthContext` to secure all child routes.
- **Privilege Separation**: The Host passes `userRole` to the MFE. If `userRole !== 'admin'`, the add and delete UI buttons are omitted from the DOM entirely.

---

## 5. Module Federation Explanation

We utilize **Vite Plugin Federation** (`@originjs/vite-plugin-federation`).
- **Remote Configuration**: The Remote MFE exposes the `./MusicLibraryApp` component path and compiles it into a static bundle with an entry file named `remoteEntry.js`.
- **Host Configuration**: The Host configures `remotes: { music_library: 'remoteUrl/assets/remoteEntry.js' }`. It imports the module lazily via React's `lazy` and `Suspense` boundary.
- **Shared Dependencies**: Core libraries (`react`, `react-dom`, `@tanstack/react-query`, `react-router-dom`) are declared as shared. This ensures they are only downloaded once, preventing React state hooks from duplicating and throwing errors.

---

## 6. React Query (TanStack Query) Explanation

- **Decoupling**: React Query hooks are isolated under `src/hooks/useSongsQuery.ts`. Component files never call `useQuery` or `useMutation` directly, nor do they interact with Axios.
- **Cache Management**: We set `staleTime: 5 * 60 * 1000` (5 minutes) so that consecutive tab navigations read from the memory cache instantly.
- **Mutations**: Form submissions trigger cache prepends directly. Delete mutations trigger Optimistic UI updates.

---

## 7. Optimistic Updates

For song deletions, we update the UI instantly before the mock server confirms the operation:
1. **Cancel Queries**: `cancelQueries` is fired on the active song query to halt outgoing refetches.
2. **Snapshot Cache**: Current query data is snapshotted.
3. **Optimistic Mutate**: The selected song is filtered out from the React Query cache using `setQueryData`.
4. **Rollback Context**: Return the snapshot in the mutation's context. If the API fails, `onError` reads the context and restores the original song array, ensuring zero visual mismatch.

---

## 8. Cache Invalidation

When a song is successfully added via `POST /songs`:
- The mutation's `onSuccess` callback inserts the new song record directly into the cached array so the registry updates instantly.
- It also calls `invalidateQueries({ queryKey: ['songs'] })` to tell React Query that the catalog is stale, prompting a silent background sync with the MSW mock database.

---

## 9. Why Context instead of Redux?

- **Zero Boilerplate**: Redux requires actions, reducers, store setups, and middleware, which is overkill for local session authentication.
- **Core Purpose**: Context API is built specifically for passing down global, low-frequency state changes (like logged-in user profiles).
- **Server State vs Client State**: With TanStack Query managing server states (caching, loading, refetching), the only global client state is authentication. Redux is redundant here.

---

## 10. Why MSW (Mock Service Worker)?

- **Real Browser Interception**: Unlike mock adapters (e.g. Axios Mock Adapter) that override client instances, MSW intercepts requests at the browser network layer using Service Workers. This ensures real network requests are visible in the Chrome DevTools Network Tab.
- **Parity**: The application code is identical to how it would behave with a real production Node/Express API.

---

## 11. Project Trade-offs

- **Client-Side MFE Merging in MSW**: iTunes search and mock data merging occur inside the service worker. In production, this would reside in a database backend.
- **Client-side Filtering**: Filtering, sorting, and grouping are processed client-side. This keeps searches extremely fast for standard playlist counts but would need server-side cursor queries for huge libraries.

---

## 12. Future Improvements

- **WebSockets / Server-Sent Events (SSE)**: Implement real-time notifications when other administrators register or remove a track.
- **Shared Design Token Package**: Move tailwind configuration settings into a shared library to enforce strict visual design sync.
- **MFE Versioning**: Implement semantic version checking during dynamic importing to guard against schema breaking changes.

---

## 13. Top 30 Technical Interview Questions & Answers

### Q1: How does Module Federation differ from micro-frontends built using iframe wrappers?
**A**: Iframes run in completely isolated sandboxes. They load duplicate copies of vendor libraries, do not support shared styles or context natively, and degrade page performance. Module Federation allows separate builds to run as single-page applications at runtime, sharing dependency bundles (like React or React DOM) and enabling smooth cross-route transitions and contextual styling.

### Q2: Why did you configure the Remote MFE in Preview mode rather than Dev mode when integrating with the Host?
**A**: Vite's dev server compiles modules on-demand, which does not output the static `/assets/remoteEntry.js` or the bundled MFE chunks that `@originjs/vite-plugin-federation` expects at runtime. Serving the remote MFE using `vite preview` (after running `vite build`) correctly exposes the compiled entry points, ensuring smooth loading in the Host application.

### Q3: How did you share React Context across Host and Remote MFE boundaries?
**A**: React Context references are module-scoped. If the Host and Remote MFE are separate bundles, their Context files compile into different references, throwing errors if accessed directly. To solve this, we passed Host Context handlers (like the Toast engine) down as props to the dynamic Remote MFE component, maintaining encapsulation and allowing standalone mode to work without throwing errors.

### Q4: Why is it crucial to specify `strictPort: true` in MFE Vite configs?
**A**: Module Federation relies on strict, predefined URLs (like port 3000 for host and 3001 for remote). If another process occupies port 3001, Vite would automatically assign a random port (like 3002), causing the Host to load a 404 remote entry point. `strictPort` prevents this by failing early and reporting the port conflict.

### Q5: How do you handle a scenario where the Remote MFE server crashes or goes offline at runtime?
**A**: We wrapped the federated import in a lazy loading Suspense boundary. If the remote MFE crashes or is unreachable, the Host catches the chunk load failure in a custom `ErrorBoundary` component, displaying a fallback network error card with a retry option.

### Q6: What is the benefit of using `useMemo` for filtering and sorting rather than calculating them inside the render body?
**A**: Without `useMemo`, filtering and sorting functions run on *every* component render (e.g. on sidebar clicks or input focuses). Wrapping them in `useMemo` restricts recalculations to only when the dependency arrays (`songs`, `searchTerm`, `sortBy`) change, preventing UI lag.

### Q7: How does your search input debouncing work, and why is it beneficial?
**A**: We split the search input into two states: `searchInputValue` (binds directly to the input, updating instantly) and `searchTerm` (used by `useMemo` to filter the lists). A `useEffect` debounces updates to `searchTerm` by 300ms. This prevents the filter logic from running on every keystroke, reducing CPU overhead during typing.

### Q8: Explain how you implemented focus trapping in the `AddSongModal` component.
**A**: When the modal is open, a keydown event listener intercepts `Tab` key presses. It queries all focusable elements inside the modal. If `Shift + Tab` is pressed on the first element, focus wraps to the last. If `Tab` is pressed on the last element, focus wraps to the first, keeping keyboard navigation secure inside the dialog.

### Q9: Why is `skipLibCheck: true` set in the TypeScript configuration files?
**A**: In node setups, different dependencies might contain conflicting declarations (e.g. `@types/node` vs standard DOM types). `skipLibCheck` skips compiling type declarations of installed packages in `node_modules`, dramatically speeding up build times and preventing third-party type conflicts.

### Q10: How does MSW v2 differ from standard API mocks like Axios Mock Adapter?
**A**: Axios Mock Adapter overrides Axios instance interceptors, making mock intercepting invisible in the Chrome DevTools network tab. MSW registers a Service Worker that intercepts browser network calls at the HTTP layer, mimicking a real server and allowing requests to be fully inspected in Chrome DevTools.

### Q11: Explain your strategy for optimistic UI updates during song deletion.
**A**: When a user clicks delete, we cancel active refetches on `['songs']` to avoid cache overwrites, snapshot the current song array, filter out the target song, and update the cache instantly. If the mock deletion API fails, we read the snapshot from context and rollback the visual card.

### Q12: How do you prevent layout shift when the Remote MFE is loading?
**A**: The `Suspense` boundary in `MusicLibraryContainer` is equipped with a custom fallback loader that renders matching skeleton components for the Registry Header, Filter Bar, and Song Cards. This reserves the exact layout footprint, preventing layout shifts when the Remote MFE mounts.

### Q13: What happens to shared dependencies if the Host and Remote MFE use slightly different versions of React?
**A**: Vite Plugin Federation resolves shared packages based on version semantic rules. If the host and remote versions are compatible (e.g. `^19.0.0` vs `^19.2.7`), Vite loads only one copy. If they are incompatible, the remote MFE might load its own duplicate bundle, which can lead to React hook state duplication errors. We pinned exact versions to prevent this.

### Q14: How does role-based authorization protect administrative actions in this client-side codebase?
**A**: The Host checks the mock JWT payload and extracts the user's role (`admin` or `user`). It passes this role to the MFE. If the role is `user`, all Administrative buttons (Add Song, Delete) are omitted from the DOM. On the network level, the MSW handlers validate incoming requests to prevent unauthorized mutations.

### Q15: Why did you choose React Hook Form instead of controlled component state inputs?
**A**: Controlled components trigger a full-component re-render on *every single keystroke*, which degrades performance in large forms. React Hook Form uses uncontrolled inputs, registering validation rules and only triggering renders during validation state transitions or submits, improving performance.

### Q16: How did you implement Escape-key closing for the `AddSongModal` dialog?
**A**: We added a `keydown` event listener in the modal's `useEffect`. If `e.key === 'Escape'` is triggered, it calls `onClose()`. We cleaned up this listener on component unmount to prevent memory leaks.

### Q17: What is the purpose of the `btoa` function in your mock authentication?
**A**: `btoa` encodes string data to base-64. We used it to generate a mock JWT token signature: `header.payload.signature`, where the payload contains base64-encoded user credentials, mimicking a real JSON Web Token.

### Q18: Why did you use `localStorage` inside the MSW handlers?
**A**: MSW runs inside a browser service worker, meaning in-memory state variables reset on page reloads. Storing mock data in `localStorage` ensures that added and deleted songs persist across refreshes, providing a seamless review experience.

### Q19: Explain the role of `loadEnv` in `vite.config.ts`.
**A**: By default, Vite does not load environment variables (like `process.env`) during config file compilation. `loadEnv` explicitly reads `.env` variables based on the active mode (development or production), allowing us to pass dynamic Remote MFE URLs at build time.

### Q20: What is the purpose of `target: 'esnext'` in the Vite configuration?
**A**: Module Federation relies on ES Module imports (`import/export` at runtime). Setting the target to `esnext` prevents Vite from transpiling modern module syntax into older formats (like CommonJS), which would break Module Federation.

### Q21: How do you handle CORS issues when querying the iTunes Search API?
**A**: The iTunes Search API is natively CORS-enabled, allowing client-side calls from any origin. If it weren't, we could proxy it through our MSW service worker or set up a reverse-proxy server.

### Q22: Why did you choose TanStack React Query instead of standard `useEffect` data fetching?
**A**: Standard `useEffect` fetching lacks built-in caching, dedupes, window refetches, mutation rollback contexts, and state cache synchronization, requiring heavy boilerplate. React Query automates cache lifetimes, state sharing, and optimistic state updates.

### Q23: How do you ensure the Mock Service Worker does not intercept real iTunes API requests in production?
**A**: The MSW handlers intercept `https://itunes.apple.com/search`, perform a real network fetch using the `bypass` utility, merge mock state additions, and return the result. This ensures live data continues to flow through MSW.

### Q24: What is the difference between `queryClient.setQueryData` and `queryClient.invalidateQueries`?
**A**: `setQueryData` synchronously updates the local cache instantly, triggering immediate UI updates. `invalidateQueries` marks the cache as stale, triggering an asynchronous network refetch to sync with the server.

### Q25: Why is semantic HTML important for accessibility in the song cards?
**A**: Screen readers rely on semantic tags (like `<article>`, `<h3>`, `<button>`) to construct the accessibility tree. Using correct landmarks allows screen reader users to navigate card elements logically.

### Q26: How did you implement responsive control stacking in the `FilterBar` component?
**A**: We styled the wrapper container using Tailwind's flexbox wraps (`flex flex-col lg:flex-row lg:items-center justify-between gap-4`). This stacks controls vertically on mobile, wraps them on tablets, and aligns them horizontally on desktop.

### Q27: How does React 19's root mount rendering differ from React 18?
**A**: React 19 continues to support the `ReactDOM.createRoot` mounting API introduced in React 18. However, React 19 introduces automatic stylesheet loading, asset preloading, and compiler improvements, which we leveraged to optimize asset pipelines.

### Q28: How do you prevent ghost clicks and layout shifting in list grids when items are deleted?
**A**: We disabled pointer events (`pointer-events-none`) and reduced opacity on cards undergoing deletion. This prevents users from clicking delete repeatedly while the transition completes.

### Q29: What are the main limitations of Module Federation in Vite compared to Webpack?
**A**: Webpack Module Federation is native to the Webpack bundler ecosystem and supports complex sharing configurations. Vite uses `@originjs/vite-plugin-federation`, which compiles assets to standard ES modules. This requires builds to be run first for remote entry generation, making dev-mode server-to-server HMR slightly more complex to configure.

### Q30: What is the risk of using base64 `btoa` encoding for production JWT tokens?
**A**: Base-64 encoding is not encryption; it is simply a representation format. Anyone can decode a base64 string to read its contents. In production, JWTs must be signed using cryptographic keys on the backend to prevent tampering. We used it here strictly as a mock token representation.
