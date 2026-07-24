---
title: "A Comprehensive Guide to Understanding the Encoder Structure and Computational Workflow of the Transformer Model"
slug: "2026-02-22-transformer-encoder-structure-and-workflow"
description: "This article provides a detailed summary of the Encoder-type network architecture and its data flow computational workflow, using a standard Encoder-Only Transformer architecture as an example."
date: 2026-02-22T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["AI"]
tags: ["Transformer"]
draft: false
---


The diagram below illustrates a standard Encoder-Only Transformer architecture:


![image.png](/images/blog/一文彻底搞懂Transformer模型的Encoder结构与计算流程-1.png)


In general, the execution workflow of an Encoder-Only Transformer architecture proceeds as follows:

- **Data preprocessing stage**, including input data vectorization (Embedding) and the addition of positional encodings.
- **A sequence of $N$ Encoder Blocks**.
- **Data output stage**.

For an Encoder-Only Transformer architecture, the output stage is straightforward—such as the Linear + Softmax output shown in the diagram above. Therefore, the focus of this article is on the computational workflows of the first two parts.


## 1. Data Preprocessing


For Natural Language Processing (NLP) Transformer architectures, data must undergo at least the following steps before entering the Encoder and Decoder:

- **Tokenization**: Breaking down a complete sentence or paragraph into individual words or subwords with independent semantic meanings (known as tokens). This step can be accomplished using existing, highly efficient tokenization tools.
- **Embedding**: Based on the tokenization results, converting individual tokens into vectors of a fixed length (e.g., 512, 768). After vectorization, each token corresponds to a vector of the same length.
    - Taking a vector length of 768 as an example, if the text to be processed contains 100 tokens, it will be converted into a tensor of shape `(100, 768)` after vectorization.
- **Positional Encoding**: Adding positional encodings to the vectorized tokens. The length of the positional encoding matches the token vector length, allowing the token vector and its corresponding positional encoding vector to be added directly. The data dimensions remain unchanged after addition.
    - Continuing with the `(100, 768)` vector dimension example, after adding positional encodings, the dimension remains `(100, 768)`.

The diagram below illustrates the complete data preprocessing workflow for the text "How are You":


![image.png](/images/blog/一文彻底搞懂Transformer模型的Encoder结构与计算流程-2.png)


Following the data preprocessing stage, a piece of text (split into $N$ tokens, with each token having a vector length of `dimension`) is transformed into a tensor of shape `(N, dimension)`, making it ready for Encoder processing.


## 2.1 Q, K, and V Matrices in Multi-Head Attention


As is well known, the core of the Transformer is the Self-Attention mechanism, whose working logic calculates the correlation between every element in the input sequence and all other elements. The key components of this self-attention mechanism are Q, K, and V. Self-attention can be thought of as an "information retrieval" process:

- **Query (Q)**: What am I looking for? (Features of the current pixel/patch)
- **Key (K)**: What do I have? (Feature labels of all other pixels/patches)
- **Value (V)**: What can I provide? (Actual content information)

Just looking at the definitions above might not feel entirely intuitive. How exactly do these Q, K, and V components function within the data processing workflow? To state the conclusion directly: **If the vector length corresponding to each token is `dimension`, then Q, K, and V are three independent weight parameter matrices of shape `(dimension, dimension)`. These three weight matrices are parameters learned during the training process.**


Assuming a token vector $x$ has a dimension of $1 \times d$, then $W_Q, W_K,$ and $W_V$ are three matrices of shape $(d, d)$. The process of computing Q, K, and V for this token vector $x$ involves multiplying the token vector by each of the three parameter matrices independently, thereby mapping the input token vector into a new space:


$$
\begin{aligned}
q = x \cdot W_Q \\
k = x \cdot W_K \\
v = x \cdot W_V \
\end{aligned}
$$


As shown in the diagram below: The text "Data visualization empowers users to" is split into 6 words (tokens), with each word corresponding to a vector length of 768. In this case, each token has a dimension of `(1, 768)`, while the three weight matrices $W_Q, W_K,$ and $W_V$ each have dimensions of `(768, 768)`. Combined, the shape of the three matrices is `(768, 2304)`.


![image.png](/images/blog/一文彻底搞懂Transformer模型的Encoder结构与计算流程-3.png)


To summarize, in this step, each token's vector of shape `(1, dimension)` is transformed into three independent vectors of shape `(1, dimension)` representing its Q, K, and V vectors, respectively. The combined shape of these three vectors is `(1, 3 × dimension)`.


## 2.2 Attention Calculation Workflow in Multi-Head Attention


After the previous step, we obtain the Q, K, and V vectors for all words in a text sequence. The next computational step is to extract the corresponding V vectors based on the Q and K vectors.


First, compute the dot product between the Q and K vectors for all tokens in the text sequence. This measures the degree of attention that the $i$-th token pays to the $j$-th token:


