/** Utilities to configure a deployed market. */

import log from 'loglevel'
import { printHeader, getTimelockAddress, sleep, waitForConfirmations } from './common'
import DeploymentConfiguration from './types/deployment-configuration'
import { ethers, BigNumber, Contract } from 'ethers'
import MarketConfiguration from './types/market-configuration'
import ConfigureMarketResult from './types/configure-market-result'
import { getContractFactory } from '@moonwell-fi/moonwell.js'

/** Amount of time to wait before retrying an operation. */
const RETRY_DELAY_SECONDS = 30

/**
 * Configure a market post deployment. 
 * 
 * This function sets the protocol seize share, the reserve factor, and sets a pending admin for the market. The pending
 * admin must accept their role before becoming admin by calling `accept`.
 * 
 * This method will automatically retry each step, since we've observed flakiness on transaction estimation in the 
 * past.
 * 
 * @param mTokenAddress The address of the newly deployed mToken.
 * @param marketConfiguration Configuration for the market.
 * @param deploymentConfiguration Configuration for the deployment.
 * @returns The result of configuration.
 */
export const configureMarket = async (
  mTokenAddress: string,
  marketConfiguration: MarketConfiguration,
  deploymentConfiguration: DeploymentConfiguration
): Promise<ConfigureMarketResult> => {
  printHeader(`Configuring the Market`)

  // Get a contract instance
  const contractFactory = getContractFactory('MErc20Delegator', deploymentConfiguration.deployer)
  const mToken = contractFactory.attach(mTokenAddress)

  // Configure each market
  const setReserveFactorHash = await setReserveFactor(mToken, marketConfiguration, deploymentConfiguration)
  const setProtocolSeizeShareHash = await setProtocolSeizeShare(mToken, marketConfiguration, deploymentConfiguration)
  const setPendingAdminHash = await setPendingAdminOnMarket(mToken, deploymentConfiguration)

  log.info('    🚀 Market configured successfully.')
  log.info()

  return {
    setReserveFactorHash,
    setProtocolSeizeShareHash,
    setPendingAdminHash,
  }
}

/**
 * Set the Reserve Factor on a given market
 * 
 * @param mToken A contract attached to the newly deployed mToken.
 * @param marketConfiguration Configuration for the new market.
 * @param deploymentConfiguration The deployment configuration
 * @returns The transaction hash.
 */
const setReserveFactor = async (mToken: Contract, marketConfiguration: MarketConfiguration, deploymentConfiguration: DeploymentConfiguration): Promise<string> => {
  log.info(`    Setting reserve factor`)

  // Calculate the reserve factor 
  const reserveFactor = BigNumber.from(marketConfiguration.reserveFactor).mul(BigNumber.from("10").pow("16"));
  log.debug(`Using reserve factor: ${reserveFactor.toString()}`)
  log.debug()

  // Send the operation
  const result = await sendOperationWithRetries(mToken, '_setReserveFactor', [reserveFactor], deploymentConfiguration)
  log.info(`    🚀 Reserve Factor set successfully.`)
  log.info()
  return result
}

/**
 * Set the Protocol Seize Share on a given market
 * 
 * @param mToken A contract attached to the newly deployed mToken.
 * @param marketConfiguration Configuration for the new market.
 * @param deploymentConfiguration The deployment configuration
 * @returns The transaction hash.
 */
const setProtocolSeizeShare = async (mToken: Contract, marketConfiguration: MarketConfiguration, deploymentConfiguration): Promise<string> => {
  log.info(`    Setting protocol seize share`)

  // Calculate the reserve factor 
  const protocolSeizeShare = BigNumber.from(marketConfiguration.protocolSeizeShare).mul(BigNumber.from("10").pow("16"));
  log.debug(`Using protocol seize share: ${protocolSeizeShare.toString()}`)
  log.debug()

  // Send the operation
  const result = await sendOperationWithRetries(mToken, '_setProtocolSeizeShare', [protocolSeizeShare], deploymentConfiguration)
  log.info(`    🚀 Protocol Seize Share set successfully.`)
  log.info()
  return result
}

/**
 * Set the pending admin on a market.
 * 
 * The pending admin must call `accept` in order to finish this process.
 * 
 * @param mToken A contract attached to the newly deployed mToken.
 * @param deploymentConfiguration The configuration for this deployment.
 * @returns The transaction hash.
 */
const setPendingAdminOnMarket = async (mToken: Contract, deploymentConfiguration: DeploymentConfiguration): Promise<string> => {
  log.info(`    Setting admin to timelock.`)

  // Load timelock address
  const timelockAddress = getTimelockAddress(deploymentConfiguration.environment)
  log.debug(`Loaded Timelock Address: ${timelockAddress}`)
  log.debug()

  // Send the operation
  const result = await sendOperationWithRetries(mToken, '_setPendingAdmin', [timelockAddress], deploymentConfiguration)
  log.info(`    🚀 Pending Admin set successfully.`)
  log.info()
  return result
}

/**
 * Send an operation, retrying if it fails.
 * 
 * @param mToken An instance of an mToken contract.
 * @param functionName The name of the function to call.
 * @param args An array of arguments to pass to the function.
 * @param deploymentConfiguration The deployment configuration
 * @returns The transaction hash.
 */
const sendOperationWithRetries = async (mToken: Contract, functionName: string, args: Array<any>, deploymentConfiguration: DeploymentConfiguration): Promise<string> => {
  log.debug(`Sending operation:`)
  log.debug(`   Contract Address: ${mToken.address}`)
  log.debug(`   Function Name: ${functionName}`)
  log.debug(`   Function Arguments: ${args}`)
  log.debug()

  while (true) {
    try {
      const result = await mToken[functionName](...args)
      log.info(`    Operation sent with hash: ${result.hash}`)

      await waitForConfirmations(result, deploymentConfiguration.requiredConfirmations)
      return result.hash
    } catch (e) {
      log.info(`Error sending operation. Retrying after 30s...`)
      log.debug(`Error: ${e}`)
      await sleep(RETRY_DELAY_SECONDS)
    }
  }
}
