/** The result of deploying a contract. */
type DeployResult = {
  /** The transaction hash that deployed the contract. */
  transactionHash: string

  /** The address of the new contract. */
  contractAddress: string
}
export default DeployResult