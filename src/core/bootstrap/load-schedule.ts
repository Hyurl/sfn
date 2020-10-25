import { ModuleProxy, createModuleProxy } from "microse";
import ScheduleService, { Schedule } from "../tools/Schedule";
import define from '@hyurl/utils/define';

declare global {
    namespace app {
        /** The portal to create and run tasks. */
        const schedule: Schedule;

        namespace services {
            /**
             * The schedule service is an internal service held by the framework,
             * which should not used directly, use `app.schedule` to create and
             * run tasks instead. However, it's recommended to serve this 
             * service in an individual RPC server, when it does, start the
             * schedule server before other servers.
             * @inner
             */
            const schedule: ModuleProxy<ScheduleService>;
        }
    }
}


define(app, "schedule", new Schedule("app.schedule"));

const proxy = createModuleProxy(
    "app.services.schedule",
    __dirname + "/../tools/Schedule",
    <any>app.services
);

define(app.services, "schedule", proxy);
