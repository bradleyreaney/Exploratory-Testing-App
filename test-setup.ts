import { vi } from "vitest"

// Mock Next.js specific modules
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}))

// Mock process.cwd for file system operations
Object.defineProperty(process, "cwd", {
  value: () => "/mock/project/root",
})
