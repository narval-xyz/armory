import { FC, ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
}

const Card: FC<CardProps> = ({ children, className }) => (
  <div className={`flex items-center h-16 px-6 bg-nv-neutrals-500 rounded-2xl ${className}`}>{children}</div>
)

export default Card
