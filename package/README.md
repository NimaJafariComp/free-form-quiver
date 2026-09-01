# Free Form Quiver LaTeX packages

This directory contains the upstream [`quiver`](https://github.com/varkor/quiver) style package and
Free Form Quiver's `freeform-quiver` companion package. They provide the TikZ styles used by
diagrams exported from this fork.

# Licence

Both packages are distributed under the repository's [MIT License](../LICENSE). The bundled
`quiver.sty` remains subject to its upstream copyright notice.

## Upstream `quiver` package

`quiver.sty` is maintained upstream by [varkor](https://github.com/varkor). Its repository and
issue tracker are at [varkor/quiver](https://github.com/varkor/quiver).

## Freeform exports

`freeform-quiver.sty` is the companion package for the fork's absolute-coordinate
freeform TikZ export. Place it beside your `.tex` file and load it with
`\usepackage{freeform-quiver}`. It depends on the CTAN `quiver` package and TikZ.

Free Form Quiver-specific issues, including `freeform-quiver.sty`, should be reported at
[NimaJafariComp/free-form-quiver](https://github.com/NimaJafariComp/free-form-quiver/issues).
