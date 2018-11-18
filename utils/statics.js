const { Api, JsonRpc, RpcError, JsSignatureProvider } = require('eosjs')
const fetch = require('node-fetch')
const { TextDecoder, TextEncoder } = require('text-encoding')

// Keys and things
const PRIVATE_KEY = "5JxKPdtB2HN9shufEHX67USQgRPMshaF48vyGDV4jjjH3xgj4Qd"
const PUBLIC_KEY = `EOS6QHa6mBET9Dk7fZbbgdoDroDPDW3WnLTUuNnU8jnt3mP8hKT1H`
const TABLE_CODE = `buttrflytest`
const TABLE_SCOPE = `buttrflytest`
const LOCAL = 'http://127.0.0.1:7777'
const JUNGLE_TEST = 'http://jungle.cryptolions.io:18888'
const MAIN_NET = 'YOUR_BP_OF_CHOICE'

// Set up helpers
const signatureProvider = new JsSignatureProvider([PRIVATE_KEY]);
const rpc = new JsonRpc(JUNGLE_TEST, { fetch })
const EOS_API = new Api({ rpc, signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder() })

module.exports = { EOS_API, TABLE_CODE, TABLE_SCOPE }
