const router = require('koa-router')()

const { TABLE_CODE, TABLE_SCOPE, EOS_API } = require('../utils/statics')
const { BUILD_ACTION, GET_TABLE, HANDLE_ERROR } = require('../utils/routeUtils')
// const { DRIVER_FUNCTIONS } = require('../postgres/driver')

module.exports = (io) => {
  // Use socket when appropriate, REST gets taxing
  const routeSocket = io.of('/ROUTE_NAME')
  
  router.prefix('/eos/ROUTE_NAME')
  
  router.get('/', async (ctx, next) => {
    // Get a list of on-chain items
  
    const res = {
      success: true,
      status: 200,
      error: null,
      data: [],
      more: false
    }

    try {
      // Try/Catch async/await pattern
      const availableTables = [
        'table1',
        'table2'
      ]

      if (availableTables.indexOf(ctx.query.table) === -1) throw new Error('Invalid table')

      const call = GET_TABLE({ code: TABLE_CODE, scope: TABLE_SCOPE, ...ctx.query })

      // Sample call to 
      const { rows, more } = await EOS_API.rpc.get_table_rows(call)

      res.data = rows
      res.more = more

      ctx.body = res
      ctx.respond = true
    } catch (ex) {
      HANDLE_ERROR(ex, 'Error retrieving your table', res, ctx)
    }
  })
  
  router.post('/single_action', async (ctx, next) => {
    // [Describe route purpose]
    // Store params in ctx.request.body a la bodyparser

    const res = {
      success: true,
      status: 200,
      error: null,
      data: {},
      transactionId: null
    }
    try {
      // Async/Await pattern
      const availableActions = [
        'action1',
        'action2'
      ]
      
      if (availableActions.indexOf(ctx.request.body.action) === -1) throw new Error('Invalid action')

      const actions = [
        BUILD_ACTION({ name: ctx.request.body.action, data: { ...ctx.request.body.data }})
      ]

      // Destructure when appropriate
      const { transaction_id } = await EOS_API.transact({
        actions
      }, {
        blocksBehind: 3,
        expireSeconds: 30,
      })

      res.data = ctx.request.body.data
      res.transactionId = transaction_id
      ctx.body = res
      ctx.respond = true
    } catch (ex) {
      HANDLE_ERROR(ex, 'Error performing action', res, ctx)
    }
  })
  
  return router
}
