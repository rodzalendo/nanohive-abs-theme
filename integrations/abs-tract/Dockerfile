# abs-tract with Goodreads rating numbers exposed (NanoHive #27).
#
# abs-tract (MIT, github.com/ahobsonsayers/abs-tract) is the Goodreads metadata
# provider people already run next to Audiobookshelf. Its answers carry no
# rating numbers; ratings.patch (by ThomasTechArtist) adds four fields to the
# search results, which NanoHive reads for its community ratings. Pinned to the
# revision the patch was written against.
#
#   docker run -d --name abs-tract -p 5555:5555 ghcr.io/rodzalendo/abs-tract-ratings
#   NH_GOODREADS_UPSTREAM=http://abs-tract:5555/goodreads   (in the nanohive container)
#
# Also usable as-is as an ABS custom metadata provider: http://<host>:5555/goodreads
FROM golang:1.23-alpine AS build
RUN apk add --no-cache git
WORKDIR /src
RUN git clone https://github.com/ahobsonsayers/abs-tract.git . && \
    git checkout 10be524a5ae436476e2c3a8cb0f0a7e6b95525b3
COPY ratings.patch /tmp/ratings.patch
RUN git apply /tmp/ratings.patch && go mod download && \
    CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o /out/abs-tract .

FROM alpine:3.20
RUN apk add --no-cache ca-certificates
COPY --from=build /out/abs-tract /usr/local/bin/abs-tract
COPY LICENSE.abs-tract /usr/share/licenses/abs-tract/LICENSE
EXPOSE 5555
USER nobody
ENTRYPOINT ["/usr/local/bin/abs-tract"]
