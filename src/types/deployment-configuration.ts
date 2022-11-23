import { Environment } from '@moonwell-fi/moonwell.js'
import { Signer } from 'ethers'

/** Configuration for deployement */
type DeploymentConfiguration = {
  /** The environment this deployment is running in. */
  environment: Environment

  /** A Signer who will deploy contracts and call methods to configure them. */
  deployer: Signer

  /** A URL for a moonscan API. Undefined if moonscan doesn't exist for the given network (ex. Ganache) */
  moonscanApiUrl?: string

  /** The number of confirmations to use */
  requiredConfirmations: number

  /** The number of markets to deploy. */
  numMarkets: number
}

export default DeploymentConfiguration