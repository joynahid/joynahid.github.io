+++
categories = ['Development', 'Tooling', 'Testing']
date = '2023-08-15'
description = 'Sendmail is a mail transfer agent (MTA) that serves as a key component in email communication systems'
tags = ['linux', 'tooling', 'sendmail', 'smtp', 'software-developing', 'testing']
title = "Test Sending Emails using Sendmail's SMTP Server"
draft = false
+++

## The Case

I was working on some email sending programs and I needed to test them locally. I found out that there are some tools that can help me with that. One of them is sendmail, which is a popular CLI tool to send emails to Linux users from your command line. You can also use it to send emails globally, but you need to configure it more and do some research. If you are interested, you can look it up.


## Real Stuffs

Use the following commands to install sendmail in a debian/ubuntu environment.
1. Install these tools
    - `sendmail` for sending mails from command line
    - `mailutils` for viewing/sending mails

```bash
apt install sendmail mailutils -y
```

2. Configure `sendmail`'s SMTP Server

```bash
sendmailconfig
```

3. Send email to the linux user `debian` from root.

```bash
echo "Subject: Hello world" > /tmp/test.txt
sendmail -v debian@localhost < /tmp/test.txt
```

4. Check the mailbox
```bash
# switch to debian user
$ sudo su debian
# Check mailbox
$ mail

"/var/mail/debian": 5 messages 1 new 2 unread
 U   1 Mail Delivery Subs Sun Aug 13 06:00  72/3052  Returned mail: see tr
 U   2 Mail Delivery Subs Sun Aug 13 10:08  63/2412  Warning: could not se
     3 root               Sun Aug 13 17:19  27/1121
     4 Debian             Sun Aug 13 17:53  14/603
>N   5 Debian             Tue Aug 15 14:35  12/620   Hello world
? 5
Return-Path: <debian@vps-ncbdhsd.vps.ovh.us>
Received: from vps-ncbdhsd.vps.ovh.us (localhost [127.0.0.1])
        by vps-ncbdhsd.vps.ovh.us (8.17.1.9/8.17.1.9/Debian-2) with ESMTP id 37FEZu5U247448
        for <debian@vps-ncbdhsd.vps.ovh.us>; Tue, 15 Aug 2023 14:35:56 GMT
Received: (from root@localhost)
        by vps-ncbdhsd.vps.ovh.us (8.17.1.9/8.17.1.9/Submit) id 37FEZubT247447
        for debian@localhost; Tue, 15 Aug 2023 14:35:56 GMT
Date: Tue, 15 Aug 2023 14:35:56 GMT
From: Debian <debian@vps-ncbdhsd.vps.ovh.us>
Message-Id: <202308151435.37FEZubT247447@vps-ncbdhsd.vps.ovh.us>
Subject: Hello world


```

That's it! You're ready to test your python, nodejs, php, rust or any other apps.