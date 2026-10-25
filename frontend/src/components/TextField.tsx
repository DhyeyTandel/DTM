import { useId, type ComponentProps } from 'react'
import { fieldClasses } from './fieldStyles'

interface TextFieldProps extends Omit<ComponentProps<'input'>, 'id'> {
  label: string
  error?: string
}

export function TextField({ label, error, ...props }: TextFieldProps) {
  const inputId = useId()
  const errorId = useId()

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={inputId} className="font-medium">
        {label}
      </label>
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={fieldClasses}
        {...props}
      />
      {error && (
        <p id={errorId} role="alert" className="text-error">
          {error}
        </p>
      )}
    </div>
  )
}
