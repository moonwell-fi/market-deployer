/** Utilities to create a governance proposal. */

import { BigNumber, Contract, ethers } from "ethers"
import MarketConfiguration from "./types/market-configuration"
import DeploymentConfiguration from "./types/deployment-configuration"
import { Contracts, ProposalData, getContract } from "@moonwell-fi/moonwell.js"

/**
 * Generate a Governance proposal that will add the given market.
 * 
 * @param marketAddress The address of the market.
 * @param marketConfiguration Configuration for the market.
 * @param deploymentConfiguration The configuration for this deployment.
 * @returns A GovernanceProp JSON object.
 */
const generateGovProposal = async (
  marketAddress: string,
  marketConfiguration: MarketConfiguration,
  deploymentConfiguration: DeploymentConfiguration
): Promise<ProposalData>  => {
  const proposals: Array<ProposalData> = []
  proposals.push(await generateConfigureChainlinkFeedProposal(deploymentConfiguration, marketConfiguration))
  proposals.push(await generateSupportMarketProposal(deploymentConfiguration, marketAddress))
  proposals.push(await generateAcceptAdminProposal(marketAddress))
  proposals.push(await generateSetCollateralFactorProposal(deploymentConfiguration, marketAddress, marketConfiguration))
  proposals.push(await generateSetBorrowSpeedProposal(deploymentConfiguration, marketAddress))
  return mergeProposals(proposals)
}

/**
 * Generates a Governance proposal to support a market in the Comptroller.
 * 
 * @param deploymentConfiguration The configuration for this deployment.
 * @param marketAddress The address of the market.
 * @returns A GovernanceProp JSON object.
 */
const generateSupportMarketProposal = async (deploymentConfiguration: DeploymentConfiguration, marketAddress: string): Promise<ProposalData> => {
  const comptroller = Contracts[deploymentConfiguration.environment].COMPTROLLER.contract
  const tx = await comptroller.populateTransaction['_supportMarket'](marketAddress)

  return {
    targets: [ comptroller.address ],
    values: [ 0 ],
    signatures: [ comptroller.interface.getFunction('_supportMarket').format()],
    callDatas: [ `0x${tx.data!.slice(10)}`]
  }
}

/**
 * Generates a Governance proposal to set the given collateral factor on the market in the Comptroller.
 * 
 * @param deploymentConfiguration The configuration for this deployment.
 * @param marketAddress The address of the market.
 * @param marketConfiguration Configuration for the market.
 * @returns A GovernanceProp JSON object.
 */
const generateSetCollateralFactorProposal = async  (
  deploymentConfiguration: DeploymentConfiguration,
  marketAddress: string,
  marketConfiguration: MarketConfiguration,
): Promise<ProposalData>  => {
  const collateralFactor = BigNumber.from(marketConfiguration.collateralFactor).mul(BigNumber.from("10").pow("16"));

  const comptroller = Contracts[deploymentConfiguration.environment].COMPTROLLER.contract
  const tx = await comptroller.populateTransaction['_setCollateralFactor'](marketAddress, collateralFactor)

  return {
    targets: [ comptroller.address ],
    values: [ 0 ],
    signatures: [ comptroller.interface.getFunction('_setCollateralFactor').format() ],
    callDatas: [ `0x${tx.data!.slice(10)}`]
  }
}

/**
 * Generates a Governance proposal to initialize borrow speedson an asset.
 * 
 * @param deploymentConfiguration The configuration for this deployment.
 * @param marketAddress The address of the market.
 * @returns A GovernanceProp JSON object.
 */
 const generateSetBorrowSpeedProposal = async  (
  deploymentConfiguration: DeploymentConfiguration,
  marketAddress: string,
): Promise<ProposalData>  => {
  const comptroller = Contracts[deploymentConfiguration.environment].COMPTROLLER.contract
 
  const txGov = await comptroller.populateTransaction['_setRewardSpeed'](0, marketAddress, 0, 1)
  const txNative = await comptroller.populateTransaction['_setRewardSpeed'](1, marketAddress, 0, 1)

  return {
    targets: [ comptroller.address, comptroller.address ],
    values: [ 0, 0 ],
    signatures: [ 
      comptroller.interface.getFunction('_setRewardSpeed').format(), 
      comptroller.interface.getFunction('_setRewardSpeed').format() ],
    callDatas: [ 
      `0x${txGov.data!.slice(10)}`,
      `0x${txNative.data!.slice(10)}`
    ]
  }
}

/**
 * Generates a Governance proposal to accept admin on a market.
 * 
 * @param marketAddress The address of the market.
 * @returns A GovernanceProp JSON object.
 */
const generateAcceptAdminProposal = async (marketAddress: string): Promise<ProposalData>  => {
  const token = getContract('MToken', marketAddress)

  const tx = await token.populateTransaction['_acceptAdmin']()

  return {
    targets: [ token.address ],
    values: [ 0 ],
    signatures: [ token.interface.getFunction('_acceptAdmin').format()],
    callDatas: [ `0x${tx.data!.slice(10)}`]
  }
}

/**
 * Generates a Governance proposal to configure a Chainlink feed on the Chainlink Proxy
 * 
 * @param deploymentConfiguration The configuration for this deployment.
 * @param marketConfiguration Configuration for the market.
 * @returns A GovernanceProp JSON object.
 */
const generateConfigureChainlinkFeedProposal = async (
  deploymentConfiguration: DeploymentConfiguration,
  marketConfiguration: MarketConfiguration,
): Promise<ProposalData>  => {
  const oracle = Contracts[deploymentConfiguration.environment].ORACLE.contract
  const tx = await oracle.populateTransaction['setFeed'](marketConfiguration.tokenSymbol, marketConfiguration.chainlinkFeedAddress)

  return {
    targets: [ oracle.address ],
    values: [ 0 ],
    signatures: [ oracle.interface.getFunction('setFeed').format()],
    callDatas: [ `0x${tx.data!.slice(10)}`]
  }
}

/**
 * Merges a set of governance proposals into a single proposal.
 * 
 * @param proposals The proposals to merge.
 * @returns A single merged GovernanceProp JSON object.
 */
export const mergeProposals = (proposals: Array<ProposalData>): ProposalData => {
  return proposals.reduce((accum: ProposalData, next: ProposalData) => {
    return mergeGovProposal(accum, next)
  })
}

/**
 * Merges two proposals.
 * 
 * @param prop1 The first gov proposal
 * @param prop2 The second gov proposal
 */
const mergeGovProposal = (prop1: ProposalData, prop2: ProposalData): ProposalData => {
  return {
    targets: [...prop1.targets, ...prop2.targets],
    values: [...prop1.values, ...prop2.values],
    signatures: [...prop1.signatures, ...prop2.signatures],
    callDatas: [...prop1.callDatas, ...prop2.callDatas]
  }
}

export default generateGovProposal