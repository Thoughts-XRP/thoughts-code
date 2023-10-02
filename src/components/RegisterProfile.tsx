import React, { useCallback, useEffect, useState } from "react";
import { BodyLayout } from "./BodyLayout";
import SideNav from "./SideNav";
import { subscribeTxStatus } from "pages/utils/subscribeTxStatus";
import { useCurrentWallet } from "WalletProvider";
import { checkUserNameAvailable, factoryAddress } from "scripts";
import { toast } from "react-toastify";
import { ProfileImage } from "./ProfileImage";
import { handleUploadFileToIPFS } from "pages/utils/uploadFileToIpfs";
import { useNavigate } from "react-router-dom";
import { debounce } from "pages/utils/debounce";
import classNames from "classnames";

function RegisterProfile() {
  const [userName, setUserName] = useState("");
  const [userNameAvailiable, setUserNameAvailable] = useState<boolean | null>();
  const [description, setDescription] = useState("");
  const [name, setName] = useState("");
  const [image, setImage] = useState(null);
  const { provider, wallet, connected, address } = useCurrentWallet();
  const navigate = useNavigate();
  
  const delayCalculateTrx = useCallback(debounce(async (userName: string) => {
    const status = await checkUserNameAvailable(provider, userName)
    console.log("Status", status)
    setUserNameAvailable(status)
  }, 500), [connected])

  useEffect(() => {
      setUserNameAvailable(null)
      if(userName.length > 0) delayCalculateTrx(userName)
  }, [userName])

  const handleRegister = async () => {
    try {
      let ipfsImageHash = "";
      if (image) ipfsImageHash = await handleUploadFileToIPFS(image, new Date().toTimeString());
      console.log("Edition hash : ", ipfsImageHash);

      var parameter = [
        { type: "string", value: userName },
        { type: "string", value: name },
        { type: "string", value: `${description}+${ipfsImageHash}` },
      ];

      var options = { feeLimit: 400000000, txLocal: true };

      let funcDef = "registerAuthor(string,string,string)";
      const tx = await provider.transactionBuilder.triggerSmartContract(
        factoryAddress,
        funcDef,
        options,
        parameter
      );

      const signedTx = await wallet.signTransaction(tx.transaction);
      const result = await provider.trx.sendRawTransaction(signedTx);
      subscribeTxStatus(result.txid, provider);
    } catch (error) {
      toast.error("Profile Registration Failed");
      console.error("Error :", error);
    }
  };

  let buttonEnabled = (name.length > 0) && (description.length > 0) && (userName.length > 0) && userNameAvailiable

  return (
    <BodyLayout>
      <SideNav selectedTab="Articles" />
      <div className="flex flex-col items-center justify-center w-full">
        <div className="flex flex-col items-center bg-white-100 text-left rounded-lg w-1/3 h-100 p-6">
          <p className="text-xl font-black  mb-7">
            Register your <span className="text-red-600">profile</span>
          </p>
          <ProfileImage setImage={setImage} />
          <input
            onChange={(e) => setName(e.target.value)}
            className="px-4 py-3 rounded-lg outline-none border-[1px] border-gray-300 mt-8 w-full"
            type="text"
            placeholder="Enter your full name"
          />
          <input
            onChange={(e) => setUserName(e.target.value)}
            className="px-4 py-3 rounded-lg outline-none border-[1px] border-gray-300 mt-3 w-full"
            type="text"
            placeholder="Choose a unique username"
          />
          {(userNameAvailiable !== null) && <div className={classNames("w-full text-left", {
            "text-green-900": userNameAvailiable,
            "text-red-600": !userNameAvailiable
          })}><p className="text-xs p-1">
            {userNameAvailiable ? "Username is available" : "Username is not available"}
            </p></div>
          }
          
          <textarea
            onChange={(e) => setDescription(e.target.value)}
            className="px-4 py-3 rounded-lg outline-none border-[1px] border-gray-300 mt-3 w-full"
            rows={4} // You can adjust the number of rows as needed
            placeholder="Write a bit about yourself"
          ></textarea>

          <button
            onClick={() => handleRegister()}
            disabled={!buttonEnabled}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-200 text-white-100 font-bold py-2 px-6 rounded-lg cursor-pointer mt-8 w-full"
          >
            Submit
          </button>
          <p className="text-sm text-gray-400 mt-4 text-center">
            Let's create you{" "}
            <span className="font-bold text-red-600">thought</span> profile
          </p>
        </div>
      </div>
    </BodyLayout>
  );
}

export default RegisterProfile;
