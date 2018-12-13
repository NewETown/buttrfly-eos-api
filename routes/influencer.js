const router = require('koa-router')()

const { TABLE_CODE, TABLE_SCOPE, EOS_API } = require('../utils/statics')
const { BUILD_ACTION, GET_TABLE, HANDLE_ERROR } = require('../utils/routeUtils')
// const { DRIVER_FUNCTIONS } = require('../postgres/driver')

module.exports = (io) => {
  // Use socket when appropriate, REST gets taxing
  const routeSocket = io.of('/influencer')
  
  router.prefix('/eos/influencers')
  
  router.get('/', async (ctx, next) => {
    // Get a list of Influencers
  
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
        'influencer',
        'campaignpair'
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
      // Sample error
      HANDLE_ERROR(ex, 'Error retrieving influencers', res, ctx)
    }
  })

  router.post('/single_action', async (ctx, next) => {
    // Handles single actions from the mobile app and dashboard

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
        'uinfluencer',
        'vinfluencer',
        'paircampaign'
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
      HANDLE_ERROR(ex, 'Error creating influencer', res, ctx)
    }
  })

  router.post('/create_account', async (ctx, next) => {
    // Create a new EOS account
    // Params
    // @param accountName
    // @param pubKey

    const res = {
      success: true,
      status: 200,
      error: null,
      data: {},
      transactionIds: []
    }

    try {
      // Async/Await pattern
      const { accountName, pubKey } = ctx.request.body

      if (!accountName || accountName.length !== 12) {
        throw new Error("Invalid account name")
      }

      if (!pubKey || pubKey.indexOf("EOS") !== 0) {
        throw new Error("Invalid EOS Public Key")
      }
      
      const eosAccount = await EOS_API.transact({
        actions: [{
          account: 'eosio',
          name: 'newaccount',
          authorization: [{
            actor: TABLE_CODE,
            permission: 'active',
          }],
          data: {
            creator: TABLE_CODE,
            name: accountName,
            owner: {
              threshold: 1,
              keys: [{
                key: pubKey,
                weight: 1
              }],
              accounts: [],
              waits: []
            },
            active: {
              threshold: 1,
              keys: [{
                key: pubKey,
                weight: 1
              }],
              accounts: [],
              waits: []
            },
          },
        },
        {
          account: 'eosio',
          name: 'buyrambytes',
          authorization: [{
            actor: TABLE_CODE,
            permission: 'active',
          }],
          data: {
            payer: TABLE_CODE,
            receiver: accountName,
            bytes: 8192,
          },
        },
        {
          account: 'eosio',
          name: 'delegatebw',
          authorization: [{
            actor: TABLE_CODE,
            permission: 'active',
          }],
          data: {
            from: TABLE_CODE,
            receiver: accountName,
            stake_net_quantity: '1.0000 EOS',
            stake_cpu_quantity: '2.0000 EOS',
            transfer: false,
          }
        }]
      }, {
        blocksBehind: 3,
        expireSeconds: 30,
      })

      console.log('Create EOS account result', eosAccount.transaction_id, eosAccount.processed)

      res.data = {
        eos: eosAccount.processed,
      }
      res.transactionIds = [
        eosAccount.transaction_id,
      ]
      ctx.body = res
      ctx.respond = true
    } catch (ex) {
      HANDLE_ERROR(ex, 'Error performing action', res, ctx)
    }
  })
  
  return router
}
