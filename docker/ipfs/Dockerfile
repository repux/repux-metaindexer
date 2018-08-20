FROM ipfs/go-ipfs:latest

COPY init.sh /usr/local/bin/ipfs_init
RUN chmod +x /usr/local/bin/ipfs_init

ENTRYPOINT ["/usr/local/bin/ipfs_init"]
