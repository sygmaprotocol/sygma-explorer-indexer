type RoutesConfiguration = {
  domains: [
    {
      domainID: number
      routes: Array<{
        destinationDomainID: number
        resourceID: number
      }>
    },
  ]
}
