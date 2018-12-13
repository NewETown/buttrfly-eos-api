const moment = require('moment')
const _ = require('lodash')
const fetch = require("node-fetch")

const { TABLE_CODE, TABLE_SCOPE, EOS_API } = require('../utils/statics')
const { BUILD_ACTION, GET_TABLE, HANDLE_ERROR } = require('../utils/routeUtils')

const MENTION_REGEX = /@[a-zA-Z0-9_-]+/gm
const ABYSS_API = process.env.NODE_ENV !== 'production' && process.env.LOCAL_API ? process.env.LOCAL_API : 'http://138.197.212.31'


module.exports = (io) => {
  const oracleSocket = io.of('/oracle')

  // Get any active campaigns
  const getCampaigns = async () => {
    const formatDate = (d) => moment(Number.parseInt(d)).format('YYYY-MM-DD')
    const lower_bound = moment().subtract(7, "days") // .valueOf() for milliseconds
    const upper_bound = moment()
    const campaignCall = GET_TABLE({
      code: TABLE_CODE,
      scope: TABLE_SCOPE,
      table: 'campaign',
      // lower_bound: `${lower_bound.valueOf()}`,
      // upper_bound: `${upper_bound.valueOf()}`,
      // index_position: 3,
      // key_type: 'i64',
      limit: 100
    })

    // curl -X POST https://api.jungle.alohaeos.com:443/v1/chain/get_table_rows -d '{"json":true,"code":"buttrfly1234","scope":"buttrfly1234","table":"campaign", "index_position":3,"key_type":"i64","lower_bound":"1543273564614","upper_bound":"1543878364616"}'

    // console.log('Calling getCampaigns between dates', formatDate(lower_bound), lower_bound, formatDate(upper_bound), upper_bound)
    // Sample call to 
    const campaignRows = await EOS_API.rpc.get_table_rows(campaignCall)
    // console.log('result', rows, more)
    campaignRows.rows && campaignRows.rows.forEach(r => { console.log(r.id, r.campaign_name, formatDate(r.startdate), formatDate(r.enddate)) })

    // Find the campaigns that have ended within the past 7 days

    const recentlyEnded = _.keyBy(_.filter(campaignRows.rows, c => moment(Number.parseInt(c.enddate)).isAfter(lower_bound) && moment(Number.parseInt(c.enddate)).isBefore(upper_bound)), 'id')
    // console.log('Recently ended campaigns', recentlyEnded)

    // Find the pairings for those campaigns that haven't been verified
    const oracleCall = GET_TABLE({
      code: TABLE_CODE,
      scope: TABLE_SCOPE,
      table: 'oracle',
      // lower_bound: `${lower_bound.valueOf()}`,
      // upper_bound: `${upper_bound.valueOf()}`,
      // index_position: 3,
      // key_type: 'i64',
      limit: 1000
    })

    const oracleRows = await EOS_API.rpc.get_table_rows(oracleCall)
    // console.log('Oracle rows', oracleRows.rows)

    const getShortcode = (url) => {
      const regex = /p\/([\d\w]*)/gm;
      let m, idx=0, shortcode;

      while ((m = regex.exec(url)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === regex.lastIndex) {
            regex.lastIndex++;
        }
        
        // The result can be accessed through the `m`-variable.
        m.forEach((match, groupIndex) => {
            console.log(`Found match, group ${groupIndex}: ${match}`);
            idx++
            shortcode = match
        });
      }

      console.log('idx', idx)
      return idx === 2 ? shortcode : ''
    }

    const checkCampaign = async (o) => {
      // Check each row against the finished campaigns
      // if (o.passed_verification || !o.post_url || o.post_url.length < 1) return

      // const campaign = recentlyEnded[o.campaignid.toString()]
      // if (!campaign) return

      // console.log('Found pair', o, campaign)

      const shortcode = getShortcode(o.post_url)

      if (shortcode.length < 1) {
        console.log(`Invalid post URL ${o.post_url} ${shortcode}`)
        return
      }

      const response = await fetch(`${ABYSS_API}/api/post/${shortcode}`)

      const { post, error, success } = await response.json()

      if (!success) {
        console.log(`Unable to find post ${o.post_url}`, error)
        return
      }

      console.log('Found post', post)

      // Check post date

      // Check mentions

      // Check hashtags

    }

    checkCampaign({ post_url: 'https://www.instagram.com/p/BrAs2Ifg90N/' })

    // oracleRows.rows.forEach(o => { checkCampaign(o) })
  }

  // getCampaigns()
}