/**
 * Test file for ApprovalDecisionPage
 *
 * This file contains tests that check if the approval decision form works correctly
 */

import { test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { ApprovalDecisionPage } from "../pages/ApprovalDecisionPage";

// Mock the API client
vi.mock("../api/client", () => ({
  getArtifactVersion: vi.fn(() =>
    Promise.resolve({
      id: 1,
      status: "pending",
      url: "https://example.com",
      submitted_by: "test@example.com",
      decision: null,
    })
  ),
  approveVersion: vi.fn(),
  rejectVersion: vi.fn(),
}));

// Helper to render with Router
const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

// Test 1: Does the approval form have the email input?
test("has email input for approval decision", async () => {
  renderWithRouter(<ApprovalDecisionPage />);

  // Wait for the component to load
  await screen.findByPlaceholderText(/your email/i);

  const emailInput = screen.getByPlaceholderText(/your email/i);
  expect(emailInput).toBeInTheDocument();
});

// Test 2: Does the form have buttons for approve and reject?
test("has approve and reject buttons", async () => {
  renderWithRouter(<ApprovalDecisionPage />);

  // Wait for buttons to appear
  await screen.findByRole("button", { name: /approve/i });

  const approveButton = screen.getByRole("button", { name: /approve/i });
  const rejectButton = screen.getByRole("button", { name: /reject/i });

  expect(approveButton).toBeInTheDocument();
  expect(rejectButton).toBeInTheDocument();
});

// Test 3: Does it show version details?
test("displays artifact version details", async () => {
  renderWithRouter(<ApprovalDecisionPage />);

  // Wait for version details to load
  await screen.findByText(/artifact version details/i);

  expect(screen.getByText(/artifact version details/i)).toBeInTheDocument();
});
