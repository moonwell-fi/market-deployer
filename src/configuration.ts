/** Prompts the user for configuration. */

import { ethers } from 'ethers'
import { printHeader } from './common'
import log from 'loglevel'
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import MarketConfiguration from './types/market-configuration';
import DeploymentConfiguration from './types/deployment-configuration';
import { getContractFactory } from '@moonwell-fi/moonwell.js'

/**
 * Get configuration for deploying a market.
 * 
 * This method will retry if the user indicates they've made a mistake or an error is detected.
 * 
 * @returns A configuration from the user.
 */
const getConfiguration = async (deploymentConfiguration: DeploymentConfiguration): Promise<MarketConfiguration> => {
  let marketConfiguration: MarketConfiguration | undefined = undefined
  while (marketConfiguration === undefined) {
    marketConfiguration = await readConfiguration(deploymentConfiguration)

    if (marketConfiguration === undefined) {
      log.info('Aborting market configuration.')
      log.info('Please try again!')
      log.info()
    }
  }
  log.info(`    🚀 Market Configuration Set!`)

  return marketConfiguration
}

/**
 * Get a configuration from the user.
 * 
 * This method will sanity check inputs to the best of it's ability and ask the user to confirm.
 * 
 * @returns A market configuration if checks are passed and the user confirms, otherwise undefined.
 */
const readConfiguration = async (deploymentConfiguration: DeploymentConfiguration): Promise<MarketConfiguration | undefined> => {
  printHeader(`We will now prompt you about market configuration`)

  // Get token address from user
  const tokenAddressPrompt = `
  What is the address of the ERC-20 Token to deploy a market for?
  💡 Tip: This is located under 'Profile > Contract' when viewing the Token on Moonscan.
  > `
  const tokenAddress = await getAddress(tokenAddressPrompt)
  log.info(`        ✅ Token address set as: ${tokenAddress}`)
  log.info()

  // Load additional data about the token from the blockchain.
  log.info(`  ⏳ Loading additional token details from the blockchain`)
  const erc20Factory = getContractFactory('MErc20Delegator', deploymentConfiguration.deployer)
  const token = erc20Factory.attach(tokenAddress)

  let tokenSymbol: string | undefined = undefined
  try {
    tokenSymbol = await token.symbol()
    log.info(`        ✅ Loaded token symbol as: ${tokenSymbol}`)
  } catch (e: unknown) {
    log.info(`Unable to read 'symbols' from ${tokenAddress}. Are you sure that you entered a valid ERC-20 token address?`)
    log.debug(`Caught error trying to read token symbol: ${e}`)
    return undefined
  }
  let tokenDecimals: number | undefined = undefined
  try {
    tokenDecimals = await token.decimals()
    log.info(`        ✅ Loaded token decimals as: ${tokenDecimals!.toString()}`)
  } catch (e: unknown) {
    log.info(`Unable to read 'decimals' from ${tokenAddress}. Are you sure that you entered a valid ERC-20 token address?`)
    log.debug(`Caught error trying to read token decimals: ${e}`)
    return undefined
  }
  log.info()

  let mTokenNamePrompt = `
  What should the name of the market's token be? This must start with "Moonwell"
  💡 Tip: Some examples might be "Moonwell USDC.mad" or "Moonwell FRAX"
  > `
  const mTokenName = await getPrefixedString(mTokenNamePrompt, "Moonwell")
  log.info(`        ✅ Setting mToken name to: ${mTokenName}`)

  let mTokenSymbolPrompt = `
  What should the symbol of the market's token be? This must start with "m"
  💡 Tip: Some examples might be "mUSDC.mad" or "mFRAX"
  > `
  const mTokenSymbol = await getPrefixedString(mTokenSymbolPrompt, "m")
  log.info(`        ✅ Setting mToken symbol to: ${mTokenSymbol}`)


  // Load address for chainlink oracle feed
  const chainlinkFeedAddressPrompt = `
  What is the address Chainlink feed for the token?
  💡 Tip: You can find a list of price feeds here: https://docs.chain.link/docs/data-feeds/price-feeds/addresses/?network=${deploymentConfiguration.environment.toLowerCase()}
  > `
  const chainlinkFeedAddress = await getAddress(chainlinkFeedAddressPrompt)
  log.info(`        ✅ Chainlink feed set as: ${chainlinkFeedAddress}`)
  log.info()

  // Load economic data

  const reserveFactorPrompt = `
  What is the reserve factor of the new market? Enter an integer representing a percentage. For instance, enter '25' for 25%.
  In line with the Gauntlet Asset Listing Framework, a typical stablecoin market like USDC will have a 15% Reserve Factor and a crypto market like GLMR will have a 25% Reserve Factor.
  💡 Tip: You can learn more about what the Reserve Factor is at https://docs.moonwell.fi/moonwell-finance/protocol-info/protocol-information#reserve-factor
  > `
  const reserveFactor = await getInteger(reserveFactorPrompt)
  log.info(`        ✅ Setting reserve factor to ${reserveFactor}%`)
  log.info()

  // We default to 3 for now. Eventually we may want to allow this to be configurable.
  const protocolSeizeShare = 3

  const collateralFactorPrompt = `
  What is the collateral factor for the new market? Enter an integer representing a percentage. For instance, enter '0' for 0%.
  In line with the Gauntlet Asset Listing Framework, typically new markets have a collateral factor of 0%.
  > Tip: You can learn more about what the Collateral Factor is at https://docs.moonwell.fi/moonwell-finance/protocol-info/protocol-information#collateral-factor
  > `
  const collateralFactor = await getInteger(collateralFactorPrompt)
  log.info(`        ✅ Setting Collateral Factor to ${collateralFactor}%`)
  log.info()

  // Print the config and give it to the user.
  const config = {
    tokenAddress,
    chainlinkFeedAddress,
    tokenSymbol: tokenSymbol!,
    tokenDecimals: tokenDecimals!,
    mTokenSymbol,
    mTokenName,
    reserveFactor,
    protocolSeizeShare,
    collateralFactor
  }
  printHeader('Market Configuration')
  printConfiguration(config)
  const confirmationPrompt = `
    Enter 'y' to confirm the above configuration is correct, or 'n' to modify configuration.
    > `
  const response = await readUserInput(confirmationPrompt)
  return response === 'y' ? config : undefined
}

