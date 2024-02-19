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
    const node1=Node{.Text=NodeText{.text="bla"}};
    const node2=Node{.Tag=NodeTag{.name="bla2"}};
    const node3=Node{.Tag=NodeTag{.name="bla22"}};
    const node4=Node{.Tag=NodeTag{.name="bla122"}};
  //  var nodes:[]*const Node =[_]*const Node {&node1,&node2};

        var nodes = [_]*const Node{ &node1, &node2,&node3,&node4 };


    for (nodes) |node| {
        switch (node.*) {
            .Text => std.debug.print("Text node: {s}\n", .{node.Text.text}),
            .Tag => std.debug.print("Tag node: {s}\n", .{node.Tag.name}),
            .Component => std.debug.print("Component node: {s}\n", .{node.Component.componentType}),
        }
    }
}
