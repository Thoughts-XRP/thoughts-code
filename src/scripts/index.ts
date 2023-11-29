// @ts-ignore
import TronWeb from 'tronweb';
import ThoughtEditionFactoryContract from '../contracts/ThoughtEditionFactory.json'
import ThoughtEditionContract from '../contracts/ThoughtEdition.json'
import { Author, ThoughtEdition } from 'types/types';
import { NetworkType } from '@tronweb3/tronwallet-abstract-adapter';
import { getDescriptionAndUrl } from 'pages/utils/slice';
import { getIpfsURL } from 'pages/utils/ipfs';

export const factoryAddress = "TJS6puKoSwg8f2oEsCTZjYsyspNwaoTe72";

export const apiKey = "89d9f463-49e8-48b2-afe1-d705565d920f"
export const factoryAbi = ThoughtEditionFactoryContract.abi;
export const editionAbi = ThoughtEditionContract.abi;
export const currentNetwork: NetworkType = NetworkType.Nile

export const zeroAddress = "0x0000000000000000000000000000000000000000";

export function getTronWebConfig(networkType: NetworkType): TronWeb {
    switch (networkType) {
        case NetworkType.Mainnet:
            return new TronWeb({
                fullHost: 'https://api.trongrid.io',
                headers: { 'TRON-PRO-API-KEY': apiKey },
            });
        case NetworkType.Shasta:
            return new TronWeb({
                fullHost: 'https://api.shasta.trongrid.io',
                headers: { 'TRON-PRO-API-KEY': apiKey },
            });
        case NetworkType.Nile:
            return new TronWeb({
                fullHost: 'https://nile.trongrid.io',
                headers: { 'TRON-PRO-API-KEY': apiKey },
            });
        default:
            return new TronWeb(
                "http://127.0.0.1:9090",
                "http://127.0.0.1:9090",
                "http://127.0.0.1:9090"
            );
    }
}

export let defaultProvider = getTronWebConfig(currentNetwork)

export const registerUser = async (provider: any) => {

}

export const checkUserNameAvailable = async (provider: any, userName: string) => {
    let factoryContract = await provider.contract(factoryAbi, factoryAddress);
    let result = await factoryContract.isUsernameAvailable(userName).call();
    return result
}

export const createEdition = async (edition: ThoughtEdition, provider: any, wallet: any) => {
    var parameter = [
        { type: "string", value: edition.title },
        { type: "string", value: edition.imageURI },
        { type: "string", value: edition.contentURI },
        { type: "uint256", value: edition.price }, 
        { type: "address", value: zeroAddress }
    ];

    var options = { feeLimit: 200 * 1e6, txLocal: true };

    let funcDef = "createEdition(string,string,string,uint256,address)";
    const tx = await provider.transactionBuilder.triggerSmartContract(
        factoryAddress,
        funcDef,
        options,
        parameter
    );
    const signedTx = await wallet.signTransaction(tx.transaction);
    const result = await provider.trx.sendRawTransaction(signedTx);
    return result
}

export const getAuthorEditions = async (provider: any, address: string): Promise<ThoughtEdition[]>  => {
    let factoryContract = await provider.contract(factoryAbi, factoryAddress);
    let result = await factoryContract.getAuthorEditions(address).call();

    const myArticles = await Promise.all(
        result.map(async (addr: any, index: any) => {
            let editionContract = await provider.contract(editionAbi, addr);
            let editionData = await editionContract.getEdition().call();
            let data: ThoughtEdition = {
                title: editionData.title,
                contentURI: editionData.contentURI,
                imageURI: editionData.imageURI,
                price: parseFloat(editionData.price.toString())/1e6,
                totalPurchased: parseFloat(editionData.totalPurchased.toString()),
                createdAt: new Date(parseInt(editionData.createdAt) * 1000).toDateString(),
                address: provider.address.fromHex(addr),
                editionId: index
            }
            return data
    }));
    return myArticles
}

export const checkUserRegistered = async (provider: any) => {
    let abi = ThoughtEditionFactoryContract.abi;
    let contract = await provider.contract(abi, factoryAddress);
    let result = await contract.getAuthorUserName().call();
    return !(result === "")
}

