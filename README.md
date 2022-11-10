<div align="center">
<p>
    <a href="https://moonwell.fi" target="_blank">
      <img alt="Moonwell Logo" src="media/spaceman.png" width="300" />
    </a>
</p>
<p style="font-size: 1.5rem; font-weight: bold">Moonwell.js</p>

<img src="https://img.shields.io/npm/v/@moonwell-fi/market-deployer?label=Latest+NPM+Version" />
<img src="https://img.shields.io/github/package-json/v/moonwell-fi/market-deployer?label=Master+Branch+Version" />

<br />

</div>

🌕 **Moonwell Market Deployer** allows users to deploy Moonwell Contracts with a simple CLI.

The Moonwell Market Deployer is optimized to be easy to use, with minimal technical knowledge required. A [sample run of
the program is available here](docs/sample-run.md).

# Setup

Users who are comfortable with a CLI should be able to get going by following the following steps. Simply install If you have trouble,
consult the [in-depth installation guide](docs/installation.md).

```shell
nvm use 18 # Node 18+ required
npm i -g @moonwell-fi/market-deployer # Get the CLI tool

market-deployer --version # Prove market-deployer CLI tool is installed

export MOONWELL_MARKET_DEPLOYER_PK=0x... # Your private key
export MOONSCAN_API_KEY=... # Your API Key 
```

# Usage

Once installed, simply pass the network you want to deploy on to the CLI tool and follow the prompts.

- [Moonbeam](https://moonbeam.moonscan.io/): `market-deployer run moonbeam`
- [Moonriver](https://moonriver.moonscan.io/): `market-deployer moonriver`
- [Moonbase Alpha Testnet](https://moonbase.moonscan.io/): `market-deployer moonbase`

# Next Steps

Upon completion, the program will output artifacts of operations and required operations in a governance proposal. You can submit this proposal on the [Moonwell Governance Forum](https://gov.moonwell.fi).

## Support

Feel free to reach out to the Moonwell Community for support! Community members are active on [Discord](https://discord.gg/moonwellfi).

## Debugging

Output is creating using the [loglevel npm package](https://www.npmjs.com/package/loglevel). By default, the process will use `info` level logging, however, you can customize this setting an environment variable called `MOONWELL_MARKET_DEPLOYER_LOGLEVEL` to a custom level.

## Contributions

This software is part of an effort to make Moonwell Governance approachable to all holders of `WELL` and `MFAM`. Moonwell
welcomes ideas to improve this software.

Please feel free to open PRs or issues against this repository. If you'd like to speak to the team responsible for this 
software prior to opening a PR, please reach out on [Discord](https://discord.gg/moonwellfi).

