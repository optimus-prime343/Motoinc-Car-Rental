import { CAR_LIST } from '../data/car-list'
import { CarModel } from '../models/car.model'
import { dbConnect } from './db-connect'

const dbSeed = async () => {
  await dbConnect()
  if (process.argv.includes('--delete')) {
    await CarModel.deleteMany()
    console.log('DB has been cleared')
  }
  if (process.argv.includes('--seed')) {
    await Promise.all(CAR_LIST.map(async car => await CarModel.create(car)))
    // await CarModel.insertMany(CAR_LIST)
    console.log('DB has been seeded')
  }
}
dbSeed().catch(error => console.log(error.message))
