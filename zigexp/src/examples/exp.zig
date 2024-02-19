const std = @import("std");

// Define a Subscription type
const Subscription = struct {
    running: *Running,
    next: *Subscription,
};

// Define a Running type
const Running = struct {
    execute: fn(),
    dependencies: []*Subscription,
};

// Define a createSignal function
pub fn createSignal(value: anytype) ![]const fn() !fn(nextValue: anytype) void {
    var subscriptions = std.ArrayList([]*Subscription, .{});

    // Define read function
    const read = fn() anytype {
        const running = context[context.len - 1];
        if (running != null) {
            subscribe(running, &subscriptions);
        }
        return value;
    };

    // Define write function
    const write = fn(nextValue: anytype) void {
        value = nextValue;
        var idx: usize = 0;
        while (idx < subscriptions.items.len) : (idx += 1) {
            const sub = subscriptions.items[idx];
            sub.execute();
        }
    };

    return [_]const fn() !fn(nextValue: anytype) void { read, write };
}

// Define subscribe function
fn subscribe(running: *Running, subscriptions: *std.ArrayList([]*Subscription)) void {
    var newSub = Subscription{ .running = running, .next = null };
    subscriptions.items.append(&newSub);
}

// Define cleanup function
fn cleanup(running: *Running) void {
    var idx: usize = 0;
    while (idx < running.dependencies.len) : (idx += 1) {
        const dep = running.dependencies.items[idx];
        dep.delete(running);
    }
    running.dependencies.items = null;
    running.dependencies.len = 0;
}

// Define createEffect function
pub fn createEffect(fn: fn()) void {
    const execute = fn() void {
        cleanup(running);
        context = context ++ &running;
        defer context = context[0..context.len - 1];
        try fn();
    };

    const running = Running{ .execute = execute, .dependencies = std.ArrayList([]*Subscription, .{}) };
    execute();
}

// Define context as a global variable
var context: [0]Running = undefined;
