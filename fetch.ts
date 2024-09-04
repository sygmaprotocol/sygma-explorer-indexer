async function fetch(){

    const { verifiedFetch } = await import('@helia/verified-fetch')

    const resp = await verifiedFetch("ipfs://bafybeifx7yeb55armcsxwwitkymga5xf53dxiarykms3ygqic223w5sk3m")
    const json = await resp.json()
    console.log(json)
}

fetch().then()

