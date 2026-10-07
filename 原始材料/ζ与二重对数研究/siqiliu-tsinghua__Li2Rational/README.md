# Li2Rational

English | [中文](README.zh-CN.md)

This project attempts to formalize in Lean 4 proofs of the irrationality of the dilogarithm

$$\mathrm{Li}_2(r)=\sum_{n\ge 1}\frac{r^n}{n^2}$$

at certain rational points $`r\in\mathbb{Q}`$.

On 17 September 2026, Aabir Fauzan gave a proof that $`\zeta(5)`$ is irrational [1]. The proof was soon formalized in Lean [2, 3], and the blog Persiflage [4] pointed out that, by changing Fauzan's choice of parameters, the same method handles $`\zeta(k)`$ for $`k=2,3,4,5`$ uniformly. On 28 September 2026, Qian Tang (GitHub: dtq1997) used Fauzan's method to prove that $`\mathrm{Li}_2(1/2)`$ is irrational [5]. This project extends Qian Tang's method further. The main results are as follows.

## Main results

Each of the following numbers is irrational ($`p`$, $`q`$, $`k`$ are positive integers; the fractions need not be in lowest terms):

1. **Reciprocals**: $`\mathrm{Li}_2(1/k)`$ for $`k\ge 2`$; $`\mathrm{Li}_2(-1/k)`$ for $`k\ge 1`$.
2. **Small numerators**:
   - $`\mathrm{Li}_2(2/k)`$ for $`k\ge 13`$; $`\mathrm{Li}_2(-2/k)`$ for $`k\ge 16`$;
   - $`\mathrm{Li}_2(3/k)`$ for $`k\ge 56`$; $`\mathrm{Li}_2(-3/k)`$ for $`k\ge 62`$;
   - $`\mathrm{Li}_2(4/k)`$ for $`k\ge 183`$; $`\mathrm{Li}_2(-4/k)`$ for $`k\ge 194`$.
3. **General numerators**:
   - $`\mathrm{Li}_2(p/q)`$ for $`p\ge 5`$ and $`q\ge 0.1851\,p^{84/17}`$;
   - $`\mathrm{Li}_2(-p/q)`$ for $`p\ge 5`$ and $`q\ge 0.1851\,p^{84/17}+\tfrac{27}{17}\,p`$.
4. **Threshold table**: for each $`p`$ in the table below, $`\mathrm{Li}_2(p/q)`$ is irrational whenever $`q\ge Q_+`$, and $`\mathrm{Li}_2(-p/q)`$ is irrational whenever $`q\ge Q_-`$. These thresholds never exceed the values given by the formulas in item 3, and most are smaller.

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

## Formalization and verification

- All the results above are combined into a single theorem,
  `Li2RationalAcceptance.originalStatement` in [`lean/RationalCheck.lean`](lean/RationalCheck.lean).
  In its statement $`\mathrm{Li}_2`$ is written directly as the series above; the statement uses
  only Mathlib definitions and none of this project's own.
- The theorem depends only on Lean's three standard axioms `propext`, `Classical.choice` and
  `Quot.sound`.
- The proof was also checked independently with [comparator](https://github.com/leanprover/comparator):
  it compares the statement against the challenge file [`lean/Challenge.lean`](lean/Challenge.lean),
  and the whole proof is rechecked by two kernels, the Lean kernel and
  [nanoda](https://github.com/ammkrn/nanoda_lib). See below for how to reproduce this check.
- Toolchain: Lean `v4.30.0-rc2`, Mathlib `5450b53e`. To build:

  ```sh
  cd lean
  lake exe cache get
  lake build
  ```

  A full build takes about 17 minutes on a laptop with 24 cores and 32 GB of memory.

### Reproducing the independent check with comparator

The comparator configuration is [`lean/comparator.json`](lean/comparator.json): challenge module
`Challenge`, solution module `RationalCheck`, theorem to check `Li2RationalAcceptance.originalStatement`,
only the three standard axioms permitted, and nanoda enabled.

We used comparator `0b0648d` (lean4export `048394e` is built together with comparator), nanoda_lib
`3a24072` and landrun `5e9a0d1`. See [comparator's README](https://github.com/leanprover/comparator) for
how to build these tools and for the assumptions behind the check. landrun relies on the Linux Landlock
sandbox, so the check runs only on Linux; comparator's README also recommends wrapping the run in
`systemd-run` on kernels older than Linux 7.1, to guard against a known landrun vulnerability.

After the build above, run the following in the `lean` directory:

```sh
COMPARATOR_LANDRUN=/path/to/landrun \
COMPARATOR_LEAN4EXPORT=/path/to/lean4export \
COMPARATOR_NANODA=/path/to/nanoda_bin \
lake env /path/to/comparator comparator.json
```

On success the output contains the two lines `Nanoda kernel accepts the solution` and
`Lean default kernel accepts the solution`, and its last line is `Your solution is okay!`.

On the laptop mentioned above, one check takes about 2 hours 30 minutes, with a peak memory use of
about 8 GB. comparator runs nanoda first and then the Lean kernel replay, both single-threaded, which is
why the check takes so long.

If this is too slow, you can apply the patch [`lean/comparator-parallel.patch`](lean/comparator-parallel.patch)
to comparator. It runs nanoda with the number of threads given by the environment variable
`COMPARATOR_NANODA_THREADS`, concurrently with the Lean kernel replay; the check succeeds only if both
kernels accept. With this patch and 16 threads, one check takes about 1 hour 35 minutes, with a peak
memory use of about 11 GB. Note that the patch modifies comparator itself; if you use a patched
comparator, judging the reliability of its result is your own responsibility.

## Acknowledgements

I thank Qian Tang (GitHub: dtq1997) for sharing his Li2NegHalf-2026-09-27 code with me.

This project was completed with the assistance of OpenAI's GPT-6-Astra and Anthropic's
Claude Opus 5.5.

## License

This project is licensed under the Apache License 2.0; see [LICENSE](LICENSE). Code adapted from other
projects and its sources are listed in [NOTICE](NOTICE), and each affected source file names its
source in its header.

## References

1. A. Fauzan, *ζ(5) is irrational*, preprint, Zenodo, 2026.
   [doi:10.5281/zenodo.22826419](https://doi.org/10.5281/zenodo.22826419)
2. M. Firsching, *mo271/Zeta5*: a Lean formalization of Fauzan's proof. <https://github.com/mo271/Zeta5>
3. C. Del Solar, *domino14/zeta5*: a Lean formalization of Fauzan's proof. <https://github.com/domino14/zeta5>
4. Persiflage, *zeta(5) is irrational*, 2026-09-24.
   <https://galoisrepresentations.org/2026/09/24/zeta5-is-irrational/>
5. Qian Tang, *dtq1997/li2-half-irrationality*: a Lean proof of the irrationality of
   $`\mathrm{Li}_2(1/2)`$. <https://github.com/dtq1997/li2-half-irrationality>
