/// Independent world-space bounds used by the freeform layout mode.
export class Bounds {
    constructor(x, y, width, height) {
        if (![x, y, width, height].every(Number.isFinite)) {
            throw new Error("bounds must contain finite numbers");
        }
        if (width <= 0 || height <= 0) {
            throw new Error("bounds must have positive dimensions");
        }
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    static from(value) {
        return value instanceof Bounds
            ? value.clone()
            : new Bounds(value.x, value.y, value.width, value.height);
    }

    clone() {
        return new Bounds(this.x, this.y, this.width, this.height);
    }

    translate(dx, dy) {
        return new Bounds(this.x + dx, this.y + dy, this.width, this.height);
    }

    contains(point) {
        return point.x >= this.x && point.x <= this.x + this.width
            && point.y >= this.y && point.y <= this.y + this.height;
    }

    containsBounds(other) {
        return other.x >= this.x
            && other.y >= this.y
            && other.x + other.width <= this.x + this.width
            && other.y + other.height <= this.y + this.height;
    }

    intersects(other) {
        return this.x < other.x + other.width
            && this.x + this.width > other.x
            && this.y < other.y + other.height
            && this.y + this.height > other.y;
    }

    toJSON() {
        return { x: this.x, y: this.y, width: this.width, height: this.height };
    }
}

/// Stores independent bounds for Quiver cells. It deliberately has no occupancy rule.
export class FreeformLayout {
    constructor({ snap = 0 } = {}) {
        this.snap = snap;
        this.bounds = new Map();
    }

    set(id, bounds) {
        this.bounds.set(id, Bounds.from(bounds));
    }

    get(id) {
        const bounds = this.bounds.get(id);
        return bounds === undefined ? null : bounds.clone();
    }

    has(id) {
        return this.bounds.has(id);
    }

    delete(id) {
        this.bounds.delete(id);
    }

    move(ids, dx, dy) {
        for (const id of ids) {
            const bounds = this.bounds.get(id);
            if (bounds === undefined) {
                throw new Error(`cannot move unknown item: ${id}`);
            }
            this.bounds.set(id, bounds.translate(dx, dy));
        }
    }

    resize(id, bounds) {
        if (!this.bounds.has(id)) {
            throw new Error(`cannot resize unknown item: ${id}`);
        }
        this.set(id, bounds);
    }

    hasBorderCollision(bounds, boxes) {
        return boxes.hasNodeBorderCollision(bounds);
    }

    pointFromScreen({ x, y }, { viewX = 0, viewY = 0, scale = 1 } = {}) {
        return { x: x / scale + viewX, y: y / scale + viewY };
    }

    snapPoint({ x, y }) {
        if (!Number.isFinite(this.snap) || this.snap <= 0) {
            return { x, y };
        }
        return {
            x: Math.round(x / this.snap) * this.snap,
            y: Math.round(y / this.snap) * this.snap,
        };
    }

    hitTest(point) {
        return Array.from(this.bounds.entries())
            .filter(([, bounds]) => bounds.contains(point))
            .map(([id]) => id);
    }

    serialize() {
        return {
            version: 1,
            layout: "freeform",
            snap: this.snap,
            items: Object.fromEntries(Array.from(this.bounds.entries()).map(([id, bounds]) => [
                id,
                bounds.toJSON(),
            ])),
        };
    }

    static deserialize(data) {
        if (data?.version !== 1 || data.layout !== "freeform" || typeof data.items !== "object") {
            throw new Error("invalid freeform layout document");
        }
        const layout = new FreeformLayout({ snap: data.snap || 0 });
        for (const [id, bounds] of Object.entries(data.items)) {
            layout.set(id, bounds);
        }
        return layout;
    }
}

/// A non-connectable rectangular canvas entity for grouping problems or definitions.
export class RectangularBox {
    constructor({ id, title = "", bounds, kind = "definition", members = [] }) {
        if (!id) {
            throw new Error("box id is required");
        }
        if (!["definition", "problem-bank"].includes(kind)) {
            throw new Error(`unsupported box kind: ${kind}`);
        }
        this.id = id;
        this.title = title;
        this.bounds = Bounds.from(bounds);
        this.kind = kind;
        this.members = Array.from(new Set(members));
    }

    setMembers(members) {
        this.members = Array.from(new Set(members));
    }

    toJSON() {
        return {
            id: this.id,
            title: this.title,
            kind: this.kind,
            bounds: this.bounds.toJSON(),
            members: this.members,
        };
    }
}

export class BoxStore {
    constructor() {
        this.boxes = new Map();
    }

    add(box) {
        if (this.boxes.has(box.id)) {
            throw new Error(`box already exists: ${box.id}`);
        }
        this.boxes.set(box.id, box);
    }

    get(id) {
        return this.boxes.get(id) || null;
    }

    move(id, dx, dy) {
        const box = this.get(id);
        if (box === null) {
            throw new Error(`unknown box: ${id}`);
        }
        box.bounds = box.bounds.translate(dx, dy);
    }

    resize(id, bounds) {
        const box = this.get(id);
        if (box === null) {
            throw new Error(`unknown box: ${id}`);
        }
        box.bounds = Bounds.from(bounds);
    }

    hasNodeBorderCollision(nodeBounds) {
        return Array.from(this.boxes.values()).some((box) => {
            return box.bounds.intersects(nodeBounds) && !box.bounds.containsBounds(nodeBounds);
        });
    }

    canPlace(bounds, nodeBounds) {
        return nodeBounds.every((node) => {
            return !bounds.intersects(node) || bounds.containsBounds(node);
        });
    }

    serialize() {
        return Array.from(this.boxes.values()).map((box) => box.toJSON());
    }
}
