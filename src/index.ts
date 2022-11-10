/** Main entrypoint to deploy a market. */

import log, { LogLevelDesc } from 'loglevel'
import deployMTokenContract from './deploy'
import { configureMarket } from './configure-market'
import generateGovProposal from './gov-proposal'
import DeploymentConfiguration from './types/deployment-configuration'
import MarketConfiguration from './types/market-configuration'
import { ProposalData } from '@moonwell-fi/moonwell.js'

const logLevel: LogLevelDesc = (process.env['MOONWELL_MARKET_DEPLOYER_LOGLEVEL'] as LogLevelDesc) ?? 'info'
log.setLevel(logLevel)

/**
 * Deploy a market and perform transactions to wire it.
 * 
 * @param deploymentConfiguration The configuration to use for the deploy.
 */
export const deployAndWireMarket = async (
  marketConfiguration: MarketConfiguration,
  deploymentConfiguration: DeploymentConfiguration
) => {
  // Deploy the token contract
  const mTokenDeployResult = await deployMTokenContract(marketConfiguration, deploymentConfiguration)

  // Configure the market
  const configureMarketResult = await configureMarket(
    mTokenDeployResult.contractAddress,
    marketConfiguration,
    deploymentConfiguration
  )
  
  const govProposal: ProposalData  = await generateGovProposal(
    mTokenDeployResult.contractAddress,
    marketConfiguration,
    deploymentConfiguration
  )

  return {
    marketConfiguration,
    mTokenDeployResult,
    configureMarketResult,
    govProposal
  }
}

