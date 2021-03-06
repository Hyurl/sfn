<!-- title: Schedule; order: 6 -->
## Concept

Since version 0.5.x, SFN introduced a new distributed schedule system, and run
as a micro-service. To use this system, you have to create one or more
schedule server process, but don't worry, it's just easy as usual.

## Create Service

### Configuration

First, add a new item of RPC server in the config file.

```typescript
// src/config.ts
export default <app.Config> {
    server: {
        rpc: {
            "schedule-server": {
                host: "localhost",
                port: 8001,
                services: [app.services.schedule]
            }
        }
    }
}
```

(NOTE: `app.services.schedule`) is a built-in service of the framework, you 
don't have to write any code of this service.)

### Start the Server

```sh
node dist schedule-server
```

## Create Schedule Task

You can use the method `app.schedule.create()` to create schedule tasks anywhere
you want.

```typescript
var taskId = await app.schedule.create({
    salt: "my-schedule-1",
    start: moment().unix() + 5,
}, async () => {
    // do every thing in here after 5 seconds.
});

var taskId2 = await app.schedule.create({
    salt: "my-schedule-2",
    start: moment().add(5, "minutes").unix() // using moment library
    repeat: 5, // running repeatedly every 5 seconds
    end: moment().add(1, "hour").unix() // stops after 1 hour
}, async () => {
    // ...
});

var taskId3 = await app.schedule.create({
    salt: "my-schedule-3",
    timetable: ["18:00", "19:00", "20:00"], // using timetable
    repeat: 24 * 60 * 60 // runs every day
}, async () => {
    // ...
});
```

If you want to cancel a task, just call the method `app.schedule.cancel()` to do
so.

```typescript
await app.schedule.cancel(taskId);
```

### About Salt

`app.schedule.create()` will automatically calculate a task ID according to the
input arguments, however, different tasks may produce the same ID and causing
the later task to erase the former task, so it's recommended to provide a unique
`salt` to prevent conflicts. NOTE: `salt` must be unique, and will not be
changed after a system restart or reload.

## Bind Service To The Schedule

Other than provide a callback function, you can bind a module and method to the
schedule as the handler function, and take extra benefits like after the service 
rebooted, the schedule can resume running.

```typescript
// services/myService.ts
declare global {
    namespace app {
        namespace services {
            const myService: ModuleProxy<MyService>;
        }
    }
}

export default class MyService {
    async init() {
        // Should create schedule in the init() method.
        var taskId = await app.schedule.create({
            start: moment().unix(),
            repeat: 3600 * 24,
            module: app.services.myService,
            handler: "syncDataEveryDay"
        });
    }

    async syncDataEveryDay() {
        // ...
    }
}
```

## Pass Data To The Handler

When creating the schedule, you can provide the `data` option, the data will be
passed to the handler function as arguments when invoking the function.
NOTE: the data will be serialized for transmission, anything that cannot be 
serialized will be lost, and once set, the data cannot be modified.

```typescript
export default class MyService {
    async init() {
        var taskId = await app.schedule.create({
            start: moment().unix(),
            repeat: 3600 * 24,
            module: app.services.myService,
            handler: "syncDataEveryDay",
            data: [{ foo: "Hello, World!" }]
        });
    }

    async syncDataEveryDay(data: { foo: any }) {
        // ...
    }
}
```

## About ScheduleService

When calling `app.schedule.create()` or `app.schedule.cancel()`, it actually
calls the corresponding methods of [ScheduleService](/api/v1/ScheduleService).
However, these two methods have some internal logics, especially for
`app.schedule.create()`, that means you cannot directly use ScheduleService to
create tasks. That being said, ScheduleService provided some useful methods, to
help you find or delete tasks.

For example, you can use `find()` method to search the running tasks:

```ts
(async () => {
    // Get all tasks that created for the app.services.docs module.
    let tasks = await app.services.schedule.find({ module: app.services.docs });
})();
```
