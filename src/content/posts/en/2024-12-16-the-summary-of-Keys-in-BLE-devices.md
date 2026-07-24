---
title: "Summary of Security Keys in BLE Devices"
slug: "2024-12-16-the-summary-of-Keys-in-BLE-devices"
description: ""
date: 2024-12-16T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["Bluetooth"]
tags: ["Bluetooth"]
draft: false
---


## The Three Fundamental Keys of BLE Security Features


In general, the security of BLE communication connections is built upon three foundations: encrypted communication, signatures, and random addresses.


To ensure encrypted communication between BLE devices during data transmission, three main types of keys are used. All three keys are securely and encrypted transmitted between the two devices only after the pairing process is completed.

- Long Term Key (LTK): Used to provide encryption protection for data under encrypted connection communication. The same LTK is generated and exchanged during the pairing process of two devices, and once the pairing and bonding procedures are completed, the LTK is stored in both devices respectively. Subsequently, during data communication in the connected state between the two devices, the LTK is used to generate session keys that encrypt and decrypt data packets using the AES-128 algorithm, ensuring that data packets transmitted between both parties after connection are encrypted.
- Connection Signature Resolving Key (CSRK): Used to verify the integrity and authenticity of data transmission in unencrypted connection scenarios. When the communication link does not use an encryption mechanism, BLE uses a data signature mechanism to ensure the integrity and authenticity of received data packets. By adding a signature to each data packet, it is determined that the data packet is complete (has not been modified) and comes from a trusted communication peer (a device paired with itself). The CSRK key is used in this data signing process. During BLE connection communication, each outgoing data packet is signed using the CSRK key, and then the data packet and signature are sent together to the other party. Upon receipt, the recipient performs another calculation on the content of the received data packet using the system's signature algorithm logic and the CSRK key, and then compares whether the self-calculated signature value matches the received signature value. If the two signatures match, it indicates that the data packet is complete and indeed sent by a trusted communication peer.
- Identity Resolving Key (IRK): Used to protect the Bluetooth MAC address of Bluetooth peripheral devices. To address the security risk where malicious attackers use a device's Bluetooth address to continuously and persistently track user Bluetooth device communications, the BLE specification introduces a random address type called Resolvable Private Addresses to protect the user device's true Bluetooth address. During operation, a Bluetooth peripheral device periodically (defaulting to 15 minutes) uses this 128-bit IRK to generate a random Bluetooth address, communicating with other devices in the air packets using this random MAC address. Only Bluetooth devices that have previously completed the pairing and bonding process with this peripheral device can resolve the true address of the peripheral Bluetooth device from this random address. Thus, whether in broadcasting or connected states, the MAC address of the peripheral Bluetooth device is always in a state of periodic change, thereby protecting against unauthorized tracking and attacks during Bluetooth communication.

## **The Long Term Key (LTK)**


![image.png](/images/blog/BLE设备之间安全密钥总结-1.png)


After a BLE connection is established, both communicating parties use the AES-128 encryption algorithm to encrypt and decrypt all communication packet data. The key for the AES-128 algorithm is generated based on the LTK and a random number negotiated by both parties for the current connection, meaning the AES encryption key used for each connection communication is different.

- Generating a temporary key based on the LTK. During the connection establishment process, both communicating parties generate and exchange a random number. This random number is used in combination with the LTK stored by each end during pairing to generate a random key, which serves as the encryption and decryption key for subsequent communications in this connection. The random number generated each time a connection is established is different, so the encryption and decryption keys used for each connection are also different. This key can be referred to as the Session Key for this connection.
- Encrypting data. After generating the Session Key in the above steps, subsequent mutual communication in this connection uses AES-CCM combined with this Session Key for encryption and decryption operations. During the encryption of data packets by the AES-CCM algorithm, a 4-byte Message Integrity Check (MIC) code for the packet is also generated. The encrypted data packet and its MIC are then sent together to the communication peer to ensure the confidentiality and integrity of BLE communication data.
- Decrypting data. Upon receiving the ciphertext data, the communication peer uses the same Session Key and AES algorithm to decrypt it and obtain the plaintext. Simultaneously, by matching and comparing the MIC of this data packet, it confirms that the data is consistent, which indicates that complete and untampered data information has been received.

## **The Connection Signature Resolving Key (CSRK)**


It should be noted that in BLE connection mode communication, not all data needs to be transmitted encrypted. For some data and application scenarios with lower security requirements (such as non-sensitive sensor data), plaintext data can also be transmitted directly. However, it must be ensured between the communicating parties that the transmitted data originates from a trusted communication peer. In this case, the CSRK must be used to ensure the data integrity and sender authenticity of both parties.


BLE uses a signature mechanism to achieve these two functions. Specifically, the implementation and operation of BLE's signature mechanism rely on the CSRK and a monotonically increasing counter used to prevent replay attacks.


![image.png](/images/blog/BLE设备之间安全密钥总结-2.png)


Specifically, BLE adopts the AES-CMAC algorithm to generate the Message Authentication Code (MAC) of the message plaintext. This MAC can simultaneously provide confirmation functions for both data packet integrity and authenticity.


