// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
export const environment = {
  production: true,
  walletUrl: 'https://aladinnetwork.org',
  votingUrl: 'https://aladinnetwork.org',
  appName: 'Aladin Explorer',
  logoUrl: '/assets/logo.png',
  blockchainUrl: 'https://stohio.aladinnetwork.org',
  chainId: 'c9c2ead009b9059945d736ce947e503a2914bc02864f18b348705538a33a0662',
  //showAds: false,
  tokensUrl: 'https://raw.githubusercontent.com/alacafe/ala-airdrops/master/tokens.json',
  tickerUrl: 'https://api.coinmarketcap.com/v2/ticker/1765/',
  token: 'ALA'
};
