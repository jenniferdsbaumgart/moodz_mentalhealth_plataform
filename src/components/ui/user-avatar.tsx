import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface UserAvatarProps {
  name: string
  image?: string | null
  className?: string
}

export function UserAvatar({ name, image, className }: UserAvatarProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <Avatar className={className}>
      <AvatarImage
        src={image || undefined}
        alt={`Foto de perfil de ${name}`}
      />
      <AvatarFallback aria-label={name}>{initials}</AvatarFallback>
    </Avatar>
  )
}
