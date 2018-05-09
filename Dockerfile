FROM alpine:latest

RUN adduser -S deployer

WORKDIR /opt/repux-indexer

USER deployer

CMD ["sh"]
