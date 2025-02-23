---
title: "HTTP in Low Level Python"
slug: http-in-low-level-python
description: In this post, we'll take a closer look into the python requests library and how it works under the hood.
tags: ["python", "requests", "urllib", "socket", "icanhazip"]
pubDate: "2025-02-23"
---

requests.get() is a popular statement in python. requests is a Python library that handles one of the most fundamental yet complex tasks in modern software - HTTP communication.


```python
import requests

response = requests.get("http://icanhazip.com")
response.text
```


When this code gets executed, it initiates a sophisticated process of network communication. Your request travels through multiple layers of software and hardware - from high-level Python code down to electrical signals transmitted across networks which finally gives us the following output:

```txt
'149.88.106.153\n'
```

Let's explore how this apparently simple request works under the hood in low level python code.

## Beyond requests

The requests library is built on a stack of increasingly lower-level components:

requests → urllib3 → urllib → sockets

Each layer adds features while abstracting complexity:

- requests: Provides a friendly API with automatic features like redirect handling and session management
- urllib3: Adds connection pooling and retry functionality
- urllib: Implements core HTTP protocol functionality
- sockets: Handles raw network communication

Let's start with urllib and work our way down to understand how each layer operates.

Using urllib, we can make basic HTTP requests without the higher-level features of requests. Here's a simple example:

```python
import urllib
with urllib.request.urlopen("http://icanhazip.com") as response:
    print(response.read())
```

If we go further down, we reach Python's low-level socket implementation.

The socket is the foundation of HTTP communication, providing direct access to the TCP/IP networking stack. This is where Python code meets the operating system's networking capabilities, turning our high-level request into actual network packets.

Let's see how a simple GET request works using raw sockets:

```python
import socket
```

Create a client socket by telling the OS, the Address Family and the Socket Type.

```python
client_socket = socket.socket(
					socket.AF_INET,
					socket.SOCK_STREAM
				)
```

In case you're wondering what AF_INET and SOCK_STREAM are, here's a table to understand the meaning of those keywords:

- `socket.AF_INET, socket.SOCK_STREAM` → TCP over IPv4.
- `socket.AF_INET, socket.SOCK_DGRAM` → UDP over IPv4.
- `socket.AF_INET6, socket.SOCK_STREAM` → TCP over IPv6.
- `socket.AF_INET6, socket.SOCK_DGRAM` → UDP over IPv6.
- `socket.AF_UNIX, socket.SOCK_STREAM` → TCP-like communication on the local machine.
- `socket.AF_UNIX, socket.SOCK_DGRAM` → Datagram communication on the local machine.


> HTTP Protocol is on top of the TCP protocol.


Now that we defined the socket type and address family. We need to define the remote host and port that we're gonna connect to.

```python
# server address or ipv4 address
remote_host = "icanhazip.com"
# server port number, for http, it's always 80
remote_port = 80
```

Resolve the host address to an IP address by doing dns resolution. The DNS resolution is done by the OS's network configuration.

```python
remote_ip = socket.gethostbyname("icanhazip.com")
```

We got the ip to connect to. Let's go ahead and connect to the remote_ip and remote_port

```python
# connect to the remote host
client_socket.connect((remote_ip, remote_port))
```

If this doesn't raise any error, that means we've successfully established a TCP connection with the server ready to send and receive bits and bytes.

As we got connected to a HTTP server. The server will only respond to HTTP packets only.

HTTP packet is formed by a specific format. The following is a representation of a simple HTTP packet:

```python
http_packet = f"""\
GET / HTTP/1.1
Host: {remote_host}
Connection: close

"""
```

The raw HTTP packet looks like this:

```txt
GET / HTTP/1.1
Host: icanhazip.com
Connection: close

```

This packet is basically telling:

> I want to do a GET request to the host [icanhazip.com](http://icanhazip.com) and close the connection

Let's just go ahead and send this packet to icanhazip.com

```python
client_socket.sendall(http_packet.encode())
```

As we sent the packet, we can expect some response from icanhazip.com server, let's try to read some bytes and see if icanhazip.com put some bytes in the socket or not:

```python
response = client_socket.recv(1024)
```

BAM! Seems like we got some response from icanhazip.com that tells us our ip address!

```python
print(f"{response.decode()}")
```

Pretty print the response:

```txt
HTTP/1.1 200 OK
Date: Sun, 23 Feb 2025 07:11:28 GMT
Content-Type: text/plain
Content-Length: 15
Connection: close
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET
Set-Cookie: __cf_bm=e2rE7nx_wsAG41tbg9vnMSVAVgg1p7.sOBJfVgjf7to-1740294688-1.0.1.1-Zr32vyZF4KGcC3PqCSLzPOCDpNxKQ6qu2VQNwNIyln6St7LPhaqUfYVbL3Ne41UqVfZBC.VSbUOrdGbaWhCk.Q; path=/; expires=Sun, 23-Feb-25 07:41:28 GMT; domain=.icanhazip.com; HttpOnly
Server: cloudflare
CF-RAY: 916566e86c67fd69-SIN
alt-svc: h3=":443"; ma=86400

149.88.106.153
```

In this packet, we can see that the response is 200 OK which means the request is successful. We also got some headers that tells us important information about the response.

The response body is the ip address of the server.

```txt
149.88.106.153
```


Thank you for reading! I hope you enjoyed this post.
