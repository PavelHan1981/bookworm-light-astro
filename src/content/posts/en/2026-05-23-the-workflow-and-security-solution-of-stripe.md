---
title: "An Analysis of the Workflow and Security Mechanisms of Stripe Online Payments"
slug: "2026-05-23-the-workflow-and-security-solution-of-stripe"
description: "In the web world, handling user credit card numbers during online payment processes is an extremely high-risk operation. For full-stack developers implementing overseas business scenarios within their applications, they must deal with cross-border credit card network communications, 3D Secure dynamic authentication, and strict PCI-DSS security compliance reviews. To address this issue, Stripe was created. Its greatness lies in packaging the chaotic reality of capital flows into highly predictable, developer-friendly interfaces through exceptionally elegant RESTful APIs and an asynchronous event-driven model based on Webhooks. In this setup, developers' own servers never need to touch, transmit, or store the user's real credit card numbers in plaintext. Instead, they simply send instructions to Stripe, and Stripe processes them and returns a token indicating the execution result of the payment operation, greatly simplifying the complexity of payment business logic."
date: 2026-05-23T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["Cloud Platforms"]
tags: ["Full-Stack Development","Android"]
draft: false
---

In the web world, handling user credit card numbers during online payment processes is an extremely high-risk operation. For full-stack developers implementing overseas business scenarios within their applications, they must deal with cross-border credit card network communications, 3D Secure dynamic authentication, and strict PCI-DSS security compliance reviews. To address this issue, Stripe was created. Its greatness lies in packaging the chaotic reality of capital flows into highly predictable, developer-friendly interfaces through exceptionally elegant RESTful APIs and an asynchronous event-driven model based on Webhooks. In this setup, developers' own servers never need to touch, transmit, or store the user's real credit card numbers in plaintext. Instead, they simply send instructions to Stripe, and Stripe processes them and returns a token indicating the execution result of the payment operation, greatly simplifying the complexity of payment business logic.


## Explanation of Stripe Online Payment Business Workflow


The diagram below illustrates the complete workflow of Stripe online payments using an example of completing a payment on an Android app. The entire payment process can be divided into four stages:

- Stage 1: Establishing a Payment Session
    - First, on the Android app, the user taps the button to purchase a product/service, initiating the payment process. At this point, the app sends a purchase request to the developer's own backend Spring Boot server.
    - Upon receiving the request, the backend server creates a new purchase order in its PostgreSQL database. Because the payment has not yet started, the order status is set to `Pending`.
    - Next, the backend server sends a request to Stripe Cloud to create a payment session.
    - Upon receiving this, the Stripe server returns the session URL and token ID to the backend server.
    - The backend server then forwards the URL and token ID as-is to the app via a persistent connection between them.
- Stage 2: The Payment Process Between the Client and the Stripe Server
    - After the first stage, the app receives the payment session URL and token from the Stripe server. The app then visits the URL directly to interact with the Stripe server and complete the actual payment process. This step is completely transparent to the developer's app and backend server.
- Stage 3: Notification to the Backend Server After Payment Completion
    - Once the user completes the payment process with Stripe within the app, the app UI displays a waiting-for-payment-confirmation page. Meanwhile, the Stripe server sends a payment confirmation message to the developer's backend server.
    - Upon receiving the payment confirmation, the backend server updates the purchase order status in the PostgreSQL database to `PAID` and updates the user's entitlements accordingly.
    - Finally, the backend server sends a purchase completion confirmation back to the app via WebSocket or a polling request from the app. The app then refreshes its UI to display the purchased product or service information.

![stripe-architecture-flow.png](/images/blog/Stripe在线支付功能的工作流程和安全机制解析-1.png)


## The Webhook Mechanism for Stripe Server Payment Event Notifications


In the workflow described above, after the developer's backend server sends a request to the Stripe server to create a payment session (Step 3 in the flowchart above), the Stripe server does not open and maintain a persistent connection with the backend server during subsequent payment sessions (which would waste too much of the Stripe server's memory). Instead, it uses a Webhook mechanism: once the user completes the payment, the Stripe server actively initiates a request to the Webhook URL registered by the developer's backend server to notify it of the payment completion status.


Therefore, to support this Webhook mechanism, when developers register their Stripe accounts, they must pre-register their server's public IP address in the Stripe developer dashboard. This allows the Stripe server to know the Webhook URL and send payment completion notifications to it after users finish paying.


Consequently, the communication between the developer's backend server and the Stripe server always follows a standard RESTful stateless communication model. Each time the backend server sends a request to Stripe to create a payment session, the Stripe server returns a payment session URL and token ID, and then the connection is closed. Later, once the payment is completed, the Stripe server uses the Webhook mechanism to send the event completion notification back to the backend server.


Below is a flowchart showing the Stripe server proactively initiating a payment event completion notification to the Webhook URL after a user completes a payment. This includes cryptographic authentication information to ensure communication security. Additionally, to handle potential Webhook communication failures, the Stripe server will retry sending the event notification request over a period of time, ensuring a complete and closed-loop process for both the payment workflow and the notification mechanism:


![stripe-server-webhook.png](/images/blog/Stripe在线支付功能的工作流程和安全机制解析-2.png)


## Communication Models Between the Frontend and Stripe Server: Checkout vs. Payment Element


For the frontend (App, Web), after initiating the payment session request and obtaining the session URL and token ID returned by the Stripe server from the backend server, the actual payment process is completed through communication between the frontend and the Stripe server. The communication model between the frontend and the Stripe server primarily falls into two categories: Checkout and Payment Element.


