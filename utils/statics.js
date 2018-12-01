const { Api, JsonRpc, RpcError, JsSignatureProvider } = require('eosjs')
const fetch = require('node-fetch')
const { TextDecoder, TextEncoder } = require('text-encoding')

// Keys and things
const PRIVATE_KEY = "5JCztbgeF4JcB9uRPYY21sX4VzwAZ1cxzeAugp2vM47W33XmCeG"
const PUBLIC_KEY = `EOS5SBxoggbhL9DdCXspp8JQqKxK3CvH5JYjQ5LLevoA8ev3xfdWA`
const TABLE_CODE = `buttrfly1234`
const TABLE_SCOPE = `buttrfly1234`
const LOCAL = 'http://127.0.0.1:7777'
const JUNGLE_TEST = 'https://api.jungle.alohaeos.com:443'
const MAIN_NET = 'YOUR_BP_OF_CHOICE'

// Set up helpers
const signatureProvider = new JsSignatureProvider([PRIVATE_KEY]);
const rpc = new JsonRpc(JUNGLE_TEST, { fetch })
const EOS_API = new Api({ rpc, signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder() })

module.exports = { EOS_API, TABLE_CODE, TABLE_SCOPE }
