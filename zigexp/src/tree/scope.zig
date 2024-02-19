const std = @import("std");
 
const Scope = struct {
    components: [_]struct {
        name: []const u8,
        node: *VdomNode,
    },
    count: usize,
    table: *HashTable,
    allocator: Allocator,

    fn init(allocator: Allocator, player_count: usize) !Game {
        var players = try allocator.alloc(Player, player_count);
        errdefer allocator.free(players);

        // храним 10 последних шагов игрока
        var history = try allocator.alloc(Move, player_count * 10);

        return .{
            .players = players,
            .history = history,
            .allocator = allocator,
        };
    }

    fn deinit(game: Game) void {
        allocator.free(components);
        allocator.free(game.history);
    }

     fn add(  name: []const u8, node: *VdomNode) void {
        const index = std.fmt.hashToIndex(name, table.items.len);
        table.items[index] = {.name = name, .node = node};
        table.count += 1;
    }

    fn get(table: *HashTable, name: []const u8) ?*VdomNode {
        const index = std.fmt.hashToIndex(name, table.items.len);
        if (table.items[index].name == name) {
            return table.items[index].node;
        }
        return null;
    }
};



 



// TESTS -----------------------------

test "new function" {
    var nodeItem = items.NodeItem{ .text = items.NodeText{ .value = "hw" } };
    const allocator = std.testing.allocator;
    const node = try new(allocator, &nodeItem, undefined);
    defer allocator.destroy(node);
    try std.testing.expectEqual(node.*.data.*.text.value, "hw");
}