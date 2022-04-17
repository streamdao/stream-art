import { PublicKey } from '../../streamTools/node_modules/@solana/web3.js.js'

export function isPublicKey(pk: string) {
  try {
    new PublicKey(pk)
    return true
  } catch {
    return false
  }
}

export function tryParsePublicKey(pk: string) {
  try {
    return new PublicKey(pk)
  } catch {
    return undefined
  }
}
