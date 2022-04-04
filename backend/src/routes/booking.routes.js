import { Router } from 'express'

import {
  cancelBooking,
  findAll,
  getCheckoutSession
} from '../controllers/booking.controller'
import { authenticated } from '../middlewares/authenticated'

const bookingRouter = Router()

bookingRouter.get('/', authenticated, findAll)
bookingRouter.post('/checkout-session/:carId', authenticated, getCheckoutSession)
bookingRouter.get('/cancel/:bookingId', authenticated, cancelBooking)

export { bookingRouter }
