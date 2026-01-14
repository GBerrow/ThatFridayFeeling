import { render, screen } from '@testing-library/react'
import { expect } from 'vitest'

export function testFormComponent(Component, expectedInputs, expectedButton) {
  return () => {
    render(<Component />)
    expectedInputs.forEach(placeholder => {
        expect(screen.getByPlaceholderText(new RegExp(placeholder, 'i'))).toBeInTheDocument()
    })
    expect(screen.getByRole('button', { name: new RegExp(expectedButton, 'i') })).toBeInTheDocument()
  }
}