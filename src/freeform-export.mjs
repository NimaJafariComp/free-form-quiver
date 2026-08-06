// Freeform exports intentionally consume this small, serialisable scene instead of Quiver's
// integer `Position`s.  Keeping this module DOM-free makes the geometry contract testable.

const PX_TO_PT = 0.75;

const tex = (value) => String(value ?? "")
    .replaceAll("\\", "\\textbackslash{}")
    .replaceAll("{", "\\{")
    .replaceAll("}", "\\}")
    .replaceAll("%", "\\%")
    .replaceAll("#", "\\#")
    .replaceAll("&", "\\&")
    .replaceAll("_", "\\_");

const xml = (value) => String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const number = (value) => Number(value || 0).toFixed(2).replace(/\.00$/, "");
const identifier = (value, index) => `qv-${String(value || index).replace(/[^A-Za-z0-9_-]/g, "-")}`;

export const freeform_content_bounds = (scene, padding = 24) => {
    const bounds = [];
    for (const node of scene.nodes || []) bounds.push(node.bounds);
    for (const box of scene.boxes || []) bounds.push(box.bounds);
    for (const edge of scene.edges || []) {
        if (edge.bounds) bounds.push(edge.bounds);
    }
    if (bounds.length === 0) return { x: 0, y: 0, width: padding * 2, height: padding * 2 };
    const min_x = Math.min(...bounds.map((bound) => bound.x));
    const min_y = Math.min(...bounds.map((bound) => bound.y));
    const max_x = Math.max(...bounds.map((bound) => bound.x + bound.width));
    const max_y = Math.max(...bounds.map((bound) => bound.y + bound.height));
    return {
        x: min_x - padding,
        y: min_y - padding,
        width: Math.max(1, max_x - min_x + padding * 2),
        height: Math.max(1, max_y - min_y + padding * 2),
    };
};

const node_lookup = (scene) => new Map((scene.nodes || []).map((node, index) => [node.id, {
    ...node,
    name: identifier(node.id, index),
}]));

const endpoint = (node) => ({ x: node.bounds.x + node.bounds.width / 2, y: node.bounds.y + node.bounds.height / 2 });

const edge_path = (edge, nodes) => {
    const source = nodes.get(edge.source);
    const target = nodes.get(edge.target);
    if (!source || !target) return "";
    const start = endpoint(source);
    const end = endpoint(target);
    if (source.id === target.id) {
        const radius = Math.max(34, Math.abs(edge.options?.radius || 1) * 20);
        return `M ${number(start.x)} ${number(start.y - source.bounds.height / 2)} C ${number(start.x + radius)} ${number(start.y - source.bounds.height / 2 - radius)}, ${number(start.x + radius)} ${number(start.y + radius)}, ${number(start.x)} ${number(start.y + radius)}`;
    }
    const curve = Number(edge.options?.curve || 0);
    if (curve === 0) return `M ${number(start.x)} ${number(start.y)} L ${number(end.x)} ${number(end.y)}`;
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const length = Math.hypot(dx, dy) || 1;
    const normal_x = -dy / length * curve * 24;
    const normal_y = dx / length * curve * 24;
    return `M ${number(start.x)} ${number(start.y)} Q ${number((start.x + end.x) / 2 + normal_x)} ${number((start.y + end.y) / 2 + normal_y)} ${number(end.x)} ${number(end.y)}`;
};

const arrow_marker = (edge) => edge.options?.style?.head?.name === "none" ? "" : ' marker-end="url(#qv-arrowhead)"';

