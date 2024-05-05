import { HttpContext } from '@adonisjs/core/http'
import { createTripValidator, updateTripValidator } from '#validators/trip'
import Trip from '#models/trip'
import { DateTime } from 'luxon'
import { inject } from '@adonisjs/core'
import FileUploaderService from '#services/file_uploader_service'
import Payment from '#models/payment'
import AwsService from '#services/aws_service'
import { cuid } from '@adonisjs/core/helpers'
import app from '@adonisjs/core/services/app'
import fs from 'node:fs/promises'
import { promises as fsPromises } from 'node:fs'
import env from '#start/env'

@inject()
export default class TripsController {
  constructor(
    protected FileUploader: FileUploaderService,
    protected awsService: AwsService
  ) {}

  /**
   * List of the resource
   */
  async index({ response, auth }: HttpContext) {
    if (auth.user) {
      await auth.user.load('trips')

      const trips = auth.user.trips

      const sharedTrips = await auth.user.getSharedTrips()

      return response.ok({ trips: trips, shared: sharedTrips })
    }
  }

  async store({ request, response, auth }: HttpContext) {
    const payload = await request.validateUsing(createTripValidator)

    const trip = await Trip.create({
      name: payload.name,
      city: payload.city,
      countryCode: payload.countryCode,
      start: payload.start,
      end: payload.end,
      userId: auth.user?.id,
      latitude: payload.latitude,
      longitude: payload.longitude,
    })

    return response.created(trip)
  }

  async show({ params, response }: HttpContext) {
    try {
      const trip = await Trip.findOrFail(params.tripId)

      await trip.load('user', (u) => {
        u.select('id', 'username')
      })
      await trip.load('activities')
      await trip.load('participants')
      await trip.load('budget')
      await trip.load('payments')

      return response.ok(trip)
    } catch (error) {
      console.log(error)
      return response.notFound({ error: 'TRIP_NOT_FOUND' })
    }
  }

  async update({ params, request, response }: HttpContext) {
    const trip = await Trip.findOrFail(params.tripId)
    const payload = await request.validateUsing(updateTripValidator)

    const tripUpdated = await trip.merge(payload).save()

    // Save images if exists
    const thumbnail = request.file('thumbnail')
    const cover = request.file('cover')

    if (thumbnail) {
      if (trip.thumbnail) {
        await this.awsService.removeFile(trip.thumbnail.replace(`${env.get('AWS_S3_URL')}/`, ''))
      }

      await thumbnail.move(app.makePath('tmp/uploads'))

      //@ts-ignore
      const thumbnailBuffer = await fs.readFile(thumbnail.filePath)
      const thumbnailUrl = await this.awsService.uploadFile(
        thumbnailBuffer,
        `trips/${trip.id}/thumbnail-${cuid()}.${thumbnail.extname}`
      )

      if (thumbnailUrl !== '') await trip.merge({ thumbnail: thumbnailUrl }).save()

      // Remove file on disk
      if (thumbnail.filePath) {
        await fsPromises.unlink(thumbnail.filePath)
      }
    }
    if (cover) {
      if (trip.cover) {
        await this.awsService.removeFile(trip.cover.replace(`${env.get('AWS_S3_URL')}/`, ''))
      }

      await cover.move(app.makePath('tmp/uploads'))

      //@ts-ignore
      const coverBuffer = await fs.readFile(cover.filePath)
      const coverUrl = await this.awsService.uploadFile(
        coverBuffer,
        `trips/${trip.id}/cover-${cuid()}.${cover.extname}`
      )

      if (coverUrl !== '') await trip.merge({ cover: coverUrl }).save()

      // Remove file on disk
      if (cover.filePath) {
        await fsPromises.unlink(cover.filePath)
      }
    }

    return response.ok(tripUpdated)
  }