export const getAuthorDetails = async (provider: any): Promise<Author | null> => {
    let abi = ThoughtEditionFactoryContract.abi;
    let contract = await provider.contract(abi, factoryAddress);
    let result = await contract.getAuthorDetailsByAddress().call();
    let descAndUrl = getDescriptionAndUrl(result.description)
    return {...result, description: descAndUrl.description, img: descAndUrl.imageUrl }
}

export const getAuthorDetailsFromUserName = async (userName: string): Promise<Author | null> => {
    let provider = defaultProvider
    provider.setAddress(factoryAddress)
    let abi = ThoughtEditionFactoryContract.abi;
    let contract = await defaultProvider.contract(abi, factoryAddress);
    let result = await contract.getAuthorDetails(userName).call();
    let descAndUrl = getDescriptionAndUrl(result.description)
    return { ...result, walletAddress: provider.address.fromHex(result.walletAddress), description: descAndUrl.description, img: descAndUrl.imageUrl }
}

export const getPartialEdition = async (address: string): Promise<ThoughtEdition>  => { 
    let provider = defaultProvider
    provider.setAddress(factoryAddress)
    let editionContract = await provider.contract(editionAbi, address);
    let editionData = await editionContract.getEdition().call();
    let data: ThoughtEdition = {
        title: editionData.title,
        contentURI: editionData.contentURI,
        imageURI: editionData.imageURI,
        price: parseFloat(editionData.price.toString())/1e6,
        totalPurchased: parseFloat(editionData.totalPurchased.toString()),
        createdAt: new Date(parseInt(editionData.createdAt) * 1000).toDateString(),
        address: provider.address.fromHex(address),
    }
    return data
}

export const getEdition = async (provider:any, address: string): Promise<ThoughtEdition>  => { 
    let editionContract = await provider.contract(editionAbi, address);
    let editionData = await editionContract.getEdition().call();
    let data: ThoughtEdition = {
        title: editionData.title,
        contentURI: editionData.contentURI,
        imageURI: editionData.imageURI,
        price: parseFloat(editionData.price.toString())/1e6,
        totalPurchased: parseFloat(editionData.totalPurchased.toString()),
        createdAt: new Date(parseInt(editionData.createdAt) * 1000).toDateString(),
        address: provider.address.fromHex(address),
    }
    return data
}

export const purchaseEdition = async (provider: any, wallet: any, price: number, addr: string) => {
      var options = { feeLimit: 100000000, callValue: price * 1e6, txLocal: true };
  
      let funcDef = "purchase()";
      const tx = await provider.transactionBuilder.triggerSmartContract(
        addr,
        funcDef,
        options,
        []
      );
  
      const signedTx = await wallet.signTransaction(tx.transaction);
      const result = await provider.trx.sendRawTransaction(signedTx);
      return result.txid
}

export const getAuthorPageAllEditions = async (authorAddress: string): Promise<ThoughtEdition[]>  => {
    let provider = defaultProvider
    provider.setAddress(factoryAddress)
    return getAuthorEditions(provider, authorAddress)
}

export const getClaimed = async (buyerAddress: string): Promise<{edition: ThoughtEdition, author: Author }[]>  => {
    let provider = defaultProvider
    provider.setAddress(factoryAddress)
    let factoryContract = await provider.contract(factoryAbi, factoryAddress);
    let editions = await factoryContract.getClaimedEditions(buyerAddress).call();
    const articles = await Promise.all(
        editions.map(async (addr: any, index: any) => {
            let editionContract = await provider.contract(editionAbi, addr);
            let editionData = await editionContract.getEdition().call();
            let author = await editionContract.owner().call();
            let authorUseName = await factoryContract.authorAddressToUserName(author).call();
            let authorDetails = await getAuthorDetailsFromUserName(authorUseName)
            let data: ThoughtEdition = {
                title: editionData.title,
                contentURI: editionData.contentURI,
                imageURI: editionData.imageURI,
                price: parseFloat(editionData.price.toString())/1e6,
                totalPurchased: parseFloat(editionData.totalPurchased.toString()),
                createdAt: new Date(parseInt(editionData.createdAt) * 1000).toDateString(),
                address: provider.address.fromHex(addr),
                editionId: index
            }
            return { edition: data, author: authorDetails }
    }));

    console.log("Akshay", articles)
    return articles
}