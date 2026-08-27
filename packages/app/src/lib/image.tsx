import type { ImgHTMLAttributes } from "react"

export default function Image({
  src,
  alt,
  width,
  height,
  className,
  ...props
}: ImgHTMLAttributes<HTMLImageElement> & { priority?: boolean }) {
  return <img src={src} alt={alt} width={width} height={height} className={className} {...props} />
}
