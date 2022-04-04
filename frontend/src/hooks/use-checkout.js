import { loadStripe } from '@stripe/stripe-js'
import { useMutation } from 'react-query'

import { axiosClient } from '../utils/axios-client'

export const useCheckout = () => {
  return useMutation(async checkoutPayload => {
    const { carId, ...rest } = checkoutPayload
    const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
    try {
      const { data: session } = await axiosClient.post(
        `/bookings/checkout-session/${carId}`,
        rest
      )
      const result = await stripe.redirectToCheckout({ sessionId: session.id })
      if (result.error) throw new Error(result.error.message)
    } catch (error) {
      throw new Error(error.response?.data?.message ?? 'Something went wrong')
    }
  })
}
