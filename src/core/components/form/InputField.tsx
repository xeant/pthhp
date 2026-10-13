'use client'

import React, { forwardRef } from 'react'

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  inputTitle: string
  icon?: React.ReactNode
  getData?: (value: string) => void
  hideLabel?: boolean
  error?: string
}

const InputField = forwardRef<HTMLInputElement, Props>((props, ref) => {
  const {
    inputTitle,
    icon,
    getData,
    id,
    name,
    type = 'text',
    placeholder,
    disabled,
    hideLabel = false,
    error,
    ...rest
  } = props

  const inputId = id || name
  const hasError = !!error

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (getData) getData(event.target.value)
    if (props.onChange) props.onChange(event)
  }

  const inputContainerClass =
	    'group flex w-full items-center rounded-md border shadow-md transition-all duration-200 dark:shadow-none ' +
    (disabled
      ? 'cursor-not-allowed border-gray-200 bg-gray-50 shadow-none opacity-70 dark:border-dark-700 dark:bg-dark-800 '
      : hasError
	        ? 'border-red-300 bg-white shadow-red-100 hover:border-red-400 focus-within:border-red-500 focus-within:ring-4 focus-within:ring-red-100 dark:border-red-500/60 dark:bg-dark-800/80 dark:focus-within:border-red-400/80 dark:focus-within:ring-red-500/15 '
	      : 'border-gray-200 bg-white shadow-gray-100 hover:border-gray-300 focus-within:border-gray-300 focus-within:ring-4 focus-within:ring-gray-200/75 dark:border-dark-600 dark:bg-dark-800/80 dark:hover:border-dark-500 dark:focus-within:border-dark-400 dark:focus-within:ring-dark-700/45 ')

  return (
    <>
      {!hideLabel && (
        <label
          htmlFor={inputId}
          className={`mb-2 block text-sm font-medium ${
            disabled
              ? 'text-gray-400 dark:text-dark-500'
              : 'text-black dark:text-dark-200'
          }`}
        >
          {inputTitle}
        </label>
      )}

      <div className={inputContainerClass}>
        {icon && (
          <div
            className={`pl-3 pr-2 transition-colors ${
              disabled
                ? 'text-gray-300 dark:text-dark-500'
                : 'text-gray-400 group-focus-within:text-gray-800 dark:text-dark-400 dark:group-focus-within:text-dark-200'
            }`}
          >
            {icon}
          </div>
        )}

        <input
          {...rest}
          ref={ref}
          type={type}
          id={inputId}
          name={name}
          disabled={disabled}
          onChange={handleChange}
          aria-invalid={hasError}
          aria-describedby={hasError && inputId ? `${inputId}-error` : undefined}
	          className="w-full bg-transparent px-3 py-2.5 text-sm text-black outline-none placeholder:text-gray-400 disabled:cursor-not-allowed disabled:text-gray-400 disabled:placeholder:text-gray-300 dark:text-dark-100 dark:placeholder:text-dark-400 dark:disabled:text-dark-500"
          placeholder={placeholder || ''}
        />
      </div>

      {error && (
        <div id={inputId ? `${inputId}-error` : undefined} className="mt-1.5 text-xs leading-5 text-red-500">
          {error}
        </div>
      )}
    </>
  )
})

InputField.displayName = 'InputField'

export default InputField
