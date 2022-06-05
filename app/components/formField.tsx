import { ComponentProps, InputHTMLAttributes } from "react"

type FormFieldProps = {
  htmlFor: string
  label: string
  type?: string
  value: InputHTMLAttributes<HTMLInputElement>['value']
  onChange?: InputHTMLAttributes<HTMLInputElement>['onChange']
}

export const FormField = ({ htmlFor, label, type = 'text', value, onChange = () => { } }: FormFieldProps) => {
  return (
    <>
      <label htmlFor={htmlFor} className="text-blue-600 font-semibold">
        {label}
      </label>
      <input
        onChange={onChange}
        type={type}
        id={htmlFor}
        name={htmlFor}
        className="w-full p-2 rounded-xl my-2"
        value={value}
      />
    </>
  )
}