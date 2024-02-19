const std = @import("std");

pub const NodeTypes = enum {
    tag,
    text,
    component,
    flow,
    //signal, event
};

pub const NodeText = struct { value: []const u8 };
pub const NodeTag = struct { name: []const u8 };
pub const NodeComponent = struct { name: []const u8 };
pub const NodeFlow = struct { name: []const u8 };
// pub const NodeSignal = struct { link: fn () void };
// pub const NodeEvent = struct { link: fn () void };
const Allocator = std.mem.Allocator;

pub const NodeItem = union(NodeTypes) {
    tag: NodeTag,
    text: NodeText,
    component: NodeComponent,
    flow: NodeFlow,
    // signal: NodeSignal,
    // event: NodeEvent,
};

pub fn newText(allocator: Allocator, value: []const u8) !*NodeItem {
    var item = try allocator.create(NodeItem);
    item.* = .{ .text = .{ .value = value } };
    return item;
}

pub fn newTag(allocator: Allocator, comptime name: []const u8) !*NodeItem {
    var item = try allocator.create(NodeItem);
    item.* = .{ .tag = .{ .name = name } };
    return item;
}

// TESTS -----------------------------

test "new text" {
    const allocator = std.testing.allocator;
    const item = try newText(allocator, "hw");
    defer allocator.destroy(item);
    try std.testing.expectEqual(item.*.text.value, "hw");
}

test "new tag" {
    const allocator = std.testing.allocator;
    const item = try newTag(allocator, "div");
    defer allocator.destroy(item);
    try std.testing.expectEqual(item.*.tag.name, "div");
}

test "different types in one array" {
    const allocator = std.testing.allocator;

    const node1 = try newText(allocator, "hw");
    defer allocator.destroy(node1);

    const node2 = try newTag(allocator, "div");
    defer allocator.destroy(node2);

    const nodes = [_]*NodeItem{ node1, node2 };

    try std.testing.expectEqual(nodes.len, 2);
    try std.testing.expectEqual(nodes[0].*.text.value, "hw");
    try std.testing.expectEqual(nodes[1].*.tag.name, "div");
}
