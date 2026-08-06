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

test("box membership is explicit and boxes cannot overlap", () => {
    const boxes = new BoxStore();
    boxes.add(new RectangularBox({ id: "bank-a", bounds: new Bounds(0, 0, 300, 200) }));
    boxes.add(new RectangularBox({ id: "bank-b", bounds: new Bounds(360, 0, 300, 200) }));

    assert.equal(boxes.addMember("bank-a", "inside-a"), true);
    assert.deepEqual(boxes.membersOf("bank-a"), ["inside-a"]);
    assert.equal(boxes.addMember("bank-b", "inside-a"), false);
    assert.equal(boxes.removeMember("bank-a", "inside-a"), true);
    assert.equal(boxes.canPlaceBox(new Bounds(200, 40, 100, 100)), false);
    assert.equal(boxes.canPlaceBox(new Bounds(700, 40, 100, 100)), true);
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
    assert.match(ui, /render_freeform_vertex_symbol\(vertex\)/);
    assert.match(css, /\.ui\.freeform \.vertex \.label[\s\S]*max-width: none/);
    assert.match(ui, /\? new Shape\.Endpoint\(Point\.zero\(\)\)/);
    assert.match(ui, /const content_size = freeform[\s\S]*ui\.freeform_vertex_symbol_size\(this\)/);
    assert.match(css, /\.ui:not\(\.freeform\) \.vertex\.selected \.content/);
    assert.match(css, /\.ui\.freeform \.vertex \.label \{[\s\S]*pointer-events: auto/);
    assert.match(ui, /ui\.is_freeform\(\) && ui\.in_mode\(UIMode\.PointerMove\)/);
    assert.match(ui, /The content element owns pointer events[\s\S]*new UIMode\.PointerMove/);
    assert.match(ui, /kind: "freeform-symbol"/);
    assert.match(ui, /fontSize = "26px"/);
    assert.match(ui, /migrate_legacy_freeform_symbol\(vertex\)/);
    assert.match(ui, /data\.version < 3/);
});

test("freeform node placement is pointer-driven and symbol size is history-backed", () => {
    const ui = readFileSync(resolve("src/ui.mjs"), "utf8");
    assert.match(ui, /arm_freeform_node_placement\(\)/);
    assert.match(ui, /add_freeform_vertex\(this\.offset_from_event\(event\)\)/);
    assert.match(ui, /kind: "freeform-symbol-size"/);
    assert.match(ui, /\{ key: "N"/);
    assert.match(ui, /set_selected_freeform_vertex_symbol/);
    assert.match(ui, /freeform_node_bounds_at\(centre\)/);
    assert.match(ui, /this\.freeform_node_size = 32/);
    assert.match(ui, /place_freeform_node_if_armed\(event\)/);
    assert.match(ui, /selection_surface\.listen\(pointer_event\("down"\)[\s\S]*place_freeform_node_if_armed/);
    assert.match(ui, /this\.freeform_layout\.set\(vertex, bounds\);\s*\/\/ The constructor[\s\S]*vertex\.render\(this\);/);
});

test("member nodes cross a box border atomically instead of stalling during drag", () => {
    const ui = readFileSync(resolve("src/ui.mjs"), "utf8");
    assert.match(ui, /resolve_freeform_drag_bounds\(vertex, proposed, delta\)/);
    assert.match(ui, /owner\.bounds\.x \+ owner\.bounds\.width/);
    assert.match(ui, /moved_bounds\.some\(\(\{ bounds \}\) => bounds === null\)/);
    assert.match(ui, /freeform_initial_bounds = ui\.is_freeform\(\)/);
    assert.match(ui, /this\.mode\.freeform_initial_bounds\.get\(vertex\)/);
});

test("selected boxes use the same properties input for title editing", () => {
    const ui = readFileSync(resolve("src/ui.mjs"), "utf8");
    assert.match(ui, /this\.label_input\.parent\.query_selector\("\.input-mode"\)\.replace\("Box title"\)/);
    assert.match(ui, /kind: "box-update"/);
    assert.match(ui, /selected_box\.title = title/);
    assert.match(ui, /this\.label_input\.listen\("blur"[\s\S]*box_title_before/);
});

test("properties controls isolate pointer-up events from canvas dismissal", () => {
    const ui = readFileSync(resolve("src/ui.mjs"), "utf8");
    assert.match(ui, /inspector as a request[\s\S]*pointer_event\("up"\)/);
    assert.match(ui, /label-input-container hidden[\s\S]*pointer_event\("up"\).*stopPropagation/);
    assert.match(ui, /this\.label_input\.listen\(pointer_event\("down"\), \(event\) => \{\s*event\.stopImmediatePropagation\(\);/);
    assert.match(ui, /event\.target\.closest\("\.label-input-container"\) !== null/);
    const css = readFileSync(resolve("src/main.css"), "utf8");
    assert.match(css, /\.label-input-container \{[\s\S]*z-index: 92/);
});

test("localhost does not retain a production service-worker cache", () => {
    const index = readFileSync(resolve("src/index.html"), "utf8");
    const worker = readFileSync(resolve("service-worker/build.js"), "utf8");
    assert.match(index, /location\.hostname === "localhost"/);
    assert.match(index, /registration\.unregister\(\)/);
    assert.match(worker, /skipWaiting: true/);
    assert.match(worker, /clientsClaim: true/);
});

test("box artwork remains behind nodes while box controls remain reachable", () => {
    const ui = readFileSync(resolve("src/ui.mjs"), "utf8");
    const css = readFileSync(resolve("src/main.css"), "utf8");
    assert.match(css, /\.diagram-box \{[\s\S]*z-index: auto/);
    assert.match(ui, /diagram-box__selection-surface/);
    assert.match(css, /\.diagram-box__selection-surface \{[\s\S]*z-index: 1/);
    assert.match(css, /\.diagram-box__header \{[\s\S]*z-index: 3/);
    assert.match(css, /\.diagram-box__resize \{[\s\S]*z-index: 3/);
});
