const read_call = (source, open) => {
    const stack = [")"];
    let quoted = false;
    for (let index = open + 1; index < source.length; ++index) {
        const character = source[index];
        if (character === "\\") {
            ++index;
            continue;
        }
        if (stack.includes("]")) {
            if (character === "[") stack.push("]");
            else if (character === "]" && stack.at(-1) === "]") stack.pop();
            continue;
        }
        if (character === '"') {
            quoted = !quoted;
            continue;
        }
        if (quoted) continue;
        if (character === "(") stack.push(")");
        else if (character === "[") stack.push("]");
        else if (character === "{") stack.push("}");
        else if (character === stack.at(-1)) {
            stack.pop();
            if (stack.length === 0) return source.slice(open + 1, index);
        }
    }
    throw new Error("Unclosed Typst diagram command.");
};

const split_arguments = (source) => {
    const arguments_ = [];
    const stack = [];
    let quoted = false;
    let start = 0;
    for (let index = 0; index < source.length; ++index) {
        const character = source[index];
        if (character === "\\") {
            ++index;
            continue;
        }
        if (stack.includes("]")) {
            if (character === "[") stack.push("]");
            else if (character === "]" && stack.at(-1) === "]") stack.pop();
            continue;
        }
        if (character === '"') {
            quoted = !quoted;
            continue;
        }
        if (quoted) continue;
        if (character === "(") stack.push(")");
        else if (character === "[") stack.push("]");
        else if (character === "{") stack.push("}");
        else if (character === stack.at(-1)) stack.pop();
        else if (character === "," && stack.length === 0) {
            arguments_.push(source.slice(start, index).trim());
            start = index + 1;
        }
    }
    arguments_.push(source.slice(start).trim());
    return arguments_;
};

const calls = (source, name) => {
    const result = [];
    const pattern = new RegExp(`\\b${name}\\s*\\(`, "g");
    for (const match of source.matchAll(pattern)) {
        const open = match.index + match[0].lastIndexOf("(");
        result.push(split_arguments(read_call(source, open)));
    }
    return result;
};

const coordinate = (source) => {
    const match = /^\(\s*(-?\d+)\s*,\s*(-?\d+)\s*\)$/.exec(source);
    if (match === null) throw new Error(`Invalid Typst diagram coordinate: ${source}`);
    return { x: Number(match[1]), y: Number(match[2]) };
};

const label = (source) => {
    if (source === undefined || source === "") return "";
    const match = /^\[([\s\S]*)\]$/.exec(source);
    if (match === null) throw new Error("Expected a bracketed Typst diagram label.");
    const content = match[1].trim();
    return /^\$([\s\S]*)\$$/.exec(content)?.[1].trim() ?? content;
};

/// Parse the node/edge subset used by the original Quiver Typst `diagram` syntax.
export const parse_typst_diagram = (source) => {
    if (!/\bdiagram\s*\(/.test(source)) {
        throw new Error("Expected a Typst diagram(...) expression.");
    }
    const nodes = calls(source, "node").map((args) => ({
        ...coordinate(args[0]),
        label: label(args[1]),
    }));
    if (nodes.length === 0) throw new Error("No Typst diagram nodes were found.");

    const edges = calls(source, "edge").map((args) => {
        const source = coordinate(args[0]);
        const target = coordinate(args[1]);
        const label_index = args.findIndex((argument, index) => index > 1 && argument.startsWith("["));
        const arrow = args.slice(2).join(", ").match(/["'](<->|->|<-|-->|-)["']/)?.[1] || "->";
        return {
            source,
            target,
            label: label(args[label_index]),
            direction: arrow,
            centred_label: /label-side\s*:\s*center\b/.test(args.slice(2).join(", ")),
        };
    });
    return { nodes, edges };
};
