
import { useCurrentWallet } from 'WalletProvider'
import { NavBarLogo } from 'components/SideNav'
import { LandingLogo } from 'images'
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { slice } from './utils/slice'

function Home() {
  const { address, connect, disconnect, connected } = useCurrentWallet()
  const navigate = useNavigate()

  const isConnected = address && connected
  useEffect(() => {
    if (connected && address) {
      navigate('/dashboard')
    }
  }, [connected, address])
  
  return (
    <div className="top-20 h-screen w-screen flex flex-col justify-center" style={{
      background: 'linear-gradient(324deg, rgba(255, 70, 86, 0.2)29%, rgba(253,187,45,0.2) 83%)'
    }}>
      <div className='flex justify-between items-center'>
        <NavBarLogo isHomePage/>
        <button className='bg-red-600 hover:bg-red-700 text-white-100 text-base h-12 w-48 mr-10 text-white py-3  rounded-lg' onClick={connect}>{isConnected ? slice(address) : "Connect Wallet"}</button>
      </div>
      <div className="w-screen flex justify-between items-center py-10 px-12 lg:py-0">
        <div className="px-28 flex flex-col">
            <h1 className="font-black text-7xl max-w-2xl text-red-500 font-Satoshi24px">
                Tron's web3 publishing hub
            </h1>
            <h2 className="text-2xl mt-8 max-w-2xl text-gray-600">
              Empower your content on the Tron blockchain with our platform, your gateway to decentralized web3 publishing.
            </h2>
            <div className='flex gap-8 mt-10'>
                <button className='bg-red-600 hover:bg-red-700 text-white-100 text-xl w-48 text-white py-3 rounded-lg' onClick={() => { navigate('/dashboard') }}>Start writing</button>
                <button className='bg-gray-200 text-xl w-48 text-gray-700  py-3 rounded-lg' onClick={() => { navigate('/rashi') }}>Explore</button>
            </div>
        </div>
        <div className='flex flex-col m-auto'>
          <img src={LandingLogo} className="scale-75"/>
        </div>
      </div>
    </div>
  )
}



export default Home
