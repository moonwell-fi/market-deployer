/** Defines preflight checks for a market deploy */

import { ethers } from 'ethers'
import { printHeader } from './common'
import log from 'loglevel'
import DeploymentConfiguration from './types/deployment-configuration'
import { MOONSCAN_API_KEY_ENV_VAR_NAME, MOONWELL_MARKET_DEPLOYER_PK_ENV_VAR_NAME, REQUIRED_CONFIRMATIONS } from './constants'
import { getNativeTokenSymbol, Environment } from '@moonwell-fi/moonwell.js'

/** Minimum required value to be on the deployer key. */
const MIN_REQUIRED_BALANCE = ethers.utils.parseUnits('1')

/** 
 * Validate that the program has the capability to deploy a market and return relevant configuration.
 *
 * @param environment The environment this script is running in.
 * @param rpcUrl The URL for a JSON RPC that is used to deploy.
 * @param moonscanApiUrl A URL for moonscan.
 * @return Configuration to run the deployment. 
 */
const runPreflightChecks = async (environment: Environment, rpcUrl: string, moonscanApiUrl: string): Promise<DeploymentConfiguration> => {
  printHeader(`Running Pre Deployment Checks`)

  // Print network data
  log.info(`    💡 Running on Network: ${environment.toLowerCase()}`)
  log.info()

  // 1. Deployer env var set
  log.info(`    1. Deployer private key set`)
  const privateKey = process.env[MOONWELL_MARKET_DEPLOYER_PK_ENV_VAR_NAME]
  if (privateKey === undefined) {
    log.error(`       ⛔️ Fatal error: No Deployer key exported.`)
    log.error(`       Make sure you have a ${MOONWELL_MARKET_DEPLOYER_PK_ENV_VAR_NAME} set. See README.md for details.`)
    log.error()
    process.exit(1)
  }
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl)
  const deployer = new ethers.Wallet(privateKey, provider)
  const deployerAddress = await deployer.getAddress()
  log.info(`        ✅ Passed!`)
  log.info()

  log.info(`    💡 Loaded Deployer Key. Address: ${deployerAddress}`)
  log.info()


  // 2. Deployer key has sufficient balance.
  log.info(`    2. Deployer has sufficient balance`)
  const deployerBalance = await provider.getBalance(deployerAddress)
  log.debug(`Balance reported as: ${deployerBalance.toString()}`)
  if (deployerBalance.lt(MIN_REQUIRED_BALANCE)) {
    log.error(`              ⛔️ Fatal Error: ${deployerAddress} does not have the minimum required balance.`)
    log.error(`       Reported Balance: ${ethers.utils.formatUnits(deployerBalance)} ${getNativeTokenSymbol(environment)}`)
    log.error(`       Required Balance: ${ethers.utils.formatUnits(MIN_REQUIRED_BALANCE)} ${getNativeTokenSymbol(environment)}`)
    log.error()
    process.exit(1)
  }
  log.info(`        ✅ Passed!`)
  log.info()

  // 3. Moonscan API key is set.
  log.info(`    3. Moonscan API key is exported`)
  const apiKey = process.env[MOONSCAN_API_KEY_ENV_VAR_NAME]
  if (apiKey === undefined) {
    log.error(`       ⛔️ Fatal error: No Moonscan API key exported.`)
    log.error(`       Make sure you have a ${MOONSCAN_API_KEY_ENV_VAR_NAME} set. See README.md for details.`)
    log.error()
    process.exit(1)
  }
  log.info(`        ✅ Passed!`)
  log.info()

  log.info(`    🚀 All checks passed!`)
  return {
    environment,
    deployer,
    moonscanApiUrl,
    requiredConfirmations: REQUIRED_CONFIRMATIONS
  }
}
export default runPreflightChecks