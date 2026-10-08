import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { parse_typst_diagram } from "../typst-import.mjs";

test("imports the original Typst node and edge syntax with coordinates and labels", () => {
    const source = String.raw`#align(center, diagram({
        node((0, 0), [$(i)$])
        node((1, 0), [$H = \{a^n | n \in \Z\}$])
        node((2, 0))
        edge((0, 0), (1, 0), [$\text{Projection}$], label-side: center, "->")
        edge((1, 0), (2, 0), [$\text{Sub (via} a^{n})$], label-side: center, "->")
        edge((2, 0), (0, 0), "<-")
    }))`;

    assert.deepEqual(parse_typst_diagram(source), {
        nodes: [
            { x: 0, y: 0, label: "(i)" },
            { x: 1, y: 0, label: String.raw`H = \{a^n | n \in \Z\}` },
            { x: 2, y: 0, label: "" },
        ],
        edges: [
            {
                source: { x: 0, y: 0 },
                target: { x: 1, y: 0 },
                label: String.raw`\text{Projection}`,
                direction: "->",
                centred_label: true,
            },
            {
                source: { x: 1, y: 0 },
                target: { x: 2, y: 0 },
                label: String.raw`\text{Sub (via} a^{n})`,
                direction: "->",
                centred_label: true,
            },
            {
                source: { x: 2, y: 0 },
                target: { x: 0, y: 0 },
                label: "",
                direction: "<-",
                centred_label: false,
            },
        ],
    });
});

test("rejects inputs that are not Typst diagram expressions", () => {
    assert.throws(() => parse_typst_diagram("#align(center, [])"), /diagram\(\.\.\.\)/);
    assert.throws(() => parse_typst_diagram("diagram({ edge((0, 0), (1, 0)) })"), /nodes were found/);
});

test("imports Typst coordinates as legacy grid positions", () => {
    const quiver = readFileSync(resolve("src/quiver.mjs"), "utf8");
    const ui = readFileSync(resolve("src/ui.mjs"), "utf8");
    assert.match(quiver, /ui\.set_layout_mode\("grid"\);[\s\S]*?new Vertex\(ui, vertex_label, new Position\(point\.x, point\.y\)\)/);
    assert.match(ui, /initial_parameters\.get\("r"\) === "typst"[\s\S]*?initial_parameters\.has\("freeform"\)[\s\S]*?\? "grid"\s*:\s*"freeform"/);
    assert.match(ui, /set_layout_mode\(layout_mode\)[\s\S]*?class_list\.toggle\("freeform", this\.is_freeform\(\)\)/);
});
