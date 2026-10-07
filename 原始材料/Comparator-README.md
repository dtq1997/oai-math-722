# [Comparator](https://github.com/leanprover/comparator) challenges

Install `comparator`, `landrun`, and `lean4export`, and make them available on `PATH`.
Then, from `lean/`:

```sh
lake update
lake exe cache get
lake env comparator ComparatorChallenges/QuasiRiemannHypothesis.json
```
