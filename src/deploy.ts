/** Functions to deploy contracts */

import log from 'loglevel'
import MarketConfiguration from './types/market-configuration'
import { ethers, BigNumber } from 'ethers'
import { getComptrollerAddress, getTimelockAddress, getInterestRateModelAddress, getMERC20ImplementationAddress, printHeader, waitForConfirmations } from './common'
import DeploymentConfiguration from './types/deployment-configuration'
import DeployResult from './types/deploy-result'
import { MOONSCAN_API_KEY_ENV_VAR_NAME } from './constants'
import axios from 'axios'
import { getContractFactory, getDeployArtifact } from '@moonwell-fi/moonwell.js'

/**
 * Deploy an mToken contract.
 * 
 * This method will also attempt to verify the contract on Moonscan.
 *  
 * @param marketConfiguration Configuration for the market to deploy
 * @param deploymentConfiguration Configuration for the deploy.
 * @returns The contract address of the new market.
 */
const deployMTokenContract = async (
  marketConfiguration: MarketConfiguration,
  deploymentConfiguration: DeploymentConfiguration
): Promise<DeployResult> => {
  printHeader(`Deploying mToken Contract`)

  // Calculate our initial parameters
  const comptrollerAddress = getComptrollerAddress(deploymentConfiguration.environment)
  log.debug(`Loaded Comptroller (Unitroller) address: ${comptrollerAddress}`)

  const interestRateModelAddress = getInterestRateModelAddress(deploymentConfiguration.environment)
  log.debug(`Loaded Interest Rate Model address: ${interestRateModelAddress}`)

  const mERC20ImplementationAddress = getMERC20ImplementationAddress(deploymentConfiguration.environment)
  log.debug(`Loaded mERC20 Implementation address: ${mERC20ImplementationAddress}`)

  const initialExchangeRateMantissa = BigNumber.from("10").pow(marketConfiguration.tokenDecimals + 8).mul(2)
  log.debug(`Initial exchange rate mantissa: ${initialExchangeRateMantissa.toString()}`)

  // Set the admin to the timelock address
  const admin = getTimelockAddress(deploymentConfiguration.environment)
  log.debug(`Initial admin set to deployer: ${admin}`)
  log.debug()

  // Load contract source
  const contractFactory = getContractFactory('MErc20Delegator', deploymentConfiguration.deployer)

  // Deploy the contract
  const mTokenContract = await contractFactory.deploy(
    marketConfiguration.tokenAddress,
    comptrollerAddress,
    interestRateModelAddress,
    initialExchangeRateMantissa,
    marketConfiguration.mTokenName,
    marketConfiguration.mTokenSymbol,
    BigNumber.from("8"),
    admin,
    mERC20ImplementationAddress,
    "0x00",
  );
  await mTokenContract.deployed();
  log.info(`    Deployed the mToken contract at: ${mTokenContract.address}`)

  await waitForConfirmations(mTokenContract.deployTransaction, deploymentConfiguration.requiredConfirmations)
  log.info()

  if (deploymentConfiguration.moonscanApiUrl) {
    log.info(`    ⏳ Verifying contract on Moonscan...`)

    const apiKey = process.env[MOONSCAN_API_KEY_ENV_VAR_NAME]!
    const data = ethers.utils.defaultAbiCoder.encode(
      ['address', 'address', 'address', 'uint256', 'string', 'string', 'uint8', 'address', 'address', 'bytes'],
      [
        marketConfiguration.tokenAddress,
        comptrollerAddress,
        interestRateModelAddress,
        initialExchangeRateMantissa,
        marketConfiguration.mTokenName,
        marketConfiguration.mTokenSymbol,
        BigNumber.from("8"),
        admin,
        mERC20ImplementationAddress,
        "0x00"
      ]
    )

    const payload = {
      apikey: apiKey,
      module: 'contract',
      action: 'verifysourcecode',
      contractaddress: mTokenContract.address,
      sourceCode: JSON.stringify(getDeployArtifact('MErc20Delegator')),
      codeformat: 'solidity-standard-json-input',
      contractname: 'MErc20Delegator.sol:MErc20Delegator',
      compilerversion: 'v0.5.7+commit.6da8b019',
      optimizationUsed: 1,
      runs: 200,
      constructorArguments: data,
    }
    const headers = { 'Content-Type': "application/x-www-form-urlencoded" }

    try {
      const result = await axios.post(
        deploymentConfiguration.moonscanApiUrl,
        payload,
        { headers }
      )
      log.info(`    ✅ Contract verified on Moonscan.`)
      log.debug(`Verification Result:`)
      log.debug(`- Status: ${result.status} / ${result.statusText}`)
      log.debug(`- Data; ${JSON.stringify(result.data, null, 2)}`)
    } catch (e: unknown) {
      log.info("    ⛔️ Caught an error trying to verify the contract. The deploy will continue but you may need to manually verify the contract.")
      log.info(`Error:\n${JSON.stringify(e, null, 2)}`)

      log.debug(`Request parameters:`)
      log.debug(`- API URL: ${deploymentConfiguration.moonscanApiUrl}`)
      log.debug(`- Headers:\n${JSON.stringify(headers, null, 2)}`)
      log.debug(`- Paylod:\n${JSON.stringify(payload, null, 2)}`)
    }
  } else {
    log.info("    ✅ Skipping contract verification because Moonscan is not supported on this network.")
  }

  return {
    transactionHash: mTokenContract.deployTransaction.hash,
    contractAddress: mTokenContract.address
  }
}
export default deployMTokenContract