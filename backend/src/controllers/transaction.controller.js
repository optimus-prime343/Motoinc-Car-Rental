import asyncHandler from 'express-async-handler'

import { transactionModel } from '../models/transaction.model'

export const findAll = asyncHandler(async (req, res, next) => {
  const transactions = await transactionModel.find()
  res.json(transactions)
})
