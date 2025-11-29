"use client"

import React from "react"
import { createCheckoutUrl } from "../client/payments"

export interface CheckoutButtonProps {
  amount?: number
  planId?: string
  label?: string
  className?: string
  onCheckout?: () => void
}

export function CheckoutButton({
  amount = 0.01,
  planId,
  label = "Subscribe",
  className,
  onCheckout,
}: CheckoutButtonProps) {
  function openCheckout() {
    const url = createCheckoutUrl({ amount, planId })
    
    if (onCheckout) {
      onCheckout()
    }
    
    window.location.href = url
  }

  return (
    <button
      onClick={openCheckout}
      className={
        className ||
        "px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold"
      }
    >
      {label}
    </button>
  )
}

