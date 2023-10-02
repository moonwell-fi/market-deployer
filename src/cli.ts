#!/usr/bin/env node

/** Provides CLI commands for working with the Market deployer */

import * as commander from 'commander'
import { Environment, ProposalData } from '@moonwell-fi/moonwell.js'
import log, { LogLevelDesc } from 'loglevel'
import runPreflightChecks from './preflight'
import getConfiguration, { getInteger, printConfiguration } from './configuration'
import { printHeader } from './common'
import { mergeProposals } from './gov-proposal'
import DeploymentConfiguration from './types/deployment-configuration'
import { deployAndWireMarket } from './index'
import { ethers } from 'ethers'
ethers.utils.Logger.setLogLevel(ethers.utils.Logger.levels.ERROR)

const { version } = require('../package.json')

const logLevel: LogLevelDesc = (process.env['MOONWELL_MARKET_DEPLOYER_LOGLEVEL'] as LogLevelDesc) ?? 'info'
log.setLevel(logLevel)

const program = new commander.Command()
program.version(version)

const makeDescription = (environment: Environment) => {
  return `Deploys an market on M${environment.toLowerCase().slice(1)}`
}

const getDefaultNodeUrl = (environment: Environment) => {
  switch (environment) {
    case Environment.MOONBASE:
      return `https://rpc.api.moonbase.moonbeam.network`
    case Environment.MOONBEAM:
      return `https://rpc.api.moonbeam.network`
    case Environment.MOONRIVER:
      return `https://rpc.moonriver.moonbeam.network`
  }
}

const getMoonscanApiUrl = (environment: Environment) => {
  switch (environment) {
    case Environment.MOONBASE:
      return `https://api-moonbase.moonscan.io/api`
    case Environment.MOONBEAM:
        return `https://api-moonbeam.moonscan.io/api`
    case Environment.MOONRIVER:
      return `https://api-moonriver.moonscan.io/api`
    }
}

/**
 * Deploys an MToken Market
 * 
 * @param environment The environment being deployed upon.
 * @param rpcUrl The URL for a JSON RPC that is used to deploy.
 * @param moonscanApiUrl A URL for moonscan.
 * @param numMarkets The number of markets to deploy
 */
const main = async (environment: Environment, rpcUrl: string, moonscanApiUrl: string, numMarkets: number) => {
  // Run preflight checks
  const deploymentConfiguration = await runPreflightChecks(environment, rpcUrl, moonscanApiUrl, numMarkets)

  const result = await configureAndDeployMarket(deploymentConfiguration)

  printHeader(`Congratulations! The new ${numMarkets > 1 ? 'markets are' : 'market is'} deployed and configured`)
  log.info(`⛔️ You should retain the below output for use when submitting a governance proposal ⛔️ `)
  log.info(`========================================================================================`)
  log.info()

  printHeader(`Metadata`)
  log.info(`Market Deployer Version: ${version} `)
  log.info(`Deployer: ${await deploymentConfiguration.deployer.getAddress()}`)
  log.info()

  for (let i = 0; i < numMarkets; i++) {
    printHeader(`Market ${i > 1 ? i + 1 : ''} Configuration`)
    printConfiguration(result.marketConfigurations[i])
    log.info()

    printHeader(`Artifacts of Deploy Operation ${i > 1 ? i + 1 : ''}`)
    const mTokenDeployResult = result.mTokenDeployResults[i]
    const configureMarketResult = result.configureMarketResults[i]

    log.info(`Market Address: ${mTokenDeployResult.contractAddress} (Deployed in hash ${mTokenDeployResult.transactionHash})`)
    log.info(`Set Reserve Factor Operation: ${configureMarketResult.setReserveFactorHash} `)
    log.info(`Set Protocol Seize Share Operation Operation: ${configureMarketResult.setProtocolSeizeShareHash} `)
    log.info(`Set Pending Admin Operation: ${configureMarketResult.setPendingAdminHash} `)
    log.info()
  }

  printHeader(`Governance Proposal to Submit`)
  log.info(JSON.stringify(result.proposal, null, 2))
  log.info()

  printHeader(`Next Steps`)
  log.info(`You should submit the Proposal above at the gov.moonwell.fi`)
  log.info(`At the very least, you should include the given configuration and artifacts of the deploy operation in your gov proposal description.`)
  log.info()

  printHeader(`For Support`)
  log.info(`If you need help with the above, please reach out to the Moonwell Community on Discord: https://discord.gg/moonwellfi!`)
  log.info()
  log.info()
  log.info()
}

/**
 * Configure and deploy a market, returning a bag of artifacts. 
 * 
 * @param deploymentConfiguration The configuration to use for the deploy.
 */
 const configureAndDeployMarket = async (deploymentConfiguration: DeploymentConfiguration) => {
  // Get a configuration from the user.
   const marketConfigurations = []
   for (let i = 0; i < deploymentConfiguration.numMarkets; i++) {
     const marketConfiguration = await getConfiguration(deploymentConfiguration)
     marketConfigurations.push(marketConfiguration)
   }

  // Deploy + Configure
   return await deployAndWireMarket(marketConfigurations, deploymentConfiguration)
}


for (const environment of Object.values(Environment)) {
  program
    .command(environment.toLowerCase())
    .description(makeDescription(environment))
    .option(
      '--node-url <node url>',
      'A custom RPC node to deploy on.',
      getDefaultNodeUrl(environment)
    )
    .option(
      '--num-markets <number>',
      'The number of markets to deploy in one session',
      '1'
    )
    .action(function (commandObject) {
      const numMarkets = Number.parseInt(commandObject.numMarkets)
      main(environment, commandObject.nodeUrl, getMoonscanApiUrl(environment), numMarkets)
    })
}
program.parse(process.argv)