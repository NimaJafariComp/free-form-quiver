import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

test("multi-slider releases from inspector controls and keeps handles independent", () => {
    const dom = readFileSync(resolve("src/dom.mjs"), "utf8");
    assert.match(dom, /this\.class_list\.toggle\("symmetric", event\.shiftKey\)/);
    assert.match(dom, /release_active_thumb/);
    assert.match(dom, /pointer_event\("up"\), release_active_thumb, \{ capture: true \}/);
    assert.match(dom, /pointer_event\("cancel"\), release_active_thumb, \{ capture: true \}/);
    assert.match(dom, /window\.addEventListener\("blur", release_active_thumb\)/);
});
