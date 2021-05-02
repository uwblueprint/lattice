# lattice

_An experimental integrated service platform for UW Blueprint._

## Progress

### Current State

When you start it up, it goes _"henlo world"_, or something like that. Pretty
cool, right?

Try it out at: [`lattice.uwblueprint.org`](https://lattice.uwblueprint.org)

### Roadmap

- [ ] It says _"Hi, $name"_, when you login with your `@uwblueprint.org` account.
- [ ] It understands basic Blueprint concepts:
  - Member
    - Roles
  - Partner (NPO)
  - Project
  - Applicant
  - ...
- [ ] It can ingest Google Forms
- ...

## Development

### Option 1: Local

TODO: Write instructions!

### Option 2: Devcontainers

1. Clone the repo:

   ```
   git clone git@github.com:uwblueprint/lattice
   ```

2. Start all services:

   ```
   docker-compose up -d
   ```

   Open your browser and navigate to [`localhost:3000`](http://localhost:3000) and [`localhost:8000`](http://localhost:8000) to make sure the frontend and backend are up and running as expected.

3. Open a service devcontainer:

   - Open VSCode (`code .`)
   - Run the command: `Remote-Containers: Open Workspace in Container...`
   - Select a service folder, i.e. [`./api/`](./api/) or [`./web/`](./web/)

> To develop multiple services at once, open a window for each service and
> start the corresponding devcontainer.
