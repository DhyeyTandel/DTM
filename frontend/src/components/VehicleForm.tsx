import { useState, type SyntheticEvent } from 'react'
import { CATEGORIES, categoryLabel } from '../lib/categories'
import { oneOf } from '../lib/oneOf'
import {
  checkVehicleForm,
  type VehicleFormErrors,
  type VehicleFormValues,
} from '../lib/vehicleForm'
import { Button } from './Button'
import { fieldClasses } from './fieldStyles'
import { TextField } from './TextField'

interface VehicleFormProps {
  initialValues: VehicleFormValues
  withQuantity: boolean
  pending: boolean
  serverError: string | null
  onSubmit: (values: VehicleFormValues) => void
}

export function VehicleForm({
  initialValues,
  withQuantity,
  pending,
  serverError,
  onSubmit,
}: VehicleFormProps) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState<VehicleFormErrors>({})

  function change(field: keyof VehicleFormValues) {
    return (event: { target: { value: string } }) => {
      setValues({ ...values, [field]: event.target.value })
    }
  }

  function handleSubmit(event: SyntheticEvent): void {
    event.preventDefault()
    const found = checkVehicleForm(values, withQuantity)
    setErrors(found)
    if (Object.keys(found).length === 0) onSubmit(values)
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="grid max-w-xl gap-5">
      <TextField label="Make" value={values.make} error={errors.make} onChange={change('make')} />
      <TextField
        label="Model"
        value={values.model}
        error={errors.model}
        onChange={change('model')}
      />
      <div className="flex flex-col gap-1">
        <label htmlFor="vehicle-category" className="font-medium">
          Category
        </label>
        <select
          id="vehicle-category"
          value={values.category}
          onChange={(event) => {
            setValues({
              ...values,
              category: oneOf(event.target.value, CATEGORIES, values.category),
            })
          }}
          className={fieldClasses}
        >
          {CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {categoryLabel(category)}
            </option>
          ))}
        </select>
      </div>
      <TextField
        label="Price (₹)"
        inputMode="decimal"
        value={values.price}
        error={errors.price}
        onChange={change('price')}
      />
      {withQuantity && (
        <TextField
          label="Quantity"
          inputMode="numeric"
          value={values.quantity}
          error={errors.quantity}
          onChange={change('quantity')}
        />
      )}
      <TextField
        label="Image URL"
        value={values.imageUrl}
        error={errors.imageUrl}
        onChange={change('imageUrl')}
      />
      {serverError && (
        <p role="alert" className="text-error">
          {serverError}
        </p>
      )}
      <Button type="submit" disabled={pending} className="self-start">
        Save vehicle
      </Button>
    </form>
  )
}
