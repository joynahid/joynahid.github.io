+++
categories = ['Development']
date = '2023-08-15'
description = 'Sendmail is a mail transfer agent (MTA) that serves as a key component in email communication systems'
tags = ['Sendmail']
title = "Testing Email Sending Locally with Sendmail"
draft = false
+++

Hey folks! Today I want to share how I set up sendmail to test email sending in my programs before deploying. 

Sendmail is this old-school Linux tool that lets you send emails right from the command line. Kinda retro, but super handy!

Here's how I got it going:

First I installed sendmail and mailutils on my Debian box:

```
apt install sendmail mailutils
```

This gives me the sendmail program plus some tools for checking emails.

Next I ran: 

```
sendmailconfig
```

To set it up with my local SMTP server. Just used the defaults here to get it working locally.

Then for the fun part - sending a test email:

```
echo "Yo this is a test" > email.txt
sendmail -v myfriend@localhost < email.txt
```

This sends email.txt to myfriend's local mailbox.

I can check that it worked by logging in as myfriend:

```
su myfriend 
mail
```

And there's my test email!

Pretty easy right? Now I can test all my email features locally before pushing to production. No more worrying about spamming real inboxes while developing.

Sendmail may look old and crusty, but it's got some good bones! Definitely recommend giving it a spin if you need to test email sending in your projects.

Let me know if you have any other tricks for local email testing!
