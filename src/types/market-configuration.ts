/** Defines a configuration for a market. */
type MarketConfiguration = {
  /** Address of the underlying ERC20 token. */
  tokenAddress: string

  /** Address of the Chainlink feed for the underlying token. */
  chainlinkFeedAddress: string

  /** The symbol of the underlying ERC20 token. */
  tokenSymbol: string

  /** The number of decimals in the underlying ERC20 token. */
  tokenDecimals: number

  /** The name of the new mToken */
  mTokenName: string

  /** The symbol for the new mToken */
  mTokenSymbol: string

  /** 
   * The reserve factor for the new mToken, as a whole number representing a percent 
   *
   * For instance, a value of 70 represents 70% and would be represented with an 18 digit mantissa as 700_000_000_000_000_000.
   */
  reserveFactor: number

  /** 
   * The protocol seize share for the new mToken, as a whole number representing a percent 
   *
   * For instance, a value of 70 represents 70% and would be represented with an 18 digit mantissa as 700_000_000_000_000_000.
   */
  protocolSeizeShare: number

  /**
   * The collateral factor for the new mToken as a whole number representing a percetn.
   * 
   * For instance, a value of 70 represents 70% and would be represented with an 18 digit mantissa as 700_000_000_000_000_000.
   */
  collateralFactor: number
}
export default MarketConfiguration