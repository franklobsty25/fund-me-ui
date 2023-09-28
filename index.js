// async function connect() {
//   if (typeof window.ethereum !== 'undefinded') {
//     await window.ethereum.request({ method: 'eth_requestAccounts' });
//     document.getElementById('connectButton').innerHTML = 'Connected!';
//   } else {
//     document.getElementById('connectButton').innerHTML =
//       'Please install metamask!';
//   }
// }
import { ethers } from 'https://cdnjs.cloudflare.com/ajax/libs/ethers/6.7.0/ethers.min.js';
import { contractAddress, abi } from './constants.js';

const connectButton = document.getElementById('connectButton');
const fundButton = document.getElementById('fundButton');
const balanceButton = document.getElementById('balanceButton');
const withdrawButton = document.getElementById('withdrawButton');
const fundInput = document.getElementById('ethAmount');

connectButton.onclick = connect;
fundButton.onclick = fund;
balanceButton.onclick = getBalance;
withdrawButton.onclick = withdraw;

function connect() {
  ethereum
    .request({ method: 'eth_requestAccounts' })
    .then((connectButton.innerHTML = 'Connected!'))
    .catch((error) => {
      if (error.code === 4001) {
        // EIP-1193 userRejectedRequest error
        connectButton.innerHTML = 'Please install metamask!';
      } else {
        console.error(error.message);
      }
    });
}

async function getBalance() {
  try {
    if (typeof window.ethereum != 'undefined') {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const balance = await provider.getBalance(contractAddress);
      console.log(ethers.formatEther(balance));
    }
  } catch (error) {
    if (error.code === 4001) {
      // EIP-1193 userRejectedRequest error
      connectButton.innerHTML = 'Please install metamask!';
    } else {
      console.error(error.message);
    }
  }
}

async function fund() {
  const ethAmount = fundInput.value;
  console.log('Funding amount with: ' + ethAmount);
  if (ethAmount != '')
    if (typeof window.ethereum != 'undefined') {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);

      try {
        const transactionResponse = await contract.fund({
          value: ethers.parseEther(ethAmount),
        });
        await listernForTransactionMine(transactionResponse, provider);
        console.log('Done!');
        fundInput.value = '';
      } catch (error) {
        if (error.code === 4001) {
          // EIP-1193 userRejectedRequest error
          connectButton.innerHTML = 'Please install metamask!';
        } else {
          console.error(error.message);
        }
      }
    }
}

async function withdraw() {
  if (typeof window.ethereum != 'undefined') {
    console.log('Withdrawing...');
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      const transactionResponse = await contract.withdraw();
      await listernForTransactionMine(transactionResponse, provider);
    } catch (error) {
      console.error(error.message);
    }
  }
}

function listernForTransactionMine(transactionResponse, provider) {
  console.log(`Mining ${transactionResponse.hash}...`);
  // return new Promise()
  // listen for this transaction to finish
  return new Promise((resolve, reject) => {
    provider.once(transactionResponse.hash, (transactionReceipt) => {
      console.log(
        `Completed with ${transactionReceipt.confirmations} confirmations`
      );
      resolve();
    });
  });
}
