# 算法论文 Schema

这份 schema 面向体系结构研究者阅读算法论文。它从上到下还原推理 workload 和执行链路，只记录原文支持的信息；缺失但重要的信息写 `未报告` 或 `FIX: info`。

不要补写原文之外的体系结构启发、优化机会、适用边界或瓶颈判断。原文未明确指出计算热点时，只记录 workflow 中可直接确认的高频调用模块。

## 私有逻辑链

正式写笔记前，先在心里回答这些问题；不需要逐项写进最终笔记：

```text
论文研究的任务是什么？
推理时输入、输出和调用形态是什么？
原始或目标推理 workflow 如何运行？
主干模型和附加模块分别是什么，规模是多少？
token / tensor / latent / state 的种类和数量由什么决定？
一次推理要调用哪些模块、多少次，哪些步骤必须串行等待？
原文明确指出的计算、memory、bandwidth、cache 或同步开销在哪里？
原文给了哪些精度、压缩、并行、异步或实现配置？
训练方法是否改变了推理时的结构、调用次数、state、质量或效率？
实验里哪些指标是质量，哪些指标是效率？硬件平台和推理设置是什么？
哪些影响推理效率的关键信息原文没有报告？
```

## 任务与调用形态

- 任务是什么。
- 输入模态、输入长度、分辨率、帧数、上下文窗口。
- 输出类型、输出长度、horizon、chunk size。
- 调用形态：单次推理、多轮交互、流式生成、闭环控制、agent loop、batch serving。

## 模型静态结构

- 主干模型类型。
- 参数量、层数、hidden size、head 数、expert 数。
- encoder、decoder、head、adapter、VAE、retriever、planner、controller 等附加模块。
- dense / sparse、single-stream / multi-stream、cascade / multi-stage 等结构。

## Token / Tensor / State 画像

- token 或 latent 种类：text、vision、video、audio、action、memory、query、retrieval。
- token 数量如何由输入尺寸、patch、frame、context、candidate、beam 等决定。
- 推理时保留的状态：KV cache、latent state、hidden state、external memory、history buffer。
- 哪些状态跨 step、跨 token、跨轮、跨 request 复用。

## 推理执行链路

- 输入预处理、编码、主干 forward、采样/搜索、解码、后处理的顺序。
- 是否存在 autoregressive decode、diffusion/flow denoise、beam/search、self-consistency、planner-controller loop、agent loop。
- 每个阶段调用哪个模块，调用多少次，哪些步骤必须串行等待。

## 调用次数与重复计算

- denoise steps、decode steps、rollout 次数、candidate 数、beam width、tool call 轮数。
- CFG、multi-sample、rerank、retry、ensemble、reflection 等导致的重复 forward。
- 原文是否提供减少重复计算的方法。

## 计算热点

- 原文明确指出的开销来源：attention、MLP、cross-attention、convolution、VAE、retrieval、reranker、decoder、sampling。
- 原文未明确指出时，只记录 workflow 中可直接确认的高频调用模块，不自行判断瓶颈。

## Memory / Bandwidth / Cache

- KV cache、activation、latent、retrieval index、history buffer、external memory。
- 显存占用、带宽、上下文长度上限、cache 复用、cache eviction、state compression。
- 原文未报告则写 `未报告`。

## 数值精度与压缩

- 推理精度：FP32、BF16、FP16、FP8、INT8、INT4、NF4、NVFP4 等。
- 压缩对象：weight、activation、KV cache、embedding、attention、MLP、latent、token。
- 压缩方法：quantization、pruning、distillation、low-rank、token pruning、frame dropping。
- 区分论文方法本身和实验实现配置。

## 并行性与调度

- batch、pipeline、tensor/model parallel、expert parallel。
- 阶段重叠、异步执行、streaming、speculative execution。
- 串行依赖和同步点。
- 只记录原文明确给出的策略或配置。

## 推理实验配置与指标

- 硬件平台、卡数、内存、软件栈。
- batch size、sequence length、resolution、frame count、sampling steps、temperature、top-k/top-p。
- 效率指标：latency、throughput、tokens/s、FPS、Hz、memory、energy、cost。
- 质量指标单独记录，不和效率指标混写。

## 图表记录规则

- 只嵌入支撑任务形态、模型结构、推理 workflow、关键机制和实验结果的图表。
- 图表必须靠近它服务的文字，并说明它回答了原文中的什么问题、支撑了哪条原文信息。
- 不根据图表补写作者没有明确陈述的瓶颈或体系结构结论。
- 如果提取工具漏掉关键图，在应该嵌图的位置写 `FIX: 手工嵌入 Figure/Table N`。
