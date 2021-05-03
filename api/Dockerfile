# Build app:
FROM ekidd/rust-musl-builder:1.51.0 as builder

WORKDIR /workspace/kernel
COPY ./kernel/Cargo.toml ./kernel/Cargo.lock ./
COPY ./kernel/src/ ./src/

WORKDIR /workspace/api
RUN cargo init --bin --name scaffold
COPY ./api/Cargo.toml ./api/Cargo.lock ./
RUN cargo build --release
RUN rm src/*.rs

COPY ./api/build.rs ./build.rs
COPY ./api/src/ ./src/
RUN cargo build --release
RUN sudo mkdir -p /dist && \
    sudo mv ./target/x86_64-unknown-linux-musl/release/lattice-api /dist/api


# Build image:
FROM alpine:3.13 AS runner
RUN apk add --update --no-cache ca-certificates curl

WORKDIR /app
COPY --from=builder /dist/api ./

RUN addgroup -g 1001 -S docker && \
    adduser -u 1001 -S docker && \
    chown -R docker:docker /app/api
USER docker

# TODO: Add healthchecks.

ENV LATTICE_ENV=production
ENV LATTICE_PORT=3000
EXPOSE 3000
ENTRYPOINT ["/app/api"]
