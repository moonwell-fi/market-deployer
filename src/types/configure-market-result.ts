/** A bag of transaction hashes from configuring a market */
type ConfigureMarketResult = {
  /** The transaction hash that set the reserve factor. */
  setReserveFactorHash: string

  /** The transaction hash that set the protocol seize share. */
  setProtocolSeizeShareHash: string

  /** The transaction hash that set the pending admin. */
  setPendingAdminHash: string
}
export default ConfigureMarketResult