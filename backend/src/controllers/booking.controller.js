import dayjs from 'dayjs'
import LocalizedFormat from 'dayjs/plugin/localizedFormat'
import asyncHandler from 'express-async-handler'
import createError from 'http-errors'
import { StatusCodes } from 'http-status-codes'
import Stripe from 'stripe'

import { BookingModel } from '../models/booking.model'
import { CarModel } from '../models/car.model'
import { transactionModel } from '../models/transaction.model'
import { UserModel } from '../models/user.model'
import { frontendUrl } from '../utils/frontend-url'

dayjs.extend(LocalizedFormat)

const stripeInstance = () =>
  new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2020-08-27'
  })
const isCarAvailableForBooking = (car, startDate) => {
  if (car.isBooked) {
    return new Date(startDate) > new Date(car.bookedUntill)
  }
  return true
}
export const findAll = asyncHandler(async (req, res, next) => {
  const bookings = await BookingModel.find({ user: req.user._id })
  res.json(bookings)
})
export const cancelBooking = asyncHandler(async (req, res, next) => {
  const { bookingId } = req.params
  const booking = await BookingModel.findById(bookingId)
  if (!booking) return next(createError(StatusCodes.NOT_FOUND, 'Booking not found'))
  const car = await CarModel.findById(booking.car._id)
  if (!car) return next(createError(StatusCodes.NOT_FOUND, 'Car not found'))

  //update booking status
  booking.status = 'cancelled'
  //update information related to booking on car
  car.isBooked = false
  car.bookedFrom = null
  car.bookedUntill = null
  await Promise.all([booking.save(), car.save()])
  res.json({ message: 'Booking cancelled' })
})
export const getCheckoutSession = asyncHandler(async (req, res, next) => {
  const car = await CarModel.findById(req.params.carId)
  if (!isCarAvailableForBooking(car, req.body.startDate)) {
    return next(
      createError(
        StatusCodes.BAD_REQUEST,
        `Car is unavailable for booking from ${dayjs(car.bookedFrom).format(
          'LL'
        )} to ${dayjs(car.bookedUntill).format('LL')}`
      )
    )
  }
  if (!car)
    return next(
      createError(
        StatusCodes.NOT_FOUND,
        'The car you are trying to book does not exist'
      )
    )
  const checkoutSession = await stripeInstance().checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: frontendUrl(`/profile?success=true&carName=${car.name}`),
    cancel_url: frontendUrl(`/cars/${req.params.carId}`),
    customer_email: req.user.email,
    client_reference_id: req.params.carId,
    metadata: {
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      pickupLocation: JSON.stringify(req.body.pickupLocation),
      dropoffLocation: JSON.stringify(req.body.dropoffLocation)
    },
    line_items: [
      {
        name: car.name,
        description: car.description,
        amount: car.price * 100,
        currency: 'usd',
        quantity: 1,
        images: [car.image]
      }
    ]
  })
  res.json(checkoutSession)
})
export const webhooks = asyncHandler(async (req, res, next) => {
  const signature = req.headers['stripe-signature']
  const event = stripeInstance().webhooks.constructEvent(
    req.body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
  )
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const carId = session.client_reference_id
    const user = await UserModel.findOne({ email: session.customer_email })
    const totalPrice = session.amount_total / 100
    const { startDate, endDate } = session.metadata
    const pickupLocation = JSON.parse(session.metadata.pickupLocation)
    const dropoffLocation = JSON.parse(session.metadata.dropoffLocation)

    //create a transaction
    await transactionModel.create(session)

    // update the booking details of the car
    try {
      await CarModel.findByIdAndUpdate(carId, {
        isBooked: true,
        bookedFrom: startDate,
        bookedUntill: endDate
      })
    } catch (error) {
      console.log(error)
    }
    await BookingModel.create({
      car: carId,
      user: user._id,
      totalPrice,
      startDate,
      endDate,
      pickupLocation,
      dropoffLocation
    })
  }
  res.status(StatusCodes.OK).json({ received: true })
})
