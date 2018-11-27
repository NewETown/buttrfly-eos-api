const { Api, JsonRpc, RpcError, JsSignatureProvider } = require('eosjs')
const fetch = require('node-fetch')
const { TextDecoder, TextEncoder } = require('text-encoding')

// Keys and things
const PRIVATE_KEY = "5JQrtRQ4J7fva5vBf1qa2Ae42UbECyEixFKfanD7bfh94q4SZVp"
const PUBLIC_KEY = `EOS7o6gmLAHXgYoRLexJiy7QjLdKc6B785Ck1j4ZMN4RQons6KrF4`
const TABLE_CODE = `buttrflytest`
const TABLE_SCOPE = `buttrflytest`
const LOCAL = 'http://127.0.0.1:7777'
const JUNGLE_TEST = 'https://api.jungle.alohaeos.com:443'
const MAIN_NET = 'YOUR_BP_OF_CHOICE'

// Set up helpers
const signatureProvider = new JsSignatureProvider([PRIVATE_KEY]);
const rpc = new JsonRpc(JUNGLE_TEST, { fetch })
const EOS_API = new Api({ rpc, signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder() })

module.exports = { EOS_API, TABLE_CODE, TABLE_SCOPE }
