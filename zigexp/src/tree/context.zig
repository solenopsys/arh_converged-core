const Context = struct {
    scopes: [_]struct {
        name: []const u8,
        node: *Scope,
    },
    table: *HashTable,
};

//     var arena = std.heap.ArenaAllocator.init(allocator);
