/** Main entrypoint to deploy a market. */

import log, { LogLevelDesc } from 'loglevel'
import deployMTokenContract from './deploy'
import { configureMarket } from './configure-market'
import generateGovProposal from './gov-proposal'
import DeploymentConfiguration from './types/deployment-configuration'
import MarketConfiguration from './types/market-configuration'
import DeployResult from './types/deploy-result'
import { Market, ProposalData } from '@moonwell-fi/moonwell.js'
import ConfigureMarketResult from './types/configure-market-result'

const logLevel: LogLevelDesc = (process.env['MOONWELL_MARKET_DEPLOYER_LOGLEVEL'] as LogLevelDesc) ?? 'info'
log.setLevel(logLevel)

type InternalDeployResult = {
  marketConfiguration: MarketConfiguration
  mTokenDeployResult: DeployResult,
  configureMarketResult: ConfigureMarketResult,
  govProposal: ProposalData
}

type MarketsDeployResult = {
  // Merged proposal
  proposal: ProposalData

  // Arrays of results for each market
  marketConfigurations: Array<MarketConfiguration>
  mTokenDeployResults: Array<DeployResult>
  configureMarketResults: Array<ConfigureMarketResult>
}

// Return a single array of all proposal data.
const mergeProposals = (govProposals: Array<ProposalData>): ProposalData => {
  const targets = govProposals.map((govProposal: ProposalData) => { return govProposal.targets })
  const signatures = govProposals.map((govProposal: ProposalData) => { return govProposal.signatures })
  const callDatas = govProposals.map((govProposal: ProposalData) => { return govProposal.callDatas })
  const values = govProposals.map((govProposal: ProposalData) => { return govProposal.values })

  return {
    targets: targets.reduce((prev, next) => { return [...prev, ...next] }),
    signatures: signatures.reduce((prev, next) => { return [...prev, ...next] }),
    callDatas: callDatas.reduce((prev, next) => { return [...prev, ...next] }),
    values: values.reduce((prev, next) => { return [...prev, ...next] })
  }

}

/**
 * Deploy a market and perform transactions to wire it.
 * 
 * @param marketConfigurations A set of market configurations
 * @param deploymentConfiguration The configuration to use for the deploy.
 */
export const deployAndWireMarket = async (
  marketConfigurations: Array<MarketConfiguration>,
  deploymentConfiguration: DeploymentConfiguration
): Promise<MarketsDeployResult> => {
  const results: Array<InternalDeployResult> = []
  for (let i = 0; i < marketConfigurations.length; i++) {
    const marketConfiguration = marketConfigurations[i]

    // Deploy the token contract
    const mTokenDeployResult = await deployMTokenContract(marketConfiguration, deploymentConfiguration)

    // Configure the market
    const configureMarketResult = await configureMarket(
      mTokenDeployResult.contractAddress,
      marketConfiguration,
      deploymentConfiguration
    )

    const govProposal: ProposalData = await generateGovProposal(
      mTokenDeployResult.contractAddress,
      marketConfiguration,
      deploymentConfiguration
    )

    results.push(
      {
        marketConfiguration,
        mTokenDeployResult,
        configureMarketResult,
        govProposal
      }
    )
  }

  return {
    proposal: mergeProposals(results.map((result) => { return result.govProposal })),
    marketConfigurations: results.map((results) => { return results.marketConfiguration }),
    mTokenDeployResults: results.map((results) => { return results.mTokenDeployResult }),
    configureMarketResults: results.map((results) => { return results.configureMarketResult }),
  }
}

