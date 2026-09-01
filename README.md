# Free Form Quiver

[![Free Form Quiver](screenshots/title.png "Free Form Quiver")](https://github.com/NimaJafariComp/free-form-quiver)

**Free Form Quiver** is a graphical editor for commutative diagrams, wiring diagrams, and
annotated figures. It is a fork of [Quiver](https://github.com/varkor/quiver) that replaces its
grid-first layout with an independent, free-positioned canvas.

Place nodes, text, arrows, and boxes wherever they belong; moving or resizing one item never
reflows another. Diagrams can be saved in their share URL, reloaded without losing freeform
geometry or styling, and exported as SVG, PNG, or absolute-coordinate TikZ.

[commutative]: https://en.wikipedia.org/wiki/Commutative_diagram
[pasting diagrams]: https://ncatlab.org/nlab/show/pasting+diagram
[LaTeX]: https://www.latex-project.org/
[tikz-cd]: https://github.com/astoff/tikz-cd
[Typst]: https://typst.app/
[fletcher]: https://typst.app/universe/package/fletcher/

## What is different from Quiver?

- **Freeform canvas.** Nodes have independent positions and can overlap when appropriate.
- **Free arrows.** Add arrows with two draggable invisible endpoints, without creating visible
  nodes. They use the same style, label, and arrowhead controls as connected arrows.
- **Standalone text.** Add editable LaTeX text anywhere on the canvas, with font and size controls.
- **Diagram boxes.** Add and resize definition or problem-bank containers without changing their
  contents' layout.
- **Reliable persistence.** Save and reload freeform diagrams while preserving item positions,
  arrow geometry, labels, styles, and text formatting.
- **Figure-ready export.** Export clean SVG or PNG images, or TikZ that Free Form Quiver can import
  again. For compiling freeform TikZ, use the companion
  [`freeform-quiver` package](package/README.md).

## Getting started

Run the editor locally:

```sh
git clone https://github.com/NimaJafariComp/free-form-quiver.git
cd free-form-quiver
make
make serve
```

Then open [http://localhost:8000](http://localhost:8000). Use the toolbar to add nodes, connected
arrows, free arrows, standalone text, and boxes. Save to update the shareable diagram URL.

Run the checks with:

```sh
make test
```

For the original Quiver keyboard workflow and conventional commutative-diagram features, see the
[upstream tutorial](https://github.com/varkor/quiver/blob/master/tutorial.md).

## Features & screenshots

Free Form Quiver retains Quiver's efficient arrow editor while adding independent placement for
every item. It supports traditional commutative diagrams as well as free-positioned figures,
including pullbacks and pushouts,

[![Pullback](screenshots/pullback.png "Pullback")](http://q.uiver.app/?q=WzAsNSxbMSwyLCJBIl0sWzIsMSwiQiJdLFsyLDIsIkMiXSxbMSwxLCJBIFxcdGltZXNfQyBCIl0sWzAsMCwiWCJdLFswLDIsImYiLDJdLFsxLDIsImciXSxbMywwLCJcXHBpXzEiLDJdLFszLDEsIlxccGlfMiJdLFs0LDAsImEiLDIseyJjdXJ2ZSI6M31dLFs0LDEsImIiLDAseyJjdXJ2ZSI6LTN9XSxbNCwzLCJcXGxhbmdsZSBhLCBiIFxccmFuZ2xlIiwxLHsic3R5bGUiOnsiYm9keSI6eyJuYW1lIjoiZGFzaGVkIiwibGV2ZWwiOjF9fX1dLFszLDIsIiIsMSx7InN0eWxlIjp7Im5hbWUiOiJjb3JuZXIifX1dXQ==)

adjunctions,

[![Adjunction](screenshots/adjunction.png "Adjunction")](https://q.uiver.app/?q=WzAsMixbMCwwLCJcXG1hdGhzY3IgQyJdLFsyLDAsIlxcbWF0aHNjciBEIl0sWzAsMSwiRiIsMCx7ImN1cnZlIjotMn1dLFsxLDAsIkciLDAseyJjdXJ2ZSI6LTJ9XSxbMiwzLCIiLDAseyJsZXZlbCI6MSwic3R5bGUiOnsibmFtZSI6ImFkanVuY3Rpb24ifX1dXQ==)

and higher cells.

[![3-cell](screenshots/3-cell.png "3-cell")](https://q.uiver.app/?q=WzAsNCxbMCwwLCJYJyJdLFsxLDAsIlgiXSxbNCwwLCJZIl0sWzUsMCwiWSciXSxbMCwxLCJ4Il0sWzIsMywieSIsMl0sWzEsMiwiIiwwLHsiY3VydmUiOi0yfV0sWzEsMiwiIiwyLHsiY3VydmUiOjJ9XSxbMCwzLCJmJyIsMCx7ImN1cnZlIjotNX1dLFswLDMsImcnIiwyLHsiY3VydmUiOjV9XSxbOCw2LCJcXHZhcnBoaSIsMix7Imxlbmd0aCI6NzB9XSxbNyw5LCJcXGdhbW1hIiwwLHsibGVuZ3RoIjo3MH1dLFs2LDcsIlxcY2hpIiwyLHsib2Zmc2V0Ijo1LCJsZW5ndGgiOjcwfV0sWzYsNywiXFx1cHNpbG9uIiwwLHsib2Zmc2V0IjotNSwibGVuZ3RoIjo3MH1dLFsxMiwxMywiXFxtdSIsMCx7Imxlbmd0aCI6NzB9XV0=)

Free Form Quiver keeps each object's position independent, so labels and nearby objects do not
force the rest of the diagram to move.

[![Flexible grid](screenshots/flexible-grid.png "Flexible grid")](https://q.uiver.app/?q=WzAsMyxbMCwwLCIoQSBcXG90aW1lcyBJKSBcXG90aW1lcyBCIl0sWzIsMCwiQSBcXG90aW1lcyAoSSBcXG90aW1lcyBCKSJdLFsxLDEsIkEgXFxvdGltZXMgQiJdLFswLDIsIlxccmhvX0EgXFxvdGltZXMgQiIsMl0sWzEsMiwiQSBcXG90aW1lcyBcXGxhbWJkYV9CIl0sWzAsMSwiXFxhbHBoYV97QSwgSSwgQn0iXV0=)

[![Arrow styles](screenshots/styles.png "Arrow styles")](https://q.uiver.app/?q=WzAsMTYsWzAsMCwiXFxidWxsZXQiXSxbMSwwLCJcXGJ1bGxldCJdLFswLDEsIlxcYnVsbGV0Il0sWzEsMSwiXFxidWxsZXQiXSxbMCwyLCJcXGJ1bGxldCJdLFsxLDIsIlxcYnVsbGV0Il0sWzAsMywiXFxidWxsZXQiXSxbMSwzLCJcXGJ1bGxldCJdLFszLDAsIlxcYnVsbGV0Il0sWzIsMCwiXFxidWxsZXQiXSxbMywxLCJcXGJ1bGxldCJdLFsyLDEsIlxcYnVsbGV0Il0sWzMsMiwiXFxidWxsZXQiXSxbMiwyLCJcXGJ1bGxldCJdLFszLDMsIlxcYnVsbGV0Il0sWzIsMywiXFxidWxsZXQiXSxbMCwxLCIiLDAseyJzdHlsZSI6eyJ0YWlsIjp7Im5hbWUiOiJtb25vIn0sImJvZHkiOnsibmFtZSI6ImRhc2hlZCIsImxldmVsIjoxfX19XSxbMiwzLCIiLDAseyJzdHlsZSI6eyJ0YWlsIjp7Im5hbWUiOiJtYXBzIHRvIn0sImJvZHkiOnsibmFtZSI6ImRvdHRlZCIsImxldmVsIjoxfSwiaGVhZCI6eyJuYW1lIjoiZXBpIn19fV0sWzQsNSwiIiwwLHsic3R5bGUiOnsidGFpbCI6eyJuYW1lIjoiaG9vayIsInNpZGUiOiJ0b3AifSwiYm9keSI6eyJuYW1lIjoic3F1aWdnbHkiLCJsZXZlbCI6MX0sImhlYWQiOnsibmFtZSI6ImhhcnBvb24iLCJzaWRlIjoidG9wIn19fV0sWzYsNywiIiwwLHsic3R5bGUiOnsidGFpbCI6eyJuYW1lIjoiaG9vayIsInNpZGUiOiJib3R0b20ifSwiYm9keSI6eyJuYW1lIjoiYmFycmVkIiwibGV2ZWwiOjF9LCJoZWFkIjp7Im5hbWUiOiJoYXJwb29uIiwic2lkZSI6ImJvdHRvbSJ9fX1dLFs4LDksImYiLDIseyJvZmZzZXQiOjJ9XSxbOCw5LCJnIiwwLHsib2Zmc2V0IjotMn1dLFsxMCwxMSwiIiwwLHsibGV2ZWwiOjIsInN0eWxlIjp7ImJvZHkiOnsibmFtZSI6InNxdWlnZ2x5IiwibGV2ZWwiOjF9fX1dLFsxMiwxMywiIiwwLHsibGVuZ3RoIjoyMCwic3R5bGUiOnsiYm9keSI6eyJsZXZlbCI6MX19fV0sWzE0LDE1LCIiLDAseyJjdXJ2ZSI6MiwibGV2ZWwiOjMsInN0eWxlIjp7ImJvZHkiOnsibmFtZSI6ImJhcnJlZCIsImxldmVsIjoxfSwiaGVhZCI6eyJuYW1lIjoiZXBpIn19fV1d)

There is a wide range of composable arrow styles.

[![Colours](screenshots/colour-picker.png "Colours")](https://q.uiver.app/?q=WzAsNSxbMSwxLCJBIFxcdGltZXNfQyBCIixbMCw2MCw2MCwxXV0sWzIsMSwiQiIsWzI0MCw2MCw2MCwxXV0sWzEsMiwiQSIsWzI0MCw2MCw2MCwxXV0sWzIsMiwiQyIsWzI0MCw2MCw2MCwxXV0sWzAsMCwiWCIsWzEyMCw2MCw2MCwxXV0sWzAsMSwiIiwwLHsiY29sb3VyIjpbMCw2MCw2MF19XSxbMCwyLCIiLDIseyJjb2xvdXIiOlswLDYwLDYwXX1dLFsyLDMsImciLDIseyJjb2xvdXIiOlsyNDAsNjAsNjBdfSxbMTgwLDYwLDYwLDFdXSxbMSwzLCJmIiwwLHsiY29sb3VyIjpbMjQwLDYwLDYwXX0sWzE4MCw2MCw2MCwxXV0sWzAsMywiIiwwLHsiY29sb3VyIjpbMCw2MCw2MF0sInN0eWxlIjp7Im5hbWUiOiJjb3JuZXIifX1dLFs0LDIsImEiLDIseyJjdXJ2ZSI6MiwiY29sb3VyIjpbMTIwLDYwLDYwXX0sWzYwLDYwLDYwLDFdXSxbNCwxLCJiIiwwLHsiY3VydmUiOi0yLCJjb2xvdXIiOlsxMjAsNjAsNjBdfSxbNjAsNjAsNjAsMV1dLFs0LDAsIiIsMSx7ImNvbG91ciI6WzMwMCw2MCw2MF0sInN0eWxlIjp7ImJvZHkiOnsibmFtZSI6ImRhc2hlZCJ9fX1dXQ)

And full use of colour for labels and arrows.

[![Screenshot mode](screenshots/grid-hidden.png "Screenshot mode")](https://q.uiver.app/?q=WzAsOCxbMCwwLCJHeCJdLFsxLDAsIkZ4Il0sWzIsMCwiR3giXSxbMywwLCJGeCJdLFswLDEsIkd5Il0sWzEsMSwiRnkiXSxbMiwxLCJHeSJdLFszLDEsIkZ5Il0sWzAsMSwiXFxiZXRhX3giXSxbMSwyLCJcXGFscGhhX3giXSxbMiwzLCJcXGJldGFfeCJdLFswLDQsIkdmIiwyXSxbNCw1LCJcXGJldGFfeSIsMl0sWzUsNiwiXFxhbHBoYV95IiwyXSxbNiw3LCJcXGJldGFfeSIsMl0sWzMsNywiRmYiXSxbMSw1LCJGZiIsMV0sWzIsNiwiR2YiLDFdLFs0LDEsIlxcYmV0YV9mIiwwLHsic2hvcnRlbiI6eyJzb3VyY2UiOjIwLCJ0YXJnZXQiOjIwfSwibGV2ZWwiOjJ9XSxbNSwyLCJcXGFscGhhX2YiLDAseyJzaG9ydGVuIjp7InNvdXJjZSI6MjAsInRhcmdldCI6MjB9LCJsZXZlbCI6Mn1dLFs2LDMsIlxcYmV0YSdmIiwwLHsic2hvcnRlbiI6eyJzb3VyY2UiOjIwLCJ0YXJnZXQiOjIwfSwibGV2ZWwiOjJ9XSxbMCwyLCIxIiwwLHsiY3VydmUiOi00fV0sWzUsNywiMSIsMix7ImN1cnZlIjo0fV0sWzEsMjEsIlxcdmFyZXBzaWxvbl94IiwwLHsic2hvcnRlbiI6eyJ0YXJnZXQiOjMwfX1dLFsyMiw2LCJcXGV0YV95IiwyLHsic2hvcnRlbiI6eyJzb3VyY2UiOjMwfX1dXQ==)

Free Form Quiver is intended to look good for screenshots and production figures, with SVG and PNG
exports that reflect the freeform canvas.

[![Keyboard hints](screenshots/hints.png "Keyboard hints")](https://q.uiver.app/?q=WzAsMixbMCwwLCJBIl0sWzEsMCwiQiJdLFswLDEsImYiXV0=)

Diagrams may be created and modified using either the mouse, by clicking and dragging, or using the keyboard, with a complete set of keyboard shortcuts for performing any action.

[![Export to LaTeX](screenshots/export.png "Export to LaTeX")](https://q.uiver.app/?q=WzAsOCxbMCwwLCJHeCJdLFsxLDAsIkZ4Il0sWzIsMCwiR3giXSxbMywwLCJGeCJdLFswLDEsIkd5Il0sWzEsMSwiRnkiXSxbMiwxLCJHeSJdLFszLDEsIkZ5Il0sWzAsMSwiXFxiZXRhX3giXSxbMSwyLCJcXGFscGhhX3giXSxbMiwzLCJcXGJldGFfeCJdLFswLDQsIkdmIiwyXSxbNCw1LCJcXGJldGFfeSIsMl0sWzUsNiwiXFxhbHBoYV95IiwyXSxbNiw3LCJcXGJldGFfeSIsMl0sWzMsNywiRmYiXSxbMSw1LCJGZiIsMV0sWzIsNiwiR2YiLDFdLFs0LDEsIlxcYmV0YV9mIiwwLHsibGVuZ3RoIjo1MCwibGV2ZWwiOjJ9XSxbNSwyLCJcXGFscGhhX2YiLDAseyJsZW5ndGgiOjUwLCJsZXZlbCI6Mn1dLFs2LDMsIlxcYmV0YSdmIiwwLHsibGVuZ3RoIjo1MCwibGV2ZWwiOjJ9XSxbMCwyLCIxIiwwLHsiY3VydmUiOi00fV0sWzUsNywiMSIsMix7ImN1cnZlIjo0fV0sWzEsMjEsIlxcdmFyZXBzaWxvbl94IiwwLHsibGVuZ3RoIjo1MH1dLFsyMiw2LCJcXGV0YV95IiwyLHsibGVuZ3RoIjo1MH1dXQ==)

TikZ exports use Free Form Quiver's absolute-coordinate format and can be imported back into this
fork. The original grid-based `tikz-cd` importer remains available for compatible diagrams.

### Other features
- Multiple selection, making mass changes easy and fast.
- A history system, allowing you to undo/redo actions.
- Support for custom macro definitions: simply paste a URL corresponding to the file containing your `\newcommand`s.
- Export embeddable diagrams to HTML.
- Panning and zooming, for large diagrams.
- Smart label alignment and edge offset.

## Editor integration

See [Editor integration](https://github.com/varkor/quiver/wiki/Editor-integration) on the upstream
Quiver wiki.

## Building
Run `make` from the command line, then run `make serve` and open `localhost:8000` in your browser.
Run `make test` to check the freeform layout model and UI syntax.

If this fails, you might be using an incompatible version of Make or Bash. In this case, you can
manually download the [latest release](https://github.com/KaTeX/KaTeX/releases) of KaTeX and place
it under `src/` as `src/KaTeX/`. If KaTeX has not been given the correct path, you will get an
error telling you that KaTeX failed to load.

**quiver** must be run through `localhost`. If you have Python installed, an easy solution is to
run:
```
make serve
```
in the **quiver** directory and then open `localhost:8000` in browser.

If you find a Free Form Quiver issue, [open an
issue](https://github.com/NimaJafariComp/free-form-quiver/issues/new) with steps to reproduce it.

## Thanks to
- [varkor/quiver](https://github.com/varkor/quiver), the upstream project on which Free Form
  Quiver is based.
- [S. C. Steenkamp](https://www.cl.cam.ac.uk/~scs62/), for helpful discussions regarding the
aesthetic rendering of arrows.
- [AndréC](https://tex.stackexchange.com/users/138900/andr%c3%a9c), for the custom TikZ style for
curves of a fixed height.
- [Andrew Stacey](https://tex.stackexchange.com/users/86/andrew-stacey), for the custom TikZ style
for shortened curves.
- [Théophile Cailliau](https://github.com/tjbcg), for implementing Typst support.
- [Nathan Corbyn](https://github.com/doctorn), for adding the ability to export embeddable diagrams
to HTML.
- [Paolo Brasolin](https://github.com/paolobrasolin), for adding offline support.
- [Carl Davidson](https://github.com/davidson16807), for discussing and prototyping loop rendering.
- [Huangxin Dong](https://github.com/HuangxinDong), for improving the interface for custom macros.
- [Pantelis Panayiotou](https://github.com/plp13) and [QuantumSoul](https://github.com/BinaryQuantumSoul), for prototyping dark themes.
- Everyone who has improved **quiver** by submitting pull requests, reporting issues or suggesting
  improvements.
