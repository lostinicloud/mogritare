## Read-only scrape

1. $ node index.js

## Goals

1. https://new.infofree.com/login
2. Implement automated CasperJS with CSS or XSL.

## Schema: Domains

We load a domain (./domains.json):

    {
      "loginUrl" : "https://domain.com/login",
      "headers": {
        "content-type": "application/x-www-form-urlencoded"
      },
      "baseUrl" : "http://domain.com/",
      "credentials": {
        "username" : "",
        "password" : ""
      }
    }

