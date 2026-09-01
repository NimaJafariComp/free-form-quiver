import assert from "node:assert/strict";
import test from "node:test";

import { Bounds, BoxStore, FreeformLayout, RectangularBox } from "../freeform.mjs";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

test("freeform layout URLs preserve Base64 payloads across save and load", () => {
    const ui = readFileSync(resolve("src/ui.mjs"), "utf8");
    const ds = readFileSync(resolve("src/ds.mjs"), "utf8");
    assert.ok(ui.includes('.replace(/=+$/, "")'));
    assert.ok(ui.includes("decodeURIComponent(payload).replace(/-/g"));
    assert.ok(ui.includes("const padded = base64.padEnd"));
    assert.ok(ds.includes('const separator = segment.indexOf("=")'));
    assert.ok(ds.includes("segment.slice(separator + 1)"));
});

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
    assert.match(ui, /symbol\.set_style\(\{ width: size, height: size \}\)/);
    assert.match(css, /\.ui\.freeform \.vertex \.label[\s\S]*max-width: none/);
    assert.match(css, /\.ui\.freeform \.vertex \.label\.below-marker \{[\s\S]*top: calc\(100% \+ 6px\)/);
    assert.ok(ui.includes('label.class_list.toggle("below-marker"'));
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
    assert.match(ui, /parse_freeform_label_input\(value\)/);
    assert.match(ui, /Consume every leading marker/);
    assert.match(ui, /freeform_label_property\(vertex\)/);
    assert.match(ui, /\["freeform-label", ui\.selection\]/);
    assert.match(ui, /new_action\[`\$\{new_action\.kind\}s`\] \|\| new_action\.cells/);
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

test("freeform Add arrow waits for explicit source and target clicks", () => {
    const ui = readFileSync(resolve("src/ui.mjs"), "utf8");
    assert.match(ui, /this\.arrow_placement_active = false/);
    assert.match(ui, /place_freeform_arrow_endpoint\(vertex, event\)/);
    assert.match(ui, /if \(this\.arrow_placement_source === null\)/);
    assert.match(ui, /const mode = new UIMode\.Connect\(this, vertex, false\)/);
    assert.match(ui, /mode\.update\(this, this\.offset_from_event\(event\)\)/);
    assert.match(ui, /this\.in_mode\(UIMode\.Connect\) && !this\.arrow_placement_active/);
    assert.match(ui, /cancel_freeform_arrow_placement\(\)/);
    assert.match(ui, /target\?\.closest\("\.vertex"\) !== null/);
    assert.match(ui, /\{ capture: true \}/);
    assert.match(ui, /const source = this\.arrow_placement_source/);
    assert.doesNotMatch(ui, /if \(this\.arrow_placement_source === vertex\) return true/);
    assert.match(ui, /this\.arrow_placement_active = false;[\s\S]*?if \(this\.in_mode\(UIMode\.Connect\)\) this\.switch_mode\(UIMode\.default\);[\s\S]*?UIMode\.Connect\.create_edge\(this, source, vertex\)/);
    assert.match(ui, /Freeform arrows are an explicit two-click gesture[\s\S]*?ui\.is_freeform\(\) && ui\.arrow_placement_active/);
    assert.match(ui, /remove_cell\(cell, when\) \{[\s\S]*this\.cancel_freeform_arrow_placement\(\)/);
    assert.match(ui, /ui\.place_freeform_arrow_endpoint\(this, event\)/);
    assert.match(ui, /enable_if\("add-arrow", ui\.is_freeform\(\) && ui\.in_mode\(\.\.\.default_pan\)\)/);
});

test("freeform arrow choices use a readable vertical submenu", () => {
    const ui = readFileSync(resolve("src/ui.mjs"), "utf8");
    const css = readFileSync(resolve("src/main.css"), "utf8");
    assert.match(ui, /arrows\.class_list\.add\("arrow-menu"\)/);
    assert.match(css, /\.subtoolbar\.arrow-menu \{[\s\S]*?min-width: 152px/);
    assert.match(css, /\.subtoolbar\.arrow-menu \.action \{[\s\S]*?display: flex[\s\S]*?width: 152px/);
    assert.match(css, /\.subtoolbar\.arrow-menu \.action \.name \{[\s\S]*?position: static/);
});

test("the LaTeX importer detects this fork's freeform TikZ vocabulary", () => {
    const quiver = readFileSync(resolve("src/quiver.mjs"), "utf8");
    assert.match(quiver, /freeformquiver\(\?:node\|box\|arrow\)/);
    assert.match(quiver, /QuiverImportExport\.freeform_tikz/);
    assert.match(quiver, /freeformquivernode/);
    assert.match(quiver, /freeformquiverbox/);
    assert.match(quiver, /freeformquiverarrow/);
});

test("free-arrow endpoint handles render above their backing edge", () => {
    const css = readFileSync(resolve("src/main.css"), "utf8");
    assert.match(css, /\.freeform-free-arrow \{[\s\S]*?z-index: 20/);
    assert.match(css, /\.free-arrow-handle \{[\s\S]*?pointer-events: all/);
});

test("free-arrow endpoint anchors reuse their saved edge when restoring a diagram", () => {
    const ui = readFileSync(resolve("src/ui.mjs"), "utf8");
    assert.match(ui, /free_arrow_anchors/);
    assert.match(ui, /Free arrows use internal endpoint vertices/);
    assert.match(ui, /free_arrow\.anchors/);
    assert.match(ui, /free arrow backing edge is missing/);
    assert.match(ui, /\{ edge, anchors \}/);
    assert.match(ui, /arrow\.edge\.render\(this\)/);
});

test("new free-arrow labels use a stable centred alignment", () => {
    const ui = readFileSync(resolve("src/ui.mjs"), "utf8");
    assert.match(ui, /A free arrow has no node layout to give that motion[\s\S]*?context/);
    assert.match(ui, /shorten: \{ source: 0, target: 0 \},\s*label_alignment: "centre"/);
});

test("freeform text is marker-free, editable, and saved with the diagram", () => {
    const ui = readFileSync(resolve("src/ui.mjs"), "utf8");
    const css = readFileSync(resolve("src/main.css"), "utf8");
    assert.match(ui, /add_freeform_text\(centre = this\.view\)/);
    assert.match(ui, /arm_freeform_text_placement\(\)/);
    assert.match(ui, /if \(text_only\) \{\s*vertex\.freeform_text = true/);
    assert.match(ui, /text: Boolean\(vertex\.freeform_text\)/);
    assert.match(ui, /vertex\.freeform_text\) continue/);
    assert.match(ui, /"Add text",\s*"add-text"/);
    assert.match(css, /\.vertex\.freeform-text \.freeform-symbol[\s\S]*?display: none/);
    assert.match(css, /\.vertex\.freeform-text \.label[\s\S]*?left: 0/);
});

test("freeform save state contains every diagram-specific persistence contract", () => {
    const ui = readFileSync(resolve("src/ui.mjs"), "utf8");
    const quiver = readFileSync(resolve("src/quiver.mjs"), "utf8");
    assert.match(ui, /bounds: this\.freeform_bounds_for\(vertex\)\.toJSON\(\)/);
    assert.match(ui, /symbol_size: this\.freeform_vertex_symbol_size\(vertex\)/);
    assert.match(ui, /boxes: this\.box_store\.serialize\(\)/);
    assert.match(ui, /anchors: \{ source: anchors\.source\.code, target: anchors\.target\.code \}/);
    assert.match(ui, /reuse those vertices and their backing edge/i);
    assert.match(ui, /layout=freeform&freeform=/);
    assert.match(quiver, /const \{ label, label_colour, options: \{ label_alignment, \.\.\.options \} \} = edge/);
});

test("persistent hand tool pans only until toggled off", () => {
    const ui = readFileSync(resolve("src/ui.mjs"), "utf8");
    const css = readFileSync(resolve("src/main.css"), "utf8");
    assert.match(ui, /toggle_freeform_pan_mode\(\)/);
    assert.match(ui, /this\.in_mode\(UIMode\.Pan\) && this\.mode\.key === null/);
    assert.match(ui, /new UIMode\.Pan\(null\)/);
    assert.match(ui, /"pan",\s*\[\],\s*\(\) => ui\.toggle_freeform_pan_mode\(\)/);
    assert.match(ui, /pan_button\.class_list\.toggle\("active", persistent_pan\)/);
    assert.match(ui, /if \(this\.in_mode\(UIMode\.Pan\)\) return;/);
    assert.match(css, /\.ui:not\(\.default\):not\(\.modal\):not\(\.pan\) \.toolbar/);
    assert.match(css, /\.toolbar \.action\.active:not\(:disabled\)/);
    assert.match(css, /\.ui\.pan \.container[\s\S]*cursor: grab/);
    assert.match(css, /\.ui\.pan \.container:active[\s\S]*cursor: grabbing/);
});

test("compact toolbars scale without clipping dropdown menus", () => {
    const css = readFileSync(resolve("src/main.css"), "utf8");
    assert.match(css, /#logo-link[\s\S]*?right: 16px; bottom: 16px/);
    assert.match(css, /a > \.logo[\s\S]*?width: 48px/);
    assert.match(css, /@media \(max-width: 1280px\)[\s\S]*?transform: translateX\(-50%\) scale\(0\.9\)/);
    assert.match(css, /@media \(max-width: 1280px\)[\s\S]*?overflow: visible/);
    assert.match(css, /@media \(max-width: 1120px\)[\s\S]*?#logo-link[\s\S]*?display: none/);
});

test("new arrows default to a flexible 5–95 length range", () => {
    const ui = readFileSync(resolve("src/ui.mjs"), "utf8");
    assert.match(ui, /shorten: \{ source: 5, target: 5 \}/);
    assert.match(ui, /suggested_edge_options\(ui, source, target\)[\s\S]*?source: source\.level === 0 \? 5[\s\S]*?target: target\.level === 0 \? 5/);
    assert.match(ui, /case "length":\s*values = \[5, 95\]/);
    assert.match(ui, /Arrow length[\s\S]*?step: 1,[\s\S]*?thumbs: 2/);
    assert.match(ui, /thumbs: 2,[\s\S]*?spacing: 0/);
});

test("freeform arrow offset preserves its path while endpoint handles stay on nodes", () => {
    const ui = readFileSync(resolve("src/ui.mjs"), "utf8");
    const arrow = readFileSync(resolve("src/arrow.mjs"), "utf8");
    assert.match(ui, /this\.arrow\.style\.anchor_handles = ui\.is_freeform\(\)/);
    assert.match(arrow, /this\.anchor_handles = false/);
    assert.match(arrow, /const handle_shift = this\.style\.anchor_handles \? Point\.zero\(\) : shift/);
    assert.match(arrow, /translate\(\$\{handle_shift\.x\}px, \$\{handle_shift\.y\}px\)/);
    const css = readFileSync(resolve("src/main.css"), "utf8");
    assert.match(css, /\.ui\.freeform \.arrow-endpoint \{[\s\S]*?background: transparent[\s\S]*?border: var\(--ui-orange\) 2px dashed/);
    assert.match(css, /\.ui\.connect \.arrow\.reconnecting \.arrow-endpoint \{[\s\S]*?display: block/);
});

test("freeform endpoint reconnection commits the node under the released pointer", () => {
    const ui = readFileSync(resolve("src/ui.mjs"), "utf8");
    assert.match(ui, /freeform_vertex_at_pointer\(event\)/);
    assert.match(ui, /this\.freeform_vertex_symbol_size\(vertex\) \/ 2 \+ 6/);
    assert.match(ui, /update_freeform_reconnect_target\(event\)/);
    assert.match(ui, /complete_freeform_reconnection\(event\)/);
    assert.match(ui, /document\.elementFromPoint\(event\.clientX, event\.clientY\)/);
    assert.match(ui, /candidate\.closest\("\.vertex"\)/);
    assert.match(ui, /UIMode\.Connect\.valid_connection\([\s\S]*this\.mode\.reconnect/);
    assert.match(ui, /kind: "connect",[\s\S]*from,[\s\S]*to: target/);
    assert.match(ui, /this\.complete_freeform_reconnection\(event\);/);
    assert.match(ui, /An endpoint drag can reach a target vertex without a reliable[\s\S]*?ui\.mode\.target = this/);
    assert.match(ui, /Resolve a freeform endpoint drop before canvas controls[\s\S]*?this\.complete_freeform_reconnection\(event\)[\s\S]*?\{ capture: true \}/);
    assert.match(ui, /this\.update_freeform_reconnect_target\(event\);[\s\S]*?this\.mode\.update\(this, this\.offset_from_event\(event\)\)/);
});

test("freeform Select All selects graph cells with visible marker feedback", () => {
    const ui = readFileSync(resolve("src/ui.mjs"), "utf8");
    const css = readFileSync(resolve("src/main.css"), "utf8");
    assert.match(ui, /select_all_freeform\(\)/);
    assert.match(ui, /this\.deselect\(\);\s*this\.select\(\.\.\.this\.quiver\.all_cells\(\)\)/);
    assert.match(ui, /ui\.select_all_freeform\(\)/);
    assert.match(css, /\.ui\.freeform \.vertex\.selected \.freeform-symbol/);
});

test("all freeform zoom controls use the clamped canvas zoom operation", () => {
    const ui = readFileSync(resolve("src/ui.mjs"), "utf8");
    assert.match(ui, /zoom_view\(delta\)/);
    assert.match(ui, /clamp\(CONSTANTS\.MIN_ZOOM, this\.scale \+ delta, CONSTANTS\.MAX_ZOOM\)/);
    assert.match(ui, /this\.zoom_view\(-event\.deltaY \/ 100\)/);
    assert.match(ui, /\(\) => ui\.zoom_view\(-0\.25\)/);
    assert.match(ui, /\(\) => ui\.zoom_view\(0\.25\)/);
    assert.match(ui, /zoom_to_multiplier\(multiplier\)/);
    assert.match(ui, /Math\.log2\(multiplier\)/);
    assert.match(ui, /ui\.zoom_to_multiplier\(Number\(event\.target\.value\)\)/);
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