/**
 * Prints a market configuration.
 */
export const printConfiguration = (config: MarketConfiguration) => {
  log.info(`    Collateral Parameters:`)
  log.info(`        Token Address: ${config.tokenAddress}`)
  log.info(`        Token Symbol: ${config.tokenSymbol}`)
  log.info(`        Token Decimals: ${config.tokenDecimals}`)
  log.info()
  log.info(`    Oracle Parameters:`)
  log.info(`        Chainlink Feed Address: ${config.chainlinkFeedAddress}`)
  log.info()
  log.info(`    Market Parameters:`)
  log.info(`        mToken Name: ${config.mTokenName}`)
  log.info(`        mToken Symbol: ${config.mTokenSymbol}`)
  log.info()
  log.info(`    Economic Parameters`)
  log.info(`        Reserve Factor: ${config.reserveFactor}%`)
  log.info(`        Protocol Seize Share: ${config.protocolSeizeShare}%`)
  log.info(`        Collateral Factor: ${config.collateralFactor}%`)
  log.info()
}

/**
 * Get a string from the user, forcing it to start with the given value.
 * @param prompt The question to ask the user.
 * @param prefix The required prefix
 * @return The entered string.
 */
export const getPrefixedString = async (prompt: string, prefix: string) => {
  let result = ''
  let isValid = false
  while (!isValid) {
    result = await readUserInput(prompt)

    isValid = result.startsWith(prefix)
    if (!isValid) {
      log.info(`    Input "${result}" must start with "${prefix}". Please try again.`)
    }
  }

  return result
}

/**
 * Get an integer by prompting the user.
 * 
 * This function guarantees the user enters a valid integer, and will reprompt the user if they don't enter a valid 
 * input.
 * 
 * @param prompt The question to ask the user.
 * @returns An integer the user entered.
 */
export const getInteger = async (prompt: string): Promise<number> => {
  let integer = Number.NaN
  while (Number.isNaN(integer)) {
    const input = await readUserInput(prompt)

    integer = Number.parseInt(input)
    if (Number.isNaN(integer)) {
      log.info(`    Input '${input}' doesn't look like a valid integer. Please try again.`)
    }
  }

  return integer
}

/**
 * Get an address by prompting the user.
 * 
 * This function guarantees the returned address is valid, and will reprompt the user if they don't enter a valid 
 * address.
 * 
 * @param prompt The question to ask the user.
 * @returns An address the user entered.
 */
const getAddress = async (prompt: string): Promise<string> => {

  let address: string | undefined = undefined
  let isValidAddress = false
  while (!isValidAddress) {
    address = await readUserInput(prompt)

    isValidAddress = ethers.utils.isAddress(address)
    if (!isValidAddress) {
      log.info(`    Input '${address}' doesn't look like a valid address. Please try again.`)
    }
  }

  return address!
}

/**
 * Read a line of input from the user.
 * 
 * @param prompt The question to ask the user.
 * @returns An address the user entered.
 */
const readUserInput = async (prompt: string): Promise<string> => {
  const rl = readline.createInterface({ input, output });
  const response = (await rl.question(prompt)).trim()
  rl.close();
  return response
}

export default getConfiguration