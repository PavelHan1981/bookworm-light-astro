---
title: "Detailed Explanation of WiFi WPA/WPA2 4-Way Handshake Authentication Mechanism"
slug: "2024-06-07-wifi-wpa2-4way-handshake-details"
description: "This article provides a detailed summary of the key structure, authentication, and key exchange processes in the WiFi WPA/WPA2 authentication mode, focusing on the 4-way handshake mechanism."
date: 2024-06-07T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["WiFi"]
tags: ["WiFi"]
draft: false
---


## Connection Establishment Process Between STA and AP


![Untitled.png](/images/blog/WiFi-WPA-WPA2四步握手认证机制详解-1.png)


When the AP is configured in WPA-PSK or WPA2-PSK encryption mode, the process of establishing a connection between the STA and the AP can be divided into the following four phases:

- Phase 1: STA scans the AP's Beacon Frame or finds the AP via Probe Request
    - Passive Mode: The AP periodically broadcasts Beacon Frames (typically every 102.4ms). Once the STA turns on its Wi-Fi, it listens for ambient Beacon Frames across all channels to detect which channel the target AP is on. By parsing the data within the Beacon Frame, the STA learns the encryption and authentication methods used by the AP.
    - Active Mode: In addition to listening for Beacon Frames, the STA can actively send Probe Request Frames containing the information of the AP it wishes to connect to across all channels. Upon receiving the request, the AP replies with a Probe Response Frame. This scanning method does not require waiting passively for Beacon Frames, allowing for faster connections.
- Phase 2: STA connects to the AP using Open Authentication
    - This phase consists of two steps: Open Authentication and Association. Each step involves a request packet sent by the STA and a response packet from the AP, totaling four packets across two round-trips.
    - For WPA and WPA2, this step uses Open Authentication, which means STAs with no password or the wrong password can still successfully authenticate and connect to the AP at this stage. However, completing this step only establishes a connection; the STA cannot access the network yet. Network access is granted only after the actual security authentication is passed.
    - Open Authentication: The STA sends an Authentication Request Frame to the AP, and the AP responds with an Authentication Response Frame.
    - Association: The STA sends an Association Request Frame to the AP, and the AP responds with an Association Response Frame.
    - This phase ensures the STA and the AP are connected, but security authentication has not yet occurred.
- Phase 3: WPA/WPA2 4-Way Handshake to complete security authentication and exchange keys
    - Initiated by the AP, this involves a four-way message exchange between the AP and the STA based on the EAPOL protocol. Once the Pre-Shared Key (PSK) is validated, it completes the exchange of unicast and multicast session keys.
    - Therefore, this phase serves two primary functions: security authentication, and the exchange of unicast and multicast keys.
- Phase 4: Encrypted Communication Phase
    - Once the WPA/WPA2 4-way handshake is completed, the STA and AP have mutually authenticated and exchanged session keys. All subsequent data traffic is encrypted and protected using these keys.

## Key Hierarchy in WPA Authentication and Encryption

*Note: Since I do not work in the cybersecurity field, I only need to understand the general workflow of how these encryption keys are generated without diving into every mathematical detail.*

To jump straight to the conclusion: after the WPA 4-way handshake and key exchange process, two key types are established between the AP and the STA: PTK and GTK.

- **PTK (Pairwise Transient Key)**: Used to encrypt all subsequent unicast (one-to-one) traffic between the AP and a specific STA. The PTK is unique to each STA and is only shared between the AP and that specific STA.
- **GTK (Group Temporal Key)**: Used to encrypt all broadcast and multicast (one-to-many) traffic between the AP and STAs. The GTK is shared among all STAs within the AP's local network (BSS). It is maintained by the AP and sent securely (encrypted) to the STA in the third step of the 4-way handshake.
    - Because the GTK is shared across the entire network, the AP periodically refreshes the GTK and updates all connected STAs to ensure its security. Additionally, the AP rotates the GTK when a STA disconnects to prevent the stale key from being exploited.

A brief explanation of each key used in WPA communication is as follows:

- **MSK (Master Session Key)**: Not used in the common WPA-PSK/WPA2-PSK pre-shared key authentication. It is only used in the 802.1X authentication framework as the initial encryption key generated between the AP and the RADIUS server.
- **PMK (Pairwise Master Key)**: In WPA-PSK/WPA2-PSK, this is derived from the pre-shared key (the Wi-Fi password) configured on both the AP and STA. In 802.1X, it is the AAA key negotiated between the AP and the RADIUS server.
- **GMK (Group Master Key)**: A random value generated by the AP, used to derive the GTK.
- **PTK (Pairwise Transient Key)**: Generated during the 4-way handshake using the PMK, ANonce, SNonce, MAC addresses of both devices, and SSID. It is used to encrypt unicast traffic between the AP and the STA.
- **GTK (Group Temporal Key)**: Periodically generated/refreshed by the AP and sent encrypted to each STA. It is shared across the entire BSS and used to encrypt multicast and broadcast traffic.
- **ANonce**: A random number (nonce) generated by the AP (Authenticator Nonce).
- **SNonce**: A random number (nonce) generated by the STA (Supplicant Nonce).
- **MIC**: Message Integrity Code (used for verifying data integrity, though MAC addresses are also used in the calculations).

