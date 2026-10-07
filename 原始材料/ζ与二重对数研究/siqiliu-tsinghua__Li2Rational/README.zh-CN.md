# Li2Rational

[English](README.md) | 中文

本项目尝试用 Lean 4 形式化证明二重对数

$$\mathrm{Li}_2(r)=\sum_{n\ge 1}\frac{r^n}{n^2}$$

在某些有理点 $`r\in\mathbb{Q}`$ 处的无理性。

2026 年 9 月 17 日，Aabir Fauzan 给出了 $`\zeta(5)`$ 的无理性证明 [1]。这一证明很快有了 Lean 形式化 [2, 3]；博客 Persiflage [4] 还指出，调整 Fauzan 的参数取法，可以用同一方法统一处理 $`\zeta(k)`$，$`k=2,3,4,5`$。2026 年 9 月 28 日，唐乾（GitHub：dtq1997）利用 Fauzan 的方法给出了 $`\mathrm{Li}_2(1/2)`$ 的无理性证明 [5]。本项目是对唐乾的方法的进一步推广，主要结果如下。

## 主要结果

以下各数都是无理数（$`p`$、$`q`$、$`k`$ 为正整数，分数不要求既约）：

1. **单位分数**：$`\mathrm{Li}_2(1/k)`$，$`k\ge 2`$；$`\mathrm{Li}_2(-1/k)`$，$`k\ge 1`$。
2. **小分子**：
   - $`\mathrm{Li}_2(2/k)`$，$`k\ge 13`$；$`\mathrm{Li}_2(-2/k)`$，$`k\ge 16`$；
   - $`\mathrm{Li}_2(3/k)`$，$`k\ge 56`$；$`\mathrm{Li}_2(-3/k)`$，$`k\ge 62`$；
   - $`\mathrm{Li}_2(4/k)`$，$`k\ge 183`$；$`\mathrm{Li}_2(-4/k)`$，$`k\ge 194`$。
3. **一般分子**：
   - $`\mathrm{Li}_2(p/q)`$，$`p\ge 5`$、$`q\ge 0.1851\,p^{84/17}`$；
   - $`\mathrm{Li}_2(-p/q)`$，$`p\ge 5`$、$`q\ge 0.1851\,p^{84/17}+\tfrac{27}{17}\,p`$。
4. **阈值表**：对下表中的 $`p`$，当 $`q\ge Q_+`$ 时 $`\mathrm{Li}_2(p/q)`$ 是无理数，当 $`q\ge Q_-`$ 时 $`\mathrm{Li}_2(-p/q)`$ 是无理数。这些阈值不超过第 3 条公式给出的值，大多更小。

| $`p`$ | $`Q_+`$ | $`Q_-`$ |
|---:|---:|---:|
| 5 | 520 | 535 |
| 6 | 1286 | 1304 |
| 7 | 2764 | 2786 |
| 8 | 5355 | 5380 |
| 9 | 9591 | 9618 |
| 10 | 16149 | 16180 |
| 11 | 25871 | 25905 |
| 12 | 39775 | 39812 |
| 13 | 59079 | 59120 |
| 14 | 85212 | 85256 |
| 15 | 119834 | 119882 |
| 16 | 164852 | 164902 |
| 17 | 222435 | 222489 |
| 18 | 295034 | 295088 |
| 19 | 385393 | 385453 |
| 20 | 496571 | 496634 |
| 25 | 1495709 | 1495788 |
| 50 | 45951536 | 45951694 |
| 100 | 1411702110 | 1411702424 |
| 1000 | 123287652417772 | 123287652420948 |

## 形式化与验证

- 上述全部结论合为一条定理：[`lean/RationalCheck.lean`](lean/RationalCheck.lean) 中的
  `Li2RationalAcceptance.originalStatement`。陈述中的 $`\mathrm{Li}_2`$ 直接写成上面的级数，
  只用到 Mathlib 的定义，不含本项目自己的任何定义。
