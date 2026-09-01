# Free Form Quiver

[![Free Form Quiver](src/quiver.svg "Free Form Quiver")](https://github.com/NimaJafariComp/free-form-quiver)

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

## Features

Free Form Quiver retains Quiver's efficient arrow editor while adding independent placement for
every item. It supports traditional commutative diagrams as well as free-positioned figures,
including pullbacks, pushouts, adjunctions, and higher cells.

Free Form Quiver keeps each object's position independent, so labels and nearby objects do not
force the rest of the diagram to move.

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