### Checkout Mode


The operating mechanism of the Checkout mode is as follows: when the backend server calls the Stripe API to create a payment session, the Stripe server generates a logical order and dynamically renders a Single Page Application (SPA) webpage dedicated to that specific order. This webpage is hosted under Stripe's domain (usually `checkout.stripe.com`). The Checkout URL is then returned to the developer's backend server and forwarded to the frontend.


In this scenario, developers only need to access this Checkout URL in their app or frontend webpage via redirection or by opening an embedded browser.


Stripe injects powerful features into this page. If it detects that the user is using Safari, it automatically displays Apple Pay; if Chrome, it displays Google Pay. It even automatically switches languages and local currencies based on the user's IP address (such as automatically displaying iDEAL payments in Europe). Developers do not need to write a single line of code for these complex detection logics; everything is handled automatically by the Stripe server.


### Payment Element Native Mode


The operating mechanism of this mode is that users do not leave the developer's domain or app during the payment process. Developers must design and render a polished checkout page themselves in their web page or app frontend using HTML/CSS or Android native components (including shopping carts, shipping addresses, etc.). In other words, the payment page is designed and presented to the user by the developer.


Of course, to ensure the payment process is securely isolated, the specific area on the frontend payment page where users enter their credit card numbers must integrate Stripe's frontend SDK to request the rendering of a Payment Element component. On the web, this component is essentially a cross-domain `<iframe>` (or a secure view inside an app).


With this design, even though the input fields of the payment page are designed by the developer, when the user types their bank card number, it is entered directly into Stripe's iframe/secure view and sent straight to Stripe's vault. The outer layers of JavaScript or Android code implemented by the developer cannot read these plaintext credentials. This perfectly bypasses PCI compliance audits and ensures that the entire payment flow and its security are managed entirely by Stripe.


The processing flowcharts for both modes are illustrated in the figure below:


![stripe-checkout-vs-element.png](/images/blog/Stripe在线支付功能的工作流程和安全机制解析-3.png)


So, how does Stripe distinguish between these two modes?


The answer is: Stripe does not care which mode the frontend uses at all. It only cares whether the backend server utilized the Checkout API or the Payment Element API when initiating the payment request to the Stripe server.

- When using the Checkout mode, the API request sent by the backend server to Stripe is `POST /v1/checkout/sessions` (refer to [https://docs.stripe.com/api/checkout/sessions](https://docs.stripe.com/api/checkout/sessions)). At this point, the Stripe server generates a webpage with a payment interface and returns the URL of this webpage to the backend server.
- When using the Payment Element mode, the API request sent by the backend server to Stripe is `POST /v1/payment_intents` (refer to [https://docs.stripe.com/api/payment_intents](https://docs.stripe.com/api/payment_intents)). At this point, the Stripe server creates an order record in memory and generates a one-time secret key returned to the backend server. The frontend subsequently communicates with the Stripe server based on this key to complete the payment.

## Stripe's Secure Communication Mechanisms and Keys


As shown in the flowcharts above, the entire payment communication process involves three parties: the frontend, the backend, and the Stripe server. To ensure communication security throughout the payment process, Stripe provides three sets of keys for identity authentication and signature verification. These three sets of keys are generated in the Stripe developer dashboard:

- Publishable Key (starts with `pk_`): Hardcoded into the frontend (app/web) code. Its role is to let the frontend prove "whose frontend I am" when communicating with the Stripe server.
- Secret Key (starts with `sk_`): Must and can only be stored securely in the backend server's environment variables. It must never be leaked to the frontend or committed to a Git repository. Its role is to be placed in the HTTP `Authorization: Bearer <sk_...>` header when the backend calls Stripe APIs (such as creating orders, issuing refunds, or querying bills), allowing the Stripe server to know which merchant the payment request comes from.
    - In addition to the Secret Key, there is actually a Restricted Key, whose functionality is similar to the Secret Key but acts as a subset of its permissions, holding only partial privileges. If only payment session creation is needed, a Restricted Key can be used to prevent the leakage of the higher-privilege Secret Key.
- Webhook Secret (signing key, starts with `whsec_`): Also stored exclusively in the backend server's environment variables. Its purpose is specifically to verify whether Webhook requests sent from Stripe to the backend server have been tampered with by hackers in transit.

It is important to note that all communications throughout the Stripe payment business process are conducted over HTTPS/TLS connections. The three sets of keys mentioned above are transmitted in plaintext within the encrypted HTTPS channel solely for identity authentication, and do not participate in data encryption/decryption operations.


As illustrated in the diagram below, three sets of keys are used across different stages of the payment process for identity authentication and authorization of communication roles:

- Stage 1: In the communication where the backend server sends a payment session request to the Stripe server, the backend server must include the SK/RK in its HTTP message. Upon receiving this, the Stripe server verifies the identity ownership associated with the SK/RK and confirms whether it has permission to create sessions.
- Stage 2: During the actual payment interaction between the frontend and the Stripe server, the frontend must pass the PK to the Stripe server in its HTTP message, allowing the Stripe server to identify the origin of the frontend communicating with it.
- Stage 3: After the payment process between the frontend and the Stripe server concludes, the Stripe server sends an event notification to the backend server via the Webhook mechanism. Upon receiving this message, the backend server must use the Webhook Secret key to verify the message's signature, ensuring that the message genuinely originated from the Stripe server.

![68951394-a233-4ed6-9d9b-76fd3a268714.png](/images/blog/Stripe在线支付功能的工作流程和安全机制解析-4.png)