  async destroy({ params, response, auth }: HttpContext) {
    const trip = await Trip.findOrFail(params.id)

    // Check if owner
    if (trip.userId !== auth.user?.id) return response.abort({ error: 'NOT_AUTHORIZED' }, 400)

    // Delete all related files
    if (trip.thumbnail) {
      await this.awsService.removeFile(trip.thumbnail.replace(`${env.get('AWS_S3_URL')}/`, ''))
    }
    if (trip.cover) {
      await this.awsService.removeFile(trip.cover.replace(`${env.get('AWS_S3_URL')}/`, ''))
    }

    await trip.delete()

    return response.ok({ message: `Trip ${trip.id}  deleted` })
  }

  /**
   * Fetch current trip or most recent in user's trips or shared trips
   * @param auth
   * @param response
   */
  async getCurrentOrMostRecentTrip({ auth, response }: HttpContext) {
    const now = DateTime.now().startOf('day').toString()
    const userId = auth.user?.id as number

    const currentTrip = await Trip.query()
      .preload('payments', (p) => {
        p.select('amount')
      })
      .where((query) => {
        query.where('userId', userId).orWhereHas('participants', (builder) => {
          builder.where('email', auth?.user?.email as string)
        })
      })
      .andWhere('start', '<=', now)
      .andWhere('end', '>=', now)
      .orderBy('start', 'asc')
      .first()

    if (currentTrip) {
      const tripCurrentWithSharedInfo = {
        ...currentTrip.toJSON(),
        isShared: currentTrip.userId !== userId,
      }
      return response.ok({ trip: tripCurrentWithSharedInfo })
    }

    const upcomingTrip = await Trip.query()
      .where((query) => {
        query.where('userId', userId).orWhereHas('participants', (builder) => {
          builder.where('email', auth?.user?.email as string)
        })
      })
      .andWhere('start', '>', now)
      .orderBy('start', 'asc')
      .first()

    if (upcomingTrip) {
      const tripUpcomingWithSharedInfo = {
        ...upcomingTrip.toJSON(),
        isShared: upcomingTrip.userId !== userId,
      }
      return response.ok({ trip: tripUpcomingWithSharedInfo })
    }

    return response.ok({ trip: null })
  }

  async getFutureTrips({ auth, response }: HttpContext) {
    const now = DateTime.now().startOf('day').toString()

    const futureTrips = await Trip.query()
      .where((query) => {
        query.where('userId', auth?.user?.id as number).orWhereHas('participants', (builder) => {
          builder.where('email', auth?.user?.email as string)
        })
      })
      .andWhere('start', '>=', now)
      .orderBy('start', 'asc')

    const tripsWithSharedInfo = futureTrips.map((trip) => {
      return {
        ...trip.toJSON(),
        isShared: trip.userId !== (auth?.user?.id as number),
      }
    })

    return response.ok({ trips: tripsWithSharedInfo })
  }

  async getPastTrips({ auth, response }: HttpContext) {
    const now = DateTime.now().startOf('day').toString()

    const pastTrips = await Trip.query()
      .where((query) => {
        query.where('userId', auth?.user?.id as number).orWhereHas('participants', (builder) => {
          builder.where('email', auth?.user?.email as string)
        })
      })
      .andWhere('end', '<', now)
      .orderBy('start', 'asc')

    const tripsWithSharedInfo = pastTrips.map((trip) => {
      return {
        ...trip.toJSON(),
        isShared: trip.userId !== (auth?.user?.id as number),
      }
    })

    return response.ok({ trips: tripsWithSharedInfo })
  }

  async getParticipants({ response, params }: HttpContext) {
    const trip = await Trip.findOrFail(params.tripId)

    await trip.load('participants')
    await trip.load('user')

    return response.ok({
      participants: trip.participants,
      owner: trip.user.serializeAttributes({ pick: ['id', 'username', 'email'] }),
    })
  }

  async getBudget({ response, params }: HttpContext) {
    const trip = await Trip.findOrFail(params.tripId)

    await trip.load('budget')

    return response.ok(trip.budget)
  }

  async getPayments({ response, params }: HttpContext) {
    const payments = await Payment.query()
      .preload('participant', (p) => {
        p.select('name')
      })
      .preload('user', (u) => {
        u.select('username')
      })
      .where('tripId', params.tripId)
      .orderBy('createdAt', 'desc')

    return response.ok(payments)
  }
}
