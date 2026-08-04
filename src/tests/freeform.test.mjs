import assert from "node:assert/strict";
import test from "node:test";

import { Bounds, BoxStore, FreeformLayout, RectangularBox } from "../freeform.mjs";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

test("moving a node changes only that node's independent bounds", () => {
    const layout = new FreeformLayout();
    layout.set("R1", new Bounds(40, 60, 180, 90));
    layout.set("P6", new Bounds(360, 60, 180, 90));

    layout.move(["R1"], 120, 40);

    assert.deepEqual(layout.get("R1").toJSON(), { x: 160, y: 100, width: 180, height: 90 });
    assert.deepEqual(layout.get("P6").toJSON(), { x: 360, y: 60, width: 180, height: 90 });
});

test("freeform layout allows overlap and optional snapping", () => {
    const layout = new FreeformLayout({ snap: 20 });
    layout.set("first", new Bounds(0, 0, 100, 100));
    layout.set("second", new Bounds(20, 20, 100, 100));

    assert.deepEqual(layout.hitTest({ x: 40, y: 40 }), ["first", "second"]);
    assert.deepEqual(layout.snapPoint({ x: 31, y: 49 }), { x: 40, y: 40 });
});

test("freeform layout round-trips independent bounds", () => {
    const layout = new FreeformLayout({ snap: 16 });
    layout.set("schema:P8", new Bounds(640, 440, 480, 320));

    const restored = FreeformLayout.deserialize(layout.serialize());

    assert.equal(restored.snap, 16);
    assert.deepEqual(restored.get("schema:P8").toJSON(), {
        x: 640,
        y: 440,
        width: 480,
        height: 320,
    });
});

test("problem-bank boxes preserve bounds and ordered membership", () => {
    const boxes = new BoxStore();
    boxes.add(new RectangularBox({
        id: "bank:delivery",
        title: "Reusable problem bank",
        kind: "problem-bank",
        bounds: new Bounds(800, 80, 720, 920),
        members: ["schema:R1", "schema:P6", "schema:P8"],
    }));

    boxes.move("bank:delivery", 20, 40);
    boxes.resize("bank:delivery", new Bounds(820, 120, 760, 960));

    assert.deepEqual(boxes.serialize(), [{
        id: "bank:delivery",
        title: "Reusable problem bank",
        kind: "problem-bank",
        bounds: { x: 820, y: 120, width: 760, height: 960 },
        members: ["schema:R1", "schema:P6", "schema:P8"],
    }]);

    assert.equal(boxes.delete("bank:delivery"), true);
    assert.deepEqual(boxes.serialize(), []);
});

test("nodes may be inside or outside a box, but never overlap its border", () => {
    const box = new RectangularBox({
        id: "bank:delivery",
        bounds: new Bounds(100, 100, 400, 300),
    });
    const boxes = new BoxStore();
    boxes.add(box);

    assert.equal(boxes.hasNodeBorderCollision(new Bounds(160, 160, 120, 80)), false);
    assert.equal(boxes.hasNodeBorderCollision(new Bounds(540, 160, 120, 80)), false);
    assert.equal(boxes.hasNodeBorderCollision(new Bounds(40, 160, 120, 80)), true);
    assert.equal(boxes.canPlace(new Bounds(220, 220, 100, 60), [
        new Bounds(240, 240, 80, 40),
        new Bounds(560, 160, 120, 80),
    ]), true);
    assert.equal(boxes.canPlace(new Bounds(220, 220, 100, 60), [
        new Bounds(180, 240, 80, 40),
    ]), false);
});

test("freeform labels have no scale-to-fit constraint", () => {
    const ui = readFileSync(resolve("src/ui.mjs"), "utf8");
    const css = readFileSync(resolve("src/main.css"), "utf8");
    assert.match(ui, /freeform_vertex_symbol_size\(cell\)/);
    assert.match(css, /\.ui\.freeform \.vertex \.label[\s\S]*max-width: none/);
    assert.match(css, /\.ui\.freeform \.vertex\.selected \.content[\s\S]*background: transparent/);
});

test("freeform node placement is pointer-driven and symbol size is history-backed", () => {
    const ui = readFileSync(resolve("src/ui.mjs"), "utf8");
    assert.match(ui, /arm_freeform_node_placement\(\)/);
    assert.match(ui, /add_freeform_vertex\(this\.offset_from_event\(event\)\)/);
    assert.match(ui, /kind: "freeform-symbol-size"/);
    assert.match(ui, /\{ key: "N"/);
    assert.match(ui, /set_selected_freeform_vertex_symbol/);
});
