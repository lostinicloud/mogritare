# Mogritare

Interfaces for web scrapers that hierarchically collect data through 
selector-based event emitters.

## Overview

We will use Watson’s [Concept Insights][0] to stitch DOM Elements together 
by event emitters for conceptually spaced extraction.

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

## Bluemix

Install cf:

    curl -L "https://cli.run.pivotal.io/stable?release=macosx64-binary&source=github" | tar -zx

Review https://github.com/watson-developer-cloud/concept-insights-nodejs

[0]: http://www.ibm.com/smarterplanet/us/en/ibmwatson/developercloud/concept-insights.html
