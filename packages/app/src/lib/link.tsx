import { Link as RouterLink } from "@tanstack/react-router"
import type { AnchorHTMLAttributes, ReactNode } from "react"

export function Link({
  href,
  children,
  className,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; children?: ReactNode }) {
  return (
    <RouterLink to={href} className={className} {...props}>
      {children}
    </RouterLink>
  )
}

export default Link
