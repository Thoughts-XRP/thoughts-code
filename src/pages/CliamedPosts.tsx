import Article from 'components/ClaimedArticle'
import { BodyLayout } from 'components/BodyLayout'
import SideNav from 'components/SideNav'
import React, { useEffect } from 'react'
import { ArticleType, Author, ThoughtEdition } from 'types/types'
import { getClaimed } from 'scripts'
import useCurrentUser from 'hooks/useCurrentUser'
import { useCurrentWallet } from 'WalletProvider'


function ClaimedPosts() {

  const [claimedPosts, setClaimedPosts] = React.useState<{edition: ThoughtEdition, author: Author }[]>([])
  const { connected, address } = useCurrentWallet()
  useEffect(() => {
    if(address && connected) {
      (async() => {
        let data = await getClaimed(address) 
        setClaimedPosts(data)
      })()
       
    }
  }, [address, connected])
  
  return (
    <BodyLayout>
        <SideNav selectedTab='Claimed' />
        <div className='flex flex-col p-4 w-full items-center'>
            
            <div className='flex flex-col items-center w-full h-full gap-4 overflow-scroll'>
            <h1 className='font-black text-[48px] text-red-500 mb-7 w-[840px] font-Satoshi16px text-left'>
            {/* <div className="flex flex-row">
                        <Heading as="h1" level="1" color={"black"}>{"Your"}</Heading>
                        <Heading as="h1" level="1" color={"green"}>{" Claimed Posts"}</Heading>
              </div> */}
                <span className='text-black-100 font-normal'>Your</span> Claimed Posts
            </h1>
            {
                claimedPosts.map((post, i) => {
                    return <Article key={i} article={post.edition} author={post.author}/>
                })
            }
            </div>
            
        </div>
    </BodyLayout>
  )
}

export default ClaimedPosts