For the AES-CMAC signature algorithm, three inputs are required:

- The message plaintext to be signed, which can be of arbitrary length.
- The CSRK key, with a length of 128 bits.
- SignCounter, a 32-bit incrementing counter that increments by 1 with each signature operation.

The result of the AES-CMAC operation is the Message Authentication Code (MAC) of the plaintext message, and the length of the MAC is fixed. During BLE communication, the message authentication code, the plaintext data packet, and the MAC counter SignCounter are sent together to the communication peer.


After receiving them, the communication peer separates the message plaintext, SignCounter, and MAC code (the lengths of both SignCounter and MAC are fixed), and then performs the same calculation logic on the plaintext to obtain its own calculated MAC code. Next, it compares the two MAC codes. If they are consistent, it indicates that the received plaintext message is complete and indeed sent by a trusted communication peer.


In addition, the receiving end will compare the newly received SignCounter with the SignCounter used in the previous calculation. If the new SignCounter is greater than the previously used SignCounter (since the sender's SignCounter increments by 1 with each operation), it indicates that the SignCounter used for the MAC calculation of this message is valid; otherwise, it is invalid, thus defending against replay attacks.


## **The Identity Resolving Key (IRK)**


The IRK is also a key shared between two BLE devices during the pairing process, used to resolve the Bluetooth random MAC addresses used in subsequent communications to prevent malicious attackers from continuously tracking communications from a fixed Bluetooth MAC address.


BLE peripheral devices generate a new random MAC address periodically based on the IRK. The specific generation steps and logic are as follows: the BLE peripheral device first generates a 22-bit random number `prand`. This random number, along with the IRK key exchanged and saved by both parties during the pairing process, is used to generate a Resolvable Private Address (RPA). The length of the IRK is fixed at 128 bits, and the fixed length of the random number `prand` is 22 bits. The calculation of the RPA takes the IRK and `prand` as inputs, using the `ah` hash algorithm defined in the Bluetooth specification:

- _hash = ah (IRK, prand)_, truncated to 24 bits

The result of the above Hash calculation is truncated to a length of 24 bits, and then combined with the 22-bit random number `prand` and the highest 2 bits `0b01` (in BLE MAC addresses, the highest bits being `0b01` indicates that the address is a Resolvable Private Address) to form the random MAC address RPA:


![image.png](/images/blog/BLE设备之间安全密钥总结-3.png)

- This resolvable private address contains two pieces of information: `prand` and the hash value calculated by the `ah` algorithm.

When a data packet containing this RPA random address is received by the Master device, it needs to resolve the RPA contained within it to extract the true peripheral MAC address. If resolution fails, it means the data packet is not intended for this device and should be dropped directly.


When two BLE devices pair, they exchange a series of keys, which include the peripheral device's IRK key and the peripheral's true, fixed BLE MAC address, among other information. Therefore, each paired BLE device maintains an address resolution table containing the IRK and true fixed BLE MAC address of paired devices.


![6782a46a-db27-49b7-8c83-19f3fdb22f06.png](/images/blog/BLE设备之间安全密钥总结-4.png)


After the BLE Master device receives a data packet, if the MAC address contained in the packet is of the resolvable private address type (the top two bits are `0b01`), it follows the process below to confirm whether the IRK information of the packet's sender is included in the resolution table above, and what its corresponding true BLE MAC address is:


![76496ea7-d40b-4ce6-80cf-d4b2694aaf32.png](/images/blog/BLE设备之间安全密钥总结-5.png)

- The BLE device receiving the data packet extracts the RPA resolvable address contained within it, dividing it into two parts: the hash value and `prand`. It then retrieves a Peer IRK from the address resolution table, calculates the hash value of `(IRK, prand)` using the same `ah` hash algorithm, and matches it against the hash value. If it does not match, it proceeds to use the Peer IRK in the next entry of the address resolution table to perform the same calculation and matching comparison, until a match between the two hash values is found. Then, the true BLE MAC address corresponding to this entry (i.e., the Peer Device Identity Address) can be found. If the entire address resolution table is polled and no matching Peer IRK is found, it indicates that the two devices have not been paired previously. This data packet is not sent to itself, so it can be discarded.

### Periodic Update of RPA


To provide tighter security and privacy protection for BLE peripheral devices, in addition to using random number encryption on its BLE MAC address as described above, the BLE device also periodically updates its RPA random address to prevent attackers from persistently tracking the random address if it is used for too long.


The available duration of the RPA random address is set via the BLE controller's _HCI_LE_Set_Resolvable_Private_Address_Timeout_ command, with an adjustable time range from 1 second to 11.5 hours. Upon timeout, the link layer needs to regenerate a random number and update to use a new RPA communication address.


The RPA update interval recommended by the Bluetooth specification is 15 minutes.


## References

- [Understanding Security Keys in Bluetooth Low Energy - Technical Articles](https://www.allaboutcircuits.com/technical-articles/understanding-security-keys-in-bluetooth-low-energy/)
- [BLE 配对加密相关问题分享_ble安全等级 模式-CSDN博客](https://blog.csdn.net/Marchtwentytwo/article/details/144217848)