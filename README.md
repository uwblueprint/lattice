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

### Setup 1: Local

> Make sure you have the following tools (or equivalents) installed:
>
> - [VSCode](https://code.visualstudio.com/)
> - [Docker](https://www.docker.com/get-started)
> - [Rust](https://www.rust-lang.org/tools/install)
> - [Node via NVM](https://github.com/nvm-sh/nvm#installing-and-updating)

1. Clone the repo:

   ```bash
   git clone git@github.com:uwblueprint/lattice && \
   cd ./lattice/
   ```

2. Start services:

   ```bash
   docker-compose up -d
   ```

3. Open workspace:

   ```bash
   code ./lattice.code-workspace
   ```

4. Install dependencies:

   ```bash
   # For api:
   cd ./api/ && \
   cargo check

   # For web:
   cd ./web/ && \
   yarn install
   ```

### Setup 2: Devcontainers

> Make sure you have the following tools (or equivalents) installed:
>
> - [VSCode](https://code.visualstudio.com/)
> - [Docker](https://www.docker.com/get-started)

1. Clone the repo:

   ```bash
   git clone git@github.com:uwblueprint/lattice && \
   cd ./lattice/
   ```

2. Start all services:

   ```bash
   docker-compose -f devcontainer.yml up -d
   ```

   Open your browser and navigate to [`localhost:3000`](http://localhost:3000) and [`localhost:8000`](http://localhost:8000) to make sure the frontend and backend are up and running as expected.

3. Open a service devcontainer:

   - Open VSCode (`code .`)
   - Run the command: `Remote-Containers: Open Workspace in Container...`
   - Select a service folder, i.e. [`./api/`](./api/) or [`./web/`](./web/)

> To develop multiple services at once, open a window for each service and
> start the corresponding devcontainer.
