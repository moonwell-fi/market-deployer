/** Common functions */

import log from 'loglevel'
import { REQUIRED_CONFIRMATIONS } from './constants'
import { Environment } from '@moonwell-fi/moonwell.js'

/**
 * Pretty print a header.
 * 
 * @param message The message to log.
 */
export const printHeader = (message: string) => {
  log.info()
  log.info(`[+] ${message}`)
  log.info()
}

/** TODO: These functionare are just legacy shims, remove. */

/**
 * Get the address of the comptroller by introspecting hardhat's network.
 * 
 * @returns The comptroller's address.
 */
export const getComptrollerAddress = (environment: Environment): string => {
  return Environment[environment].COMPTROLLER.address
}

/**
 * Get the address of the interest rate model by introspecting hardhat's network.
 *
 * @param networkName The name of the network that we are running on.
 * @returns The interest rate model's address.
 */
export const getInterestRateModelAddress = (environment: Environment): string => {
  return Environment[environment].INTEREST_RATE_MODEL.address
}


/**
 * Get the address of the mERC20 Implementation by introspecting hardhat's network.
 *
 * @param networkName The name of the network that we are running on.
 * @returns The mERC20 implementation's address.
 */
export const getMERC20ImplementationAddress = (environment: Environment): string => {
  return Environment[environment].MERC_20_IMPL.address
}

/**
 * Get the address of the Governance Timelock by introspecting hardhat's network.
 *
 * @param networkName The name of the network that we are running on.
 * @returns The Governance Timelock's address.
 */
export const getTimelockAddress = (environment: Environment): string => {
  return Environment[environment].TIMELOCK.address
}

/**
 * Get the address of the Chainlink Proxy by introspecting hardhat's network.
 *
 * @param networkName The name of the network that we are running on.
 * @returns The Chainlink Proxy's address.
 */
export const getChainlinkProxyAddress = (environment: Environment): string => {
  return Environment[environment].ORACLE.address
}

/**
 * Pause the program for the given number of seconds
 * 
 * @param pauseDelaySeconds The amount of seconds to pause for
 */
export const sleep = async (pauseDelaySeconds: number) => {
  await new Promise<void>((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, pauseDelaySeconds * 1000);
  });
}

/** 
 * Wait for confirmations on an Ethers operation. 
 * 
 * @param result The result of an ethers operation.
 * @param rrequiredConfirmations The number of required confirmations.
 */
export const waitForConfirmations = async (result: any, requiredConfirmations: number) => {
  log.info(`    ⏳ Waiting for ${requiredConfirmations} confirmations...`)
  await result.wait(requiredConfirmations);
  log.info(`    ✅ Confirmations received!`)
}
