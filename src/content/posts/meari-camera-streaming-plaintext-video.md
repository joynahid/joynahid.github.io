---
title: "I Bought a Meari Security Camera and Hacked My Own Living Room"
slug: meari-camera-streaming-plaintext-video
description: "I bought a budget Meari WiFi camera, put my laptop on the same network, and within 30 seconds I was watching the same H.264 video and AAC audio the camera was uploading to Alibaba Cloud - no TLS, no auth. Here's the full breakdown."
tags: ["security", "iot", "meari", "privacy", "networking", "vulnerability"]
pubDate: "2026-04-23"
draft: false
---

## The Camera

A Meari-branded WiFi security camera, sold under multiple names (Meari, CloudEdge, PPstrong, and rebadged variants). The model uses an **AltoBeam chipset** and runs **PPstrong** firmware, a Chinese SoC platform that powers a huge chunk of cheap IP cameras worldwide.

You can identify these cameras by:

- The Meari/CloudEdge mobile app
- AltoBeam OUI on the MAC address (`E8:F4:94:xx:xx:xx`)
- Device hostname patterns like `pps*`
- Cloud endpoints at `*.mearicloud.com` or `*.cloudedge360.com`

If your camera uses any of these, this blog is about you.

---

## Step 1: Recon

After joining the camera's WiFi (the same WiFi everything else in the house uses), I ran a quick subnet scan from a Linux box on the same LAN.

```bash
sudo nmap -sn 192.168.0.0/24
```

Found the camera at `192.168.1.100`, MAC `E8:F4:94:XX:XX:XX` - vendor: AltoBeam. Confirmed.

A full TCP port scan came back almost empty:

```bash
sudo nmap -sV -p- --min-rate 5000 192.168.1.100
```

```
PORT     STATE SERVICE  VERSION
8091/tcp open  jamlink?
```

Just one open port. **No RTSP (554), no web UI (80/443), no Telnet, no FTP, no ONVIF.** From the outside, this looks like a tightly locked-down device. No default credentials to brute-force, no admin panel to attack.

If you stopped here, you'd think the camera was reasonably secure. So I kept going.

---

## Step 2: Where Does It Talk?

A camera that doesn't expose anything locally has to be talking to *something*. So I sniffed its outgoing traffic. Because the camera was on WiFi and my Linux box was on Ethernet - both behind the same router - I needed to put myself in the middle of its conversation with the router. Classic ARP spoofing:

```bash
echo 1 > /proc/sys/net/ipv4/ip_forward
arpspoof -i eth0 -t 192.168.1.100 192.168.0.1 &
arpspoof -i eth0 -t 192.168.0.1 192.168.1.100 &
```

Now every packet between the camera and the router flowed through my machine. Then I captured everything:

```bash
tcpdump -i eth0 host 192.168.1.100 -n -w meari.pcap
```

Within seconds, packets started flowing. The camera was talking to three IPs:

| IP | Owner |
|----|-------|
| `47.253.42.52` | Alibaba Cloud (US-West) |
| `47.252.10.162` | Alibaba Cloud (US-West) |
| `47.89.182.8` | Alibaba Cloud (US-West) |

All three are **Alibaba Cloud LLC**, US region. The first connection was a handshake to TCP port `18665` - a non-standard port - followed by ~338 bytes of binary that looked like a custom-encrypted protocol. Not TLS. No `Client Hello`, no certificate exchange, just opaque bytes.

**That's the P2P signaling channel** - how the camera registers itself with the cloud and waits for someone to connect.

So far, mildly concerning (Chinese cloud, non-standard encryption) but nothing damning. Then I let the capture run a little longer.

---

## Step 3: The Smoking Gun

About a minute into the capture, I saw this fly past:

```
192.168.1.100.51968 > 47.88.37.113.80: Flags [.],
HTTP: PUT /7e/v/USER_ID/DEVICE_ID/20260410/__v1-115252f7e952601f4dc71307ea3a5bb1-20260410120810-0.ts HTTP/1.1
Host: meari-oss-us.oss-us-west-1.aliyuncs.com
User-Agent: ppsRequests/0.0.1
Content-Length: 109228
Content-Type: application/json
```

Read that again.

**`HTTP/1.1`. Port `80`. Plaintext.** The camera was uploading a `.ts` (MPEG transport stream) video segment, **109 KB**, **without TLS**, to an Alibaba Object Storage bucket called `meari-oss-us`.

