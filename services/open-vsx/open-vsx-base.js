'use strict'

const Joi = require('joi')
const { BaseJsonService, NotFound } = require('..')

const extensionQuerySchema = Joi.object({
  error: Joi.string(),
  version: Joi.string().when('error', {
    is: Joi.exist(),
    then: Joi.forbidden(),
    otherwise: Joi.required(),
  }),
  timestamp: Joi.string().isoDate().when('error', {
    is: Joi.exist(),
    then: Joi.forbidden(),
    otherwise: Joi.required(),
  }),
  downloadCount: Joi.number().optional().min(0),
  reviewCount: Joi.number().optional().min(0),
  averageRating: Joi.number().when('reviewCount', {
    is: Joi.exist(),
    then: Joi.number().max(5),
    otherwise: Joi.forbidden(),
  }),
}).required()

module.exports = class OpenVSXBase extends BaseJsonService {
  static keywords = [
    'ovsx',
    'open-vsx',
    'ovsx-marketplace',
    'open-vsx-marketplace',
  ]

  static defaultBadgeData = {
    label: 'open vsx',
    color: 'blue',
  }

  async fetch({ namespace, extension, version }) {
    const baseUrl = 'https://open-vsx.org/api'
    const options = {
      method: 'GET',
    }

    const url = version
      ? `${baseUrl}/${namespace}/${extension}/${version}`
      : `${baseUrl}/${namespace}/${extension}`

    return this._requestJson({
      schema: extensionQuerySchema,
      url,
      options,
      errorMessages: {
        400: 'invalid extension id',
      },
    })
  }

  validateResponse({ json }) {
    const { error, version } = json
    if (error || !version) {
      throw new NotFound({
        prettyMessage: 'extension not found',
      })
    }
    return json
  }
}
