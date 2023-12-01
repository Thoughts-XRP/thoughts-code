import ThoughtEditionFactoryContract from '../contracts/ThoughtEditionFactory.json'
import ThoughtEditionContract from '../contracts/ThoughtEdition.json'
import { Author, ThoughtEdition } from 'types/types';
import { getDescriptionAndUrl } from 'pages/utils/slice';
import { getIpfsURL } from 'pages/utils/ipfs';
import { ethers, Contract } from 'ethers';

export type NetworkConfiguration = {
    networkName: string;
    networkSlug: string;
    rpcUrl: string;
    chainId: number; // The chain ID is a numerical identifier for the specific blockchain network
    blockExplorerUrl?: string; // Optional block explorer URL for the network
};

enum NetworkType {
    Devnet,
    Testnet
}

export const factoryAddress = "0x86b4105b0Fe4c3058DbaD867C9039494Db25C99a";

export const apiKey = "89d9f463-49e8-48b2-afe1-d705565d920f"
export const factoryAbi = ThoughtEditionFactoryContract.abi;
export const editionAbi = ThoughtEditionContract.abi;
export const currentNetwork: NetworkType = NetworkType.Devnet

export const zeroAddress = "0x0000000000000000000000000000000000000000";

export function getTronWebConfig(networkType: NetworkType): NetworkConfiguration {
    switch (networkType) {
        case NetworkType.Devnet:
            return {
                chainId: 1440002,
                networkSlug: 'xrpl-evm-sidechain',
                rpcUrl: 'https://rpc-evm-sidechain.xrpl.org',
                blockExplorerUrl: ' https://evm-sidechain.xrpl.org',
                networkName: 'XRPL EVM Sidechain'
            }
        case NetworkType.Testnet:
            return {
                chainId: 1440002,
                networkSlug: 'xrpl-evm-sidechain',
                rpcUrl: 'https://rpc-evm-sidechain.xrpl.org',
                blockExplorerUrl: ' https://evm-sidechain.xrpl.org',
                networkName: 'XRPL EVM Sidechain'
            }
        
        default:
            return {
                chainId: 1440002,
                networkSlug: 'xrpl-evm-sidechain',
                rpcUrl: 'https://rpc-evm-sidechain.xrpl.org',
                blockExplorerUrl: ' https://evm-sidechain.xrpl.org',
                networkName: 'XRPL EVM Sidechain'
            }
    }
}
const network = getTronWebConfig(currentNetwork)
export const defaultProvider = new ethers.Wallet("57b58f6fc03377ea42884d4b8ccb6ad0f9bf2de48108f3abb8522ce9f4ef73bd").connect(new ethers.providers.JsonRpcProvider(network.rpcUrl));

export const registerUser = async (provider: any) => {

}

export const checkUserNameAvailable = async (provider: any, userName: string) => {
    const factoryContract = new Contract(factoryAddress, factoryAbi, provider);
    let result = await factoryContract.isUsernameAvailable(userName);
    return result
}

export const createEdition = async (edition: ThoughtEdition, provider: any, wallet: any) => {
    const factoryContract = new ethers.Contract(factoryAddress, factoryAbi, wallet)
    const tx = await factoryContract.createEdition(edition.title, edition.imageURI, edition.contentURI, edition.price, zeroAddress);
    return tx.wait();
}

export const getAuthorEditions = async (provider: any, address: string): Promise<ThoughtEdition[]> => {
    const factoryContract = new Contract(factoryAddress, factoryAbi, provider);
    let result = await factoryContract.getAuthorEditions(address)
    console.log("My editions ", result)
    const myArticles = await Promise.all(
        result.map(async (addr: any, index: any) => {
            const editionContract = new Contract(addr, editionAbi, provider);
            let editionData = await editionContract.getEdition();
            let data: ThoughtEdition = {
                title: editionData.title,
                contentURI: editionData.contentURI,
                imageURI: editionData.imageURI,
                price: parseFloat(editionData.price.toString()) / 1e6,
                totalPurchased: parseFloat(editionData.totalPurchased.toString()),
                createdAt: new Date(parseInt(editionData.createdAt) * 1000).toDateString(),
                address: addr,
                editionId: index
            }
            return data
        }));
    return myArticles
}

