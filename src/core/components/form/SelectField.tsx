'use client'

import React, { forwardRef } from 'react'

interface SelectOption {
  id: string | number
  title: string
}

interface Props extends React.SelectHTMLAttributes<HTMLSelectElement> {
  inputTitle: string
  icon?: React.ReactNode
  options: SelectOption[]
  placeholder?: string
  error?: string
}

const SelectField = forwardRef<HTMLSelectElement, Props>((props, ref) => {
  const {
    inputTitle,
    icon,
    options,
    id,
    name,
    defaultValue,
    disabled,
    placeholder = '카테고리 선택',
    error,
    ...rest
  } = props

  const selectId = id || name
  const hasError = !!error

  const containerClass =
    'group flex w-full items-center rounded-md border shadow-md transition-all duration-200 dark:shadow-black/30 ' +
    (disabled
      ? 'cursor-not-allowed border-gray-200 bg-gray-50 shadow-none opacity-70 dark:border-dark-700 dark:bg-dark-800 '
      : hasError
        ? 'border-red-300 bg-white shadow-red-100 hover:border-red-400 focus-within:border-red-500 focus-within:ring-4 focus-within:ring-red-100 dark:border-red-500/60 dark:bg-dark-900 dark:shadow-red-950/20 dark:focus-within:ring-red-500/15 '
      : 'border-gray-200 bg-white shadow-gray-100 hover:border-gray-300 focus-within:border-gray-300 focus-within:ring-4 focus-within:ring-gray-200/75 dark:border-dark-700 dark:bg-dark-900 dark:hover:border-dark-500 dark:focus-within:border-dark-500 dark:focus-within:ring-dark-800/80 ')

  return (
    <div className="w-full">
      <label
        htmlFor={selectId}
        className={`mb-2 block text-sm font-medium ${
          disabled
            ? 'text-gray-400 dark:text-dark-500'
            : 'text-black dark:text-dark-200'
        }`}
      >
        {inputTitle}
      </label>

      <div className={containerClass}>
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

        <div className="relative flex-1">
          <select
            {...rest}
            ref={ref}
            id={selectId}
            name={name}
            defaultValue={defaultValue ?? ''}
            disabled={disabled}
            aria-invalid={hasError}
            aria-describedby={hasError && selectId ? `${selectId}-error` : undefined}
            className="w-full appearance-none bg-transparent px-3 py-2.5 pr-10 text-sm text-black outline-none disabled:cursor-not-allowed disabled:text-gray-400 dark:text-white dark:disabled:text-dark-500"
          >
            <option value="" disabled className="dark:bg-dark-900">
              {placeholder}
            </option>

            {options.map(opt => (
              <option
                key={opt.id}
                value={opt.id}
                className="dark:bg-dark-900"
              >
                {opt.title}
              </option>
            ))}
          </select>

          <div
            className={`pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 transition-colors ${
              disabled
                ? 'text-gray-300 dark:text-dark-500'
                : 'text-gray-400 group-focus-within:text-gray-800 dark:text-dark-400 dark:group-focus-within:text-dark-200'
            }`}
          >
            <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </div>
        </div>
      </div>

      {error && (
        <div id={selectId ? `${selectId}-error` : undefined} className="mt-1.5 text-xs leading-5 text-red-500">
          {error}
        </div>
      )}
    </div>
  )
})

SelectField.displayName = 'SelectField'

export default SelectField
