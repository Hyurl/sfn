<!-- title: Getting Start; order: 1 -->

>This documentation is for SFN 0.4.x, for old version SFN documentation, please 
> [click here](/docs/v0.3.x/getting-started).

### Initiate Your Project

Create a directory to store files of your project, then use the command

```sh
npm init
```

to initiate your project, assume you have some knowledge of 
[NPM](https://www.npmjs.com/) and have [NodeJS](https://nodejs.org) installed.

### Install TypeScript Compiler And Runtime

**SFN** is written in [TypeScript](https://www.typescriptlang.org), which your
own code should be as well.

*The runtime [ts-node](https://github.com/TypeStrong/ts-node) is optional, only*
*needed if you want to run your program without compiling.*

```sh
npm i -g typescript
npm i -g ts-node
```

### Install PM2 (Optional)

Since version 0.3.x, SFN uses [PM2](https://pm2.io) as its application manager 
and load-balancer, so to better deploy your application, you'd also install PM2
and use it to start you application (however it is production environment 
requirement, not necessary during development).

```sh
npm i -g pm2
```

### Install Framework

After you have initiated your project, you can now install **SFN** by using 
this command:

```sh
npm i sfn
```

After all files downloaded, type the following command to initiate your project,
it will create needed files and directories for you automatically.

But before running this procedure, you have to setup the environment for NodeJS 
to run user-defined commands. See [Command Line](./command-line).

```sh
sfn init
```

### Start Demo Server

**SFN** provides a demo, so you can now start server and see what will happen.

If you have installed **ts-node**, use this command to start the project.

```sh
ts-node src
```

Otherwise, compile the source code with command: `tsc`, then run the command:

```sh
node dist
```

And the server should be started in few seconds.

If you have PM2 installed, you can use the following command to start the 
application, and auto-scale according to the CPU numbers.

```sh
pm2 start dist/index.js -i max
```