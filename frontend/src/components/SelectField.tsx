import { useId, type ComponentProps } from 'react'
import { fieldClasses } from './fieldStyles'

interface SelectFieldProps extends Omit<ComponentProps<'select'>, 'id'> {
  label: string
}

export function SelectField({ label, children, ...props }: SelectFieldProps) {
  const selectId = useId()

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={selectId} className="font-medium">
        {label}
      </label>
      <select id={selectId} className={`${fieldClasses} capitalize`} {...props}>
        {children}
      </select>
    </div>
  )
}
