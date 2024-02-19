const std = @import("std");
const items = @import("./item.zig");
const Allocator = std.mem.Allocator;

pub const VdomNode = struct {
    data: *items.NodeItem,
    children: ?*[]VdomNode,
};

pub fn new(allocator: Allocator, data: *items.NodeItem, children: ?*[]VdomNode) !*VdomNode {
    var node = try allocator.create(VdomNode);
    node.data = data;
    node.children = children;
    return node;
}

pub fn destroyRecursive(allocator: Allocator, node: *const VdomNode) void { //todo

    if (node.*.children) |chld| {
        const message = node.*.data.text.value;
        std.debug.print("m1-{s}\n", .{message});
        for (chld.*) |child1| {
            const message2 = child1.data.text.value;
            std.debug.print("m2-{s}\n", .{message2});
            destroyRecursive(allocator, &child1);
        }

        allocator.free(chld.*);
    }

    //  allocator.destroy(node.*.data.*);
    allocator.destroy(node.*);
}

pub fn traverse(node: *VdomNode, visitor: fn (node: *VdomNode) void) void {
    visitor(node);
    for (node.*.children) |child| {
        traverse(&child, visitor);
    }
}

// TESTS -----------------------------

test "new function" {
    var nodeItem = items.NodeItem{ .text = items.NodeText{ .value = "hw" } };
    const allocator = std.testing.allocator;
    const node = try new(allocator, &nodeItem, undefined);
    defer allocator.destroy(node);
    try std.testing.expectEqual(node.*.data.*.text.value, "hw");
}

test "new function width children" {
    var nodeItem = items.NodeItem{ .text = items.NodeText{ .value = "hw" } };
    const allocator = std.testing.allocator;

    var itemChild1 = items.NodeItem{ .text = items.NodeText{ .value = "child1" } };
    var itemChild2 = items.NodeItem{ .text = items.NodeText{ .value = "child2" } };

    var nodeChild1 = try new(allocator, &itemChild1, null);
    defer allocator.destroy(nodeChild1);
    var nodeChild2 = try new(allocator, &itemChild2, null);
    defer allocator.destroy(nodeChild2);

    var children: []VdomNode = try allocator.alloc(VdomNode, 2);

    defer allocator.free(children);
    children[0] = nodeChild1.*;
    children[1] = nodeChild2.*;

    const node = try new(allocator, &nodeItem, &children);
    defer allocator.destroy(node);

    if (node.*.children) |ch| {
        try std.testing.expectEqual(ch.len, 2);
        try std.testing.expectEqual(ch.*[0].data.*.text.value, "child1");
        try std.testing.expectEqual(ch.*[1].data.*.text.value, "child2");
    } else {
        try std.testing.expect(false);
    }
}

test "destroy recursive" {
    const allocator = std.testing.allocator;

    var itemChild1 = items.NodeItem{ .text = items.NodeText{ .value = "child1" } };
    var itemChild2 = items.NodeItem{ .text = items.NodeText{ .value = "child2" } };

    var nodeChild1 = try new(allocator, &itemChild1, null);
    var nodeChild2 = try new(allocator, &itemChild2, null);

    var children: []VdomNode = try allocator.alloc(VdomNode, 2);

    children[0] = nodeChild1.*;
    children[1] = nodeChild2.*;

    var nodeItem = items.NodeItem{ .text = items.NodeText{ .value = "hw" } };
    const node = try new(allocator, &nodeItem, &children);

    // if (node.*.children) |ch| {
    //     try std.testing.expectEqual(ch.len, 2);
    //     try std.testing.expectEqual(ch.*[0].data.*.text.value, "child1");
    //     try std.testing.expectEqual(ch.*[1].data.*.text.value, "child2");
    // }

    defer destroyRecursive(allocator, node);
}
