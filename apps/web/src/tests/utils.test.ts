import { test, expect } from 'vitest'
import { formatCurrency, formatDate, slugify, capitalize, truncate } from '@condominios/utils'

test('formatCurrency formats number as MXN currency', () => {
  expect(formatCurrency(1234.56)).toBe('$1,234.56')
  expect(formatCurrency(0)).toBe('$0.00')
})

test('formatDate formats date correctly', () => {
  const date = new Date('2024-01-15')
  const result = formatDate(date)
  expect(result).toContain('enero')
  expect(result).toContain('2024')
})

test('slugify converts string to slug', () => {
  expect(slugify('Hello World')).toBe('hello-world')
  expect(slugify('Residencial Las Lomas')).toBe('residencial-las-lomas')
  expect(slugify('Test 123!@#')).toBe('test-123')
})

test('capitalize capitalizes first letter', () => {
  expect(capitalize('hello')).toBe('Hello')
  expect(capitalize('WORLD')).toBe('World')
})

test('truncate truncates long strings', () => {
  expect(truncate('Hello World', 5)).toBe('He...')
  expect(truncate('Hi', 10)).toBe('Hi')
})
