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

1.  Make sure you have the following tools (or equivalents) installed:

    - [VSCode](https://code.visualstudio.com/)
    - [Docker](https://www.docker.com/get-started)
    - [Rust](https://www.rust-lang.org/tools/install)
    - [Node via Volta](https://docs.volta.sh/guide/getting-started)

2.  Clone the repo:

    ```bash
    git clone git@github.com:uwblueprint/lattice && \
    cd ./lattice/
    ```

3.  Install dependencies:

    ```bash
    ./setup.sh
    ```

### Setup 2: [Devcontainers](https://code.visualstudio.com/docs/remote/containers)

> #### DISCLAIMER:
>
> I really wanted to try out the _devcontainer_ experience with this project,
> but unfortunately it turns that you need a _really hecking beefy_ system
> for the VSCode Rust integration performance to be _remotely tolerable_—and
> so, alas, for this particular project, I must concede that **devcontainers are
> not it, chief**.
>
> However, I will leave the setup instructions up in case anybody wants to
> mimic it for other multi-root workspaces, or if they have a _really hecking
> beefy_ computer.

1. Make sure you have the following tools (or equivalents) installed:

   - [VSCode](https://code.visualstudio.com/)
   - [Docker](https://www.docker.com/get-started)

2. Clone the repo:

   ```bash
   git clone git@github.com:uwblueprint/lattice && \
   cd ./lattice/
   ```

3. Start all services:

   ```bash
   docker-compose -f devcontainer.yml up -d
   ```

   Open your browser and navigate to [`localhost:3000`](http://localhost:3000) and [`localhost:8000`](http://localhost:8000) to make sure the frontend and backend are up and running as expected.

4. Open a service devcontainer:

   - Open VSCode (`code .`)
   - Run the command: `Remote-Containers: Open Workspace in Container...`
   - Select a service folder, i.e. [`./api/`](./api/) or [`./web/`](./web/)

> To develop multiple services at once, open a window for each service and
> start the corresponding devcontainer.

### Workflow

1.  Start background services:

    ```bash
    docker-compose up -d
    ```

2.  Open workspace in [VS Code](https://code.visualstudio.com):

    ```bash
    code ./lattice.code-workspace
    ```

3.  Run database migrations:

    ```bash
    cd ./migrator && yarn up
    ```

4.  Start `api` (in terminal 1):

    ```bash
    cd ./api/ && cargo run
    ```

    Visit [`localhost:3000`](http://localhost:3000) to make sure the GraphQL
    Playground is up and running.

5.  Start `web` (in terminal 2):

    ```bash
    cd ./web/ && yarn dev
    ```

    Visit [`localhost:8000`](http://localhost:8000) to make sure the web app
    is up and running.

<br />

When you're finished, quit both terminals and stop background services with:

```bash
docker-compose down
```
