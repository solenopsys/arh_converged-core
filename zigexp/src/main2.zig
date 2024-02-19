const std = @import("std");

const NodeText = struct {
    text: []const u8,
};

const NodeTag = struct {
    name: []const u8,
};

const NodeComponent = struct {
    componentType: []const u8,
};

const NodeType = enum {
    Text,
    Tag,
    Component,
};

const Node = union(NodeType) {
    Text : NodeText,
    Tag : NodeTag,
    Component : NodeComponent,
};


pub fn main() void {
    const nodes = [_]* Node{
       .{.Text= NodeText{ .text = "Text node" }},
     //   &NodeTag{ .name = "Tag node" },
     //   &NodeComponent{ .componentType = "Component node" },
    };

    for (nodes) |node| {
        switch (node.*) {
            .Text => std.debug.print("Text node: {s}\n", .{node.Text.text}),
            .Tag => std.debug.print("Tag node: {s}\n", .{node.Tag.name}),
            .Component => std.debug.print("Component node: {s}\n", .{node.Component.componentType}),
        }
    }
}
