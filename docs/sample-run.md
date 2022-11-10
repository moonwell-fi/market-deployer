# Sample Run

Here's a sample run of the CLI tool!

This run deploys a market for `axlATOM` (address [0x27292cf0016e5df1d8b37306b2a98588acbd6fca](https://moonbeam.moonscan.io/address/0x27292cf0016e5df1d8b37306b2a98588acbd6fca)) with a Chainlink Feed for `ATOM` (address [0x4F152D143c97B5e8d2293bc5B2380600f274a5dd](https://moonbeam.moonscan.io/address/0x4F152D143c97B5e8d2293bc5B2380600f274a5dd), using a Reserve Factor
of 25% and a Collateral Factor of 0%. 

```
npm run cli moonbeam

> @moonwell-fi/market-deployer@0.0.15 cli
> npx ts-node src/cli.ts -- moonbeam

[+] Running Pre Deployment Checks

    💡 Running on Network: moonbeam

    1. Deployer private key set
        ✅ Passed!

    💡 Loaded Deployer Key. Address: 0x23385e61fBC465ab16278fA4847CEf5C1AA722a1

    2. Deployer has sufficient balance
        ✅ Passed!

    3. Moonscan API key is exported
        ✅ Passed!

    🚀 All checks passed!

[+] We will now prompt you about market configuration


  What is the address of the ERC-20 Token to deploy a market for?
  💡 Tip: This is located under 'Profile > Contract' when viewing the Token on Moonscan.
  > 0x27292cf0016e5df1d8b37306b2a98588acbd6fca
        ✅ Token address set as: 0x27292cf0016e5df1d8b37306b2a98588acbd6fca

  ⏳ Loading additional token details from the blockchain
        ✅ Loaded token symbol as: axlATOM
        ✅ Loaded token decimals as: 6

  What should the name of the market's token be? This must start with "Moonwell"
  💡 Tip: Some examples might be "Moonwell USDC.mad" or "Moonwell FRAX"
  > Moonwell axlATOM
        ✅ Setting mToken name to: Moonwell axlATOM

  What should the symbol of the market's token be? This must start with "m"
  💡 Tip: Some examples might be "mUSDC.mad" or "mFRAX"
  > maxlATOM
        ✅ Setting mToken symbol to: maxlATOM

  What is the address Chainlink feed for the token?
  💡 Tip: You can find a list of price feeds here: https://docs.chain.link/docs/data-feeds/price-feeds/addresses/?network=moonbeam
  > 0x4F152D143c97B5e8d2293bc5B2380600f274a5dd
        ✅ Chainlink feed set as: 0x4F152D143c97B5e8d2293bc5B2380600f274a5dd


  What is the reserve factor of the new market? Enter an integer representing a percentage. For instance, enter '25' for 25%.
  In line with the Gauntlet Asset Listing Framework, a typical stablecoin market like USDC will have a 15% Reserve Factor and a crypto market like GLMR will have a 25% Reserve Factor.
  💡 Tip: You can learn more about what the Reserve Factor is at https://docs.moonwell.fi/moonwell-finance/protocol-info/protocol-information#reserve-factor
  > 25
        ✅ Setting reserve factor to 25%


  What is the collateral factor for the new market? Enter an integer representing a percentage. For instance, enter '0' for 0%.
  In line with the Gauntlet Asset Listing Framework, typically new markets have a collateral factor of 0%.
  > Tip: You can learn more about what the Collateral Factor is at https://docs.moonwell.fi/moonwell-finance/protocol-info/protocol-information#collateral-factor
  > 0
        ✅ Setting Collateral Factor to 0%


[+] Market Configuration

    Collateral Parameters:
        Token Address: 0x27292cf0016e5df1d8b37306b2a98588acbd6fca
        Token Symbol: axlATOM
        Token Decimals: 6

    Oracle Parameters:
        Chainlink Feed Address: 0x4F152D143c97B5e8d2293bc5B2380600f274a5dd

    Market Parameters:
        mToken Name: Moonwell axlATOM
        mToken Symbol: maxlATOM

    Economic Parameters
        Reserve Factor: 25%
        Protocol Seize Share: 3%
        Collateral Factor: 0%


    Enter 'y' to confirm the above configuration is correct, or 'n' to modify configuration.
    > y
    🚀 Market Configuration Set!

[+] Deploying mToken Contract

    Deployed the mToken contract at: 0x104cBd9d9EE773AE58d414cbe9F24290F54E88e7
    ⏳ Waiting for 3 confirmations...
    ✅ Confirmations received!

    ⏳ Verifying contract on Moonscan...
    ✅ Contract verified on Moonscan.

[+] Configuring the Market

    Setting reserve factor
    Operation sent with hash: 0x3c495d2e1110bbe6ebfc57cc322ab5589836f4db8a353d0cb282c8526d006b1d
    ⏳ Waiting for 3 confirmations...
    ✅ Confirmations received!
    🚀 Reserve Factor set successfully.

    Setting protocol seize share
    Operation sent with hash: 0x21145508f1c369f1dcb9ab8178735a82497c34267e71b687c325a38baba9f2ab
    ⏳ Waiting for 3 confirmations...
    ✅ Confirmations received!
    🚀 Protocol Seize Share set successfully.

    Setting admin to timelock.
    Operation sent with hash: 0x64002a1c656b12f6ed547c9f81bed303f8e60a8322eeff10940752051f9891a4
    ⏳ Waiting for 3 confirmations...
    ✅ Confirmations received!
    🚀 Pending Admin set successfully.

    🚀 Market configured successfully.


[+] Congratulations! The new market has been deployed and configured

⛔️ You should retain the below output for use when submitting a governance proposal ⛔️ 
========================================================================================


[+] Metadata

Market Deployer Version: 0.0.15 
Deployer: 0x23385e61fBC465ab16278fA4847CEf5C1AA722a1


[+] Market Configuration

    Collateral Parameters:
        Token Address: 0x27292cf0016e5df1d8b37306b2a98588acbd6fca
        Token Symbol: axlATOM
        Token Decimals: 16

    Oracle Parameters:
        Chainlink Feed Address: 0x4F152D143c97B5e8d2293bc5B2380600f274a5dd

    Market Parameters:
        mToken Name: Moonwell axlATOM
        mToken Symbol: maxlATOM

    Economic Parameters
        Reserve Factor: 25%
        Protocol Seize Share: 3%
        Collateral Factor: 0%



[+] Artifacts of the Deploy Operation

Market Address: 0x104cBd9d9EE773AE58d414cbe9F24290F54E88e7 (Deployed in hash 0x4ee32c2a214f2be45656cfe4879f1b824d8f81dd10e6719cbfde1bd1a48ba935)
Set Reserve Factor Operation: 0x3c495d2e1110bbe6ebfc57cc322ab5589836f4db8a353d0cb282c8526d006b1d 
Set Protocol Seize Share Operation Operation: 0x21145508f1c369f1dcb9ab8178735a82497c34267e71b687c325a38baba9f2ab 
Set Pending Admin Operation: 0x64002a1c656b12f6ed547c9f81bed303f8e60a8322eeff10940752051f9891a4 


[+] Governance Proposal to Submit

{
  "targets": [
    "0xED301cd3EB27217BDB05C4E9B820a8A3c8B665f9",
    "0x8E00D5e02E65A19337Cdba98bbA9F84d4186a180",
    "0x104cBd9d9EE773AE58d414cbe9F24290F54E88e7",
    "0x8E00D5e02E65A19337Cdba98bbA9F84d4186a180",
    "0x8E00D5e02E65A19337Cdba98bbA9F84d4186a180",
    "0x8E00D5e02E65A19337Cdba98bbA9F84d4186a180"
  ],
  "values": [
    0,
    0,
    0,
    0,
    0,
    0
  ],
  "signatures": [
    "setFeed(string,address)",
    "_supportMarket(address)",
    "_acceptAdmin()",
    "_setCollateralFactor(address,uint256)",
    "_setRewardSpeed(uint8,address,uint256,uint256)",
    "_setRewardSpeed(uint8,address,uint256,uint256)"
  ],
  "callDatas": [
    "0x0000000000000000000000000000000000000000000000000000000000000040000000000000000000000000c6c836c6764c048ceeee28392a6d778d6108d54200000000000000000000000000000000000000000000000000000000000000044d46414d00000000000000000000000000000000000000000000000000000000",
    "0x000000000000000000000000104cbd9d9ee773ae58d414cbe9f24290f54e88e7",
    "0x",
    "0x000000000000000000000000104cbd9d9ee773ae58d414cbe9f24290f54e88e70000000000000000000000000000000000000000000000000000000000000000",
    "0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000104cbd9d9ee773ae58d414cbe9f24290f54e88e700000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001",
    "0x0000000000000000000000000000000000000000000000000000000000000001000000000000000000000000104cbd9d9ee773ae58d414cbe9f24290f54e88e700000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001"
  ]
}

t
[+] Next Steps

You should submit the Proposal above at the gov.moonwell.fi
At the very least, you should include the given configuration and artifacts of the deploy operation in your gov proposal description.


[+] For Support

If you need help with the above, please reach out to the Moonwell Community on Discord: https://discord.gg/moonwellfi!
```