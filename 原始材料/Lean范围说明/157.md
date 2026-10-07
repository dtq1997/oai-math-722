# Graph coloring, clique minors, and Colin de Verdière invariants

The following describes the scope of the Lean formalization related to the following accompanying paper(s):

- [A linear list-coloring bound in terms of the Hadwiger number](../../preprints/A-linear-list-coloring-bound-in-terms-of-the-Hadwiger-number-September-23-2026/paper.pdf)

## Scope

The Linear List Hadwiger conjecture asks for a universal linear bound on list chromatic number in terms of clique-minor size. The formalization proves that there is one integer $C\ge1$ such that every finite nonempty simple graph $G$ satisfies $\chi_{\mathrm{list}}(G)\le C h(G)$, where $h(G)$ is the largest order of a clique minor. The constant is independent of the graph.

## Comparator links

| Result | Comparator statement |
| --- | --- |
| Linear list-coloring bound in the Hadwiger number | [ListHadwiger.lean](../ComparatorChallenges/ListHadwiger.lean) |
