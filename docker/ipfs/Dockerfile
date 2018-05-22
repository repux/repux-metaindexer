FROM ipfs/go-ipfs:latest
MAINTAINER Herman Junge <herman.junge@consensys.net>

COPY init.sh /usr/local/bin/ipfs_init
RUN chmod +x /usr/local/bin/ipfs_init

ENTRYPOINT ["/usr/local/bin/ipfs_init"]
