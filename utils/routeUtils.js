const { TABLE_CODE, TABLE_SCOPE, EOS_API } = require('./statics')

const HANDLE_ERROR = (ex, msg='An error occurred! Give them a good message', res, ctx) => {
  // Sample error
  // console.error(`${Date.now()} - ERROR - Unexpected error occurred: `, ex)
  let message = msg
  if (ex && ex.json && ex.json.error.details) {
    // console.log('Error details', ex.json.error.details[0].message)
    message = ex.json.error.details[0].message
  }
  res.error = message
  res.success = false
  res.status = 400
  res.error = ex.message || ex
  ctx.body = res
  ctx.respond = true
}

const GET_TABLE = ({ table, code, scope, limit, lower_bound, upper_bound }) => {
  const call = {
    code,
    scope,
    table,
  }

  if (limit) call.limit = limit
  if (lower_bound) call.lower_bound = lower_bound
  if (upper_bound) call.upper_bound = upper_bound

  return call
}

const BUILD_ACTION = ({ account=TABLE_CODE, name, actor=TABLE_CODE, permission='active', data}) => {
  return {
    account,
    name,
    authorization: [
      {
        actor,
        permission
      }
    ],
    data
  }
}

module.exports = { BUILD_ACTION, HANDLE_ERROR, GET_TABLE }
