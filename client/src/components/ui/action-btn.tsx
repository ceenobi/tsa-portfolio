import { Loader2 } from 'lucide-react'
import { Button } from './button'

interface ActionButtonProps {
  type?: 'button' | 'submit' | 'reset' | undefined
  loading?: boolean
  text?: React.ReactNode
  className?: string
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
  disabled?: boolean
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost'
  form?: string
  size?: 'default' | 'sm' | 'lg'
}

export default function ActionBtn({
  type,
  loading,
  text,
  className,
  onClick,
  disabled,
  variant,
  form,
  size,
}: ActionButtonProps) {
  return (
    <Button
      type={type}
      disabled={loading || disabled}
      onClick={onClick}
      className={`transition-transform ease-in-out duration-300 ${className}`}
      variant={variant}
      form={form}
      size={size}
    >
      {loading && <Loader2 className="animate-spin" />}
      {text}
    </Button>
  )
}