export const checkUserRegistered = async (provider: any) => {
    const contract = new Contract(factoryAddress, factoryAbi, provider);
    let result = await contract.getAuthorUserName();
    return !(result === "")
}

export const getAuthorDetails = async (provider: any): Promise<Author | null> => {
    const contract = new Contract(factoryAddress, factoryAbi, provider);
    let result = await contract.getAuthorDetailsByAddress();
    let descAndUrl = getDescriptionAndUrl(result.description)
    return { ...result, description: descAndUrl.description, img: descAndUrl.imageUrl }
}

export const getAuthorDetailsFromUserName = async (userName: string): Promise<Author | null> => {
    const contract = new Contract(factoryAddress, factoryAbi, defaultProvider);
    let result = await contract.getAuthorDetails(userName);
    let descAndUrl = getDescriptionAndUrl(result.description)
    return { ...result, walletAddress: result.walletAddress, description: descAndUrl.description, img: descAndUrl.imageUrl }
}

export const getPartialEdition = async (address: string): Promise<ThoughtEdition> => {
    let editionContract =  new Contract(address, editionAbi, defaultProvider);
    let editionData = await editionContract.getEdition();
    let data: ThoughtEdition = {
        title: editionData.title,
        contentURI: editionData.contentURI,
        imageURI: editionData.imageURI,
        price: parseFloat(editionData.price.toString()) / 1e6,
        totalPurchased: parseFloat(editionData.totalPurchased.toString()),
        createdAt: new Date(parseInt(editionData.createdAt) * 1000).toDateString(),
        address: address,
    }
    return data
}

export const getEdition = async (provider: any, address: string): Promise<ThoughtEdition> => {
    let editionContract =  new Contract(address, editionAbi, provider);
    let editionData = await editionContract.getEdition();
    let data: ThoughtEdition = {
        title: editionData.title,
        contentURI: editionData.contentURI,
        imageURI: editionData.imageURI,
        price: parseFloat(editionData.price.toString()) / 1e6,
        totalPurchased: parseFloat(editionData.totalPurchased.toString()),
        createdAt: new Date(parseInt(editionData.createdAt) * 1000).toDateString(),
        address: address,
    }
    return data
}

export const purchaseEdition = async (provider: any, wallet: any, price: number, addr: string) => {
    let editionContract =  new Contract(addr, editionAbi, wallet);
    const tx = await editionContract.purchase({ value: price * 1e6 });
    return tx.wait();
}

export const getAuthorPageAllEditions = async (authorAddress: string): Promise<ThoughtEdition[]> => {
    let provider = defaultProvider
    
    return getAuthorEditions(provider, authorAddress)
}

export const getClaimed = async (buyerAddress: string): Promise<{ edition: ThoughtEdition, author: Author }[]> => {
    const factoryContract = new Contract(factoryAddress, factoryAbi, defaultProvider);
    let editions = await factoryContract.getClaimedEditions(buyerAddress);
    const articles = await Promise.all(
        editions.map(async (addr: any, index: any) => {
            let editionContract =  new Contract(addr, editionAbi, defaultProvider);
            let editionData = await editionContract.getEdition();
            let author = await editionContract.owner();
            let authorUseName = await factoryContract.authorAddressToUserName(author);
            let authorDetails = await getAuthorDetailsFromUserName(authorUseName)
            let data: ThoughtEdition = {
                title: editionData.title,
                contentURI: editionData.contentURI,
                imageURI: editionData.imageURI,
                price: parseFloat(editionData.price.toString()) / 1e6,
                totalPurchased: parseFloat(editionData.totalPurchased.toString()),
                createdAt: new Date(parseInt(editionData.createdAt) * 1000).toDateString(),
                address: addr,
                editionId: index
            }
            return { edition: data, author: authorDetails }
    }));

    return articles
}