export const freeform_svg = (scene, { padding = 24, background = null } = {}) => {
    const bounds = freeform_content_bounds(scene, padding);
    const nodes = node_lookup(scene);
    const box_svg = (scene.boxes || []).map((box) => {
        const colour = box.kind === "definition" ? "#45358c" : "#7b3fc6";
        return `<g class="qv-box qv-${xml(box.kind || "problem-bank")}"><rect x="${number(box.bounds.x)}" y="${number(box.bounds.y)}" width="${number(box.bounds.width)}" height="${number(box.bounds.height)}" rx="10" fill="white" fill-opacity="0.93" stroke="${colour}" stroke-width="2"/><path d="M ${number(box.bounds.x)} ${number(box.bounds.y + 40)} H ${number(box.bounds.x + box.bounds.width)}" stroke="${colour}" stroke-width="1.5"/><text x="${number(box.bounds.x + 16)}" y="${number(box.bounds.y + 27)}" fill="${colour}" font-family="system-ui, sans-serif" font-size="18" font-weight="700">${xml(box.title || "Untitled box")}</text></g>`;
    }).join("");
    const arrows = (scene.edges || []).map((edge) => {
        if (edge.svg_markup) return `<g class="qv-edge" data-level="${number(edge.level || 1)}">${edge.svg_markup}</g>`;
        const colour = edge.colour || "#111";
        const body = edge.options?.style?.body?.name;
        const dash = body === "dashed" ? ' stroke-dasharray="8 6"' : body === "dotted" ? ' stroke-dasharray="2 5"' : "";
        const path = edge.svg_path || edge_path(edge, nodes);
        const label = edge.label_html || (edge.label ? xml(edge.label) : "");
        const source = nodes.get(edge.source);
        const target = nodes.get(edge.target);
        const label_x = source && target ? (endpoint(source).x + endpoint(target).x) / 2 : 0;
        const label_y = source && target ? (endpoint(source).y + endpoint(target).y) / 2 - 10 : 0;
        return `<g class="qv-edge" data-level="${number(edge.level || 1)}"><path d="${path}" fill="none" stroke="${colour}" stroke-width="${number(1 + Math.max(0, (edge.level || 1) - 1))}"${dash}${arrow_marker(edge)}/>${label ? `<foreignObject x="${number(label_x - 120)}" y="${number(label_y - 18)}" width="240" height="42"><div xmlns="http://www.w3.org/1999/xhtml" class="qv-edge-label">${label}</div></foreignObject>` : ""}</g>`;
    }).join("");
    const node_svg = [...nodes.values()].map((node) => {
        const label = node.label_html || xml(node.label || "");
        const frame = node.frame || {};
        const centre = endpoint(node);
        const size = number(node.symbol_size || 0);
        const symbol = node.symbol === "circle"
            ? `<circle cx="${number(centre.x)}" cy="${number(centre.y)}" r="${number(size / 2)}" fill="none" stroke="${node.colour || "#111"}" stroke-width="2"/>`
            : node.symbol === "square"
                ? `<rect x="${number(centre.x - size / 2)}" y="${number(centre.y - size / 2)}" width="${size}" height="${size}" fill="${node.colour || "#111"}"/>`
                : `<circle cx="${number(centre.x)}" cy="${number(centre.y)}" r="${number(size / 2)}" fill="${node.colour || "#111"}"/>`;
        return `<g class="qv-node"><rect x="${number(node.bounds.x)}" y="${number(node.bounds.y)}" width="${number(node.bounds.width)}" height="${number(node.bounds.height)}" rx="${number(frame.radius || 14)}" fill="${frame.background || "transparent"}" stroke="${frame.border || "none"}"/>${symbol}<foreignObject x="${number(node.bounds.x)}" y="${number(node.bounds.y)}" width="${number(node.bounds.width)}" height="${number(node.bounds.height)}"><div xmlns="http://www.w3.org/1999/xhtml" class="qv-node-label" style="color:${node.colour || "#111"};font-size:${number(node.font_size || 26)}px">${label}</div></foreignObject></g>`;
    }).join("");
    return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${number(bounds.width)}" height="${number(bounds.height)}" viewBox="${number(bounds.x)} ${number(bounds.y)} ${number(bounds.width)} ${number(bounds.height)}"><defs><marker id="qv-arrowhead" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="context-stroke"/></marker><style>.qv-node-label,.qv-edge-label{display:flex;width:100%;height:100%;align-items:center;justify-content:center;text-align:center;overflow:visible;font:20px KaTeX_Main,serif}.qv-edge-label{font-size:16px;background:transparent}.katex{white-space:nowrap}${scene.styles || ""}</style></defs>${background ? `<rect x="${number(bounds.x)}" y="${number(bounds.y)}" width="${number(bounds.width)}" height="${number(bounds.height)}" fill="${xml(background)}"/>` : ""}${box_svg}${arrows}${node_svg}</svg>`;
};

const tikz_colour = (colour, fallback = "black") => /^#[0-9a-f]{6}$/i.test(colour || "") ? colour : fallback;

