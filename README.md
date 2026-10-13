<div align="center">
    <h1 align="center">EnvShare</h1>
    <h5>Share Environment Variables Securely</h5>
</div>

<div align="center">
  <a href="https://envshare.ddulce.app">envshare.ddulce.app</a>
</div>
<br/>

EnvShare is a simple tool to share environment variables securely. It uses
**AES-GCM** to encrypt your data before sending it to the server. The encryption
key never leaves your browser. Cloudflare-pure version inspired by [envshare](https://github.com/chronark/envshare)

## Features

- **Shareable Links:** Share your environment variables securely by sending a
  link
- **End-to-End Encryption:** AES-GCM encryption is used to encrypt your data
  before sending it to the server
- **Limit number of reads:** Limit the number of times a link can be read
- **Auto Expire:** Automatically expire links and delete data after a certain
  time

## Built with

- [Next.js](https://nextjs.org)
- [vinext](https://vinext.dev/)
- [shadcn/ui](https://ui.shadcn.com/)
- Deployed on [Cloudflare Workers](https://www.cloudflare.com/products/workers/)
- Data stored on [Cloudflare KV](https://developers.cloudflare.com/kv/)

## Docs

Docs in the README are temporary and will be moved to the website soon.

### API

#### Store a secret

**PLEASE NEVER EVER UPLOAD UNENCRYPTED SECRETS.**

This endpoint is only meant to store **already encrypted** secrets. The
encrypted secrets are stored in plain text.

```sh-session
$ curl -X POST -s https://envshare.ddulce.app/api/v1/secret -d "already-encrypted-secret"
```

You can add optional headers to configure the ttl and number of reads.

```sh-session
$ curl -X POST -s https://envshare.ddulce.app/api/v1/secret -d "already-encrypted-secret" -H "envshare-ttl: 3600" -H "envshare-reads: 10"
```

- Omitting the `envshare-ttl` header will set a default of 30 days. Disable the
  ttl by setting it to 0. (`envshare-ttl: 0`)
- Omitting the `envshare-reads` header will simply disable it and allow reading
  for an unlimited number of times.

This endpoint returns a JSON response with the secret id:

```json
{
  "data": {
    "id": "HdPbXgpvUvNk43oxSdK97u",
    "ttl": 86400,
    "reads": 2,
    "expiresAt": "2023-01-19T20:47:28.383Z",
    "url": "http://envshare.ddulce.app/api/v1/secret/HdPbXgpvUvNk43oxSdK97u"
  }
}
```

#### Retrieve a secret

You need an id to retrieve a secret. The id is returned when you store a secret.

```sh-session
$ curl -s https://envshare.ddulce.app/api/v1/secret/HdPbXgpvUvNk43oxSdK97u
```

```json
{
  "data": {
    "secret": "Hello",
    "remainingReads": 1
  }
}
```
