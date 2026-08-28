import { useNavigate, useParams, useRouterState } from "@tanstack/react-router"

export function usePathname() {
  return useRouterState({ select: (state) => state.location.pathname })
}

export function useSearchParams() {
  const search = useRouterState({ select: (state) => state.location.searchStr })
  return new URLSearchParams(search.startsWith("?") ? search.slice(1) : search)
}

export function useRouter() {
  const navigate = useNavigate()
  return {
    push: (href: string, _options?: { scroll?: boolean }) => {
      void navigate({ href })
    },
    replace: (href: string, _options?: { scroll?: boolean }) => {
      void navigate({ href, replace: true })
    },
    back: () => {
      window.history.back()
    },
  }
}

export function useParamsRecord() {
  return useParams({ strict: false }) as Record<string, string>
}

export { useParams }