$$
Score_{i,j} = Q_i \cdot K_j^T
$$


The closer the directional alignment between $Q_i$ and $K_j$, the higher the calculated score. **After this computation (assuming the text contains $N$ tokens), the resulting score matrix has a shape of `(N, N)`.**


To prevent gradient explosion during the computation above and to convert the scores into probabilities, two additional operations are performed:

- **Scaling**: Divide each score by $\sqrt{d_k}$. Here, $d_k$ is a scaling factor that ensures stable training when models are stacked deeply. For a designed Transformer model, $d_k$ is a constant, typically calculated as the data dimension divided by the number of attention heads.
- **Softmax**: Transform the score matrix into a weight matrix $\alpha_{i,j}$ ranging between $0$ and $1$.

$$
\alpha_{i,j} = \text{softmax}\left(\frac{Q_i K_j^T}{\sqrt{d_k}}\right)
$$


The computational workflow of these two steps is highlighted by the red box in the diagram below: The resulting softmax-processed matrix $\alpha_{i,j}$ maintains a shape of `(N, N)`. In the diagram below, since the text contains only 6 tokens, the matrix shape is `(6, 6)`.


![image.png](/images/blog/一文彻底搞懂Transformer模型的Encoder结构与计算流程-4.png)


With the weight matrix $\alpha_{i,j}$ obtained above, we can use it to aggregate all Values (i.e., the V matrix):


$$
\text{Output}_i = \sum_{j} \alpha_{i,j} V_j
$$



As illustrated in the red box of the diagram below: Assuming the text contains $N$ tokens and each token has a vector length of `dimension`, this computation is a matrix multiplication between an `(N × N)` matrix (the weight matrix computed from Q and K) and an `(N × dimension)` matrix, resulting in a final shape of `(N × dimension)`.


![image.png](/images/blog/一文彻底搞懂Transformer模型的Encoder结构与计算流程-5.png)


At this point, the computation of the self-attention Q, K, and V matrices in the Encoder module is complete. The entire Encoder takes data of shape `(N, dimension)` as input and yields an output of shape `(N, dimension)`, demonstrating that the data dimensions remain unchanged.


**Wait! There is another question: Earlier, during the embedding and transformation of individual tokens, it was clearly stated that each token's vector length is 768. However, in the final V matrix operation above, the V matrix clearly has a shape of `(6, 64)` instead of `(6, 768)`, and the final output is also `(6, 64)` rather than `(6, 768)`? This brings up the concept of Multi-Head Attention.**


## 2.3 Multi-Head Attention


Let's examine the complete block diagram of the Multi-Head Self-Attention Block: On the left are the Q, K, and V matrices for all input tokens, with a data shape of `(N, 3 × dimension)`; on the right is the output of this multi-head attention module, with a shape of `(N, dimension)`.


![image.png](/images/blog/一文彻底搞懂Transformer模型的Encoder结构与计算流程-6.png)


**The section marked by the red box below indicates that the operations of the entire attention module are split into 12 independent, parallel computational modules executed simultaneously, with their results concatenated at the end—this is the essence of "multi-head" attention.**


For example, if the diagram above contains 6 tokens and each token has a data dimension of 768, then for the entire self-attention module, the input consists of three independent `(6, 768)` matrices representing the Q, K, and V vectors of the 6 tokens. In the multi-head setup, the computation is split into 12 heads, and the input data is similarly divided into 12 independent groups. For each token's Q, K, and V vectors, the 768-length vector is split into 12 segments, where each segment has a length of $768 / 12 = 64$ (which explains the dimension 64 appearing in the V matrix calculation above). Consequently, **for each head, the input data dimension becomes three independent `(6, 64)` matrices (for the Q, K, and V vectors), the output of a single head is also of shape `(6, 64)`, and after all heads finish computing, their outputs are concatenated back to `(6, 768)`.**

> This is what multi-head attention means: the Q, K, and V vectors of each input token are evenly divided into $N$ parts, processed simultaneously in parallel, and then concatenated. The dimensions of the input and output data remain consistent.

The following code snippet provides a deeper understanding of the working workflow of the multi-head self-attention mechanism:


