test "get scoupe" {
    const item = newText("hw");
    try std.testing.expectEqual(item.*.text.value, "hw");
}

fn getScope(name: []const u8) i32 {}

// test "get component" {
//     const item = newText("hw");
//     try std.testing.expectEqual(item.*.text.value, "hw");
// }

// fn getComponent(scope: i32, name: []const u8) i32 {}

// fn addNode(component: i32, parent: i32, items: []i32) i32 {}

// fn newText(value: []const u8) i32 {}

// fn newTag(name: []const u8) i32 {}