const tikz_arrow_options = (edge) => {
    const options = ["qv arrow"];
    const style = edge.options?.style || {};
    const body = style.body?.name;
    if (body === "dashed" || body === "dotted") options.push(body);
    if (body === "squiggly") options.push("decorate, decoration={snake, amplitude=0.7mm, segment length=2mm}");
    if (style.head?.name === "none") options.push("-");
    else if (style.head?.name === "epi") options.push("-{Stealth[scale=1.1]}-{Stealth[scale=0.7]}");
    else if (style.head?.name === "harpoon") options.push("-{Hooks[harpoon]}");
    else options.push("->");
    if (style.tail?.name === "hook") options.push("Hooks-");
    if (style.tail?.name === "mono") options.push("-{Bar[width=4pt]}-");
    if (edge.colour) options.push(`draw=${tikz_colour(edge.colour)}`);
    return options.join(", ");
};

export const freeform_tikz = (scene, { source_url = "" } = {}) => {
    const bounds = freeform_content_bounds(scene);
    const nodes = node_lookup(scene);
    const lines = [
        "% Freeform Quiver export. Coordinates are absolute editor pixels (0.75pt per pixel).",
        "% Requires \\usepackage{freeform-quiver} (which depends on CTAN quiver and TikZ).",
        source_url ? `% ${source_url}` : "% Source URL unavailable.",
        "\\begin{tikzpicture}[x=0.75pt,y=-0.75pt]",
    ];
    for (const box of scene.boxes || []) {
        lines.push(`  \\freeformquiverbox{${number(box.bounds.x)}}{${number(box.bounds.y)}}{${number(box.bounds.width)}}{${number(box.bounds.height)}}{${tex(box.title || "Untitled box")}}{${box.kind || "problem-bank"}}`);
    }
    for (const node of nodes.values()) {
        const centre = endpoint(node);
        lines.push(`  \\freeformquivernode{${node.name}}{${number(centre.x)}}{${number(centre.y)}}{${number(node.bounds.width)}}{${number(node.bounds.height)}}{${node.label || ""}}`);
    }
    for (const edge of scene.edges || []) {
        const source = nodes.get(edge.source);
        const target = nodes.get(edge.target);
        if (!source || !target) continue;
        const options = tikz_arrow_options(edge);
        const curve = Number(edge.options?.curve || 0);
        const label = edge.label ? ` node[midway, fill=white, inner sep=1pt] {$${edge.label}$}` : "";
        if (source.id === target.id) {
            const angle = Number(edge.options?.angle || 0) * 180 / Math.PI;
            const distance = Math.max(22, Math.abs(edge.options?.radius || 1) * 18);
            lines.push(`  \\draw[${options}] (${source.name}) to[out=${number(angle - 35)}, in=${number(angle + 215)}, looseness=${number(distance / 22)}]${label} (${target.name});`);
        } else if (curve !== 0) {
            const bend = Math.min(85, Math.abs(curve) * 14);
            lines.push(`  \\draw[${options}] (${source.name}) to[bend ${curve > 0 ? "left" : "right"}=${number(bend)}]${label} (${target.name});`);
        } else {
            lines.push(`  \\draw[${options}] (${source.name}) --${label} (${target.name});`);
        }
    }
    lines.push("\\end{tikzpicture}");
    return { data: lines.join("\n"), metadata: { tikz_incompatibilities: new Set(), dependencies: new Map([["quiver", new Set(["freeform-quiver.sty"])]] ) } };
};

export const download_svg = (scene, filename, options = {}) => {
    const blob = new Blob([freeform_svg(scene, options)], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${filename}.svg`;
    anchor.click();
    URL.revokeObjectURL(url);
};

export const download_png = async (scene, filename, { scale = 2, ...options } = {}) => {
    const svg = freeform_svg(scene, options);
    const bounds = freeform_content_bounds(scene);
    const image = new Image();
    const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }));
    try {
        await new Promise((resolve, reject) => { image.onload = resolve; image.onerror = reject; image.src = url; });
        const canvas = document.createElement("canvas");
        canvas.width = Math.ceil(bounds.width * scale);
        canvas.height = Math.ceil(bounds.height * scale);
        canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
        const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
        if (!blob) throw new Error("The browser could not rasterize the SVG.");
        const png_url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = png_url;
        anchor.download = `${filename}.png`;
        anchor.click();
        URL.revokeObjectURL(png_url);
    } finally {
        URL.revokeObjectURL(url);
    }
};