```python
class MultiHeadAttention(nn.Module):
    def __init__(self, embed_dim, num_heads):
        super().__init__()
        self.num_heads = num_heads
        self.head_dim = embed_dim // num_heads
        assert embed_dim % num_heads == 0, "embed_dim must be divisible by num_heads"
        # Weight calculation and parameter matrices for Q, K, and V vectors
        self.q_linear = nn.Linear(embed_dim, embed_dim)
        self.k_linear = nn.Linear(embed_dim, embed_dim)
        self.v_linear = nn.Linear(embed_dim, embed_dim)
        self.out_linear = nn.Linear(embed_dim, embed_dim)

    def forward(self, query, key, value, mask=None):
        batch_size = query.size(0)
        # Compute Q, K, and V vectors
        Q = self.q_linear(query).view(batch_size, -1, self.num_heads, self.head_dim).transpose(1, 2)
        K = self.k_linear(key).view(batch_size, -1, self.num_heads, self.head_dim).transpose(1, 2)
        V = self.v_linear(value).view(batch_size, -1, self.num_heads, self.head_dim).transpose(1, 2)
        # Compute score matrix based on Q and K vectors
        scores = torch.matmul(Q, K.transpose(-2, -1)) / math.sqrt(self.head_dim)
        if mask is not None:
            scores = scores.masked_fill(mask == 0, float('-inf'))
        # Apply softmax to the score matrix
        attention_weights = torch.softmax(scores, dim=-1)
        # Aggregate the score matrix with the V vector
        attended_output = torch.matmul(attention_weights, V)
        # Concatenate multi-head outputs
        attended_output = attended_output.transpose(1, 2).contiguous().view(batch_size, -1, self.num_heads * self.head_dim)
        output = self.out_linear(attended_output)
        return output
```


## 3.0 Feed Forward


The feed-forward network in the Encoder module is relatively simple. It is essentially implemented by **sandwiching a non-linear activation function between two linear layers** to achieve non-linear transformations of the output data, while keeping the input and output dimensions as `(N, dimension)`:


```python
class PositionwiseFeedForward(nn.Module):
    def __init__(self, embed_dim, ff_dim):
        super().__init__()
        self.linear1 = nn.Linear(embed_dim, ff_dim)
        self.relu = nn.ReLU()
        self.linear2 = nn.Linear(ff_dim, embed_dim)

    def forward(self, x):
        return self.linear2(self.relu(self.linear1(x)))
```


## 4.0 Complete Encoder Block


The block diagram of a complete Encoder Block is shown below:


![image.png](/images/blog/一文彻底搞懂Transformer模型的Encoder结构与计算流程-7.png)


As can be seen, a single encoder block simply consists of a multi-head attention module and its residual connection, followed by a feed-forward network module and its residual connection. Building upon our understanding of the multi-head attention and feed-forward modules, the execution flow of the encoder block becomes easy to follow:


```python
class EncoderLayer(nn.Module):
    def __init__(self, embed_dim, num_heads, ff_dim, dropout_rate):
        super().__init__()
        self.self_attn = MultiHeadAttention(embed_dim, num_heads) # Multi-Head Attention module
        self.feed_forward = PositionwiseFeedForward(embed_dim, ff_dim) # Feed-Forward Network module
        self.norm1 = nn.LayerNorm(embed_dim)
        self.norm2 = nn.LayerNorm(embed_dim)
        self.dropout = nn.Dropout(dropout_rate)

    def forward(self, x, mask=None):
	    # Compute Multi-Head Attention module
        attn_output = self.self_attn(x, x, x, mask)
        # Residual connection and layer normalization for multi-head attention
        x = self.norm1(x + self.dropout(attn_output))
        # Forward computation of the feed-forward network module
        ff_output = self.feed_forward(x)
        # Residual connection and layer normalization for feed-forward network
        x = self.norm2(x + self.dropout(ff_output))
        return x
```


At this point, the complete computational workflow of a single Encoder Block is clear. **Note that for a single encoder block, both the input and output data dimensions are identical—specifically `(N, dimension)`—making it straightforward to stack multiple encoder blocks sequentially to form the complete Transformer architecture.**


## 5.0 Complete Transformer Encoder Architecture


Revisiting the complete Transformer Encoder architecture, it is now easy to understand:

- First is the data preprocessing part. Input text and other sequence data undergo tokenization and vectorization, converting each token into a fixed-length vector. Positional encodings are then added to produce position-encoded vectors of the same dimension, which are fed into the Encoder for processing. The data dimension is `(N, dimension)`.
- Next is the core of the Transformer Encoder architecture: a sequence of stacked Encoder Blocks, where the input and output data dimensions of each encoder block remain `(N, dimension)`.
- Finally, the output layer, which is tailored specifically according to application requirements.

![image.png](/images/blog/一文彻底搞懂Transformer模型的Encoder结构与计算流程-8.png)


## References

- [Transformer Explainer: LLM Transformer Model Visually Explained](https://poloclub.github.io/transformer-explainer/)
- [How Transformers Work: A Detailed Exploration of Transformer Architecture | DataCamp](https://www.datacamp.com/tutorial/how-transformers-work)
- [Transformer Architecture : Part 1- Encoder | by Abhishek Jain | Medium](https://medium.com/@abhishekjainindore24/transformer-architecture-part-1-encoder-d90835db56b5)
- [Working of Encoders in Transformers - GeeksforGeeks](https://www.geeksforgeeks.org/deep-learning/working-of-encoders-in-transformers/)