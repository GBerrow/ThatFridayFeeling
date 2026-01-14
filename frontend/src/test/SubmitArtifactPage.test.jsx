/**
 * Test file for SubmitArtifactPage
 * 
 * This file contains tests that check if the form works correctly
 */

import { test, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SubmitArtifactPage } from '../pages/SubmitArtifactPage'
import { testFormComponent } from './helpers/testFormComponent'

// Test 1: Does the form have the required input fields?
test('has input fields for URL and artifact ID', testFormComponent(SubmitArtifactPage, ['URL', 'Artifact ID'], 'submit'))

// Test 2: Does it have a submit button?
test('has a submit button', () => {
  render(<SubmitArtifactPage />)
  
  const button = screen.getByRole('button', { name: /submit/i })
  expect(button).toBeInTheDocument()
})

