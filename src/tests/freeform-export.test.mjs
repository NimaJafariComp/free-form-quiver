import assert from "node:assert/strict";
import test from "node:test";

import { freeform_content_bounds, freeform_svg, freeform_tikz } from "../freeform-export.mjs";

const scene = {
    nodes: [
        { id: "source", bounds: { x: 40, y: 80, width: 120, height: 64 }, label: "A" },
        { id: "target", bounds: { x: 440, y: 200, width: 120, height: 64 }, label: "B" },
    ],
    boxes: [{ id: "bank", kind: "problem-bank", title: "Problem bank", bounds: { x: 0, y: 0, width: 640, height: 360 } }],
    edges: [{ source: "source", target: "target", label: "f", options: { curve: 1, shorten: { source: 5, target: 20 }, style: { head: { name: "arrowhead" }, body: { name: "dashed" }, tail: { name: "none" } } } }],
};

test("freeform exporters use absolute scene bounds rather than grid positions", () => {
    assert.deepEqual(freeform_content_bounds(scene), { x: -24, y: -24, width: 688, height: 408 });
    const tikz = freeform_tikz(scene).data;
    assert.match(tikz, /\\freeformquiverbox\{0\}\{0\}\{640\}\{360\}/);
    assert.match(tikz, /\(qv-source\) to\[bend left=14\]/);
    assert.match(tikz, /shorten <=.*pt/);
    assert.match(tikz, /shorten >=.*pt/);
    assert.doesNotMatch(tikz, /tikzcd|Position|row sep/);
});

test("SVG includes semantic content but never the editor grid", () => {
    const svg = freeform_svg(scene);
    assert.match(svg, /<svg/);
    assert.match(svg, /Problem bank/);
    assert.match(svg, /<foreignObject/);
    assert.doesNotMatch(svg, /focus-point|static-grid|grid/);
});

test("SVG omits invisible editor frames and unrelated document styles", () => {
    const svg = freeform_svg({
        nodes: [{
            id: "node",
            bounds: { x: 0, y: 0, width: 32, height: 32 },
            symbol: "bullet",
            symbol_size: 18,
            frame: { background: "transparent", border: "rgb(0, 0, 0)", border_width: 0 },
        }],
        styles: "@font-face{src:url(fonts/KaTeX_Main.woff2)}.injected{outline:99px solid red}",
    });
    assert.match(svg, /stroke="none"/);
    assert.doesNotMatch(svg, /KaTeX_Main\.woff2|injected|outline:99px/);
});

test("raster SVG avoids foreign objects that taint canvas exports", () => {
    const svg = freeform_svg({
        nodes: [{ id: "node", bounds: { x: 0, y: 0, width: 32, height: 32 }, label: "A", symbol: "bullet", symbol_size: 18 }],
        edges: [{ source: "node", target: "node", label: "f", svg_markup: "<foreignObject><div>f</div></foreignObject><path d=\"M 0 0\"/>" }],
    }, { rasterize: true });
    assert.doesNotMatch(svg, /foreignObject/);
    assert.match(svg, />A<|>f</);
});

test("SVG includes node-independent free arrows", () => {
    const svg = freeform_svg({
        nodes: [],
        edges: [{ free: true, source_point: { x: 12, y: 20 }, target_point: { x: 96, y: 44 } }],
    });
    assert.match(svg, /qv-free-edge/);
    assert.match(svg, /M 12 20 L 96 44/);
    assert.deepEqual(freeform_content_bounds({ nodes: [], edges: [{
        free: true, source_point: { x: 12, y: 20 }, target_point: { x: 96, y: 44 },
    }] }), { x: -12, y: -4, width: 132, height: 72 });
});

test("TikZ preserves node-independent free arrows for re-import", () => {
    const tikz = freeform_tikz({ nodes: [], boxes: [], edges: [{
        free: true, source_point: { x: 12, y: 20 }, target_point: { x: 96, y: 44 },
    }] }).data;
    assert.match(tikz, /\\freeformquiverarrow\{12\}\{20\}\{96\}\{44\}/);
});

test("overflowing labels, external nodes, and arrow styles remain scene content", () => {
    const styles = ["cell", "dashed", "dotted", "squiggly", "barred", "double barred", "bullet solid", "bullet hollow"];
    const fixture = {
        nodes: [
            { id: "inside", bounds: { x: 80, y: 80, width: 80, height: 48 }, label: "very-long-label-that-overflows" },
            { id: "outside", bounds: { x: 800, y: 160, width: 80, height: 48 }, label: "outside" },
        ],
        boxes: [{ id: "definition", kind: "definition", title: "Definition", bounds: { x: 40, y: 40, width: 320, height: 220 } }],
        edges: styles.map((body, index) => ({
            source: "inside", target: "outside", level: index % 4 + 1,
            options: { curve: index % 2, style: { body: { name: body }, head: { name: index % 3 ? "arrowhead" : "none" }, tail: { name: "none" } } },
        })),
    };
    const svg = freeform_svg(fixture);
    assert.equal((svg.match(/class="qv-edge"/g) || []).length, styles.length);
    assert.match(svg, /very-long-label-that-overflows/);
    assert.match(svg, /x="800"/);
});
