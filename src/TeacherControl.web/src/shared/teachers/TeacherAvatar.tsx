import { Avatar, type AvatarProps } from '@mantine/core'

interface TeacherAvatarProps extends Omit<AvatarProps, 'src' | 'name' | 'alt'> {
  name: string
  photoUrl?: string | null
}

/** Fotka učitele, bez fotky iniciály. Velikost, barvu a ostatní props bere od Mantine `Avatar`. */
export function TeacherAvatar({ name, photoUrl, ...props }: TeacherAvatarProps) {
  return <Avatar src={photoUrl} name={name} alt={name} radius={1000} color="brand" {...props} />
}
