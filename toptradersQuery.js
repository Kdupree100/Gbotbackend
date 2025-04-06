const TOP_TRADERS_QUERY = `
{
  solana(network: solana) {
    traders {
      count
      trader {
        address
      }
    }
  }
}
`;

module.exports = TOP_TRADERS_QUERY;