The User-Agent gave away the firmware name (`ppsRequests/0.0.1` → PPstrong's HTTP client). The path leaked an internal user ID, device ID, a date prefix, and a unique segment hash. The Host header confirmed the destination bucket.

But the body of that PUT request - that's the payload. That's the actual video.

---

## Step 4: Pulling The Video Out Of The Wire

I let `tcpdump` run for another 90 seconds, then reconstructed the TCP streams with `tcpflow`:

```bash
tcpflow -r meari.pcap
```

That dumped each direction of each TCP connection into its own file. The big one - 65 KB - was the camera-to-Alibaba upload. I parsed the HTTP headers off the front and looked for the MPEG-TS sync byte (`0x47`) to find where the video data started:

```python
with open('192.168.001.100.52033-047.088.037.113.00080', 'rb') as f:
    data = f.read()

body = data[data.find(b'\r\n\r\n')+4:]   # skip HTTP headers
ts_start = body.find(b'\x47')             # MPEG-TS sync byte

# Validate: next sync byte should be exactly 188 bytes later
assert body[ts_start+188] == 0x47

with open('captured_video.ts', 'wb') as out:
    out.write(body[ts_start:])
```

Output: **63,856 bytes - 339 valid MPEG-TS packets.**

Then I converted it to MP4 with `ffmpeg`:

```bash
ffmpeg -i captured_video.ts -c copy camera_clip.mp4
```

```
Stream #0:0: Video: h264 (High), 640x360, 20 fps
Stream #0:1: Audio: aac (LC), 16000 Hz, mono, 31 kb/s
```

**640×360 H.264 video. 16 kHz mono AAC audio. Yes - audio.** I had a playable MP4 of footage from inside my own home, captured from the network in a few seconds.

This wasn't even a motion event. I checked the metadata in the request headers:

```json
{
  "callbackUrl": "https://apis-us-west.cloudedge360.com/v14/devices/callback/event/video-push-success",
  "callbackBody": {
    "userID": "YOUR_USER_ID",
    "deviceID": "YOUR_DEVICE_ID",
    "videoDuration": 6,
    "videoIndex": 1,
    "eventTime": "20260410120810",
    "deviceKey": "YOUR_DEVICE_KEY",
    "secVersion": 1,
    "sign": "tTbuI8BSfBDUXMeuu9DHlSTzmtY="
  }
}
```

**`aiEvent=0`** - this wasn't triggered by motion detection. The camera is just chunking video into 6-second `.ts` segments and continuously uploading them to the cloud, regardless of whether anything is happening.

And that callback body leaks **everything** that identifies the camera: my user ID, my device ID, the device's persistent key, and a request signature. All of it traveling in cleartext.

---

## Who Can See This?

Anyone in any of these positions can capture and play your camera footage:

1. **Anyone on your WiFi.** Doesn't matter that it's WPA2 - that only encrypts the WiFi link. Once a packet is decrypted by the router, anyone else on the LAN can ARP-spoof and read it. Guests, roommates, that one friend who knows your WiFi password.

2. **Your ISP.** Plaintext HTTP traffic is fully visible to your ISP. They can see the destination, the headers, the user ID, the device key, and the actual video frames. They could log it, archive it, hand it over on request, or sell aggregated metadata. In countries without strong privacy laws, that's not even illegal.

3. **Anyone tapping the line between you and Alibaba.** Backbone providers, transit networks, intelligence services in any country the traffic transits.

4. **Alibaba Cloud.** Obviously. But that's true of any cloud camera - the difference is, with HTTPS only Alibaba sees the content. With this camera, *everyone in between* can.

5. **A malicious WiFi network you connect a phone to** - if your phone is signed into the Meari app and the phone has been compromised by something on the public WiFi, the device key leaks the same way.

The bar to attack this is "owns a $20 USB WiFi adapter and knows how to type `arpspoof`." That's not nation-state. That's a bored teenager.

---

## Why HTTPS Wasn't Used

There is no good reason. Let's go through the bad ones:

- **"It's faster."** The video is already H.264-compressed; TLS overhead is negligible compared to the payload size. We're talking single-digit percent, on a device that streams 6-second clips on demand, not in realtime.
- **"The chip can't handle it."** AltoBeam SoCs ship with TLS libraries. PPstrong's own SDK supports HTTPS. The control channel to `apis-us-west.cloudedge360.com` *is* HTTPS - they just decided not to bother on the bulk upload path.
- **"Certificates are hard to manage."** They're using AWS S3-style object storage (`oss-us-west-1.aliyuncs.com`). Alibaba OSS supports HTTPS out of the box. It's literally one URL change.

The only reason this is plaintext is **cost-cutting and laziness**. A 30-line code change would fix it. They didn't make it.

---

## The Block

Once I confirmed what was happening, I wanted to stop it. Two layers:

**Immediate (network MITM, while testing):**
```bash
iptables -A FORWARD -s 192.168.1.100 -j DROP
iptables -A FORWARD -d 192.168.1.100 -j DROP
```
Combined with the ARP spoof, this drops every packet to and from the camera before it leaves the LAN.

**Permanent (router):**
On a TP-Link router, the working block is **Access Control → MAC Blacklist**, not Parental Controls. Parental Controls is schedule-based and the camera retries fast enough to slip through. A hard MAC blacklist works.

After enabling it, I ran the same capture again:

```
Total packets: 0
Out: 0 bytes
In: 0 bytes
BLOCKED
```

Camera went offline in the Meari app within seconds. That's the goal.

The trade-off: you lose the cloud features. No remote viewing, no app notifications, no event playback. The camera still records to its SD card if it has one, but the Meari app is now useless. For me, that's a feature, not a bug.

---

## What You Should Actually Do

If you own one of these cameras, in order of effort:

1. **Block it on your router.** MAC blacklist, hard block. Takes 2 minutes. Camera becomes a dumb local-only device or a brick, depending on the model. No more video to China.

2. **Unplug it.** If the camera doesn't work without the cloud, it's not really yours. Treat it as e-waste, throw it out, get something better.

3. **Replace it.** Local-first cameras that don't depend on a Chinese cloud:
   - **Reolink** with their NVR - local recording, optional cloud
   - **Eufy** - local storage, encrypted cloud (mostly)
   - **Frigate NVR** + cheap PoE cameras - DIY, full control, no cloud at all
   - **Unifi Protect** - expensive but completely local

4. **Network isolation, if you must keep it.** Put the camera on a guest VLAN with no internet access. It'll stop working with the app, but it can't phone home and it can't see any of your other devices.

5. **Don't trust Wi-Fi cameras with anything sensitive.** Bedrooms, bathrooms, home offices, places where confidential conversations happen - these are exactly where this camera type should never go.

---

## Reporting It

I'm not going to pretend filing complaints will fix this overnight, but creating a paper trail matters. The right channels, in roughly increasing order of impact:

- **Where you bought it** - return it as defective with the security issue documented. Easiest path to a refund.
- **The vendor** - `support@meari.com.cn`, `support@cloudedge360.com`. They probably won't reply, but you've documented it.
- **Your country's data protection regulator** - in the EU that's GDPR; in the UK that's the ICO; in Bangladesh that's BTRC; in the US that's the FTC. Plaintext PII transmission is a clear violation almost everywhere.
- **CERT/CC and CVE** - file at `https://www.kb.cert.org/vuls/report/` and `https://cveform.mitre.org/`. Get a CVE number. It becomes part of the permanent vulnerability record.
- **Public disclosure** - Reddit, Hacker News, tech press, video walkthrough on YouTube. Embarrassment works faster than regulators in IoT security. Bonus: other people affected can find your post.

Include the evidence: pcap file, extracted MP4, decoded headers, the device key in the URL. The technical details make the difference between "guy on the internet complaining" and "documented vulnerability with reproducible steps."

---

## The Bigger Picture

This isn't really about Meari. The Meari camera is one of probably hundreds of identical-internals cameras sold under different brand names - the AltoBeam + PPstrong stack is everywhere. **All of them likely have the same problem.** White-label IoT is a race to the bottom on price, and security is the first thing thrown overboard.

The IoT industry has known about this problem for a decade. Mirai botnet was 2016. The advice - use HTTPS, don't hardcode keys, isolate IoT on a separate network - is well-understood. Manufacturers ignore it because there are no consequences. Cheap cameras keep selling, regulators move slowly, consumers don't have the technical chops to verify any of it.

The fix isn't going to come from Meari. It comes from:

1. **Buyers asking the question** before purchasing: does this camera work without the cloud? Does it use HTTPS? Where is the data going?
2. **Reviewers actually testing this stuff** instead of just rating image quality.
3. **Regulators with teeth** - fines big enough to make a 30-line code change cheaper than ignoring it.
4. **Pressure from disclosures like this one** - every public writeup raises the cost of doing nothing.

Until then: assume any cheap IoT camera is a surveillance device for whoever cares to listen, and act accordingly.

---

## Tools Used

For anyone wanting to reproduce this on their own network and their own hardware:

- `nmap` - host discovery and port scanning
- `arpspoof` (from `dsniff`) - ARP cache poisoning to MITM the camera
- `tcpdump` - packet capture
- `tcpflow` - TCP stream reconstruction
- `tshark` - HTTP request extraction
- `ffmpeg` - convert the captured `.ts` to a playable MP4
- `iptables` - drop the camera's traffic at the gateway
- A USB WiFi adapter in monitor/AP/client mode for the network side (a MediaTek MT7921 in my case, though anything works)

Total time from "let me look at this" to "I have a copy of my own camera footage decoded from the wire": about 20 minutes.
