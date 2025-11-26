// components/ui/Button.tsx
import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  children: React.ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles = 'font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variantStyles = {
    primary: 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-lg',
    secondary: 'bg-gradient-to-r from-green-400 to-emerald-500 text-white hover:from-green-500 hover:to-emerald-600 shadow-lg',
    outline: 'border-2 border-white/20 text-white hover:bg-white/10',
    ghost: 'text-white hover:bg-white/10',
  }
  
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-6 py-2.5 text-base',
    lg: 'px-8 py-4 text-lg',
  }
  
  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center justify-center">
          <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  )
}

// components/ui/Card.tsx
interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
}

export function Card({ children, className = '', hover = false }: CardProps) {
  return (
    <div
      className={`
        bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20
        ${hover ? 'hover:bg-white/15 hover:scale-105 hover:shadow-2xl transition-all duration-200' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}

// components/ui/Input.tsx
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

export function Input({
  label,
  error,
  helperText,
  className = '',
  ...props
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-white mb-2">
          {label}
          {props.required && <span className="text-pink-400 ml-1">*</span>}
        </label>
      )}
      <input
        className={`
          w-full px-4 py-3 bg-white/5 border rounded-lg text-white 
          placeholder-purple-400 focus:ring-2 focus:ring-purple-500 
          focus:border-transparent transition
          ${error ? 'border-red-500' : 'border-white/20'}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-400 mt-1">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-xs text-purple-400 mt-1">{helperText}</p>
      )}
    </div>
  )
}

// components/ui/Badge.tsx
interface BadgeProps {
  children: React.ReactNode
  variant?: 'success' | 'warning' | 'error' | 'info'
}

export function Badge({ children, variant = 'info' }: BadgeProps) {
  const variants = {
    success: 'bg-green-400/20 text-green-300 border-green-400/30',
    warning: 'bg-yellow-400/20 text-yellow-300 border-yellow-400/30',
    error: 'bg-red-400/20 text-red-300 border-red-400/30',
    info: 'bg-blue-400/20 text-blue-300 border-blue-400/30',
  }
  
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${variants[variant]}`}>
      {children}
    </span>
  )
}

// components/ui/Skeleton.tsx
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-white/10 rounded ${className}`} />
  )
}

export function SkeletonCard() {
  return (
    <Card>
      <div className="space-y-4">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    </Card>
  )
}

// components/ui/Alert.tsx
interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info'
  title?: string
  message: string
  onClose?: () => void
}

export function Alert({ type, title, message, onClose }: AlertProps) {
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
  }
  
  const colors = {
    success: 'bg-green-500/20 border-green-400/30 text-green-300',
    error: 'bg-red-500/20 border-red-400/30 text-red-300',
    warning: 'bg-yellow-500/20 border-yellow-400/30 text-yellow-300',
    info: 'bg-blue-500/20 border-blue-400/30 text-blue-300',
  }
  
  return (
    <div className={`p-4 rounded-lg border ${colors[type]} flex items-start gap-3`}>
      <span className="text-2xl">{icons[type]}</span>
      <div className="flex-1">
        {title && <h4 className="font-semibold mb-1">{title}</h4>}
        <p className="text-sm">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-white/60 hover:text-white transition"
        >
          ✕
        </button>
      )}
    </div>
  )
}

// components/ui/Modal.tsx
interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 rounded-2xl p-6 max-w-lg w-full border border-white/20 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white text-2xl"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

// components/ui/EmptyState.tsx
interface EmptyStateProps {
  icon: string
  title: string
  description: string
  action?: React.ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-20 bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
      <p className="text-purple-300 mb-6 max-w-md mx-auto">{description}</p>
      {action}
    </div>
  )
}