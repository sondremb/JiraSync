/// <reference types="vite/client" />

interface ImportMetaEnv {
	/** "true" turns on the fake backend in `pnpm start`. Ignored by `pnpm build`. */
	readonly VITE_FAKE_BACKEND?: string;
}
