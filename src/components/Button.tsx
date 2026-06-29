import { type ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger'
  size?: 'sm' | 'md'
}

export function Button({ variant = 'primary', size = 'md', className = '', children, ...props }: ButtonProps) {
  const base = 'inline-flex items-center gap-2 font-medium rounded-xl transition-all duration-150 cursor-pointer disabled:opacity-40'
  const sizes = { sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2.5 text-sm' }
  const variants = {
    primary: 'bg-zinc-900 text-white hover:bg-zinc-700 active:scale-95',
    ghost: 'bg-transparent text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 active:scale-95',
    danger: 'bg-red-50 text-red-600 hover:bg-red-100 active:scale-95',
  }
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}
