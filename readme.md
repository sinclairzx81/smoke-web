# Smoke-Web

A static file server with live reload.

```
$ npm install smoke-web -g
```
```
$ smoke-web ./ --port 5000
```

## Overview

Smoke-Web is a static file web server that live reloads HTML pages on file change. It is primarily geared towards development workflows where code edits should result in automatic page refresh.

## Options
```

$ smoke-web <directory> --port <number> --trace --cors

   Examples: smoke-run ./dist
             smoke-run ./dist --port 5001
             smoke-run ./dist --trace

   Options:
     --port   The server port. default is 5000.
     --cors   Allow cross-origin requests.
     --trace  Print requests in terminal.

```

## Tasks

The following project tasks are available.

```bash
$ npm run clean       # cleans this project
$ npm run start       # starts serving ./output/bin in watch.
$ npm run pack        # npm packs this tool.
$ npm run install-cli # installs this tool locally.
$ npm run templates   # builds static templates
```
