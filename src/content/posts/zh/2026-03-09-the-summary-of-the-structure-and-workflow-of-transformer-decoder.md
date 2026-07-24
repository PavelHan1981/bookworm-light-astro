---
title: "一文彻底搞懂Transformer模型的Decoder结构与计算流程"
slug: "2026-03-09-the-summary-of-the-structure-and-workflow-of-transformer-decoder"
description: "本文详细总结了Transformer模型架构中Decoder部分的总体网络结构，以及数据在其中的运算和流转流程。"
date: 2026-03-09T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["AI"]
tags: ["LLM","Transformer"]
draft: false
---


本文详细总结了Transformer模型架构中Decoder部分的总体网络结构，以及数据在其中的运算和流转流程。


之前在[一文彻底搞懂Transformer模型的Encoder结构与计算流程](https://www.pavelhan.tech/article/2026-02-22-transformer-encoder-structure-and-workflow)一文中，详细整理了Transformer模型的Encoder架构，本文继续学习和解析Transformer的Decoder的结构以及完整的计算流程。因为Decoder与Encoder的模型结构与计算流程非常类似，所以最好参考[一文彻底搞懂Transformer模型的Encoder结构与计算流程](https://www.pavelhan.tech/article/2026-02-22-transformer-encoder-structure-and-workflow)以及[如何理解Transformer架构中的多头注意力机制？](https://www.pavelhan.tech/article/2026-02-23-how-to-understand-multi-head-attention-in-transformer)把Transformer的自注意力概率与计算流程先搞清楚。


下图是一个完整的Transformer Encoder-Decoder的网络架构：

- 左侧为连续N个Encoder Block组成的Transformer Encoder，用于实现把输入的自然语言文本转换为向量表示的语义信息。
- 右侧为连续N个Decoder Block组成的Transformer Decoder，用于基于Encoder输出的语义信息的向量表示来实现自然语言功能的输出，如机器翻译，文本续写等。

![image.png](/images/blog/一文彻底搞懂Transformer模型的Decoder结构与计算流程-1.png)


## Decoder的输入和输出


Transformer的输入和输出结构如下图所示。


![image.png](/images/blog/一文彻底搞懂Transformer模型的Decoder结构与计算流程-2.png)


Decoder的输入包含两部分数据：

- 下方输入（Outputs Shifted Right）：用于执行掩码自注意力 (Masked Self-Attention)计算。**其内容是模型已生成的 Token 序列，从而让模型知道“我已经说了什么”。**
- 中间输入（来自Encoder提取的语义向量）：用于执行交叉注意力 (Cross Attention)计算。其输入内容是基于 Encoder 的语义向量计算得到的 K 和 V 矩阵，让模型知道“源句子的意思是什么”。其计算逻辑是 Decoder 会用自己的 Q（我想找哪个语义）去跟 Encoder 的 K, V 进行匹配。

Decoder的输出为上图最上方的Output Probilities。**输出内容的维度等于模型输出词表大小（Vocabulary Size）的向量**。通过最后的 `Linear` 层和 `Softmax` 层处理之后，这个向量代表了模型输出词表中每一个单词作为“下一个输出单词”出现的概率分布。通常选取概率最大的那个索引（Index），然后去字典里查出对应的单词作为下一个输出单词。


### Outputs shifted right输入与自回归预测


**以上提到Decoder下方输入Outputs Shifted Right的内容是模型已生成的 Token 序列，这个在推理流程中要如何理解？**


在初始状态下，模型是没有输出的，此时 Outputs Shifted Right 部分的输入内容就是一个起始信号 `<SOS>`（Start of Sentence）。此时模型会根据 Encoder 的语义和起始信号，在Decoder端执行一次前向推理，预测生成第一个词（例如 `Hello`）。接下来，新生成的这个词 `hello` 就会被接入到decoder的输入端，此时decoder的输入序列就变成：`[<SOS>, Hello]`，模型继续基于这个新的输入序列执行前向推理，预测出第二个词 `world`，第二个词同样被接入到输入端，这样输入端的输入序列就变成 `[<SOS>, Hello, World]`，依此类推，直到最终模型预测输出的结果为


`<EOS>`（End of Sentence，结束符），此时推理停止。


以上就是Decoder执行前向推理预测生成一个个单词的完整流程，因为每生成一个单词，这个单词都会被重新拼接到输入预测序列的最后，用于推理新的单词，这个过程也就是所谓的自回归预测过程。


## Decoder Block的结构


Transformer 中的Decoder部分由多个相同的Decoder Block组成，其主要功能是根据Encoder所提供的语义表示（如上图中Encoder部分的输出）和先前已生成的输出标记（如上图中的Outputs Shifted Right部分）生成最终的输出序列。


![image.png](/images/blog/一文彻底搞懂Transformer模型的Decoder结构与计算流程-3.png)


每个Decoder Block由三个主要子层组成：

- Masked Multi-Head Attention：与编码器的自注意力机制类似，但其主要目的是防止关注未来的 token，以保持自回归属性（确保生成过程中不会作弊）。
- Multi-Head Attention：该子层允许解码器关注编码器输出表示的相关部分。这使得解码器能够专注于输入的相关部分，这对于翻译等任务至关重要。
- Feed Forward：前馈神经网络，该子层处理屏蔽自注意力和编码器-解码器注意力机制的组合输出。

**从网络结构和推理的计算流程上，Multi-Head Attention多头注意力模块与Feed Forward前馈模块与Encoder的相应模块没有差异，主要的区别在于Masked Multi-Head Attention模块以及Encoder输出作为Decoder输入的交叉注意力机制上。**


### Masked Multi-Head Attention


从工程实现的角度看，Masked Self-Attention（掩码自注意力）和 普通的 Self-Attention 在代码结构以及计算流程上 90% 是相同的。**唯一的差异只是两个注意力的视野范围不同：**

- 普通的 Self-Attention (例如Encoder 使用自注意力模型)：该模块对一段文本进行语义提取的时侯，可以同时看到从开头到结尾的所有词，因此可以根据全句的语境来理解每一个词，并提取其语义，因此普通的Self-Attention模块的视野范围是全局的。
- Masked Self-Attention (Decoder 使用)：在使用掩膜自注意力模块的时候，当前词的输出只能参考之前已经输出的词，不能参考尚未在当前词位置后边的词。也就是说，掩膜自注意力模块的视野氛围是历史视角，即只能看到之前的词。

Masked Self-Attention在计算中的历史视角这一点，对于训练过程非常关键。


因为在训练阶段，训练样本中包含有针对某个问题的完整的正确答案序列。为了提高效率，训练过程的执行，不是像推理解码那样一个词一个词地跑 N 遍模型，而是把整个序列一次性输入，然后执行一次矩阵运算，通过一次推理得到答案序列。这样的话，如果采用普通的自注意力模块就会存在一个问题，在解码器生成文本的过程中，位置在前面的词会看到后面的词，这样的话，后面位置的词就会对前面位置的词产生影响，相当于模型在训练的过程中直接把答案看到了，这当然是模型训练不希望看到的情况。


此时，就可以在执行注意力的矩阵运算的过程中，如下图所示，通过一个三角掩码矩阵，在数学上强制让第 t 个词只能看到第 1 到第 t 个词，无法看到后面的词。这样就既实现了并行化训练，同时又完美模拟了无法看到未来的因果律。


![image.png](/images/blog/一文彻底搞懂Transformer模型的Decoder结构与计算流程-4.png)


相应的，Masked Self-Attention模块的计算公式就变成了：


$$
\text{Attention}(Q, K, V) = \text{softmax}(\frac{QK^T}{\sqrt{d_k}} + M)V
$$


其中，M 是一个下三角矩阵。其逻辑如下：

- 对于所有 j > i 的位置（即当前位置之后的词），将 $M_{ij}$设为 $-\infty $。
- 对于所有 j ≤ i 的位置（即当前和之前的词），将 $M_{ij}$设为 0。
> 注意：在正常的前向推理过程中，模型实际上是执行一次前向推理生成一个token，在这种情况下，每次执行前向推理时，通过outputs shift right传递给decoder模块的文本序列自然就不存在未来的token（因为这个时候未来的token还没有生成），这样的话，这个掩码机制其实根本就没必要了。只不过因为训练的过程中，Transformer中的参数都是在有掩码的情况下生成的，所以如果在前向推理的过程中，把这个掩膜自注意力模块去掉，可能会导致参数数值分布的细微偏移，从而影响预测的准确性。所以，即使前向推理推理过程实际上已经不再需要掩膜机制，仍然需要保留这个掩膜自注意力模块机制，确保模型在推理阶段的输出与训练阶段输出的准确性基本一致。

### Encoder的输出与交叉注意力


在Encoder的自注意力（Self-Attention）机制的实现中，Q、K、V 全部来自同一个输入。而对于Decoder的多头注意力模块而言，其输入来源于两个不同的来源，这就是所谓的交叉注意力机制：

- Query (Q)来自于 Decoder 上一层的输出，实际上也就是掩膜注意力模块的输出。其语义内涵代表“我已经生成了这些词，我现在需要寻找什么样的上下文信息来翻译下一个词？”
- Key (K) 和 Value (V)则来自于 Encoder 的最终输出。其语义内涵表示“原文（源语言）中每个词的特征和含义是什么？”

因此，对于交叉注意力机制，可以把它想象成 Decoder 持有问题（Q），去 Encoder 的知识库（K, V）中寻找答案。


如下图所示，基于Decoder前一模块的输出，与 Wq 矩阵运算得到 Queries；基于Encoder 的输出分别于 Wk 和Wv 矩阵运算得到Keys和Values，然后基于Queries、Keys和Values调用相同的注意力机制的计算流程（可参考[如何理解Transformer架构中的多头注意力机制？](https://www.pavelhan.tech/article/2026-02-23-how-to-understand-multi-head-attention-in-transformer)），得到交叉注意力模块的计算结果。


![image.png](/images/blog/一文彻底搞懂Transformer模型的Decoder结构与计算流程-5.png)


## Decoder部分的工作流程总结


最后再来总结一下整个Decoder部分的工作流程如下。


![image.png](/images/blog/一文彻底搞懂Transformer模型的Decoder结构与计算流程-6.png)


首先是从outputs shifted right端输入模型推理输出的Token序列，这个token序列会使用与Encoder相同的预处理方式，对token进行向量化（Embedding）并增加位置编码信息。


第二步是掩膜自注意力模块的处理流程，其输入是叠加了位置编码信息的Token向量序列，这部分计算流程在前文的`Masked Multi-Head Attention` 已做了非常详细的解释。掩膜自注意力模块的输出通过标准的Add & Norm进行残差连接和层归一化。


第三步是交叉注意力模块的处理流程，这部分计算流程在前文的 `Encoder的输出与交叉注意力` 已做了详细的解释。同样，其输出通过标准的Add & Norm进行残差连接和层归一化。


第四步是由两层全连接神经网络所组成的前馈网络Feed Forward。其作用是在经过了两次注意力机制（掩膜自注意力和交叉注意力）后，对提取到的复杂特征进行非线性变换和进一步的维度提取。最后仍然通过 Add & Norm 进行残差连接和层归一化。


以上的第二步到第四步的处理流程构成了一个Decoder Block，每个Decoder Block的输入数据和输出数据的维度相同。整个Decoder 部分包含有N个Decoder Block，上一步Decoder Block的输出作为下一个Decoder Block的输出，直到N个Decoder Block处理完毕。


最后是输出结构的转换层，包含两个部分：线性层和Linear和Softmax层。

- Linear (线性层)：全连接映射层，用于将 Decoder 提取出来的抽象向量（例如 512维，768维等）投射到一个巨大的空间，即模块输出所能支持的完整词表的空间。如果输出的字典里有 30000 个单词，那么这一层的输出维度就是 30000。
- Softmax (归一化层)：通过Softmax 将线性层输出的原始数值（Logits）转换为概率分布，最终输出一个预测概率向量，每个位置的值代表词典中对应单词成为下一个词的概率。接下来系统就根据预测概率向量，选取概率最高的单词作为结果输出，并反馈回底部的输入端，开始下一个词的预测。

## 参考资料

- [Architecture and Working of Transformers in Deep Learning - GeeksforGeeks](https://www.geeksforgeeks.org/deep-learning/architecture-and-working-of-transformers-in-deep-learning/)
- [How Transformers Work: A Detailed Exploration of Transformer Architecture | DataCamp](https://www.datacamp.com/tutorial/how-transformers-work)
- [Cross-Attention Mechanism in Transformers - GeeksforGeeks](https://www.geeksforgeeks.org/nlp/cross-attention-mechanism-in-transformers/)
