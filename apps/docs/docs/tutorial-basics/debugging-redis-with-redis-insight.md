# Debugging Redis with Redis Insight

Redis Insight is a graphical user interface for Redis. It is available as a
Docker image, and can be used to inspect the contents of your Redis database.

```bash
 docker run -v redisinsight:/db \
  --publish 8001:8001 \
  redislabs/redisinsight:latest
```

You can then access Redis Insight at http://localhost:8001.

> When adding a new connection, use the hostname of the host machine, not
> `localhost`.
> If you're on macOS, use `host.docker.internal`.
