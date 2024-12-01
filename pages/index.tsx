import React, { useState } from 'react';
import { ethers } from 'ethers';
import { toBytes, isAddress } from 'viem';
import {BigNumber} from "@ethersproject/bignumber";
import IOFTABI from "../abi/IOFT.json";
import ERC20ABI from "../abi/ERC20.json";


export default function Home() {
    const [currentAccount, setCurrentAccount] = useState(null);
    const [amount, setAmount] = useState(0);

    // MetaMask 연결 함수
    const connectWallet = async () => {
        if (!window.ethereum) {
            alert('MetaMask가 설치되어 있지 않습니다!');
            return;
        }

        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            setCurrentAccount(accounts[0]);
            console.log('연결된 계정:', accounts[0]);
        } catch (error) {
            console.error('MetaMask 연결 오류:', error);
        }
    };

    // 주소를 Bytes32로 변환하는 함수
    function addressToBytes32(address: string): string {
        // 주소가 유효한지 확인
        if (!isAddress(address)) {
            throw new Error("Invalid address");
        }

        // 주소를 바이트 배열로 변환
        const bytes = toBytes(address);

        // 바이트 배열의 길이가 32바이트가 되도록 패딩
        const paddedBytes = new Uint8Array(32); // 32바이트 크기 배열 생성
        paddedBytes.set(bytes, 32 - bytes.length); // 주소의 바이트를 배열 끝에 맞춰 넣기

        // 32바이트 배열을 16진수 문자열로 변환하여 반환
        return `0x${Array.from(paddedBytes).map(byte => byte.toString(16).padStart(2, '0')).join('')}`;
    }

    // 스마트 컨트랙트 호출 함수
    const sendTokens = async () => {
        if (!currentAccount) {
            alert('먼저 MetaMask 지갑을 연결해주세요!');
            return;
        }

        try {
            const contractAddress = "0x426E7d03f9803Dd11cb8616C65b99a3c0AfeA6dE";

            const dstEid = 40161; // 목적지 엔드포인트 ID
            const amount = 7; // 전송할 토큰 양
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const token = new ethers.Contract(contractAddress, IOFTABI, signer);




            // @ts-ignore
            const usdeContractAddress = "0x426E7d03f9803Dd11cb8616C65b99a3c0AfeA6dE";
            const usdeToken = new ethers.Contract(usdeContractAddress, ERC20ABI, signer);
            const approveTx = await usdeToken.approve(contractAddress, 100000000000000)
            await approveTx.wait()

            const amountLD = BigNumber.from(amount)

            const sendParam = {
                dstEid,
                to: addressToBytes32(signer.address),
                amountLD: amountLD.mul(BigNumber.from(10).pow(18)).toString(),
                minAmountLD: amountLD.mul(BigNumber.from(10).pow(18)).toString(),
                extraOptions: '0x000301001101000000000000000000000000000186a0',
                composeMsg: '0x',
                oftCmd: '0x',
            }
            console.log(sendParam);
            // @ts-ignore
            const msgFee = await token.quoteSend(sendParam, false)

            console.log(msgFee);
            const txResponse = await token.send(sendParam, [msgFee[0].toString(), msgFee[1].toString()], signer.address, {
                value: msgFee.nativeFee
            })
            const txReceipt = await txResponse.wait()
            console.log(txReceipt);


            // @ts-ignore
            alert('트랜잭션 완료! 상태: ' + txReceipt.status);
        } catch (error) {
            console.error('스마트 컨트랙트 호출 오류:', error);
            alert('오류 발생: ');
        }
    };

    return (
        <div style={{textAlign: 'center', marginTop: '50px'}}>
            <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                placeholder="Enter amount"
                style={{
                    padding: '10px',
                    fontSize: '16px',
                    marginBottom: '20px',
                    borderRadius: '5px',
                    border: '1px solid #ccc',
                    color: '#000', // Text color
                    backgroundColor: '#fff', // Background color
                }}
            />
            {currentAccount ? (
                <p>Wallet Address: {currentAccount}</p>
            ) : (
                <button
                    onClick={connectWallet}
                    style={{
                        padding: '10px 20px',
                        fontSize: '16px',
                        cursor: 'pointer',
                        backgroundColor: '#0070f3',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '5px',
                        marginBottom: '20px',
                    }}
                >
                    MetaMask 지갑 연결
                </button>
            )}
            <button
                onClick={sendTokens}
                style={{
                    padding: '10px 20px',
                    fontSize: '16px',
                    cursor: 'pointer',
                    backgroundColor: '#28a745',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '5px',
                }}
            >
                cross chain sendTokens Ethena Network to Sepolia Network
            </button>
        </div>
    );
}