The diagram below illustrates the WPA encryption key hierarchy.


![Untitled.png](/images/blog/WiFi-WPA-WPA2四步握手认证机制详解-2.png)


To briefly summarize the diagram above:

- The PTK is derived from the PMK. The PMK, in turn, is derived from either the Pre-Shared Key (PSK) configured on the AP and STA, or the AAA key negotiated between the AP and the RADIUS server in an 802.1X framework.
- The GTK is derived from the GMK, which is essentially a random number periodically generated and refreshed by the AP.

Next, let's take a closer look at how the PTK and GTK are generated.


First, let's look at the GTK.

- As mentioned earlier, the GTK is independently generated and maintained by the AP. It does not require exchanging nonces between the AP and the STA. The AP only needs to encrypt the GTK and send it to the STA during connection establishment, and then update it periodically or whenever a STA leaves the network.
- The generation of the GTK depends on the GMK. The GMK is a pseudo-random number periodically generated and refreshed by the AP. The GMK itself is never transmitted to the STAs; instead, the GTK derived from it is sent to the STAs to encrypt multicast and broadcast traffic.
- Once the AP has the GMK, it uses a Pseudo-Random Function (PRF) to generate the GTK, which is then encrypted and transmitted to the STAs.

Next, let's see how the PTK is generated in the commonly used WPA-PSK/WPA2-PSK (Pre-Shared Key) mode.

- The formula for generating the PTK is: `PTK = PRF (PMK + Anonce + SNonce + Mac (AA)+ Mac (SA))`. This means the PTK depends on the PMK, the ANonce (generated by the AP), the SNonce (generated by the STA), and the MAC addresses of both the STA and AP. The MAC addresses are known to both sides from their initial communication. The ANonce and SNonce are exchanged during the first and second messages of the 4-way handshake, respectively. Therefore, to generate the PTK, only the PMK remains to be determined.
- In the WPA/WPA2 PSK authentication mode, the PMK is actually a 256-bit key generated by running the PBKDF2 algorithm on the pre-shared key (the Wi-Fi password) configured on both the AP and STA. Since both the AP and STA know this password, they can independently calculate the exact same PMK.
- Consequently, once the ANonce and SNonce are successfully exchanged between the AP and STA, both sides can independently generate the identical PTK to encrypt subsequent unicast traffic.

To summarize once again:

- The GTK, required for encrypting multicast traffic, is generated and maintained by the AP. The AP only needs to encrypt and send it to the joining STA during the 4-way handshake.
- The PTK, required for encrypting unicast traffic, must be generated independently on both the AP and STA sides. Since the pre-shared key is pre-configured on both devices, the PMK is already known; the MAC addresses are also readily available. The core challenge is how to securely exchange the ANonce and SNonce.
- Furthermore, how does the AP verify during the 4-way handshake that the STA is a legitimate device? This ultimately comes down to verifying whether the pre-shared keys configured on both devices match.

