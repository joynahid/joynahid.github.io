---
title: "A Closer Look Into the requests Library"
slug: a-closer-look-into-the-requests-library
description: In this post, We'll take a closer look into the requests library and how it works.
tags: ["python", "requests", "urllib", "socket"]
pubDate: "2025-02-20"
# heroImage: '/assets/a-closer-look-into-the-requests-library/hero.png'
---

requests.get is a popular statement in python. `requests`, a library that does one of the most complex tasks of the internet world.


```python
import requests

response = requests.get("https://google.com")
response.text
```


When this function executes, we embark on a journey through the borderless digital world, traveling through physical wires and wireless connections. The data we transmit is converted into binary bits - simple 0s and 1s that are carried as electrical signals, light pulses, or wireless waves across vast networks.

This is one of the most fascinating aspects of modern programming and the internet. With just a few lines of code, we can send information across the globe.

Let's dive deeper into the building blocks that make this computer-to-computer communication possible, exploring the layers that power today's internet.

## Beyond requests

requests is built on top of `urllib3` which is again built on top of python's standard library `urllib`.

urllib has the implementation of the core http protocol. Let's demystify the urllib and how it works.

If we want to expand the requests in urrlib3 it will apprently look like the following:

```python
>>> import urllib3
>>> http = urllib3.PoolManager()
>>> response = http.request(method='GET', url='https://google.com')
>>> response
<urllib3.response.HTTPResponse object at 0x105969db0>
```

urllib is the low level implementation of http protocol, that leaves us with some basic but handy way to connect to a http server.

By using urllib we can do something like the following to do a simple get request just like the requests but it doesn't do any redirects or session handling for us like urllib3 or requests, just a plain http request to the server:

```python
import urllib
urllib.request.urlopen("https://google.com")
```

If we go further down, we'll hit python's low level socket implementation.

Let's see how a simple get request works in low level python code:

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

Now that we defined the socket type and address family. We need to define the remote host and port that we're gonna connect to.

```python
remote_host = "google.com"  # server address or ipv4 address
remote_port = 80            # server port number, for http, it's always 80
```

Resolve the host address to an IP address by doing dns resolution. The DNS resolution is done by the OS's network configuration.

```python
remote_ip = socket.gethostbyname("google.com")
```

We got the ip to connect to. Let's go ahead and connect to the remote_ip and remote_port

```python
client_socket.connect((remote_ip, remote_port))  # connect to the remote host
```

If this doesn't raise any error, that means we've successfully established a TCP connection with the server ready to send and receive bits and bytes.

> HTTP Protocol is on top of the TCP protocol.
>

As we got connected to a HTTP server. The server will only respond to HTTP packets only.

HTTP packet is formed by a specific format. The following is a representation of a simple HTTP packet:

```python
http_packet = """\
GET / HTTP/1.1
Host: {remote_host}
Connection: close
"""
```

This packet apparently telling:

> I want to do a GET request to the host [google.com](http://google.com) and close the connection
>

Let's just go ahead and send this packet to google

```python
client_socket.sendall(http_packet.encode())
```

As we sent the packet, we can expect some response from google, let's try to read some bytes and see if google put some bytes in the socket or not:

```python
client_socket.recv(1024)
```

BAM! Seems like we got some response from google!

```python
b'r\r\nContent-Length: 1589\r\nDate: Thu, 20 Feb 2025 20:45:30 GMT\r\nConnection: close\r\n\r\n<!DOCTYPE html>\n<html lang=en>\n  <meta charset=utf-8>\n  <meta name=viewport content="initial-scale=1, minimum-scale=1, width=device-width">\n  <title>Error 405 (Method Not Allowed)!!1</title>\n  <style>\n    *{margin:0;padding:0}html,code{font:15px/22px arial,sans-serif}html{background:#fff;color:#222;padding:15px}body{margin:7% auto 0;max-width:390px;min-height:180px;padding:30px 0 15px}* > body{background:url([//www.google.com/images/errors/robot.png](https://www.google.com/images/errors/robot.png)) 100% 5px no-repeat;padding-right:205px}p{margin:11px 0 22px;overflow:hidden}ins{color:#777;text-decoration:none}a img{border:0}@media screen and (max-width:772px){body{background:none;margin-top:0;max-width:none;padding-right:0}}#logo{background:url([//www.google.com/images/branding/googlelogo/1x/googlelogo_color_150x54dp.png](https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_150x54dp.png)) no-repeat;margin-left:-5px}@media only screen and (min-resolution:192dpi){#logo{background:url([//www.google.com/images/branding/googlelogo/2x/googlelogo_color_](https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_)'
```%