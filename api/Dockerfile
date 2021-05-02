# Build app:
FROM ekidd/rust-musl-builder:1.51.0 as builder

WORKDIR /app
RUN cargo init --bin --name scaffold
COPY ./Cargo.toml ./Cargo.lock ./
RUN cargo build --release
RUN rm src/*.rs

COPY ./src/ ./src/
COPY ./build.rs ./build.rs
RUN cargo build --release
RUN mv ./target/x86_64-unknown-linux-musl/release/lattice-api ./target/release/


# Build image:
FROM alpine:3.13 AS runner
RUN apk add --update --no-cache ca-certificates curl

WORKDIR /app
COPY --from=builder /app/target/release/lattice-api ./

RUN addgroup -g 1001 -S docker && \
    adduser -u 1001 -S docker && \
    chown -R docker:docker /app/lattice-api
USER docker

# TODO: Add healthchecks.

ENV LATTICE_ENV=production
ENV LATTICE_PORT=3000
EXPOSE 3000
ENTRYPOINT ["/app/lattice-api"]