For a deeper dive into how WPA and WPA2 keys are generated, there is an excellent reference document: [networklessons.com...](https://networklessons.com/cisco/ccnp-encor-350-401/introduction-to-wpa-key-hierarchy#Group_Master_Key_GMK). Here, I am simply streamlining the basic logical workflow.


## The WPA 4-Way Handshake Process


Based on the analysis of the WPA key hierarchy, the issues that the 4-way handshake needs to address are:

- How to securely exchange the SNonce and ANonce to allow both the AP and STA to independently generate the same PTK for encrypting unicast traffic.
- How to securely transmit the encrypted GTK from the AP to the STA for encrypting multicast and broadcast traffic.
- How the AP verifies the legitimacy of the connecting STA.

The WPA 4-way handshake consists of four messages exchanged between the AP and the STA, initiated by the AP, as shown in the diagram below.


![Untitled.png](/images/blog/WiFi-WPA-WPA2四步握手认证机制详解-3.png)


### Message 1


Message 1 is sent from the AP to the STA. Its primary purpose is to send the AP's random number, the ANonce, to the STA.


Note:

- Since no other encryption keys have been exchanged between the AP and the STA at this stage (the pre-shared key PSK configured on both devices will be utilized in Message 2), the ANonce is sent from the AP to the STA in plaintext.
- The ANonce sent in Message 1 is not protected by a MIC (Message Integrity Code).

![Untitled.jpeg](/images/blog/WiFi-WPA-WPA2四步握手认证机制详解-4.jpeg)


Summary: Message 1 is simply the AP sending its generated random number, the ANonce, to the STA in plaintext.


### Message 2


After receiving the ANonce from the AP in Message 1, the STA can calculate the PTK using the following formula: `PTK = PRF (PMK + Anonce + SNonce + Mac (AA)+ Mac (SA))`.

- The PMK in WPA-PSK/WPA2-PSK is derived from the Wi-Fi password entered by the user.
- The ANonce is received from the AP in Message 1, and the SNonce is generated by the STA itself.
- MAC(AA) and MAC(SA) are the MAC addresses of the STA and AP, which are easily obtainable by both sides.

Once the STA calculates its PTK, it must send its self-generated SNonce to the AP in Message 2.

- Since the AP needs the SNonce to calculate its own copy of the PTK, the SNonce in Message 2 is sent in plaintext.

However, unlike Message 1, Message 2 contains not only the plaintext SNonce but also a MIC for this message. Therefore, the "Key MIC" flag is set in the Key Information field of this packet.


How is this MIC calculated?

- "Now WPA2 PSK uses HMAC-SHA1 to generate the MIC and it uses the **KCK** as a secret to generate the **MIC**." In other words, the MIC in Message 2 is calculated using the HMAC-SHA1 algorithm, with the KCK serving as the key.

So, what is the KCK? The KCK (Key Confirmation Key) consists of the first 16 bytes (128 bits) of the PTK calculated by the STA, and is specifically used to compute the MIC in subsequent communications. The diagram below shows the structure of the PTK, where the KCK is the first 128 bits.


![Untitled.png](/images/blog/WiFi-WPA-WPA2四步握手认证机制详解-5.png)


When the AP receives Message 2, it extracts the plaintext SNonce and combines it with its own ANonce, the MAC addresses of both parties, and the configured pre-shared key to calculate its own copy of the PTK. It then takes the first 16 bytes of this PTK (the KCK) as the key to calculate the MIC of Message 2 using the HMAC-SHA1 algorithm. Finally, it compares its calculated MIC with the MIC received in Message 2. If they match, it confirms that the PTK exchange was successful. At this point, both sides share the same PTK and can use it to encrypt subsequent unicast traffic.

- Thus, the MIC in Message 2 serves two crucial, hidden purposes: first, it verifies the integrity of the transmitted SNonce to ensure it has not been tampered with; second, it verifies whether the pre-shared keys on both the AP and STA match, since the KCK used to calculate the MIC is derived from the PTK, which is in turn derived from the PMK (pre-shared key).

![Untitled.png](/images/blog/WiFi-WPA-WPA2四步握手认证机制详解-6.png)


Summary: Message 2 is the STA sending its SNonce to the AP. Both parties calculate their PTKs and verify if their PTKs (and thus their pre-shared keys) match by comparing the MIC.


At this point, the AP and STA have completed pre-shared key authentication and successfully exchanged the PTK for unicast communication. The subsequent Messages 3 and 4 are primarily used to exchange the GTK for encrypting broadcast and multicast traffic.


### Message 3


Since the PTK has already been established in Messages 1 and 2, all subsequent communications in Messages 3 and 4 are protected using this PTK.


The primary role of Message 3 is for the AP to send its GTK to the STA. Because the GTK is independently maintained by the AP and shared across the entire local network, the AP simply encrypts the GTK using the negotiated PTK and transmits it to the STA.


The most important components of Message 3 are the encrypted GTK payload and the Message Integrity Code (MIC).


![Untitled.png](/images/blog/WiFi-WPA-WPA2四步握手认证机制详解-7.png)

- As shown above, the **Key MIC** flag is set, indicating that this message contains a MIC, which is computed using the KCK (the first 16 bytes of the PTK).
- The **Secure** flag is set, indicating that this is an encrypted message that requires decryption using the PTK.
- **WPA Key Data**: The encrypted GTK payload.
- **WPA Key MIC**: The Message Integrity Code for verifying the message.

Upon receiving this message, the STA decrypts the ciphertext using its PTK to obtain the GTK, and verifies the MIC using its KCK. If the verification succeeds, the GTK is deemed valid. The STA now possesses the GTK required to decrypt broadcast and multicast traffic.


### Message 4


Message 4 is straightforward. Its purpose is simply to acknowledge to the AP that the STA has successfully received and installed the GTK.


![Untitled.png](/images/blog/WiFi-WPA-WPA2四步握手认证机制详解-8.png)


With this, the WPA 4-way handshake process is complete. All subsequent communications between the AP and STA are fully encrypted and protected using the PTK and GTK.


## References

- [4-Way Handshake - WiFi (wifi-professionals.com)](https://www.wifi-professionals.com/2019/01/4-way-handshake)
- [WiFi 四次握手分析 | Think && Act (gitbook.io)](https://kysonlok.gitbook.io/blog/wireless/4_way_handshake)
- [4-Way Hand shake , Keys generation and MIC Verification-WPA2 – Praneeth's Blog (praneethwifi.in)](https://praneethwifi.in/2019/11/09/4-way-hand-shake-keys-generation-and-mic-verification/)
- [4-Way Handshake - WiFi (wifi-professionals.com)](https://www.wifi-professionals.com/2019/01/4-way-handshake)
- [4-Way Hand shake , Keys generation and MIC Verification-WPA2 – Praneeth's Blog (praneethwifi.in)](https://praneethwifi.in/2019/11/09/4-way-hand-shake-keys-generation-and-mic-verification/)