- 该定理只依赖 Lean 的三条标准公理 `propext`、`Classical.choice`、`Quot.sound`。
- 另用 [comparator](https://github.com/leanprover/comparator) 做了独立验收：以
  [`lean/Challenge.lean`](lean/Challenge.lean) 为题面核对陈述，并用 Lean 内核与
  [nanoda](https://github.com/ammkrn/nanoda_lib) 两个内核分别重新检查全部证明。复现方法见下文。
- 工具链：Lean `v4.30.0-rc2`，Mathlib `5450b53e`。构建方法：

  ```sh
  cd lean
  lake exe cache get
  lake build
  ```

  在 24 核、32 GB 内存的笔记本电脑上，全量构建约需 17 分钟。

### 用 comparator 复现独立验收

comparator 的配置是 [`lean/comparator.json`](lean/comparator.json)：题面模块 `Challenge`，解答模块
`RationalCheck`，要核对的定理 `Li2RationalAcceptance.originalStatement`，只允许三条标准公理，并启用
nanoda。

我们使用的版本是 comparator `0b0648d`（lean4export `048394e` 随 comparator 一起构建）、nanoda_lib
`3a24072` 和 landrun `5e9a0d1`。各工具的构建方法与安全前提见
[comparator 的 README](https://github.com/leanprover/comparator)。landrun 依赖 Linux 的 Landlock 沙箱，
因此只能在 Linux 上运行；comparator 的 README 还建议在 Linux 7.1 之前的内核上用 `systemd-run` 包一层，
以规避 landrun 的一个已知漏洞。

先完成上面的构建，然后在 `lean` 目录下运行：

```sh
COMPARATOR_LANDRUN=/path/to/landrun \
COMPARATOR_LEAN4EXPORT=/path/to/lean4export \
COMPARATOR_NANODA=/path/to/nanoda_bin \
lake env /path/to/comparator comparator.json
```

通过时，输出中会分别有 `Nanoda kernel accepts the solution` 和 `Lean default kernel accepts the solution`
两行，最后一行是 `Your solution is okay!`。

在上述笔记本电脑上，一次检查用时约 2 小时 30 分钟，内存峰值约 8 GB。comparator 先运行 nanoda，再运行
Lean 内核重放，两者都是单线程的，所以耗时较长。

如果嫌耗时太久，可以给 comparator 打上补丁 [`lean/comparator-parallel.patch`](lean/comparator-parallel.patch)：
它让 nanoda 按环境变量 `COMPARATOR_NANODA_THREADS` 指定的线程数运行，并与 Lean 内核重放同时进行，两个内核都
接受才算通过。用这个补丁并设 16 个线程，一次检查约需 1 小时 35 分钟，内存峰值约 11 GB。注意，这个补丁修改了
comparator 本身，用打过补丁的 comparator 得到的结果是否可靠，请使用者自行判断。

## 致谢

感谢唐乾（GitHub：dtq1997）与我分享他的 Li2NegHalf-2026-09-27 代码。

本项目在 OpenAI 的 GPT-6-Astra 和 Anthropic 的 Claude Opus 5.5 协助下完成。

## 许可

本项目采用 Apache License 2.0，见 [LICENSE](LICENSE)。项目中改编自其他项目的代码及其来源见
[NOTICE](NOTICE)，并在对应源文件的文件头中逐一注明。

## 参考文献

1. A. Fauzan, *ζ(5) is irrational*, preprint, Zenodo, 2026.
   [doi:10.5281/zenodo.22826419](https://doi.org/10.5281/zenodo.22826419)
2. M. Firsching, *mo271/Zeta5*：Fauzan 证明的 Lean 形式化。<https://github.com/mo271/Zeta5>
3. C. Del Solar, *domino14/zeta5*：Fauzan 证明的 Lean 形式化。<https://github.com/domino14/zeta5>
4. Persiflage, *zeta(5) is irrational*, 2026-09-24.
   <https://galoisrepresentations.org/2026/09/24/zeta5-is-irrational/>
5. 唐乾, *dtq1997/li2-half-irrationality*：$`\mathrm{Li}_2(1/2)`$ 无理性的 Lean 证明。
   <https://github.com/dtq1997/li2-half-irrationality>
