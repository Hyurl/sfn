<!-- title: Schedule; order: 17 -->
# Concept

Running a schedule cyclically is supported by 
[sfn-scheduler](https://github.com/hyurl/sfn-scheduler) module, which gives 
you a simple and friendly interface to set a schedule that runs it in a certain 
time or period.

## How To Use?

As convenience, you should put your schedule files in the `src/schedules/` 
directory, and load them from the bootstrap files.

### Example

```typescript
// src/schedules/index.ts
import { Schedule } from "sfn-scheduler";

var schedule1 = new Schedule("every 2 seconds", () => {
    console.log("This schedule runs every 2 seconds.");
});

var schedule2 = new Schedule("in 2 days", () => {
    console.log("This schedule has been waiting for 2 days.");
});

console.log(schedule2);

var schedule3 = new Schedule("20:00", () => {
    console.log("This schedule runs at 20:00 this evening.");
});

var schedule4 = new Schedule("*:30", () => {
    console.log("This schedule runs at 30 minutes of every hour in today.");
});

var schedule5 = new Schedule("*-*-1 8:00", () => {
    console.log("This schedule runs on every first day in every month.");
});
```

```typescript
// src/bootstrap/http.ts
import "../schedules/index";

// ...
```

## Schedule Pattern

Schedule pattern will be parsed by 
[sfn-schedule-parser](https://github.com/hyurl/sfn-schedule-parser), which 
exposes a common API for NodeJS to build schedulers. For full supported 
patterns, you should follow it for newest features.

## How To Stop?

You can call the method `stop()` to terminate the schedule whenever you want.

```typescript
var schedule = new Schedule("runs every 2 minutes", () => {
    // ...
    schedule.stop();
});
```

## Run In Multi-Processing Scenario

SFN production mode is always run in multiple processes, under multi-processing 
scenario, when you set a schedule task, if not handled properly, you will face 
the problem that the task runs repeatedly in every process. To fix that problem,
you will need to use [manager-process](https://github.com/hyurl/manager-process)
module, to get the unique **manager** process, and run the schedule task 
only in that process.

First install the dependency module via this command:

```sh
npm i manager-process
```

And then use the function it provides to check if the current process should 
execute the task.

```typescript
import { isManager } from "manager-process";
import { Schedule } from "sfn-scheduler";

(async () => {
    if (await isManager()) {
        var schedule = new Schedule("every 2 seconds", () => {
            console.log("This schedule runs every 2 seconds.");
        });
    }
})();
```